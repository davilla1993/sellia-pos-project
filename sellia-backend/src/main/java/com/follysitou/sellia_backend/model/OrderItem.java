package com.follysitou.sellia_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.follysitou.sellia_backend.enums.WorkStation;
import com.follysitou.sellia_backend.enums.OrderItemStatus;



@Entity
@Table(name = "order_items", indexes = {
        @Index(name = "idx_order_item_order", columnList = "orderId"),
        @Index(name = "idx_order_item_menu_item", columnList = "menuItemId"),
        @Index(name = "idx_order_item_product", columnList = "productId")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = true)
    private MenuItem menuItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Column(nullable = false)
    private Integer quantity;

    @NotNull(message = "Unit price is required")
    @Min(value = 0L, message = "Unit price must be positive")
    @Column(nullable = false)
    private Long unitPrice;

    @Column(nullable = false)
    private Long totalPrice;

    @Column(length = 500)
    private String specialInstructions;

    @Column(name = "preparation_notes")
    private String preparationNotes;

    private Boolean isPrepared = false;

    @Column(name = "prepared_at")
    private java.time.LocalDateTime preparedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkStation workStation = WorkStation.KITCHEN;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderItemStatus status = OrderItemStatus.PENDING;

    @Column(name = "sent_to_station_at")
    private java.time.LocalDateTime sentToStationAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id")
    private Ticket ticket;
}
