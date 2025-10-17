package com.follysitou.sellia_backend.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class StockUpdateRequest {

    @Min(value = 0, message = "Current quantity cannot be negative")
    private Long currentQuantity;

    private Long alertThreshold;

    private Long minimumQuantity;

    private Long maximumQuantity;

    private Boolean active;

    private String supplierInfo;
}
