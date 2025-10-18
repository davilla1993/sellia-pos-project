package com.follysitou.sellia_backend.mapper;

import com.follysitou.sellia_backend.dto.request.ProductCreateRequest;
import com.follysitou.sellia_backend.dto.request.ProductUpdateRequest;
import com.follysitou.sellia_backend.dto.response.ProductResponse;
import com.follysitou.sellia_backend.model.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProductMapper {

    public Product toEntity(ProductCreateRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(null)
                .available(request.getAvailable())
                .preparationTime(request.getPreparationTime() != null ? Integer.valueOf(request.getPreparationTime()) : null)
                .isVip(request.getIsVip())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .build();
        
        // Note: imageUrl will be set in service layer after file upload
        // Category will be set in the service layer
        return product;
    }

    public ProductResponse toResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setPublicId(product.getPublicId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
        response.setAvailable(product.getAvailable());
        response.setImageUrl(product.getImageUrl());
        response.setPreparationTime(product.getPreparationTime());
        response.setIsVip(product.getIsVip());
        response.setDisplayOrder(product.getDisplayOrder());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        return response;
    }

    public void updateEntityFromRequest(ProductUpdateRequest request, Product product) {
        if (request.getName() != null) {
            product.setName(request.getName());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getAvailable() != null) {
            product.setAvailable(request.getAvailable());
        }
        if (request.getPreparationTime() != null) {
            product.setPreparationTime(request.getPreparationTime());
        }
        if (request.getIsVip() != null) {
            product.setIsVip(request.getIsVip());
        }
        if (request.getDisplayOrder() != null) {
            product.setDisplayOrder(request.getDisplayOrder());
        }
        // Note: Image file handling is done in service layer
        // Category will be handled in service layer
    }
}
