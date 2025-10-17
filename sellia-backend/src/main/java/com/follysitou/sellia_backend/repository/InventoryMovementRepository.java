package com.follysitou.sellia_backend.repository;

import com.follysitou.sellia_backend.model.InventoryMovement;
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
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {

    Optional<InventoryMovement> findByPublicId(String publicId);

    @Query("SELECT m FROM InventoryMovement m WHERE m.stock.id = :stockId AND m.deleted = false ORDER BY m.createdAt DESC")
    Page<InventoryMovement> findByStockId(@Param("stockId") Long stockId, Pageable pageable);

    @Query("SELECT m FROM InventoryMovement m WHERE m.movementType = :movementType AND m.deleted = false ORDER BY m.createdAt DESC")
    Page<InventoryMovement> findByMovementType(@Param("movementType") InventoryMovement.MovementType movementType, Pageable pageable);

    @Query("SELECT m FROM InventoryMovement m WHERE m.deleted = false AND m.createdAt BETWEEN :startDate AND :endDate ORDER BY m.createdAt DESC")
    Page<InventoryMovement> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query("SELECT m FROM InventoryMovement m WHERE m.deleted = false ORDER BY m.createdAt DESC")
    Page<InventoryMovement> findAllMovements(Pageable pageable);

    @Query("SELECT SUM(m.quantity) FROM InventoryMovement m WHERE m.stock.id = :stockId AND m.movementType = com.follysitou.sellia_backend.model.InventoryMovement$MovementType.SALE AND m.deleted = false AND m.createdAt BETWEEN :startDate AND :endDate")
    Long getTotalSoldQuantity(@Param("stockId") Long stockId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT m FROM InventoryMovement m WHERE m.referenceOrderId = :orderId AND m.deleted = false")
    List<InventoryMovement> findByReferenceOrderId(@Param("orderId") String orderId);
}
