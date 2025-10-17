package com.follysitou.sellia_backend.repository;

import com.follysitou.sellia_backend.model.Stock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

    Optional<Stock> findByPublicId(String publicId);

    @Query("SELECT s FROM Stock s WHERE s.product.id = :productId AND s.deleted = false")
    Optional<Stock> findByProductId(@Param("productId") Long productId);

    @Query("SELECT s FROM Stock s WHERE s.deleted = false AND s.active = true")
    Page<Stock> findAllActive(Pageable pageable);

    @Query("SELECT s FROM Stock s WHERE s.deleted = false")
    Page<Stock> findAllStocks(Pageable pageable);

    @Query("SELECT s FROM Stock s WHERE s.deleted = false AND s.currentQuantity <= s.alertThreshold ORDER BY s.currentQuantity ASC")
    List<Stock> findLowStockItems();

    @Query("SELECT s FROM Stock s WHERE s.deleted = false AND s.currentQuantity < s.minimumQuantity")
    List<Stock> findBelowMinimumQuantity();

    @Query("SELECT s FROM Stock s WHERE s.deleted = false AND s.currentQuantity >= s.maximumQuantity")
    List<Stock> findAboveMaximumQuantity();
}
