package com.follysitou.sellia_backend.repository;

import com.follysitou.sellia_backend.model.Ticket;
import com.follysitou.sellia_backend.enums.WorkStation;
import com.follysitou.sellia_backend.enums.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Optional<Ticket> findByPublicId(String publicId);

    @Query("SELECT t FROM Ticket t WHERE t.customerSession.publicId = :customerSessionId AND t.deleted = false")
    List<Ticket> findByCustomerSessionId(@Param("customerSessionId") String customerSessionId);

    @Query("SELECT t FROM Ticket t WHERE t.customerSession.publicId = :customerSessionId AND t.workStation = :workStation AND t.deleted = false")
    Optional<Ticket> findByCustomerSessionIdAndWorkStation(
            @Param("customerSessionId") String customerSessionId,
            @Param("workStation") WorkStation workStation
    );

    @Query("SELECT t FROM Ticket t WHERE t.workStation = :workStation AND t.status = :status AND t.deleted = false ORDER BY t.priority, t.createdAt")
    Page<Ticket> findByWorkStationAndStatus(
            @Param("workStation") WorkStation workStation,
            @Param("status") TicketStatus status,
            Pageable pageable
    );

    @Query("SELECT t FROM Ticket t WHERE t.workStation = :workStation AND (t.status = 'PRINTED' OR t.status = 'PREPARING') AND t.deleted = false ORDER BY t.priority, t.createdAt")
    List<Ticket> findActiveByWorkStation(@Param("workStation") WorkStation workStation);

    @Query("SELECT t FROM Ticket t WHERE t.status = 'READY' AND t.deleted = false ORDER BY t.readyAt")
    List<Ticket> findReadyTickets();
}
