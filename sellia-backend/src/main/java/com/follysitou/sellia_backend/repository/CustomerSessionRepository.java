package com.follysitou.sellia_backend.repository;

import com.follysitou.sellia_backend.model.CustomerSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerSessionRepository extends JpaRepository<CustomerSession, Long> {

    Optional<CustomerSession> findByPublicId(String publicId);

    Optional<CustomerSession> findByQrCodeToken(String qrCodeToken);

    @Query("SELECT cs FROM CustomerSession cs WHERE cs.table.publicId = :tablePublicId AND cs.active = true")
    Optional<CustomerSession> findActiveByTable(@Param("tablePublicId") String tablePublicId);

    @Query("SELECT cs FROM CustomerSession cs " +
           "LEFT JOIN FETCH cs.orders o " +
           "LEFT JOIN FETCH o.cashierSession cashSess " +
           "LEFT JOIN FETCH cashSess.cashier " +
           "WHERE cs.table.publicId = :tablePublicId AND cs.active = true")
    Optional<CustomerSession> findActiveByTableWithCashierInfo(@Param("tablePublicId") String tablePublicId);
}
