package com.follysitou.sellia_backend.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

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
    private Boolean lowStock;
    private List<CategorySimpleResponse> categories;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class CategorySimpleResponse {
        private String publicId;
        private String name;
    }
}
