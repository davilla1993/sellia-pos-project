package com.follysitou.sellia_backend.repository;

import com.follysitou.sellia_backend.model.OrderItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    Optional<OrderItem> findByPublicId(String publicId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.id = :orderId ORDER BY oi.createdAt")
    List<OrderItem> findByOrderId(@Param("orderId") Long orderId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.product.id = :productId ORDER BY oi.createdAt DESC")
    Page<OrderItem> findByProductId(@Param("productId") Long productId, Pageable pageable);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.isPrepared = false ORDER BY oi.createdAt")
    List<OrderItem> findUnpreparedItems();

    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.order.id = :orderId")
    long countByOrderId(@Param("orderId") Long orderId);
}
