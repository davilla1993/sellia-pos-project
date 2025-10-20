package com.follysitou.sellia_backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

@Data
public class PublicOrderRequest {

    @NotBlank(message = "Customer session token is required")
    private String customerSessionToken;

    @NotEmpty(message = "At least one item is required")
    @Valid
    private List<OrderItemRequest> items;

    private String customerName;
    private String customerPhone;
    private String notes;
    private Long discountAmount;

    @Data
    public static class OrderItemRequest {
        @NotBlank(message = "MenuItem ID is required")
        private String menuItemPublicId;

        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be positive")
        private Integer quantity;

        private String notes;
    }
}
