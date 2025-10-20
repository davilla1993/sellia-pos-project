package com.follysitou.sellia_backend.repository;

import com.follysitou.sellia_backend.enums.GlobalSessionStatus;
import com.follysitou.sellia_backend.model.GlobalSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface GlobalSessionRepository extends JpaRepository<GlobalSession, Long> {

    Optional<GlobalSession> findByPublicId(String publicId);

    @Query("SELECT g FROM GlobalSession g WHERE g.status = :status AND g.deleted = false")
    Optional<GlobalSession> findCurrentSession(@Param("status") GlobalSessionStatus status);

    @Query(value = "SELECT * FROM global_sessions g WHERE g.deleted = false ORDER BY g.opened_at DESC LIMIT 1", nativeQuery = true)
    Optional<GlobalSession> findLatestSession();

    @Query("SELECT g FROM GlobalSession g WHERE g.deleted = false AND g.status = :status")
    Page<GlobalSession> findByStatus(@Param("status") GlobalSessionStatus status, Pageable pageable);

    @Query("SELECT g FROM GlobalSession g WHERE g.deleted = false")
    Page<GlobalSession> findByDate(@Param("date") LocalDateTime date, Pageable pageable);

    @Query("SELECT g FROM GlobalSession g WHERE g.deleted = false")
    Page<GlobalSession> findAllActive(Pageable pageable);
}
