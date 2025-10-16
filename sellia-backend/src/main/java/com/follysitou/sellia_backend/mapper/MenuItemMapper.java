package com.follysitou.sellia_backend.mapper;

import com.follysitou.sellia_backend.dto.request.MenuItemCreateRequest;
import com.follysitou.sellia_backend.dto.request.MenuItemUpdateRequest;
import com.follysitou.sellia_backend.dto.response.MenuItemResponse;
import com.follysitou.sellia_backend.model.Menu;
import com.follysitou.sellia_backend.model.MenuItem;
import com.follysitou.sellia_backend.model.Product;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class MenuItemMapper {

    public MenuItem toEntity(MenuItemCreateRequest request, Menu menu, Set<Product> products) {
        return MenuItem.builder()
                .menu(menu)
                .products(products)
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .priceOverride(request.getPriceOverride())
                .bundlePrice(request.getBundlePrice())
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .isSpecial(request.getIsSpecial() != null ? request.getIsSpecial() : false)
                .specialDescription(request.getSpecialDescription())
                .build();
    }

    public MenuItemResponse toResponse(MenuItem menuItem) {
        MenuItemResponse response = new MenuItemResponse();
        response.setPublicId(menuItem.getPublicId());
        response.setMenuId(menuItem.getMenu().getPublicId());
        response.setDisplayOrder(menuItem.getDisplayOrder());
        response.setPriceOverride(menuItem.getPriceOverride());
        response.setBundlePrice(menuItem.getBundlePrice());
        response.setAvailable(menuItem.getAvailable());
        response.setIsSpecial(menuItem.getIsSpecial());
        response.setSpecialDescription(menuItem.getSpecialDescription());
        response.setCreatedAt(menuItem.getCreatedAt());
        response.setUpdatedAt(menuItem.getUpdatedAt());

        if (menuItem.getProducts() != null && !menuItem.getProducts().isEmpty()) {
            response.setProducts(menuItem.getProducts().stream()
                    .map(p -> new MenuItemResponse.ProductSummary(
                            p.getPublicId(),
                            p.getName(),
                            p.getPrice(),
                            p.getImageUrl()
                    ))
                    .collect(Collectors.toList()));

            // Calculate total price
            if (menuItem.getBundlePrice() != null) {
                response.setCalculatedPrice(menuItem.getBundlePrice());
            } else {
                Long totalPrice = menuItem.getProducts().stream()
                        .mapToLong(p -> p.getPrice() != null ? p.getPrice() : 0)
                        .sum();
                response.setCalculatedPrice(totalPrice);
            }
        }

        return response;
    }

    public void updateEntityFromRequest(MenuItemUpdateRequest request, MenuItem menuItem, Set<Product> products) {
        if (request.getProductIds() != null && !request.getProductIds().isEmpty()) {
            menuItem.setProducts(products);
        }
        if (request.getDisplayOrder() != null) {
            menuItem.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getPriceOverride() != null) {
            menuItem.setPriceOverride(request.getPriceOverride());
        }
        if (request.getBundlePrice() != null) {
            menuItem.setBundlePrice(request.getBundlePrice());
        }
        if (request.getAvailable() != null) {
            menuItem.setAvailable(request.getAvailable());
        }
        if (request.getIsSpecial() != null) {
            menuItem.setIsSpecial(request.getIsSpecial());
        }
        if (request.getSpecialDescription() != null) {
            menuItem.setSpecialDescription(request.getSpecialDescription());
        }
    }
}
