package com.follysitou.sellia_backend.dto.response;

import com.follysitou.sellia_backend.enums.OrderStatus;
import com.follysitou.sellia_backend.enums.OrderType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponse {

    private String publicId;
    private String orderNumber;
    private RestaurantTableResponse table;
    private OrderType orderType;
    private CustomerSessionResponse customerSession;
    private CashierSessionResponse cashierSession;
    private InvoiceResponse invoice;
    private List<OrderItemResponse> items;
    private OrderStatus status;
    private Long totalAmount;
    private Long discountAmount;
    private Long finalAmount;
    private String notes;
    private Boolean isPaid;
    private String paymentMethod;
    private LocalDateTime paidAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime completedAt;
    private String customerName;
    private String customerPhone;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Flattened fields for easier frontend access
    private String cashierSessionCashierName;
    private String tableNumber;
    private String createdByUserName;

    @Data
    public static class RestaurantTableResponse {
        private String publicId;
        private String number;
        private String name;
        private String room;
        private Integer capacity;
        private Boolean isVip;
        private Boolean occupied;
    }

    @Data
    public static class CustomerSessionResponse {
        private String publicId;
        private String qrCode;
        private LocalDateTime startedAt;
        private LocalDateTime endedAt;
    }

    @Data
    public static class CashierSessionResponse {
        private String publicId;
        private CashierResponse cashier;
        private UserResponse user;
        private LocalDateTime openedAt;
        private LocalDateTime closedAt;
    }

    @Data
    public static class CashierResponse {
        private String publicId;
        private String name;
        private String cashierNumber;
    }

    @Data
    public static class UserResponse {
        private String publicId;
        private String firstName;
        private String lastName;
        private String username;
    }

    @Data
    public static class InvoiceResponse {
        private String publicId;
        private String invoiceNumber;
        private Long totalAmount;
        private Boolean isPaid;
        private LocalDateTime paidAt;
    }

    @Data
    public static class OrderItemResponse {
        private String publicId;
        private MenuItemResponse menuItem;
        private ProductSimpleResponse product;
        private Integer quantity;
        private Long unitPrice;
        private Long totalPrice;
        private String notes;
        private String workStation;
    }

    @Data
    public static class MenuItemResponse {
        private String publicId;
        private String menuName;
        private Long priceOverride;
        private Long bundlePrice;
        private List<ProductSimpleResponse> products;
    }

    @Data
    public static class ProductSimpleResponse {
        private String publicId;
        private String name;
        private String imageUrl;
        private Integer preparationTime;
        private String workStation;
    }
}
