package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.dto.request.ProductCreateRequest;
import com.follysitou.sellia_backend.dto.request.ProductUpdateRequest;
import com.follysitou.sellia_backend.dto.response.PagedResponse;
import com.follysitou.sellia_backend.dto.response.ProductResponse;
import com.follysitou.sellia_backend.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @Value("${app.products-images-dir:./uploads/products}")
    private String productsImagesDir;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ProductResponse> createProduct(@Valid @ModelAttribute ProductCreateRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/images/{filename}")
    public ResponseEntity<Resource> getProductImage(@PathVariable String filename) throws IOException {
        try {
            Resource resource = new UrlResource(Paths.get(productsImagesDir)
                    .resolve(filename)
                    .toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{publicId}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable String publicId) {
        ProductResponse response = productService.getProductById(publicId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<PagedResponse<ProductResponse>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> products = productService.getAllProducts(pageable);
        PagedResponse<ProductResponse> response = PagedResponse.of(products);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/available/list")
    public ResponseEntity<PagedResponse<ProductResponse>> getAvailableProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> products = productService.getAllAvailableProducts(pageable);
        PagedResponse<ProductResponse> response = PagedResponse.of(products);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unavailable/list")
    public ResponseEntity<PagedResponse<ProductResponse>> getUnavailableProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> products = productService.getAllUnavailableProducts(pageable);
        PagedResponse<ProductResponse> response = PagedResponse.of(products);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<PagedResponse<ProductResponse>> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> products = productService.getProductsByCategory(categoryId, pageable);
        PagedResponse<ProductResponse> response = PagedResponse.of(products);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<PagedResponse<ProductResponse>> searchProducts(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> products = productService.searchProducts(name, pageable);
        PagedResponse<ProductResponse> response = PagedResponse.of(products);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/price-range")
    public ResponseEntity<PagedResponse<ProductResponse>> getProductsByPriceRange(
            @RequestParam Long minPrice,
            @RequestParam Long maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> products = productService.getProductsByPriceRange(minPrice, maxPrice, pageable);
        PagedResponse<ProductResponse> response = PagedResponse.of(products);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/{publicId}", consumes = "multipart/form-data")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable String publicId,
            @Valid @ModelAttribute ProductUpdateRequest request) {
        ProductResponse response = productService.updateProduct(publicId, request);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{publicId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String publicId) {
        productService.deleteProduct(publicId);
        return ResponseEntity.noContent().build();
    }
}
