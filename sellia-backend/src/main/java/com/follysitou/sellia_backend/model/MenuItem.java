package com.follysitou.sellia_backend.model;

import com.follysitou.sellia_backend.enums.MenuType;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;



@Entity
@Table(name = "menu_items", indexes = {
        @Index(name = "idx_menu_item_menu", columnList = "menuId"),
        @Index(name = "idx_menu_item_product", columnList = "productId")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id", nullable = false)
    private Menu menu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer displayOrder = 0;

    @Min(value = 0L, message = "Price override cannot be negative")
    @Column
    private Long priceOverride;

    @Column(nullable = false)
    private Boolean available = true;

    @Column(name = "is_special")
    private Boolean isSpecial = false;

    @Size(max = 255)
    @Column(name = "special_description")
    private String specialDescription;
}
