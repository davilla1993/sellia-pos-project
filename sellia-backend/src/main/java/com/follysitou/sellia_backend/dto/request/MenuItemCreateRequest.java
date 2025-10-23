package com.follysitou.sellia_backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class MenuItemCreateRequest {

    @NotNull(message = "Menu ID is required")
    private String menuId;

    @NotEmpty(message = "At least one product is required")
    private List<String> productIds;

    @Min(value = 0L, message = "Display order cannot be negative")
    private Integer displayOrder = 0;

    @Min(value = 0L, message = "Price override cannot be negative")
    private Long priceOverride;

    private Boolean available = true;

    private Boolean isSpecial = false;

    @Size(max = 255, message = "Special description must not exceed 255 characters")
    private String specialDescription;
}
