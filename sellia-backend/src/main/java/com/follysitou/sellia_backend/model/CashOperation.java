package com.follysitou.sellia_backend.model;

import com.follysitou.sellia_backend.enums.CashOperationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "cash_operations", indexes = {
        @Index(name = "idx_cash_operation_session", columnList = "cashier_session_id"),
        @Index(name = "idx_cash_operation_type", columnList = "type"),
        @Index(name = "idx_cash_operation_date", columnList = "operation_date"),
        @Index(name = "idx_cash_operation_user", columnList = "user_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CashOperation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cashier_session_id", nullable = false)
    private CashierSession cashierSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CashOperationType type;

    @Column(nullable = false)
    private Long amount;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(length = 100)
    private String reference;

    @Column(name = "authorized_by", nullable = false, length = 200)
    private String authorizedBy;

    @Column(name = "operation_date", nullable = false)
    private LocalDateTime operationDate;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;
}
