package com.follysitou.sellia_backend.dto.request;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RestaurantTableUpdateRequest {

    private String number;

    @Size(max = 50, message = "Table name must not exceed 50 characters")
    private String name;

    @Positive(message = "Capacity must be positive")
    private Integer capacity;

    @Size(max = 30, message = "Room must not exceed 30 characters")
    private String room;

    private Boolean available;

    private Boolean isVip;

    private String qrCodeUrl;

    private Boolean occupied;
}
