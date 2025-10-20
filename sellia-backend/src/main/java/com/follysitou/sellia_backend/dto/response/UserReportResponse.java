package com.follysitou.sellia_backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class UserReportResponse {

    private String userPublicId;
    private String firstName;
    private String lastName;
    private String username;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;

    private Long totalSales;
    private Long totalOrders;
    private Long totalDiscounts;
    private Long averageOrderValue;
    private Double averageDiscount;

    private List<CashierSummary> cashiers;
    private List<SessionSummary> sessions;
    private List<ProductSummary> topProducts;

    @Data
    @Builder
    public static class CashierSummary {
        private String cashierPublicId;
        private String cashierName;
        private Long totalSales;
        private Long orderCount;
    }

    @Data
    @Builder
    public static class SessionSummary {
        private String sessionPublicId;
        private String cashierName;
        private LocalDateTime openedAt;
        private LocalDateTime closedAt;
        private Long salesAmount;
        private Long orderCount;
    }

    @Data
    @Builder
    public static class ProductSummary {
        private String productName;
        private Integer quantity;
        private Long totalAmount;
    }
}
