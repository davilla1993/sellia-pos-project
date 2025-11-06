package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.request.CashierSessionCloseRequest;
import com.follysitou.sellia_backend.dto.request.CashierSessionOpenRequest;
import com.follysitou.sellia_backend.dto.request.CashierSessionPinUnlockRequest;
import com.follysitou.sellia_backend.dto.response.CashierSessionResponse;
import com.follysitou.sellia_backend.dto.response.SessionReportResponse;
import com.follysitou.sellia_backend.dto.response.CashOperationResponse;
import com.follysitou.sellia_backend.enums.CashierSessionStatus;
import com.follysitou.sellia_backend.exception.ConflictException;
import com.follysitou.sellia_backend.exception.ResourceNotFoundException;
import com.follysitou.sellia_backend.mapper.CashierSessionMapper;
import com.follysitou.sellia_backend.model.Cashier;
import com.follysitou.sellia_backend.model.CashierSession;
import com.follysitou.sellia_backend.model.GlobalSession;
import com.follysitou.sellia_backend.model.User;
import com.follysitou.sellia_backend.repository.CashierSessionRepository;
import com.follysitou.sellia_backend.repository.GlobalSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CashierSessionService {

    private final CashierSessionRepository cashierSessionRepository;
    private final CashierSessionMapper cashierSessionMapper;
    private final GlobalSessionRepository globalSessionRepository;
    private final CashierService cashierService;
    private final com.follysitou.sellia_backend.repository.UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final com.follysitou.sellia_backend.mapper.ActiveCashierSessionMapper activeCashierSessionMapper;
    private final com.follysitou.sellia_backend.repository.OrderRepository orderRepository;
    private final CashOperationService cashOperationService;
    private final RestaurantService restaurantService;

    @Transactional
    public CashierSessionResponse openSession(CashierSessionOpenRequest request) {
        GlobalSession globalSession = globalSessionRepository.findCurrentSession(com.follysitou.sellia_backend.enums.GlobalSessionStatus.OPEN)
                .orElseThrow(() -> new ConflictException(
                        "session",
                        "global",
                        "Global session is not open. Contact administrator."
                ));

        Cashier cashier = cashierService.getCashierEntityById(request.getCashierId());

        User currentUser = getCurrentUser();

        // SECURITY CHECK: Verify cash register (caisse) doesn't already have an active session
        // This prevents multiple users from opening sessions on the same cash register simultaneously
        var existingSession = cashierSessionRepository.findActiveByCashierAndGlobalSession(
                request.getCashierId(),
                globalSession
        );
        if (existingSession.isPresent()) {
            CashierSession activeSession = existingSession.get();
            User sessionUser = activeSession.getUser();

            // AUDIT LOG: Failed attempt to open session on occupied cash register
            auditLogService.logFailure(
                    currentUser.getUsername(),
                    "OPEN_CASHIER_SESSION",
                    "CASH_REGISTER",
                    request.getCashierId(),
                    "Attempted to open session on cash register " + cashier.getName() + " already in use by " + sessionUser.getUsername(),
                    "Cash register already in use"
            );

            throw new ConflictException(
                    "cash_register",
                    cashier.getName(),
                    "This cash register is already in use by " + sessionUser.getUsername() +
                    ". Session opened at " + activeSession.getOpenedAt() + ". " +
                    "Please ask them to close their session first."
            );
        }

        // SECURITY CHECK: Validate PIN (ALWAYS required to open a session)
        if (!cashierService.validatePin(request.getPin(), request.getCashierId())) {
            // AUDIT LOG: Failed PIN validation
            auditLogService.logFailure(
                    currentUser.getUsername(),
                    "OPEN_CASHIER_SESSION",
                    "CASH_REGISTER",
                    request.getCashierId(),
                    "Invalid PIN for cash register " + cashier.getName(),
                    "Invalid PIN"
            );

            throw new ConflictException(
                    "pin",
                    "invalid",
                    "Invalid PIN for this cashier"
            );
        }

        CashierSession session = CashierSession.builder()
                .globalSession(globalSession)
                .cashier(cashier)
                .user(currentUser)
                .status(CashierSessionStatus.OPEN)
                .openedAt(LocalDateTime.now())
                .lastActivityAt(LocalDateTime.now())
                .initialAmount(request.getInitialAmount())
                .totalSales(0L)
                .inactivityLockMinutes(15)
                .build();

        CashierSession savedSession = cashierSessionRepository.save(session);

        // AUDIT LOG: Successful session opening
        auditLogService.logSuccess(
                currentUser.getUsername(),
                "OPEN_CASHIER_SESSION",
                "CASHIER_SESSION",
                savedSession.getPublicId(),
                "Opened session on cash register " + cashier.getName() + " with initial amount: " + request.getInitialAmount()
        );

        return cashierSessionMapper.toResponse(savedSession);
    }

    @Transactional
    public CashierSessionResponse lockSession(String publicId) {
        CashierSession session = getCashierSessionEntityById(publicId);

        if (!session.getStatus().equals(CashierSessionStatus.OPEN)) {
            throw new ConflictException(
                    "status",
                    session.getStatus().toString(),
                    "Only open sessions can be locked"
            );
        }

        session.setStatus(CashierSessionStatus.LOCKED);
        session.setLockedAt(LocalDateTime.now());

        CashierSession updatedSession = cashierSessionRepository.save(session);
        return cashierSessionMapper.toResponse(updatedSession);
    }

    @Transactional
    public CashierSessionResponse unlockSession(String publicId, CashierSessionPinUnlockRequest request) {
        CashierSession session = getCashierSessionEntityById(publicId);

        if (!session.getStatus().equals(CashierSessionStatus.LOCKED)) {
            throw new ConflictException(
                    "status",
                    session.getStatus().toString(),
                    "Only locked sessions can be unlocked"
            );
        }

        if (!cashierService.validatePin(request.getPin(), session.getCashier().getPublicId())) {
            throw new ConflictException(
                    "pin",
                    "invalid",
                    "Invalid PIN"
            );
        }

        session.setStatus(CashierSessionStatus.OPEN);
        session.setUnlockedAt(LocalDateTime.now());
        session.setLastActivityAt(LocalDateTime.now());

        CashierSession updatedSession = cashierSessionRepository.save(session);
        return cashierSessionMapper.toResponse(updatedSession);
    }

    @Transactional
    public CashierSessionResponse closeSession(String publicId, CashierSessionCloseRequest request) {
        CashierSession session = getCashierSessionEntityById(publicId);
        User currentUser = getCurrentUser();

        if (session.getStatus().equals(CashierSessionStatus.CLOSED)) {
            throw new ConflictException(
                    "status",
                    "CLOSED",
                    "Session is already closed"
            );
        }

        session.setStatus(CashierSessionStatus.CLOSED);
        session.setClosedAt(LocalDateTime.now());
        session.setFinalAmount(request.getFinalAmount());
        session.setNotes(request.getNotes());

        CashierSession updatedSession = cashierSessionRepository.save(session);

        // Calculate discrepancy
        long expectedAmount = session.getInitialAmount() + session.getTotalSales();
        long discrepancy = request.getFinalAmount() - expectedAmount;

        // AUDIT LOG: Session closed
        auditLogService.logSuccess(
                currentUser.getUsername(),
                "CLOSE_CASHIER_SESSION",
                "CASHIER_SESSION",
                updatedSession.getPublicId(),
                "Closed session on cash register " + session.getCashier().getName() +
                ". Initial: " + session.getInitialAmount() +
                ", Sales: " + session.getTotalSales() +
                ", Expected: " + expectedAmount +
                ", Final: " + request.getFinalAmount() +
                ", Discrepancy: " + discrepancy
        );

        return cashierSessionMapper.toResponse(updatedSession);
    }

    public CashierSessionResponse getCurrentSession() {
        User currentUser = getCurrentUser();
        return cashierSessionRepository.findCurrentSessionByUser(currentUser.getPublicId())
                .map(cashierSessionMapper::toResponse)
                .orElse(null);
    }

    public CashierSessionResponse getSessionById(String publicId) {
        CashierSession session = getCashierSessionEntityById(publicId);
        return cashierSessionMapper.toResponse(session);
    }

    public Page<CashierSessionResponse> getAllSessions(Pageable pageable) {
        Page<CashierSession> sessions = cashierSessionRepository.findAllActive(pageable);
        return sessions.map(cashierSessionMapper::toResponse);
    }

    public Page<CashierSessionResponse> getSessionsByGlobalSession(String globalSessionId, Pageable pageable) {
        GlobalSession globalSession = getGlobalSessionById(globalSessionId);
        Page<CashierSession> sessions = cashierSessionRepository.findByGlobalSession(globalSession, pageable);
        return sessions.map(cashierSessionMapper::toResponse);
    }

    public Page<CashierSessionResponse> getSessionsByCashier(String cashierId, Pageable pageable) {
        Page<CashierSession> sessions = cashierSessionRepository.findByCashier(cashierId, pageable);
        return sessions.map(cashierSessionMapper::toResponse);
    }

    public Page<CashierSessionResponse> getSessionsByUser(String userId, Pageable pageable) {
        Page<CashierSession> sessions = cashierSessionRepository.findByUser(userId, pageable);
        return sessions.map(cashierSessionMapper::toResponse);
    }

    @Transactional
    public void updateLastActivity(String publicId) {
        CashierSession session = getCashierSessionEntityById(publicId);
        session.setLastActivityAt(LocalDateTime.now());
        cashierSessionRepository.save(session);
    }

    @Transactional
    public void autoLockInactiveSessions() {
        GlobalSession globalSession = globalSessionRepository.findCurrentSession(com.follysitou.sellia_backend.enums.GlobalSessionStatus.OPEN)
                .orElse(null);
        if (globalSession == null) return;
        
        List<CashierSession> activeSessions = cashierSessionRepository.findActiveSessionsByGlobalSession(globalSession);

        LocalDateTime now = LocalDateTime.now();

        for (CashierSession session : activeSessions) {
            if (session.getStatus().equals(CashierSessionStatus.OPEN) && session.getLastActivityAt() != null) {
                long minutesInactive = java.time.temporal.ChronoUnit.MINUTES.between(
                        session.getLastActivityAt(),
                        now
                );

                if (minutesInactive >= session.getInactivityLockMinutes()) {
                    session.setStatus(CashierSessionStatus.LOCKED);
                    session.setLockedAt(now);
                    cashierSessionRepository.save(session);
                }
            }
        }
    }

    @Transactional
    public void forceCloseSessionByAdmin(String publicId) {
        CashierSession session = getCashierSessionEntityById(publicId);
        session.setStatus(CashierSessionStatus.CLOSED);
        session.setClosedAt(LocalDateTime.now());
        cashierSessionRepository.save(session);
    }

    /**
     * Force close all active cashier sessions for a specific user
     * Used when a new login is detected to prevent session hijacking
     */
    @Transactional
    public void forceCloseAllUserSessions(String userId, String reason) {
        List<CashierSession> activeSessions = cashierSessionRepository.findActiveSessionsByGlobalSession(
                globalSessionRepository.findCurrentSession(com.follysitou.sellia_backend.enums.GlobalSessionStatus.OPEN)
                        .orElse(null)
        );

        if (activeSessions == null || activeSessions.isEmpty()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        int closedCount = 0;

        for (CashierSession session : activeSessions) {
            if (session.getUser().getPublicId().equals(userId) &&
                (session.getStatus().equals(CashierSessionStatus.OPEN) ||
                 session.getStatus().equals(CashierSessionStatus.LOCKED))) {

                session.setStatus(CashierSessionStatus.CLOSED);
                session.setClosedAt(now);
                session.setNotes(session.getNotes() != null ?
                    session.getNotes() + " [FORCE CLOSED: " + reason + "]" :
                    "[FORCE CLOSED: " + reason + "]");

                cashierSessionRepository.save(session);

                // Audit log
                auditLogService.logSuccess(
                        session.getUser().getUsername(),
                        "FORCE_CLOSE_CASHIER_SESSION",
                        "CASHIER_SESSION",
                        session.getPublicId(),
                        "Session automatically closed on cash register " + session.getCashier().getName() +
                        " due to: " + reason
                );

                closedCount++;
            }
        }

        if (closedCount > 0) {
            org.slf4j.LoggerFactory.getLogger(CashierSessionService.class)
                    .info("Force closed {} active cashier sessions for user {}: {}", closedCount, userId, reason);
        }
    }

    public CashierSession getCashierSessionEntityById(String publicId) {
        return cashierSessionRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("CashierSession", "publicId", publicId));
    }

    /**
     * Get all active cashier sessions (OPEN and LOCKED) with order statistics
     */
    public List<com.follysitou.sellia_backend.dto.response.ActiveCashierSessionResponse> getActiveSessions() {
        GlobalSession globalSession = globalSessionRepository.findCurrentSession(com.follysitou.sellia_backend.enums.GlobalSessionStatus.OPEN)
                .orElse(null);

        if (globalSession == null) {
            return List.of(); // No active global session, return empty list
        }

        List<CashierSession> activeSessions = cashierSessionRepository.findActiveSessionsByGlobalSession(globalSession);

        return activeSessions.stream()
                .map(session -> {
                    // Count orders for this session
                    Long orderCount = orderRepository.countByCashierSession(session.getPublicId());
                    return activeCashierSessionMapper.toResponse(session, orderCount);
                })
                .toList();
    }

    private GlobalSession getGlobalSessionById(String publicId) {
        return globalSessionRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("GlobalSession", "publicId", publicId));
    }

    /**
     * Get the final amount from the last closed session for a specific cashier
     * Returns null if no previous closed session exists
     */
    public Long getLastClosedSessionFinalAmount(String cashierId) {
        return cashierSessionRepository.findLastClosedByCashier(cashierId)
                .map(CashierSession::getFinalAmount)
                .orElse(null);
    }

    private User getCurrentUser() {
        String userId = com.follysitou.sellia_backend.util.SecurityUtil.getCurrentUserId();
        if (userId == null) {
            throw new com.follysitou.sellia_backend.exception.UnauthorizedException("User is not authenticated");
        }
        return userRepository.findByPublicId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "publicId", userId));
    }

    public SessionReportResponse getSessionReport(String publicId) {
        // Get session details using the existing mapper which calculates everything
        CashierSessionResponse sessionResponse = getSessionById(publicId);

        // Get cash operations for this session
        List<CashOperationResponse> cashOperations = cashOperationService.getOperationsBySession(publicId);

        // Get cash operation totals
        var totals = cashOperationService.getTotalsBySession(publicId);

        // Calculate expected amount
        Long initialAmount = sessionResponse.getInitialAmount() != null ? sessionResponse.getInitialAmount() : 0L;
        Long totalSales = sessionResponse.getTotalSales() != null ? sessionResponse.getTotalSales() : 0L;
        Long totalEntrees = totals.getTotalEntrees();
        Long totalSorties = totals.getTotalSorties();
        Long expectedAmount = initialAmount + totalSales + totalEntrees - totalSorties;

        // Calculate discrepancy
        Long finalAmount = sessionResponse.getFinalAmount() != null ? sessionResponse.getFinalAmount() : 0L;
        Long discrepancy = finalAmount - expectedAmount;

        // Get restaurant info
        var restaurant = restaurantService.getRestaurant();

        // Count orders for this session
        Long ordersCountLong = orderRepository.countByCashierSession(publicId);
        Integer ordersCount = ordersCountLong != null ? ordersCountLong.intValue() : 0;

        return SessionReportResponse.builder()
                .sessionId(sessionResponse.getPublicId())
                .cashierName(sessionResponse.getCashier().getName())
                .cashierNumber(sessionResponse.getCashier().getCashierNumber())
                .userName(sessionResponse.getUser().getFirstName() + " " + sessionResponse.getUser().getLastName())
                .openedAt(sessionResponse.getOpenedAt())
                .closedAt(sessionResponse.getClosedAt())
                .initialAmount(initialAmount)
                .finalAmount(finalAmount)
                .expectedAmount(expectedAmount)
                .discrepancy(discrepancy)
                .totalSales(totalSales)
                .ordersCount(ordersCount)
                .totalCashEntrees(totalEntrees)
                .totalCashSorties(totalSorties)
                .cashEntreesCount(totals.getEntreesCount())
                .cashSortiesCount(totals.getSortiesCount())
                .cashOperations(cashOperations)
                .closingNotes(sessionResponse.getNotes())
                .restaurantName(restaurant.getName())
                .restaurantAddress(restaurant.getAddress())
                .restaurantPhone(restaurant.getPhoneNumber())
                .build();
    }
}
