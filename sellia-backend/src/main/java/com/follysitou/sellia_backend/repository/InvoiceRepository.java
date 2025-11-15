package com.follysitou.sellia_backend.repository;

import com.follysitou.sellia_backend.model.Invoice;
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
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByPublicId(String publicId);

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    @Query("SELECT i FROM Invoice i WHERE i.deleted = false AND i.customerSession.id = :sessionId")
    Optional<Invoice> findByCustomerSessionId(@Param("sessionId") Long sessionId);

    @Query("SELECT i FROM Invoice i WHERE i.deleted = false ORDER BY i.createdAt DESC")
    Page<Invoice> findAllInvoices(Pageable pageable);

    @Query("SELECT i FROM Invoice i WHERE i.deleted = false AND i.status = com.follysitou.sellia_backend.model.Invoice.InvoiceStatus.PAID ORDER BY i.paidAt DESC")
    Page<Invoice> findPaidInvoices(Pageable pageable);

    @Query("SELECT i FROM Invoice i WHERE i.deleted = false AND i.createdAt BETWEEN :startDate AND :endDate ORDER BY i.createdAt DESC")
    Page<Invoice> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query("SELECT SUM(i.finalAmount) FROM Invoice i WHERE i.deleted = false AND i.status = com.follysitou.sellia_backend.model.Invoice.InvoiceStatus.PAID AND i.paidAt BETWEEN :startDate AND :endDate")
    Long getTotalRevenueByDate(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.deleted = false AND i.status = com.follysitou.sellia_backend.model.Invoice.InvoiceStatus.PENDING")
    long countPendingInvoices();

    @Query("SELECT DISTINCT i FROM Invoice i " +
           "LEFT JOIN FETCH i.orders o " +
           "LEFT JOIN FETCH o.cashierSession cs " +
           "LEFT JOIN FETCH cs.cashier c " +
           "WHERE i.deleted = false AND i.customerSession.publicId = :sessionPublicId")
    Optional<Invoice> findByCustomerSessionPublicIdWithCashierInfo(@Param("sessionPublicId") String sessionPublicId);
}
