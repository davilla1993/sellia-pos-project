package com.follysitou.sellia_backend.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProductResponse {

    private String publicId;
    private String name;
    private String description;
    private Long price;
    private Boolean available;
    private String imageUrl;
    private Integer preparationTime;
    private Boolean isVip;
    private Integer displayOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
