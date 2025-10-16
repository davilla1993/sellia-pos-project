package com.follysitou.sellia_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.LocalDateTime;

@Entity
@Table(name = "payments", indexes = {
        @Index(name = "idx_payment_order", columnList = "orderId"),
        @Index(name = "idx_payment_method", columnList = "paymentMethod"),
        @Index(name = "idx_payment_status", columnList = "status"),
        @Index(name = "idx_payment_date", columnList = "createdAt")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_session_id")
    private CustomerSession customerSession;

    @Column(nullable = false)
    private String paymentMethod;

    @Column(name = "transaction_id")
    private String transactionId;

    @NotNull(message = "Amount is required")
    @jakarta.validation.constraints.Min(value = 0L, message = "Amount must be positive")
    @Column(nullable = false)
    private Long amount;

    @Column(nullable = false)
    private PaymentStatus status;

    @Column(name = "received_by")
    private String receivedBy;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(length = 500)
    private String notes;

    @Column(name = "change_given")
    private Long changeGiven;

    @Column(name = "cash_given")
    private Long cashGiven;

    @Column(name = "card_last_four")
    private String cardLastFour;

    @Column(name = "receipt_url")
    private String receiptUrl;

    public enum PaymentStatus {
        PENDING,
        COMPLETED,
        REFUNDED,
        FAILED,
        CANCELLED
    }
}
