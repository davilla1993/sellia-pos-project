package com.follysitou.sellia_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

@Data
public class OrderCreateRequest {

    @NotBlank(message = "Table ID is required")
    private String tablePublicId;

    private String customerSessionPublicId;

    @NotEmpty(message = "At least one item is required")
    @NotNull(message = "Order items are required")
    private List<OrderItemRequest> items;

    private Long discountAmount;

    private String notes;

    private String customerName;

    private String customerPhone;

    @Data
    public static class OrderItemRequest {
        @NotBlank(message = "Product ID is required")
        private String productPublicId;

        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be positive")
        private Integer quantity;

        private String notes;
    }
}
