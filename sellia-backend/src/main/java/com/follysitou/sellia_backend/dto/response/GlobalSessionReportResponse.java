package com.follysitou.sellia_backend.dto.response;

import com.follysitou.sellia_backend.enums.GlobalSessionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class GlobalSessionReportResponse {

    private String publicId;
    private GlobalSessionStatus status;
    private LocalDateTime openedAt;
    private LocalDateTime closedAt;
    private UserResponse openedBy;
    private UserResponse closedBy;

    private Long initialAmount;
    private Long finalAmount;
    private Long totalSales;
    private Long totalOrders;
    private Long totalDiscounts;

    private List<CashierSessionSummary> cashierSessions;
    private List<OrderSummary> topProducts;

    @Data
    @Builder
    public static class CashierSessionSummary {
        private String publicId;
        private String cashierName;
        private String cashierNumber;
        private String userName;
        private LocalDateTime openedAt;
        private LocalDateTime closedAt;
        private Long totalSales;
        private Long orderCount;
    }

    @Data
    @Builder
    public static class OrderSummary {
        private String productName;
        private Integer quantity;
        private Long totalAmount;
    }

    @Data
    public static class UserResponse {
        private String publicId;
        private String firstName;
        private String lastName;
        private String username;
    }
}
