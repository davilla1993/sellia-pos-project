package com.follysitou.sellia_backend.mapper;

import com.follysitou.sellia_backend.dto.request.ProductCreateRequest;
import com.follysitou.sellia_backend.dto.request.ProductUpdateRequest;
import com.follysitou.sellia_backend.dto.response.ProductResponse;
import com.follysitou.sellia_backend.model.Product;
import com.follysitou.sellia_backend.model.Category;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

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
        response.setAvailable(product.getAvailable());
        response.setImageUrl(product.getImageUrl());
        response.setPreparationTime(product.getPreparationTime());
        response.setIsVip(product.getIsVip());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());

        // Map single category to list for consistency
        if (product.getCategory() != null) {
            response.setCategories(List.of(toCategorySimpleResponse(product.getCategory())));
        }

        // Set low stock null since stock is managed separately in Stock entity
        response.setLowStock(null);

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
            product.setPreparationTime(Integer.valueOf(request.getPreparationTime()));
        }
        if (request.getIsVip() != null) {
            product.setIsVip(request.getIsVip());
        }
        // Note: Image file handling is done in service layer
        // Category will be handled in service layer
    }

    private ProductResponse.CategorySimpleResponse toCategorySimpleResponse(Category category) {
        ProductResponse.CategorySimpleResponse response = new ProductResponse.CategorySimpleResponse();
        response.setPublicId(category.getPublicId());
        response.setName(category.getName());
        return response;
    }
}
