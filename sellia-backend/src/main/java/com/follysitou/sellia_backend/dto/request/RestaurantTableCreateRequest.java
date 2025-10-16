package com.follysitou.sellia_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RestaurantTableCreateRequest {

    @NotBlank(message = "Table number is required")
    private String number;

    @Size(max = 50, message = "Table name must not exceed 50 characters")
    private String name;

    @NotNull(message = "Capacity is required")
    @Positive(message = "Capacity must be positive")
    private Integer capacity;

    @NotBlank(message = "Room is required")
    @Size(max = 30, message = "Room must not exceed 30 characters")
    private String room;

    private Boolean available = true;

    private Boolean isVip = false;
}
