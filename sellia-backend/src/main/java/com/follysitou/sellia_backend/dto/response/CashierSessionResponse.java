package com.follysitou.sellia_backend.dto.response;

import com.follysitou.sellia_backend.enums.CashierSessionStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CashierSessionResponse {

    private String publicId;
    private String globalSessionPublicId;
    private CashierResponse cashier;
    private UserResponse user;
    private CashierSessionStatus status;
    private LocalDateTime openedAt;
    private LocalDateTime lockedAt;
    private LocalDateTime unlockedAt;
    private LocalDateTime closedAt;
    private Long initialAmount;
    private Long finalAmount;
    private Long totalSales;
    private LocalDateTime lastActivityAt;
    private Integer inactivityLockMinutes;
    private String notes;
    private Long totalCashEntrees;    // Total cash in operations
    private Long totalCashSorties;    // Total cash out operations
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
