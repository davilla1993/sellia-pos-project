package com.follysitou.sellia_backend.dto.request;

import com.follysitou.sellia_backend.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private OrderStatus status;

    private String notes;
}
