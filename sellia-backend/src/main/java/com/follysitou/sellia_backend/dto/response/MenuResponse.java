package com.follysitou.sellia_backend.dto.response;

import com.follysitou.sellia_backend.enums.MenuType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class MenuResponse {

    private String publicId;
    private String name;
    private String description;
    private MenuType menuType;
    private Long bundlePrice;
    private Boolean active;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String imageUrl;
    private List<MenuItemResponse> menuItems;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class MenuItemResponse {
        private String publicId;
        private String productName;
        private Long price;
        private Integer position;
    }
}
