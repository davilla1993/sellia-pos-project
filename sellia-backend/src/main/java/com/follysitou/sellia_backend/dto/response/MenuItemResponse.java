package com.follysitou.sellia_backend.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class MenuItemResponse {

    private String publicId;
    private String menuId;
    private List<ProductSummary> products;
    private Integer displayOrder;
    private Long priceOverride;
    private Boolean available;
    private Boolean isSpecial;
    private String specialDescription;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class ProductSummary {
        private String publicId;
        private String name;
        private Long price;
        private String imageUrl;

        public ProductSummary(String publicId, String name, Long price, String imageUrl) {
            this.publicId = publicId;
            this.name = name;
            this.price = price;
            this.imageUrl = imageUrl;
        }
    }
}
