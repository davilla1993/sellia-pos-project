package com.follysitou.sellia_backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GlobalSessionSummaryResponse {

    private String globalSessionId;

    // Total from all cashier sessions
    private Long totalInitialAmount;      // Sum of all cashier session initial amounts
    private Long totalSales;              // Sum of all sales from all cashiers
    private Long totalCashEntrees;        // Sum of all cash IN operations
    private Long totalCashSorties;        // Sum of all cash OUT operations

    // Calculated expected amount
    private Long expectedAmount;          // totalInitialAmount + totalSales + totalCashEntrees - totalCashSorties

    // Number of cashier sessions
    private Integer totalCashierSessions;
    private Integer openCashierSessions;
    private Integer closedCashierSessions;
}
