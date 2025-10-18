package com.follysitou.sellia_backend.mapper;

import com.follysitou.sellia_backend.dto.request.CategoryCreateRequest;
import com.follysitou.sellia_backend.dto.request.CategoryUpdateRequest;
import com.follysitou.sellia_backend.dto.response.CategoryResponse;
import com.follysitou.sellia_backend.model.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public Category toEntity(CategoryCreateRequest request) {
        return Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .icon(request.getIcon())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .build();
    }

    public CategoryResponse toResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setPublicId(category.getPublicId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());
        response.setIcon(category.getIcon());
        response.setDisplayOrder(category.getDisplayOrder());
        response.setAvailable(category.getAvailable());
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());
        return response;
    }

    public void updateEntityFromRequest(CategoryUpdateRequest request, Category category) {
        if (request.getName() != null) {
            category.setName(request.getName());
        }
        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
        if (request.getIcon() != null) {
            category.setIcon(request.getIcon());
        }
        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getAvailable() != null) {
            category.setAvailable(request.getAvailable());
        }
    }
}
