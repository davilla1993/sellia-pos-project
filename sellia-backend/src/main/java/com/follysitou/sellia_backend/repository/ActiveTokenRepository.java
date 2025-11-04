package com.follysitou.sellia_backend.repository;

import com.follysitou.sellia_backend.model.ActiveToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ActiveTokenRepository extends JpaRepository<ActiveToken, Long> {

    Optional<ActiveToken> findByJti(String jti);

    @Query("SELECT at FROM ActiveToken at WHERE at.user.publicId = :userId AND at.revoked = false AND at.expiresAt > :now AND at.deleted = false")
    List<ActiveToken> findActiveTokensByUser(@Param("userId") String userId, @Param("now") LocalDateTime now);

    @Query("SELECT at FROM ActiveToken at WHERE at.user.publicId = :userId AND at.tokenType = :tokenType AND at.revoked = false AND at.expiresAt > :now AND at.deleted = false")
    List<ActiveToken> findActiveTokensByUserAndType(@Param("userId") String userId, @Param("tokenType") String tokenType, @Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE ActiveToken at SET at.revoked = true, at.revokedAt = :revokedAt, at.revokedReason = :reason WHERE at.user.publicId = :userId AND at.revoked = false")
    int revokeAllUserTokens(@Param("userId") String userId, @Param("revokedAt") LocalDateTime revokedAt, @Param("reason") String reason);

    @Modifying
    @Query("UPDATE ActiveToken at SET at.revoked = true, at.revokedAt = :revokedAt, at.revokedReason = :reason WHERE at.jti = :jti")
    int revokeTokenByJti(@Param("jti") String jti, @Param("revokedAt") LocalDateTime revokedAt, @Param("reason") String reason);

    @Query("SELECT at FROM ActiveToken at WHERE at.expiresAt < :now AND at.deleted = false")
    List<ActiveToken> findExpiredTokens(@Param("now") LocalDateTime now);

    @Modifying
    @Query("DELETE FROM ActiveToken at WHERE at.expiresAt < :expirationDate OR at.createdAt < :creationDate")
    int deleteOldTokens(@Param("expirationDate") LocalDateTime expirationDate, @Param("creationDate") LocalDateTime creationDate);
}
