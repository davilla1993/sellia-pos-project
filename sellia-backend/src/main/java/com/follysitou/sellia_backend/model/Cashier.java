package com.follysitou.sellia_backend.model;

import com.follysitou.sellia_backend.enums.CashierStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "cashiers", indexes = {
        @Index(name = "idx_cashier_name", columnList = "name"),
        @Index(name = "idx_cashier_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, exclude = "assignedUsers")
public class Cashier extends BaseEntity {

    @NotBlank(message = "Cashier name is required")
    @Size(max = 100, message = "Cashier name must not exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "cashier_number", nullable = false, unique = true)
    private String cashierNumber;

    @NotBlank(message = "PIN is required")
    @Size(min = 60, message = "PIN must be encrypted (bcrypt format)")
    @Column(nullable = false, length = 255)
    private String pin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CashierStatus status = CashierStatus.ACTIVE;

    @Column(name = "failed_pin_attempts", nullable = false)
    private Integer failedPinAttempts = 0;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "cashier_users",
            joinColumns = @JoinColumn(name = "cashier_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private Set<User> assignedUsers = new HashSet<>();

    @Column(name = "description")
    private String description;

    private String location;
}
