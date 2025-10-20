package com.follysitou.sellia_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import com.follysitou.sellia_backend.enums.WorkStation;



@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_product_name", columnList = "name"),
        @Index(name = "idx_product_category", columnList = "categoryId"),
        @Index(name = "idx_product_available", columnList = "available")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Product extends BaseEntity {

    @NotBlank(message = "Product name is required")
    @Size(max = 100, message = "Product name must not exceed 100 characters")
    @Column(nullable = false)
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Price is required")
    @Min(value = 0L, message = "Price must be positive")
    @Column(nullable = false)
    private Long price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private Boolean available = true;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "preparation_time")
    private Integer preparationTime; // en minutes

    @Column(name = "is_vip")
    private Boolean isVip = false;

    @Column(name = "allergens")
    private String allergens; // JSON format

    @Column(name = "ingredients")
    private String ingredients; // JSON format

    @Column(nullable = false)
    private Integer displayOrder = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkStation workStation = WorkStation.KITCHEN;
}
