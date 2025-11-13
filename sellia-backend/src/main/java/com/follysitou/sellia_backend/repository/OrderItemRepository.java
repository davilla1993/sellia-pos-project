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

    // Top products by revenue for analytics
    @Query(value = "SELECT p.name as productName, " +
            "SUM(oi.quantity) as totalQuantity, " +
            "SUM(oi.total_price) as totalRevenue " +
            "FROM order_items oi " +
            "INNER JOIN orders o ON oi.order_id = o.id " +
            "INNER JOIN products p ON oi.product_id = p.id " +
            "WHERE o.deleted = false AND o.is_paid = true " +
            "AND o.paid_at BETWEEN :startDate AND :endDate " +
            "GROUP BY p.id, p.name " +
            "ORDER BY totalRevenue DESC " +
            "LIMIT :limit", nativeQuery = true)
    List<Object[]> getTopProductsByRevenue(@Param("startDate") java.time.LocalDateTime startDate,
                                           @Param("endDate") java.time.LocalDateTime endDate,
                                           @Param("limit") int limit);
}
