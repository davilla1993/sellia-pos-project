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

    @Query(value = "SELECT * FROM products WHERE deleted = false", nativeQuery = true)
    Page<Product> findAll(Pageable pageable);

    @Query(value = "SELECT * FROM products WHERE deleted = false AND available = true", nativeQuery = true)
    Page<Product> findAllAvailableProducts(Pageable pageable);

    @Query(value = "SELECT * FROM products WHERE deleted = false AND available = false", nativeQuery = true)
    Page<Product> findAllUnavailableProducts(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.deleted = false AND p.category.id = :categoryId")
    Page<Product> findByCategoryId(@Param("categoryId") Long categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.deleted = false AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :description, '%')))")
    Page<Product> findByNameContaining(@Param("name") String name, @Param("description") String description, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.deleted = false AND p.category.id = :categoryId")
    Page<Product> findByCategoryIdDirect(@Param("categoryId") Long categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.deleted = false AND p.price BETWEEN :minPrice AND :maxPrice")
    Page<Product> findByPriceRange(@Param("minPrice") Long minPrice, @Param("maxPrice") Long maxPrice, Pageable pageable);
}
