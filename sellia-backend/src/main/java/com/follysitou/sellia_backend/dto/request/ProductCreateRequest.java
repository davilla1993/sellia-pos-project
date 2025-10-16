package com.follysitou.sellia_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ProductCreateRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 100, message = "Product name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private Long price;

    private Long discountPrice;

    @NotNull(message = "Stock quantity is required")
    private Integer stockQuantity;

    private Integer minStockThreshold;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private MultipartFile image;

    private Boolean available = true;

    private Integer preparationTime;

    private Boolean isVip = false;

    private Integer displayOrder = 0;
}
