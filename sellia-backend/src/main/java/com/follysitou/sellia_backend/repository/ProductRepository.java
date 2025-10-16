package com.follysitou.sellia_backend.repository;

import com.follysitou.sellia_backend.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByPublicId(String publicId);

    boolean existsByNameAndDeletedFalse(String name);

    @Query("SELECT p FROM Product p WHERE p.deleted = false AND p.available = true")
    Page<Product> findAllAvailableProducts(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.deleted = false AND p.category.id = :categoryId")
    Page<Product> findByCategoryId(@Param("categoryId") Long categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.deleted = false AND (p.name LIKE %:name% OR p.description LIKE %:description%)")
    Page<Product> findByNameContaining(@Param("name") String name, @Param("description") String description, Pageable pageable);

    // Note: Stock management is handled by the Stock entity, not Product directly
    // List<Product> findLowStockProducts(); // Removed - use StockRepository instead

    @Query("SELECT p FROM Product p WHERE p.deleted = false AND p.category.id = :categoryId")
    Page<Product> findByCategoryIdDirect(@Param("categoryId") Long categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.deleted = false AND p.price BETWEEN :minPrice AND :maxPrice")
    Page<Product> findByPriceRange(@Param("minPrice") Long minPrice, @Param("maxPrice") Long maxPrice, Pageable pageable);
}
