package com.follysitou.sellia_backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProductReportResponse {

    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;

    private Long totalRevenue;
    private Long totalQuantitySold;
    private Long totalOrders;
    private Integer totalProducts;

    private List<ProductDetail> products;

    @Data
    @Builder
    public static class ProductDetail {
        private String productId;
        private String productName;
        private String categoryName;
        private Integer quantitySold;
        private Long totalRevenue;
        private Long orderCount;
        private Long averagePrice;
        private Boolean isAvailable;
    }
}
