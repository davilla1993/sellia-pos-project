package com.follysitou.sellia_backend.repository;

import com.follysitou.sellia_backend.enums.CashierStatus;
import com.follysitou.sellia_backend.model.Cashier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CashierRepository extends JpaRepository<Cashier, Long> {

    @EntityGraph(attributePaths = "assignedUsers")
    Optional<Cashier> findByPublicId(String publicId);

    Optional<Cashier> findByCashierNumber(String cashierNumber);

    @EntityGraph(attributePaths = "assignedUsers")
    @Query("SELECT c FROM Cashier c WHERE c.deleted = false")
    Page<Cashier> findAllActive(Pageable pageable);

    @EntityGraph(attributePaths = "assignedUsers")
    @Query("SELECT c FROM Cashier c WHERE c.deleted = false AND c.status = :status")
    Page<Cashier> findByStatus(@Param("status") CashierStatus status, Pageable pageable);

    @EntityGraph(attributePaths = "assignedUsers")
    @Query("SELECT c FROM Cashier c WHERE c.deleted = false AND c.name LIKE %:name%")
    Page<Cashier> findByNameContaining(@Param("name") String name, Pageable pageable);

    @EntityGraph(attributePaths = "assignedUsers")
    @Query("SELECT c FROM Cashier c JOIN c.assignedUsers u WHERE u.publicId = :userId AND c.deleted = false")
    Page<Cashier> findByAssignedUserId(@Param("userId") String userId, Pageable pageable);
}
