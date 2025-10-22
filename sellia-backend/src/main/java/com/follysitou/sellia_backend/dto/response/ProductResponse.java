package com.follysitou.sellia_backend.dto.response;

import com.follysitou.sellia_backend.enums.WorkStation;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProductResponse {

    private String publicId;
    private String name;
    private String description;
    private Long price;
    private Long categoryId;
    private Boolean available;
    private String imageUrl;
    private Integer preparationTime;
    private Boolean isVip;
    private Integer displayOrder;
    private WorkStation workStation;
    private Long stock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
