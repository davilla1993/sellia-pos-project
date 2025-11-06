package com.follysitou.sellia_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionReportResponse {
    // Session Info
    private String sessionId;
    private String cashierName;
    private String cashierNumber;
    private String userName;
    private LocalDateTime openedAt;
    private LocalDateTime closedAt;

    // Financial Summary
    private Long initialAmount;
    private Long finalAmount;
    private Long expectedAmount;
    private Long discrepancy;

    // Sales Summary
    private Long totalSales;
    private Integer ordersCount;

    // Cash Operations Summary
    private Long totalCashEntrees;
    private Long totalCashSorties;
    private Integer cashEntreesCount;
    private Integer cashSortiesCount;

    // Detailed Lists
    private List<CashOperationResponse> cashOperations;

    // Closing Notes
    private String closingNotes;

    // Restaurant Info
    private String restaurantName;
    private String restaurantAddress;
    private String restaurantPhone;
}
