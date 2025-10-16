package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.request.CategoryCreateRequest;
import com.follysitou.sellia_backend.dto.request.CategoryUpdateRequest;
import com.follysitou.sellia_backend.dto.response.CategoryResponse;
import com.follysitou.sellia_backend.exception.ConflictException;
import com.follysitou.sellia_backend.exception.ResourceNotFoundException;
import com.follysitou.sellia_backend.mapper.CategoryMapper;
import com.follysitou.sellia_backend.model.Category;
import com.follysitou.sellia_backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Transactional
    public CategoryResponse createCategory(CategoryCreateRequest request) {
        if (categoryRepository.existsByNameAndDeletedFalse(request.getName())) {
            throw new ConflictException("name", request.getName(), "Category already exists");
        }

        Category category = categoryMapper.toEntity(request);
        Category saved = categoryRepository.save(category);
        return categoryMapper.toResponse(saved);
    }

    public CategoryResponse getCategoryById(String publicId) {
        Category category = categoryRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "publicId", publicId));
        return categoryMapper.toResponse(category);
    }

    public Page<CategoryResponse> getAllCategories(Pageable pageable) {
        Page<Category> categories = categoryRepository.findAll(pageable);
        return categories.map(categoryMapper::toResponse);
    }

    public List<CategoryResponse> getAllActiveCategories() {
        List<Category> categories = categoryRepository.findAllActiveCategories();
        return categories.stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<CategoryResponse> getAllOrderedByDisplayOrder() {
        List<Category> categories = categoryRepository.findAllOrderedByDisplayOrder();
        return categories.stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse updateCategory(String publicId, CategoryUpdateRequest request) {
        Category category = categoryRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "publicId", publicId));

        if (request.getName() != null && !request.getName().equals(category.getName())) {
            if (categoryRepository.existsByNameAndDeletedFalse(request.getName())) {
                throw new ConflictException("name", request.getName(), "Category already exists");
            }
        }

        categoryMapper.updateEntityFromRequest(request, category);
        Category updated = categoryRepository.save(category);
        return categoryMapper.toResponse(updated);
    }

    @Transactional
    public void deleteCategory(String publicId) {
        Category category = categoryRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "publicId", publicId));
        category.setDeleted(true);
        categoryRepository.save(category);
    }
}
