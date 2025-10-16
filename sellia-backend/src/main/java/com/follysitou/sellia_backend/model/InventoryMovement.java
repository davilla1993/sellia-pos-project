package com.follysitou.sellia_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;



@Entity
@Table(name = "inventory_movements", indexes = {
        @Index(name = "idx_movement_stock", columnList = "stockId"),
        @Index(name = "idx_movement_type", columnList = "movementType"),
        @Index(name = "idx_movement_date", columnList = "createdAt")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryMovement extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @Column(nullable = false)
    private MovementType movementType;

    @NotNull(message = "Quantity is required")
    @Column(nullable = false)
    private Long quantity;

    @Column
    private Long previousQuantity;

    @Column
    private Long newQuantity;

    @Column(name = "reference_order_id")
    private String referenceOrderId;

    @Column(name = "reference_purchase_id")
    private String referencePurchaseId;

    @Column(length = 500)
    private String reason;

    @Column(name = "performed_by")
    private String performedBy;

    @Column(name = "cost_per_unit")
    private Long costPerUnit;

    @Column(name = "total_cost")
    private Long totalCost;

    public enum MovementType {
        INITIAL,
        RESTOCK,
        SALE,
        ADJUSTMENT_IN,
        ADJUSTMENT_OUT,
        WASTE,
        RETURN
    }
}
