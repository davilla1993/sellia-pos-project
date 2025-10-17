package com.follysitou.sellia_backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StockCreateRequest {

    @NotBlank(message = "Product ID is required")
    private String productPublicId;

    @NotNull(message = "Current quantity is required")
    @Min(value = 0, message = "Current quantity cannot be negative")
    private Long currentQuantity;

    @NotNull(message = "Initial quantity is required")
    @Min(value = 0, message = "Initial quantity cannot be negative")
    private Long initialQuantity;

    private String unitOfMeasure;

    private Long alertThreshold;

    private Long minimumQuantity;

    private Long maximumQuantity;

    private Boolean active = true;

    private String supplierInfo;
}
