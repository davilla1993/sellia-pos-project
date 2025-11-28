package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.request.ProductCreateRequest;
import com.follysitou.sellia_backend.dto.request.ProductUpdateRequest;
import com.follysitou.sellia_backend.dto.response.ProductResponse;
import com.follysitou.sellia_backend.exception.ConflictException;
import com.follysitou.sellia_backend.exception.ResourceNotFoundException;
import com.follysitou.sellia_backend.mapper.ProductMapper;
import com.follysitou.sellia_backend.model.Category;
import com.follysitou.sellia_backend.model.Product;
import com.follysitou.sellia_backend.model.Stock;
import com.follysitou.sellia_backend.repository.ProductRepository;
import com.follysitou.sellia_backend.repository.StockRepository;
import com.follysitou.sellia_backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final CategoryService categoryService;
    private final FileService fileService;
    private final StockRepository stockRepository;

    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request) {
        if (productRepository.existsByNameAndDeletedFalse(request.getName())) {
            throw new ConflictException("name", request.getName(), "Ce produit existe déjà");
        }

        Product product = productMapper.toEntity(request);

        // Upload image if provided
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            String fileName = fileService.uploadProductImage(request.getImage());
            product.setImageUrl("/uploads/" + fileName);
            log.info("Product image uploaded: /uploads/{}", fileName);
        }

        // Get category
        Category category = new Category();
        category.setId(request.getCategoryId());
        product.setCategory(category);

        Product saved = productRepository.save(product);
        
        // Create stock entry if stockQuantity is provided
        if (request.getStockQuantity() != null && request.getStockQuantity() > 0) {
            Stock stock = Stock.builder()
                    .product(saved)
                    .currentQuantity(request.getStockQuantity().longValue())
                    .initialQuantity(request.getStockQuantity().longValue())
                    .alertThreshold(request.getMinStockThreshold() != null ? request.getMinStockThreshold().longValue() : 10L)
                    .minimumQuantity(request.getMinStockThreshold() != null ? request.getMinStockThreshold().longValue() : 0L)
                    .active(true)
                    .lastRestocked(java.time.LocalDateTime.now())
                    .build();
            stockRepository.save(stock);
            log.info("Stock created for product: {} with quantity: {}", saved.getName(), request.getStockQuantity());
        }
        
        return productMapper.toResponse(saved);
    }

    @Cacheable(value = "products", key = "#publicId")
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

    public Page<ProductResponse> getAllUnavailableProducts(Pageable pageable) {
        Page<Product> products = productRepository.findAllUnavailableProducts(pageable);
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

    @CacheEvict(value = "products", key = "#publicId")
    @Transactional
    public ProductResponse updateProduct(String publicId, ProductUpdateRequest request) {
        Product product = productRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "publicId", publicId));

        if (request.getName() != null && !request.getName().equals(product.getName())) {
            if (productRepository.existsByNameAndDeletedFalse(request.getName())) {
                throw new ConflictException("name", request.getName(), "Ce produit existe déjà");
            }
        }

        if (request.getCategoryId() != null) {
            Category category = new Category();
            category.setId(request.getCategoryId());
            product.setCategory(category);
        }

        // Handle image update
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            // Delete old image if it exists
            if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
                fileService.deleteProductImage(product.getImageUrl());
                log.info("Old product image deleted: {}", product.getImageUrl());
            }
            // Upload new image
            String newFileName = fileService.uploadProductImage(request.getImage());
            product.setImageUrl("/uploads/" + newFileName);
            log.info("New product image uploaded: /uploads/{}", newFileName);
        }

        productMapper.updateEntityFromRequest(request, product);
        Product updated = productRepository.save(product);
        
        // Update stock if stockQuantity is provided
        if (request.getStockQuantity() != null) {
            stockRepository.findByProductId(updated.getId()).ifPresentOrElse(
                stock -> {
                    stock.setCurrentQuantity(request.getStockQuantity().longValue());
                    if (request.getMinStockThreshold() != null) {
                        stock.setAlertThreshold(request.getMinStockThreshold().longValue());
                        stock.setMinimumQuantity(request.getMinStockThreshold().longValue());
                    }
                    stockRepository.save(stock);
                    log.info("Stock updated for product: {} to quantity: {}", updated.getName(), request.getStockQuantity());
                },
                () -> {
                    // Create stock if it doesn't exist
                    Stock stock = Stock.builder()
                            .product(updated)
                            .currentQuantity(request.getStockQuantity().longValue())
                            .initialQuantity(request.getStockQuantity().longValue())
                            .alertThreshold(request.getMinStockThreshold() != null ? request.getMinStockThreshold().longValue() : 10L)
                            .minimumQuantity(request.getMinStockThreshold() != null ? request.getMinStockThreshold().longValue() : 0L)
                            .active(true)
                            .lastRestocked(java.time.LocalDateTime.now())
                            .build();
                    stockRepository.save(stock);
                    log.info("Stock created for product: {} with quantity: {}", updated.getName(), request.getStockQuantity());
                }
            );
        }
        
        return productMapper.toResponse(updated);
    }

    @Transactional
    public void activateProduct(String publicId) {
        Product product = productRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "publicId", publicId));
        product.setAvailable(true);
        productRepository.save(product);
        log.info("Product activated: {}", publicId);
    }

    @Transactional
    public void deactivateProduct(String publicId) {
        Product product = productRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "publicId", publicId));
        product.setAvailable(false);
        productRepository.save(product);
        log.info("Product deactivated: {}", publicId);
    }

    @CacheEvict(value = "products", key = "#publicId")
    @Transactional
    public void deleteProduct(String publicId) {
        Product product = productRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "publicId", publicId));
        
        // Delete associated image
        if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
            fileService.deleteProductImage(product.getImageUrl());
            log.info("Product image deleted during product deletion: {}", product.getImageUrl());
        }
        
        // Soft delete avec audit complet
        product.setDeleted(true);
        product.setDeletedAt(java.time.LocalDateTime.now());
        product.setDeletedBy(SecurityUtil.getCurrentUsername());
        productRepository.save(product);
        log.info("Product deleted (soft delete): {}", publicId);
    }
}
