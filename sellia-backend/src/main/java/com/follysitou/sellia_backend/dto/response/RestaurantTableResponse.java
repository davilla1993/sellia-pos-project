package com.follysitou.sellia_backend.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RestaurantTableResponse {

    private String publicId;
    private String number;
    private String name;
    private Integer capacity;
    private String room;
    private Boolean available;
    private Boolean isVip;
    private String qrCodeUrl;
    private String qrCodeToken;
    private String currentOrderId;
    private Boolean occupied;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
