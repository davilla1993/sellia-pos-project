package com.follysitou.sellia_backend.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CategoryResponse {

    private Long id;
    private String publicId;
    private String name;
    private String description;
    private String icon;
    private Integer displayOrder;
    private Boolean available;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
