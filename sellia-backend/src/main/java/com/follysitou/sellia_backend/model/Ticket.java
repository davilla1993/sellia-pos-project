package com.follysitou.sellia_backend.model;

import com.follysitou.sellia_backend.enums.WorkStation;
import com.follysitou.sellia_backend.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tickets", indexes = {
        @Index(name = "idx_ticket_customer_session", columnList = "customerSessionId"),
        @Index(name = "idx_ticket_work_station", columnList = "workStation"),
        @Index(name = "idx_ticket_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Ticket extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_session_id", nullable = false)
    private CustomerSession customerSession;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkStation workStation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status = TicketStatus.PENDING;

    private Integer priority;  // 1 = Bar (haute), 2 = Kitchen, etc

    private String message;    // Message spécial (ex: "Servir EN PREMIER")

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> items;

    @Column(name = "ticket_number")
    private String ticketNumber;  // Ex: "BAR-001", "KITCHEN-001"

    @Column(name = "printed_at")
    private LocalDateTime printedAt;

    @Column(name = "ready_at")
    private LocalDateTime readyAt;

    @Column(name = "served_at")
    private LocalDateTime servedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private Boolean deleted = false;
}
