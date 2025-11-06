package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.request.GlobalSessionCloseRequest;
import com.follysitou.sellia_backend.dto.request.GlobalSessionOpenRequest;
import com.follysitou.sellia_backend.dto.response.GlobalSessionResponse;
import com.follysitou.sellia_backend.dto.response.GlobalSessionSummaryResponse;
import com.follysitou.sellia_backend.enums.CashOperationType;
import com.follysitou.sellia_backend.enums.GlobalSessionStatus;
import com.follysitou.sellia_backend.exception.ConflictException;
import com.follysitou.sellia_backend.exception.ResourceNotFoundException;
import com.follysitou.sellia_backend.mapper.GlobalSessionMapper;
import com.follysitou.sellia_backend.model.CashierSession;
import com.follysitou.sellia_backend.model.GlobalSession;
import com.follysitou.sellia_backend.model.User;
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
public class GlobalSessionService {

    private final GlobalSessionRepository globalSessionRepository;
    private final GlobalSessionMapper globalSessionMapper;
    private final com.follysitou.sellia_backend.repository.UserRepository userRepository;
    private final com.follysitou.sellia_backend.repository.OrderRepository orderRepository;
    private final com.follysitou.sellia_backend.repository.CashierSessionRepository cashierSessionRepository;
    private final com.follysitou.sellia_backend.repository.CashOperationRepository cashOperationRepository;

    @Transactional
    public GlobalSessionResponse openSession(GlobalSessionOpenRequest request) {
        var existingOpenSession = globalSessionRepository.findCurrentSession(GlobalSessionStatus.OPEN);
        if (existingOpenSession.isPresent()) {
            throw new ConflictException(
                    "session",
                    "global",
                    "A global session is already open. Close it before opening a new one."
            );
        }

        User currentUser = getCurrentUser();

        // No initial amount needed - it will be calculated from cashier sessions
        GlobalSession session = GlobalSession.builder()
                .status(GlobalSessionStatus.OPEN)
                .openedAt(LocalDateTime.now())
                .openedBy(currentUser)
                .initialAmount(0L)
                .totalSales(0L)
                .build();

        GlobalSession savedSession = globalSessionRepository.save(session);
        return globalSessionMapper.toResponse(savedSession);
    }

    @Transactional
    public GlobalSessionResponse closeSession(String publicId, GlobalSessionCloseRequest request) {
        GlobalSession session = globalSessionRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("GlobalSession", "publicId", publicId));

        if (!session.getStatus().equals(GlobalSessionStatus.OPEN)) {
            throw new ConflictException(
                    "status",
                    session.getStatus().toString(),
                    "Only open sessions can be closed"
            );
        }

        // IMPORTANT: Verify all cashier sessions are closed
        if (hasOpenCashierSessions(session)) {
            throw new ConflictException(
                    "cashier_sessions",
                    "open",
                    "All cashier sessions must be closed before closing the global session"
            );
        }

        User currentUser = getCurrentUser();

        // Calculate final total sales before closing
        LocalDateTime startDate = session.getOpenedAt();
        LocalDateTime endDate = LocalDateTime.now();
        Long totalSales = orderRepository.getTotalRevenue(startDate, endDate);

        session.setStatus(GlobalSessionStatus.CLOSED);
        session.setClosedAt(endDate);
        session.setClosedBy(currentUser);
        session.setFinalAmount(request.getFinalAmount());  // Real amount entered by admin
        session.setReconciliationNotes(request.getReconciliationNotes());
        session.setReconciliationAmount(request.getReconciliationAmount());
        session.setTotalSales(totalSales != null ? totalSales : 0L);

        GlobalSession updatedSession = globalSessionRepository.save(session);
        return globalSessionMapper.toResponse(updatedSession);
    }

    public GlobalSessionResponse getCurrentSession() {
        GlobalSession session = globalSessionRepository.findCurrentSession(GlobalSessionStatus.OPEN)
                .orElseThrow(() -> new ResourceNotFoundException("GlobalSession", "status", "OPEN"));

        // Calculate total sales dynamically for the current session
        LocalDateTime startDate = session.getOpenedAt();
        LocalDateTime endDate = session.getClosedAt() != null ? session.getClosedAt() : LocalDateTime.now();
        Long totalSales = orderRepository.getTotalRevenue(startDate, endDate);
        session.setTotalSales(totalSales != null ? totalSales : 0L);

        return globalSessionMapper.toResponse(session);
    }

    public GlobalSessionResponse getSessionById(String publicId) {
        GlobalSession session = globalSessionRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("GlobalSession", "publicId", publicId));

        // Calculate total sales dynamically
        LocalDateTime startDate = session.getOpenedAt();
        LocalDateTime endDate = session.getClosedAt() != null ? session.getClosedAt() : LocalDateTime.now();
        Long totalSales = orderRepository.getTotalRevenue(startDate, endDate);
        session.setTotalSales(totalSales != null ? totalSales : 0L);

        return globalSessionMapper.toResponse(session);
    }

    public Page<GlobalSessionResponse> getAllSessions(Pageable pageable) {
        Page<GlobalSession> sessions = globalSessionRepository.findAllActive(pageable);
        return sessions.map(session -> {
            // Calculate total sales dynamically for each session
            LocalDateTime startDate = session.getOpenedAt();
            LocalDateTime endDate = session.getClosedAt() != null ? session.getClosedAt() : LocalDateTime.now();
            Long totalSales = orderRepository.getTotalRevenue(startDate, endDate);
            session.setTotalSales(totalSales != null ? totalSales : 0L);
            return globalSessionMapper.toResponse(session);
        });
    }

    public GlobalSessionSummaryResponse getGlobalSessionSummary(String publicId) {
        GlobalSession session = globalSessionRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("GlobalSession", "publicId", publicId));

        // Get all cashier sessions for this global session
        List<CashierSession> cashierSessions = cashierSessionRepository
                .findByGlobalSession(session, Pageable.unpaged())
                .getContent();

        // Calculate totals from all cashier sessions
        long totalInitialAmount = cashierSessions.stream()
                .mapToLong(cs -> cs.getInitialAmount() != null ? cs.getInitialAmount() : 0L)
                .sum();

        long totalSales = cashierSessions.stream()
                .mapToLong(cs -> cs.getTotalSales() != null ? cs.getTotalSales() : 0L)
                .sum();

        // Calculate total cash entries and exits for all cashier sessions
        long totalCashEntrees = 0L;
        long totalCashSorties = 0L;

        for (CashierSession cs : cashierSessions) {
            Long entrees = cashOperationRepository.getTotalBySessionAndType(cs.getPublicId(), CashOperationType.ENTREE);
            Long sorties = cashOperationRepository.getTotalBySessionAndType(cs.getPublicId(), CashOperationType.SORTIE);

            totalCashEntrees += (entrees != null ? entrees : 0L);
            totalCashSorties += (sorties != null ? sorties : 0L);
        }

        // Calculate expected amount
        long expectedAmount = totalInitialAmount + totalSales + totalCashEntrees - totalCashSorties;

        // Count sessions by status
        int totalSessions = cashierSessions.size();
        int openSessions = (int) cashierSessions.stream()
                .filter(cs -> "OPEN".equals(cs.getStatus().toString()) || "LOCKED".equals(cs.getStatus().toString()))
                .count();
        int closedSessions = (int) cashierSessions.stream()
                .filter(cs -> "CLOSED".equals(cs.getStatus().toString()))
                .count();

        return GlobalSessionSummaryResponse.builder()
                .globalSessionId(session.getPublicId())
                .totalInitialAmount(totalInitialAmount)
                .totalSales(totalSales)
                .totalCashEntrees(totalCashEntrees)
                .totalCashSorties(totalCashSorties)
                .expectedAmount(expectedAmount)
                .totalCashierSessions(totalSessions)
                .openCashierSessions(openSessions)
                .closedCashierSessions(closedSessions)
                .build();
    }

    public boolean isGlobalSessionOpen() {
        return globalSessionRepository.findCurrentSession(GlobalSessionStatus.OPEN).isPresent();
    }

    /**
     * Check if there are any open or locked cashier sessions in the global session
     */
    private boolean hasOpenCashierSessions(GlobalSession globalSession) {
        var activeSessions = cashierSessionRepository.findActiveSessionsByGlobalSession(globalSession);
        return !activeSessions.isEmpty();
    }

    /**
     * Calculate the total amount from all cashier sessions in a global session
     * This sums up the final amounts of all closed cashier sessions
     */
    private Long calculateTotalCashierSessionsAmount(GlobalSession globalSession) {
        var cashierSessions = cashierSessionRepository.findByGlobalSession(globalSession, Pageable.unpaged());

        return cashierSessions.stream()
                .filter(cs -> cs.getFinalAmount() != null) // Only count closed sessions with final amount
                .mapToLong(cs -> cs.getFinalAmount())
                .sum();
    }

    private User getCurrentUser() {
        String userId = com.follysitou.sellia_backend.util.SecurityUtil.getCurrentUserId();
        if (userId == null) {
            throw new com.follysitou.sellia_backend.exception.UnauthorizedException("User is not authenticated");
        }
        return userRepository.findByPublicId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "publicId", userId));
    }
}
