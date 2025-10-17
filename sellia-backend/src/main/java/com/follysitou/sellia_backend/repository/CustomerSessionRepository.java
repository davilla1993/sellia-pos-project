package com.follysitou.sellia_backend.repository;

import com.follysitou.sellia_backend.model.CustomerSession;
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
public interface CustomerSessionRepository extends JpaRepository<CustomerSession, Long> {

    Optional<CustomerSession> findByPublicId(String publicId);

    Optional<CustomerSession> findByQrCodeToken(String qrCodeToken);

    @Query("SELECT cs FROM CustomerSession cs WHERE cs.deleted = false AND cs.active = true ORDER BY cs.createdAt DESC")
    Page<CustomerSession> findActiveSession(Pageable pageable);

    @Query("SELECT cs FROM CustomerSession cs WHERE cs.deleted = false AND cs.table.id = :tableId ORDER BY cs.createdAt DESC")
    Page<CustomerSession> findByTableId(@Param("tableId") Long tableId, Pageable pageable);

    @Query("SELECT cs FROM CustomerSession cs WHERE cs.deleted = false AND cs.table.id = :tableId AND cs.active = true ORDER BY cs.createdAt DESC")
    Optional<CustomerSession> findActiveSessionByTableId(@Param("tableId") Long tableId);

    @Query("SELECT cs FROM CustomerSession cs WHERE cs.deleted = false AND cs.isPaid = false AND cs.active = false ORDER BY cs.createdAt")
    List<CustomerSession> findUnpaidInactiveSessions();

    @Query("SELECT cs FROM CustomerSession cs WHERE cs.deleted = false AND cs.sessionStart BETWEEN :startDate AND :endDate ORDER BY cs.createdAt DESC")
    Page<CustomerSession> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);
}
