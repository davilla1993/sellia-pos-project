package com.follysitou.sellia_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import com.follysitou.sellia_backend.enums.OrderType;

import java.util.List;

@Data
public class OrderCreateRequest {

    private String tablePublicId; // Optional for TAKEAWAY orders

    private String customerSessionPublicId;

    private OrderType orderType = OrderType.TABLE;

    @NotEmpty(message = "At least one item is required")
    @NotNull(message = "Order items are required")
    private List<OrderItemRequest> items;

    private Long discountAmount;

    private String notes;

    private String customerName;

    private String customerPhone;

    @Data
    public static class OrderItemRequest {
        @NotBlank(message = "Menu Item ID is required")
        private String menuItemPublicId;

        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be positive")
        private Integer quantity;

        private String productPublicId; // Optional: if MenuItem has multiple products

        private String notes;
    }
}
