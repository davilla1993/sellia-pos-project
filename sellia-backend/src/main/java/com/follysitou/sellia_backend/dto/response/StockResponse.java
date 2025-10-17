package com.follysitou.sellia_backend.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StockResponse {

    private String publicId;
    private String productPublicId;
    private String productName;
    private Long currentQuantity;
    private Long initialQuantity;
    private String unitOfMeasure;
    private Long alertThreshold;
    private Long minimumQuantity;
    private Long maximumQuantity;
    private Boolean active;
    private LocalDateTime lastRestocked;
    private String supplierInfo;
    private Boolean isLowStock;
    private Boolean isBelowMinimum;
    private Boolean isAboveMaximum;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
