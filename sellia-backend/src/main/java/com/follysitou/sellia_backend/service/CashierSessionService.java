package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.request.CashierSessionCloseRequest;
import com.follysitou.sellia_backend.dto.request.CashierSessionOpenRequest;
import com.follysitou.sellia_backend.dto.request.CashierSessionPinUnlockRequest;
import com.follysitou.sellia_backend.dto.response.CashierSessionResponse;
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

    @Transactional
    public CashierSessionResponse openSession(CashierSessionOpenRequest request) {
        GlobalSession globalSession = globalSessionRepository.findCurrentSession(com.follysitou.sellia_backend.enums.GlobalSessionStatus.OPEN)
                .orElseThrow(() -> new ConflictException(
                        "session",
                        "global",
                        "Global session is not open. Contact administrator."
                ));

        Cashier cashier = cashierService.getCashierEntityById(request.getCashierId());

        var existingSession = cashierSessionRepository.findActiveByCashierAndGlobalSession(
                request.getCashierId(),
                globalSession
        );
        if (existingSession.isPresent()) {
            throw new ConflictException(
                    "cashier",
                    request.getCashierId(),
                    "This cashier already has an active session in the current global session"
            );
        }

        if (!cashierService.validatePin(request.getPin(), request.getCashierId())) {
            throw new ConflictException(
                    "pin",
                    "invalid",
                    "Invalid PIN for this cashier"
            );
        }

        User currentUser = getCurrentUser();

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
        return cashierSessionMapper.toResponse(updatedSession);
    }

    public CashierSessionResponse getCurrentSession() {
        User currentUser = getCurrentUser();
        CashierSession session = cashierSessionRepository.findCurrentSessionByUser(currentUser.getPublicId())
                .orElseThrow(() -> new ResourceNotFoundException("CashierSession", "user", currentUser.getPublicId()));
        return cashierSessionMapper.toResponse(session);
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

    public CashierSession getCashierSessionEntityById(String publicId) {
        return cashierSessionRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("CashierSession", "publicId", publicId));
    }

    private GlobalSession getGlobalSessionById(String publicId) {
        return globalSessionRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("GlobalSession", "publicId", publicId));
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
