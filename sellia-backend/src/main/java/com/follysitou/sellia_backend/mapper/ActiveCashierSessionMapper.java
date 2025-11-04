package com.follysitou.sellia_backend.mapper;

import com.follysitou.sellia_backend.dto.response.ActiveCashierSessionResponse;
import com.follysitou.sellia_backend.model.CashierSession;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;

@Component
public class ActiveCashierSessionMapper {

    public ActiveCashierSessionResponse toResponse(CashierSession session, Long orderCount) {
        LocalDateTime now = LocalDateTime.now();

        // Calculate duration in minutes
        Long durationMinutes = null;
        if (session.getOpenedAt() != null) {
            LocalDateTime endTime = session.getClosedAt() != null ? session.getClosedAt() : now;
            durationMinutes = Duration.between(session.getOpenedAt(), endTime).toMinutes();
        }

        // Calculate inactivity in minutes
        Long inactivityMinutes = null;
        if (session.getLastActivityAt() != null) {
            inactivityMinutes = Duration.between(session.getLastActivityAt(), now).toMinutes();
        }

        return ActiveCashierSessionResponse.builder()
                .publicId(session.getPublicId())
                .globalSessionPublicId(session.getGlobalSession().getPublicId())
                // Cashier info
                .cashierId(session.getCashier().getPublicId())
                .cashierName(session.getCashier().getName())
                .cashierNumber(session.getCashier().getCashierNumber())
                // User info
                .userId(session.getUser().getPublicId())
                .userName(session.getUser().getUsername())
                .userEmail(session.getUser().getEmail())
                .userFullName(session.getUser().getFirstName() + " " + session.getUser().getLastName())
                // Session info
                .status(session.getStatus())
                .openedAt(session.getOpenedAt())
                .lockedAt(session.getLockedAt())
                .closedAt(session.getClosedAt())
                .lastActivityAt(session.getLastActivityAt())
                .inactivityLockMinutes(session.getInactivityLockMinutes())
                // Financial info
                .initialAmount(session.getInitialAmount())
                .finalAmount(session.getFinalAmount())
                .totalSales(session.getTotalSales())
                // Statistics
                .orderCount(orderCount != null ? orderCount : 0L)
                // Duration
                .durationMinutes(durationMinutes)
                .inactivityMinutes(inactivityMinutes)
                .notes(session.getNotes())
                .build();
    }
}
