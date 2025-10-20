package com.follysitou.sellia_backend.model;

import com.follysitou.sellia_backend.enums.GlobalSessionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "global_sessions", indexes = {
        @Index(name = "idx_global_session_status", columnList = "status"),
        @Index(name = "idx_global_session_date", columnList = "openedAt")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class GlobalSession extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GlobalSessionStatus status = GlobalSessionStatus.CLOSED;

    @Column(nullable = false)
    private LocalDateTime openedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opened_by_id", nullable = false)
    private User openedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "closed_by_id")
    private User closedBy;

    @Column(name = "initial_amount", nullable = false)
    private Long initialAmount = 0L;

    @Column(name = "final_amount")
    private Long finalAmount;

    @Column(name = "total_sales")
    private Long totalSales = 0L;

    @Column(name = "reconciliation_notes")
    private String reconciliationNotes;

    @Column(name = "reconciliation_amount")
    private Long reconciliationAmount;
}
