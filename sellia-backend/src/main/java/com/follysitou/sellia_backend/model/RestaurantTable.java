package com.follysitou.sellia_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "restaurant_tables", indexes = {
        @Index(name = "idx_table_number", columnList = "number"),
        @Index(name = "idx_table_room", columnList = "room"),
        @Index(name = "idx_table_available", columnList = "available")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantTable extends BaseEntity {

    @NotBlank(message = "Table number is required")
    @Column(nullable = false, unique = true)
    private String number;

    @Size(max = 50, message = "Table name must not exceed 50 characters")
    private String name;

    @NotNull(message = "Capacity is required")
    @Column(nullable = false)
    private Integer capacity;

    @Size(max = 30, message = "Room must not exceed 30 characters")
    @Column(nullable = false)
    private String room;

    @Column(nullable = false)
    private Boolean available = true;

    @Column(name = "is_vip")
    private Boolean isVip = false;

    @Column(name = "qr_code_url")
    private String qrCodeUrl;

    @Column(name = "qr_code_token", unique = true)
    private String qrCodeToken;

    @Column(name = "current_order_id")
    private String currentOrderId;

    @Column(name = "occupied")
    private Boolean occupied = false;
}

