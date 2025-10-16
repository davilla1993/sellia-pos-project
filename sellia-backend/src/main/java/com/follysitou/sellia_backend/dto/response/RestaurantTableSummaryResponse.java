package com.follysitou.sellia_backend.dto.response;

import lombok.Data;

@Data
public class RestaurantTableSummaryResponse {

    private String publicId;
    private String number;
    private String name;
    private String room;
    private Integer capacity;
    private Boolean available;
    private Boolean isVip;
    private Boolean occupied;
}
