package com.follysitou.sellia_backend.dto.request;

import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class OrderUpdateRequest {

    private Long discountAmount;

    private String notes;

    private String customerName;

    private String customerPhone;
}
