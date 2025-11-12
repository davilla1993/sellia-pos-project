package com.follysitou.sellia_backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TableReportResponse {

    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;

    private Long totalRevenue;
    private Long totalOrders;
    private Long totalDiscounts;
    private Long averageOrderValue;

    private Long tableRevenue;
    private Long tableOrders;
    private Long takeawayRevenue;
    private Long takeawayOrders;

    private List<TableDetail> tables;
    private TableDetail takeawaySummary;

    @Data
    @Builder
    public static class TableDetail {
        private String tableId;
        private String tableName;
        private String tableNumber;
        private Long totalRevenue;
        private Long orderCount;
        private Long averageOrderValue;
        private Long totalDiscounts;
    }
}
