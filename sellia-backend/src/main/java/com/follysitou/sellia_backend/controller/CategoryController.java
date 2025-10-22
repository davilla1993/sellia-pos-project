package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.dto.request.CategoryCreateRequest;
import com.follysitou.sellia_backend.dto.request.CategoryUpdateRequest;
import com.follysitou.sellia_backend.dto.response.CategoryResponse;
import com.follysitou.sellia_backend.dto.response.PagedResponse;
import com.follysitou.sellia_backend.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryCreateRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{publicId}")
    public ResponseEntity<CategoryResponse> getCategory(@PathVariable String publicId) {
        CategoryResponse response = categoryService.getCategoryById(publicId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<PagedResponse<CategoryResponse>> getAllCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CategoryResponse> categories = categoryService.getAllCategories(pageable);
        PagedResponse<CategoryResponse> response = PagedResponse.of(categories);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active/list")
    public ResponseEntity<List<CategoryResponse>> getAllActiveCategories() {
        List<CategoryResponse> categories = categoryService.getAllActiveCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/ordered/list")
    public ResponseEntity<List<CategoryResponse>> getAllOrderedByDisplayOrder() {
        List<CategoryResponse> categories = categoryService.getAllOrderedByDisplayOrder();
        return ResponseEntity.ok(categories);
    }

    @PutMapping("/{publicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable String publicId,
            @Valid @RequestBody CategoryUpdateRequest request) {
        CategoryResponse response = categoryService.updateCategory(publicId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{publicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable String publicId) {
        categoryService.deleteCategory(publicId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{publicId}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> activateCategory(@PathVariable String publicId) {
        categoryService.activateCategory(publicId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{publicId}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateCategory(@PathVariable String publicId) {
        categoryService.deactivateCategory(publicId);
        return ResponseEntity.noContent().build();
    }
}
