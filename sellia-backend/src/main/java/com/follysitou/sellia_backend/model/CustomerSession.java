package com.follysitou.sellia_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.follysitou.sellia_backend.enums.OrderType;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "customer_sessions", indexes = {
        @Index(name = "idx_session_table", columnList = "table_id"),
        @Index(name = "idx_session_customer", columnList = "customer_name"),
        @Index(name = "idx_session_active", columnList = "active"),
        @Index(name = "idx_session_date", columnList = "created_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSession extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id", nullable = true)
    private RestaurantTable table;

    @Column(name = "order_type")
    @Enumerated(EnumType.STRING)
    private OrderType orderType = OrderType.TABLE; // TABLE ou TAKEAWAY

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "customer_phone")
    private String customerPhone;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "session_start")
    private LocalDateTime sessionStart;

    @Column(name = "session_end")
    private LocalDateTime sessionEnd;

    @OneToMany(mappedBy = "customerSession", fetch = FetchType.LAZY)
    private List<Order> orders;

    @Column(nullable = false)
    private Boolean isPaid = false;

    @Column(name = "total_amount")
    private Long totalAmount;

    @Column(name = "finalized_at")
    private LocalDateTime finalizedAt;

    @Column(name = "notes")
    private String notes;

    @Column(name = "qr_code_token")
    private String qrCodeToken; // Token unique pour le QR code de session

    @Column(name = "number_of_customers")
    private Integer numberOfCustomers = 1;
}
