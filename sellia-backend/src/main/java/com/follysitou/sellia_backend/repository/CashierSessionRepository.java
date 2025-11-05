package com.follysitou.sellia_backend.repository;

import com.follysitou.sellia_backend.enums.CashierSessionStatus;
import com.follysitou.sellia_backend.model.CashierSession;
import com.follysitou.sellia_backend.model.GlobalSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CashierSessionRepository extends JpaRepository<CashierSession, Long> {

    Optional<CashierSession> findByPublicId(String publicId);

    @Query("SELECT cs FROM CashierSession cs WHERE cs.globalSession = :globalSession AND cs.status = 'OPEN' AND cs.deleted = false")
    Optional<CashierSession> findOpenSessionByGlobalSession(@Param("globalSession") GlobalSession globalSession);

    @Query("SELECT cs FROM CashierSession cs WHERE cs.cashier.publicId = :cashierId AND cs.globalSession = :globalSession AND (cs.status = 'OPEN' OR cs.status = 'LOCKED') AND cs.deleted = false")
    Optional<CashierSession> findActiveByCashierAndGlobalSession(@Param("cashierId") String cashierId, @Param("globalSession") GlobalSession globalSession);

    @Query("SELECT cs FROM CashierSession cs WHERE cs.user.publicId = :userId AND cs.globalSession.status = 'OPEN' AND (cs.status = 'OPEN' OR cs.status = 'LOCKED') AND cs.deleted = false ORDER BY cs.openedAt DESC")
    Optional<CashierSession> findCurrentSessionByUser(@Param("userId") String userId);

    @Query("SELECT cs FROM CashierSession cs WHERE cs.globalSession = :globalSession AND (cs.status = 'OPEN' OR cs.status = 'LOCKED') AND cs.deleted = false")
    List<CashierSession> findActiveSessionsByGlobalSession(@Param("globalSession") GlobalSession globalSession);

    @Query("SELECT cs FROM CashierSession cs WHERE cs.globalSession = :globalSession AND cs.deleted = false")
    Page<CashierSession> findByGlobalSession(@Param("globalSession") GlobalSession globalSession, Pageable pageable);

    @Query("SELECT cs FROM CashierSession cs WHERE cs.cashier.publicId = :cashierId AND cs.deleted = false")
    Page<CashierSession> findByCashier(@Param("cashierId") String cashierId, Pageable pageable);

    @Query("SELECT cs FROM CashierSession cs WHERE cs.user.publicId = :userId AND cs.deleted = false")
    Page<CashierSession> findByUser(@Param("userId") String userId, Pageable pageable);

    @Query("SELECT cs FROM CashierSession cs WHERE cs.deleted = false")
    Page<CashierSession> findAllActive(Pageable pageable);

    @Query("SELECT COUNT(cs) FROM CashierSession cs WHERE cs.deleted = false AND cs.status = :status")
    Long countByStatus(@Param("status") String status);

    @Query("SELECT cs FROM CashierSession cs WHERE cs.cashier.publicId = :cashierId AND cs.status = 'CLOSED' AND cs.deleted = false ORDER BY cs.closedAt DESC")
    Optional<CashierSession> findLastClosedByCashier(@Param("cashierId") String cashierId);
}
