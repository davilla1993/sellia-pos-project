package com.follysitou.sellia_backend.dto.response;

import com.follysitou.sellia_backend.enums.GlobalSessionStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class GlobalSessionResponse {

    private String publicId;
    private GlobalSessionStatus status;
    private LocalDateTime openedAt;
    private LocalDateTime closedAt;
    private UserResponse openedBy;
    private UserResponse closedBy;
    private Long initialAmount;
    private Long finalAmount;
    private Long totalSales;
    private String reconciliationNotes;
    private Long reconciliationAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Total amount from all cashier sessions (sum of their final amounts)
    private Long totalCashierSessionsAmount;
}
