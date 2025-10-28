package com.follysitou.sellia_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicMenuResponse {

    private String tablePublicId;
    private String tableNumber;
    private Boolean isVip;
    private String customerSessionToken;
    
    private List<MenuCategoryResponse> categories;
    private List<MenuItemResponse> popularItems;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuCategoryResponse {
        private String publicId;
        private String name;
        private String description;
        private Integer itemCount;
        private List<MenuItemResponse> items;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuItemResponse {
        private String publicId;
        private String menuName;
        private String itemName;
        private Long price;
        private String description;
        private String imageUrl;
        private Integer preparationTime;
        private List<String> allergens;
        private Boolean isSpecial;
        private String specialDescription;
        private String categoryName;
        private Long categoryId;
        private Integer productCount;
        private List<ComboProductDetail> comboProducts;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComboProductDetail {
        private String name;
        private String imageUrl;
        private Long price;
    }
}
