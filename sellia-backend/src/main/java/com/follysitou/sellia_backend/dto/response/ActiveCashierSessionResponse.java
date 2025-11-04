package com.follysitou.sellia_backend.dto.response;

import com.follysitou.sellia_backend.enums.CashierSessionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ActiveCashierSessionResponse {

    private String publicId;
    private String globalSessionPublicId;

    // Cashier info (flat)
    private String cashierId;
    private String cashierName;
    private String cashierNumber;

    // User info (flat)
    private String userId;
    private String userName;
    private String userEmail;
    private String userFullName;

    // Session info
    private CashierSessionStatus status;
    private LocalDateTime openedAt;
    private LocalDateTime lockedAt;
    private LocalDateTime closedAt;
    private LocalDateTime lastActivityAt;
    private Integer inactivityLockMinutes;

    // Financial info
    private Long initialAmount;
    private Long finalAmount;
    private Long totalSales;

    // Statistics
    private Long orderCount;

    // Duration
    private Long durationMinutes;
    private Long inactivityMinutes;

    private String notes;
}
