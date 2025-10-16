package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.request.ProductCreateRequest;
import com.follysitou.sellia_backend.dto.request.ProductUpdateRequest;
import com.follysitou.sellia_backend.dto.response.ProductResponse;
import com.follysitou.sellia_backend.exception.ConflictException;
import com.follysitou.sellia_backend.exception.ResourceNotFoundException;
import com.follysitou.sellia_backend.mapper.ProductMapper;
import com.follysitou.sellia_backend.model.Category;
import com.follysitou.sellia_backend.model.Product;
import com.follysitou.sellia_backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final CategoryService categoryService;

    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request) {
        if (productRepository.existsByNameAndDeletedFalse(request.getName())) {
            throw new ConflictException("name", request.getName(), "Product already exists");
        }

        Product product = productMapper.toEntity(request);

        // Get category
        Category category = new Category();
        category.setId(request.getCategoryId());
        product.setCategory(category);

        Product saved = productRepository.save(product);
        return productMapper.toResponse(saved);
    }

    public ProductResponse getProductById(String publicId) {
        Product product = productRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "publicId", publicId));
        return productMapper.toResponse(product);
    }

    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        Page<Product> products = productRepository.findAll(pageable);
        return products.map(productMapper::toResponse);
    }

    public Page<ProductResponse> getAllAvailableProducts(Pageable pageable) {
        Page<Product> products = productRepository.findAllAvailableProducts(pageable);
        return products.map(productMapper::toResponse);
    }

    public Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable) {
        Page<Product> products = productRepository.findByCategoryId(categoryId, pageable);
        return products.map(productMapper::toResponse);
    }

    public Page<ProductResponse> searchProducts(String name, Pageable pageable) {
        Page<Product> products = productRepository.findByNameContaining(name, name, pageable);
        return products.map(productMapper::toResponse);
    }

    public Page<ProductResponse> getProductsByPriceRange(Long minPrice, Long maxPrice, Pageable pageable) {
        Page<Product> products = productRepository.findByPriceRange(minPrice, maxPrice, pageable);
        return products.map(productMapper::toResponse);
    }

    @Transactional
    public ProductResponse updateProduct(String publicId, ProductUpdateRequest request) {
        Product product = productRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "publicId", publicId));

        if (request.getName() != null && !request.getName().equals(product.getName())) {
            if (productRepository.existsByNameAndDeletedFalse(request.getName())) {
                throw new ConflictException("name", request.getName(), "Product already exists");
            }
        }

        if (request.getCategoryId() != null) {
            Category category = new Category();
            category.setId(request.getCategoryId());
            product.setCategory(category);
        }

        productMapper.updateEntityFromRequest(request, product);
        Product updated = productRepository.save(product);
        return productMapper.toResponse(updated);
    }

    @Transactional
    public void deleteProduct(String publicId) {
        Product product = productRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "publicId", publicId));
        product.setDeleted(true);
        productRepository.save(product);
    }
}
