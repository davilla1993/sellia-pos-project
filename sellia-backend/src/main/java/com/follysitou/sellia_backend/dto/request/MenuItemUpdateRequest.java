package com.follysitou.sellia_backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class MenuItemUpdateRequest {

    private List<String> productIds;

    @Min(value = 0L, message = "Display order cannot be negative")
    private Integer displayOrder;

    @Min(value = 0L, message = "Price override cannot be negative")
    private Long priceOverride;

    private Boolean available;

    private Boolean isSpecial;

    @Size(max = 255, message = "Special description must not exceed 255 characters")
    private String specialDescription;
}
