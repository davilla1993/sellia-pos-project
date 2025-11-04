package com.follysitou.sellia_backend.repository;

import com.follysitou.sellia_backend.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT al FROM AuditLog al WHERE al.userEmail = :userEmail AND al.deleted = false ORDER BY al.actionDate DESC")
    Page<AuditLog> findByUserEmail(@Param("userEmail") String userEmail, Pageable pageable);

    @Query("SELECT al FROM AuditLog al WHERE al.action = :action AND al.deleted = false ORDER BY al.actionDate DESC")
    Page<AuditLog> findByAction(@Param("action") String action, Pageable pageable);

    @Query("SELECT al FROM AuditLog al WHERE al.entityType = :entityType AND al.deleted = false ORDER BY al.actionDate DESC")
    Page<AuditLog> findByEntityType(@Param("entityType") String entityType, Pageable pageable);

    @Query("SELECT al FROM AuditLog al WHERE al.entityType = :entityType AND al.entityId = :entityId AND al.deleted = false ORDER BY al.actionDate DESC")
    List<AuditLog> findByEntityTypeAndEntityId(@Param("entityType") String entityType, @Param("entityId") String entityId);

    @Query("SELECT al FROM AuditLog al WHERE al.actionDate BETWEEN :startDate AND :endDate AND al.deleted = false ORDER BY al.actionDate DESC")
    Page<AuditLog> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query("SELECT al FROM AuditLog al WHERE al.status = :status AND al.deleted = false ORDER BY al.actionDate DESC")
    Page<AuditLog> findByStatus(@Param("status") AuditLog.ActionStatus status, Pageable pageable);
}
