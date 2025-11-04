package com.follysitou.sellia_backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "active_tokens", indexes = {
        @Index(name = "idx_active_token_user", columnList = "user_id"),
        @Index(name = "idx_active_token_status", columnList = "revoked"),
        @Index(name = "idx_active_token_jti", columnList = "jti", unique = true)
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ActiveToken extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "jti", nullable = false, unique = true, length = 500)
    private String jti; // JWT ID - identifiant unique du token

    @Column(name = "token_type", nullable = false, length = 20)
    private String tokenType = "ACCESS"; // ACCESS ou REFRESH

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "revoked", nullable = false)
    private Boolean revoked = false;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(name = "revoked_reason", length = 255)
    private String revokedReason;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;
}
