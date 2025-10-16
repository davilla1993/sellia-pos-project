package com.follysitou.sellia_backend.dto.request;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ProductUpdateRequest {

    @Size(max = 100, message = "Product name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @Positive(message = "Price must be positive")
    private Long price;

    private Long discountPrice;

    private Integer stockQuantity;

    private Integer minStockThreshold;

    private Long categoryId;

    private MultipartFile image;

    private Boolean available;

    private Integer preparationTime;

    private Boolean isVip;

    private Integer displayOrder;
}
