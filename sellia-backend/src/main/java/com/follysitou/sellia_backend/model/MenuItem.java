package com.follysitou.sellia_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "menu_items", indexes = {
        @Index(name = "idx_menu_item_menu", columnList = "menuId")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id", nullable = false)
    private Menu menu;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "menu_item_products",
            joinColumns = @JoinColumn(name = "menu_item_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    @Builder.Default
    private Set<Product> products = new HashSet<>();

    @Column(nullable = false)
    private Integer displayOrder = 0;

    @Min(value = 0L, message = "Price override cannot be negative")
    @Column(name = "price_override")
    private Long priceOverride;

    @Min(value = 0L, message = "Bundle price cannot be negative")
    @Column(name = "bundle_price")
    private Long bundlePrice;

    @Column(nullable = false)
    private Boolean available = true;

    @Column(name = "is_special")
    private Boolean isSpecial = false;

    @Size(max = 255)
    @Column(name = "special_description")
    private String specialDescription;
}
