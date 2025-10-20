package com.follysitou.sellia_backend.model;

import com.follysitou.sellia_backend.enums.CashierSessionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "cashier_sessions", indexes = {
        @Index(name = "idx_cashier_session_status", columnList = "status"),
        @Index(name = "idx_cashier_session_global", columnList = "global_session_id"),
        @Index(name = "idx_cashier_session_cashier", columnList = "cashier_id"),
        @Index(name = "idx_cashier_session_user", columnList = "user_id"),
        @Index(name = "idx_cashier_session_date", columnList = "opened_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CashierSession extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "global_session_id", nullable = false)
    private GlobalSession globalSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cashier_id", nullable = false)
    private Cashier cashier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CashierSessionStatus status = CashierSessionStatus.OPEN;

    @Column(nullable = false)
    private LocalDateTime openedAt;

    @Column(name = "locked_at")
    private LocalDateTime lockedAt;

    @Column(name = "unlocked_at")
    private LocalDateTime unlockedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "initial_amount", nullable = false)
    private Long initialAmount = 0L;

    @Column(name = "final_amount")
    private Long finalAmount;

    @Column(name = "total_sales")
    private Long totalSales = 0L;

    @Column(name = "last_activity_at")
    private LocalDateTime lastActivityAt;

    @Column(name = "inactivity_lock_minutes", nullable = false)
    private Integer inactivityLockMinutes = 15;

    @Column(name = "notes")
    private String notes;
}
