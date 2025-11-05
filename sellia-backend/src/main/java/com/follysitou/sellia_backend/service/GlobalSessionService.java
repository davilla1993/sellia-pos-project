package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.request.GlobalSessionCloseRequest;
import com.follysitou.sellia_backend.dto.request.GlobalSessionOpenRequest;
import com.follysitou.sellia_backend.dto.response.GlobalSessionResponse;
import com.follysitou.sellia_backend.enums.GlobalSessionStatus;
import com.follysitou.sellia_backend.exception.ConflictException;
import com.follysitou.sellia_backend.exception.ResourceNotFoundException;
import com.follysitou.sellia_backend.mapper.GlobalSessionMapper;
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

@Service
@RequiredArgsConstructor
public class GlobalSessionService {

    private final GlobalSessionRepository globalSessionRepository;
    private final GlobalSessionMapper globalSessionMapper;
    private final com.follysitou.sellia_backend.repository.UserRepository userRepository;
    private final com.follysitou.sellia_backend.repository.OrderRepository orderRepository;

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

        GlobalSession session = GlobalSession.builder()
                .status(GlobalSessionStatus.OPEN)
                .openedAt(LocalDateTime.now())
                .openedBy(currentUser)
                .initialAmount(request.getInitialAmount())
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

        User currentUser = getCurrentUser();

        // Calculate final total sales before closing
        LocalDateTime startDate = session.getOpenedAt();
        LocalDateTime endDate = LocalDateTime.now();
        Long totalSales = orderRepository.getTotalRevenue(startDate, endDate);

        session.setStatus(GlobalSessionStatus.CLOSED);
        session.setClosedAt(endDate);
        session.setClosedBy(currentUser);
        session.setFinalAmount(request.getFinalAmount());
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

    public boolean isGlobalSessionOpen() {
        return globalSessionRepository.findCurrentSession(GlobalSessionStatus.OPEN).isPresent();
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
