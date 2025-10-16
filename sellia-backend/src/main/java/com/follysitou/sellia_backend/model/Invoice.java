package com.follysitou.sellia_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "invoices", indexes = {
        @Index(name = "idx_invoice_session", columnList = "customerSessionId"),
        @Index(name = "idx_invoice_number", columnList = "invoiceNumber"),
        @Index(name = "idx_invoice_date", columnList = "createdAt"),
        @Index(name = "idx_invoice_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Invoice extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String invoiceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_session_id", nullable = false)
    private CustomerSession customerSession;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Order> orders;

    @Column(nullable = false)
    private Long subtotal;

    @Column(nullable = false)
    private Long totalAmount;

    @Column(nullable = false)
    private Long taxAmount;

    @Column(nullable = false)
    private Long discountAmount;

    @Column(nullable = false)
    private Long finalAmount;

    @Column(nullable = false)
    private InvoiceStatus status = InvoiceStatus.PENDING;

    @Column(name = "issued_by")
    private String issuedBy;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "receipt_url")
    private String receiptUrl;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "customer_phone")
    private String customerPhone;

    @Column(length = 1000)
    private String notes;

    public enum InvoiceStatus {
        PENDING,
        PAID,
        CANCELLED,
        REFUNDED
    }
}
