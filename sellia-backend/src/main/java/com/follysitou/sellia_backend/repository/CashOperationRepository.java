package com.follysitou.sellia_backend.repository;

import com.follysitou.sellia_backend.enums.CashOperationType;
import com.follysitou.sellia_backend.model.CashOperation;
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
public interface CashOperationRepository extends JpaRepository<CashOperation, Long> {

    Optional<CashOperation> findByPublicId(String publicId);

    @Query("SELECT co FROM CashOperation co WHERE co.cashierSession.publicId = :sessionId AND co.deleted = false ORDER BY co.operationDate DESC")
    List<CashOperation> findByCashierSession(@Param("sessionId") String sessionId);

    @Query("SELECT co FROM CashOperation co WHERE co.cashierSession.publicId = :sessionId AND co.deleted = false ORDER BY co.operationDate DESC")
    Page<CashOperation> findByCashierSessionPaged(@Param("sessionId") String sessionId, Pageable pageable);

    @Query("SELECT co FROM CashOperation co WHERE co.deleted = false ORDER BY co.operationDate DESC")
    Page<CashOperation> findAllActive(Pageable pageable);

    @Query("SELECT co FROM CashOperation co WHERE co.deleted = false AND co.operationDate BETWEEN :startDate AND :endDate ORDER BY co.operationDate DESC")
    Page<CashOperation> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query("SELECT co FROM CashOperation co WHERE co.cashierSession.cashier.publicId = :cashierId AND co.deleted = false ORDER BY co.operationDate DESC")
    Page<CashOperation> findByCashier(@Param("cashierId") String cashierId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(co.amount), 0) FROM CashOperation co WHERE co.cashierSession.publicId = :sessionId AND co.type = :type AND co.deleted = false")
    Long getTotalBySessionAndType(@Param("sessionId") String sessionId, @Param("type") CashOperationType type);

    @Query("SELECT COUNT(co) FROM CashOperation co WHERE co.cashierSession.publicId = :sessionId AND co.type = :type AND co.deleted = false")
    Integer getCountBySessionAndType(@Param("sessionId") String sessionId, @Param("type") CashOperationType type);
}
