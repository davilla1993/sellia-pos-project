package com.follysitou.sellia_backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CashierReportResponse {

    private String cashierPublicId;
    private String cashierName;
    private String cashierNumber;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;

    private Long totalSales;
    private Long totalOrders;
    private Long totalDiscounts;
    private Long averageOrderValue;

    private List<SessionSummary> sessions;
    private List<ProductSummary> topProducts;
    private List<UserSummary> users;

    @Data
    @Builder
    public static class SessionSummary {
        private String sessionPublicId;
        private String userName;
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

    @Data
    @Builder
    public static class UserSummary {
        private String userPublicId;
        private String firstName;
        private String lastName;
        private Long totalSales;
        private Long orderCount;
    }
}
