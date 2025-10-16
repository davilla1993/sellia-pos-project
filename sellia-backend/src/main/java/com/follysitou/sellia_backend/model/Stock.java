package com.follysitou.sellia_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "stocks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Stock extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @NotNull(message = "Current quantity is required")
    @Min(value = 0L, message = "Quantity cannot be negative")
    @Column(nullable = false)
    private Long currentQuantity;

    @NotNull(message = "Initial quantity is required")
    @Min(value = 0L, message = "Initial quantity cannot be negative")
    @Column(nullable = false)
    private Long initialQuantity;

    @Column(name = "unit_of_measure")
    private String unitOfMeasure;

    @Column(name = "alert_threshold")
    private Long alertThreshold;

    @Column(name = "minimum_quantity")
    private Long minimumQuantity;

    @Column(name = "maximum_quantity")
    private Long maximumQuantity;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "last_restocked")
    private java.time.LocalDateTime lastRestocked;

    @Column(name = "supplier_info")
    private String supplierInfo;
}
