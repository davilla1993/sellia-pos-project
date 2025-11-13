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

    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.items i " +
           "LEFT JOIN FETCH i.product " +
           "LEFT JOIN FETCH o.table " +
           "WHERE o.deleted = false AND o.status = :status " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findByStatus(@Param("status") OrderStatus status, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.deleted = false AND o.customerSession.publicId = :customerSessionId ORDER BY o.createdAt DESC")
    Page<Order> findByCustomerSessionId(@Param("customerSessionId") String customerSessionId, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.deleted = false AND o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    Page<Order> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.deleted = false AND o.isPaid = true AND o.paidAt BETWEEN :startDate AND :endDate ORDER BY o.paidAt DESC")
    Page<Order> findByPaidDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.items i " +
           "LEFT JOIN FETCH i.product " +
           "WHERE o.deleted = false AND o.isPaid = false AND o.status != 'ANNULEE' " +
           "ORDER BY o.createdAt")
    List<Order> findUnpaidPendingOrders();

    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.items i " +
           "LEFT JOIN FETCH i.product " +
           "LEFT JOIN FETCH o.table " +
           "WHERE o.deleted = false AND (o.status = OrderStatus.EN_PREPARATION OR o.status = OrderStatus.PRETE) " +
           "ORDER BY o.createdAt")
    List<Order> findActiveKitchenOrders();

    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.items i " +
           "LEFT JOIN FETCH i.product p " +
           "LEFT JOIN FETCH o.table t " +
           "LEFT JOIN FETCH o.cashierSession cs " +
           "LEFT JOIN FETCH cs.cashier c " +
           "LEFT JOIN FETCH cs.user u " +
           "WHERE o.deleted = false AND o.status != 'ANNULEE' AND o.status != 'PAYEE' " +
           "ORDER BY o.createdAt DESC")
    List<Order> findAllActiveOrders();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.deleted = false AND o.createdAt >= :startDate")
    Long countOrdersSinceDate(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.deleted = false AND o.isPaid = true AND o.paidAt BETWEEN :startDate AND :endDate")
    Long getTotalRevenue(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.deleted = false AND o.isPaid = true AND o.paidAt BETWEEN :startDate AND :endDate")
    Long sumRevenueByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.deleted = false AND o.isPaid = true AND o.paidAt BETWEEN :startDate AND :endDate")
    Long countByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(o.discountAmount) FROM Order o WHERE o.deleted = false AND o.isPaid = true AND o.paidAt BETWEEN :startDate AND :endDate")
    Long sumDiscountsByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.deleted = false AND o.isPaid = true AND o.paidAt BETWEEN :startDate AND :endDate AND HOUR(o.paidAt) = :hour")
    Long countByHourRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, @Param("hour") int hour);

    // Commandes passées (toutes les commandes créées)
    @Query("SELECT COUNT(o) FROM Order o WHERE o.deleted = false AND o.createdAt BETWEEN :startDate AND :endDate")
    Long countOrdersPlaced(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.deleted = false AND o.createdAt BETWEEN :startDate AND :endDate")
    Long sumOrdersPlacedAmount(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Commandes annulées
    @Query("SELECT COUNT(o) FROM Order o WHERE o.deleted = false AND o.status = 'ANNULEE' AND o.createdAt BETWEEN :startDate AND :endDate")
    Long countCancelledOrders(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.deleted = false AND o.status = 'ANNULEE' AND o.createdAt BETWEEN :startDate AND :endDate")
    Long sumCancelledOrdersAmount(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Commandes livrées
    @Query("SELECT COUNT(o) FROM Order o WHERE o.deleted = false AND o.status = 'LIVREE' AND o.createdAt BETWEEN :startDate AND :endDate")
    Long countDeliveredOrders(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.deleted = false AND o.status = 'LIVREE' AND o.createdAt BETWEEN :startDate AND :endDate")
    Long sumDeliveredOrdersAmount(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query(value = "SELECT CONCAT(u.first_name, ' ', u.last_name) as cashierName, COALESCE(SUM(o.total_amount), 0) as revenue, COUNT(o) as transactions " +
            "FROM orders o " +
            "LEFT JOIN cashier_sessions cs ON o.cashier_session_id = cs.id " +
            "LEFT JOIN users u ON cs.user_id = u.id " +
            "WHERE o.deleted = false AND o.is_paid = true AND o.paid_at BETWEEN :startDate AND :endDate " +
            "GROUP BY cs.id, u.id, u.first_name, u.last_name " +
            "ORDER BY revenue DESC", nativeQuery = true)
    List<Object[]> getCashierPerformanceStats(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    boolean existsByOrderNumberAndDeletedFalse(String orderNumber);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.cashierSession.publicId = :cashierSessionId AND o.deleted = false")
    Long countByCashierSession(@Param("cashierSessionId") String cashierSessionId);

    @Query("SELECT o FROM Order o " +
           "LEFT JOIN o.invoice inv " +
           "WHERE o.deleted = false AND inv.invoiceNumber = :invoiceNumber " +
           "ORDER BY o.createdAt DESC")
    List<Order> findByInvoiceNumber(@Param("invoiceNumber") String invoiceNumber);

    @Query("SELECT o FROM Order o " +
           "WHERE o.deleted = false " +
           "AND o.customerSession.id = (SELECT i.customerSession.id FROM Invoice i WHERE i.invoiceNumber = :invoiceNumber) " +
           "ORDER BY o.createdAt DESC")
    List<Order> findByInvoiceNumberViaSession(@Param("invoiceNumber") String invoiceNumber);
}
