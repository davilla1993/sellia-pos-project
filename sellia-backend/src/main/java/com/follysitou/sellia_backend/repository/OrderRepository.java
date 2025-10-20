package com.follysitou.sellia_backend.repository;

import com.follysitou.sellia_backend.model.Order;
import com.follysitou.sellia_backend.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByPublicId(String publicId);

    Optional<Order> findByOrderNumber(String orderNumber);

    @Query("SELECT o FROM Order o WHERE o.deleted = false ORDER BY o.orderNumber DESC")
    Page<Order> findAllOrders(Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.deleted = false AND o.table.id = :tableId ORDER BY o.createdAt DESC")
    Page<Order> findByTableId(@Param("tableId") Long tableId, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.deleted = false AND o.status = :status ORDER BY o.createdAt DESC")
    Page<Order> findByStatus(@Param("status") OrderStatus status, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.deleted = false AND o.customerSession.publicId = :customerSessionId ORDER BY o.createdAt DESC")
    Page<Order> findByCustomerSessionId(@Param("customerSessionId") String customerSessionId, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.deleted = false AND o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    Page<Order> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.deleted = false AND o.isPaid = false AND (o.status != OrderStatus.LIVREE AND o.status != OrderStatus.ANNULEE) ORDER BY o.createdAt")
    List<Order> findUnpaidPendingOrders();

    @Query("SELECT o FROM Order o WHERE o.deleted = false AND (o.status = OrderStatus.EN_PREPARATION OR o.status = OrderStatus.PRETE) ORDER BY o.createdAt")
    List<Order> findActiveKitchenOrders();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.deleted = false AND o.createdAt >= :startDate")
    Long countOrdersSinceDate(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.deleted = false AND o.isPaid = true AND o.paidAt BETWEEN :startDate AND :endDate")
    Long getTotalRevenue(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    boolean existsByOrderNumberAndDeletedFalse(String orderNumber);
}
