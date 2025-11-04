package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.model.ActiveToken;
import com.follysitou.sellia_backend.model.User;
import com.follysitou.sellia_backend.repository.ActiveTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActiveTokenService {

    private final ActiveTokenRepository activeTokenRepository;

    /**
     * Enregistre un nouveau token actif
     */
    @Transactional
    public ActiveToken saveToken(User user, String jti, String tokenType, LocalDateTime expiresAt, String ipAddress, String userAgent) {
        ActiveToken token = ActiveToken.builder()
                .user(user)
                .jti(jti)
                .tokenType(tokenType)
                .expiresAt(expiresAt)
                .revoked(false)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();

        return activeTokenRepository.save(token);
    }

    /**
     * Vérifie si un token est actif (non révoqué et non expiré)
     */
    public boolean isTokenActive(String jti) {
        Optional<ActiveToken> token = activeTokenRepository.findByJti(jti);
        if (token.isEmpty()) {
            return false;
        }

        ActiveToken activeToken = token.get();
        return !activeToken.getRevoked()
                && !activeToken.getDeleted()
                && activeToken.getExpiresAt().isAfter(LocalDateTime.now());
    }

    /**
     * Révoque tous les tokens actifs d'un utilisateur
     */
    @Transactional
    public void revokeAllUserTokens(String userId, String reason) {
        int revokedCount = activeTokenRepository.revokeAllUserTokens(
                userId,
                LocalDateTime.now(),
                reason
        );
        log.info("Revoked {} tokens for user {}: {}", revokedCount, userId, reason);
    }

    /**
     * Révoque un token spécifique par son JTI
     */
    @Transactional
    public void revokeToken(String jti, String reason) {
        int revokedCount = activeTokenRepository.revokeTokenByJti(
                jti,
                LocalDateTime.now(),
                reason
        );
        if (revokedCount > 0) {
            log.info("Revoked token {}: {}", jti, reason);
        }
    }

    /**
     * Révoque tous les anciens tokens ACCESS d'un utilisateur (sauf le nouveau)
     * Utilisé lors d'un nouveau login
     */
    @Transactional
    public void revokeOldAccessTokens(String userId, String newJti) {
        List<ActiveToken> activeTokens = activeTokenRepository.findActiveTokensByUserAndType(
                userId,
                "ACCESS",
                LocalDateTime.now()
        );

        for (ActiveToken token : activeTokens) {
            if (!token.getJti().equals(newJti)) {
                activeTokenRepository.revokeTokenByJti(
                        token.getJti(),
                        LocalDateTime.now(),
                        "New login detected"
                );
            }
        }

        if (!activeTokens.isEmpty()) {
            log.info("Revoked {} old access tokens for user {} due to new login", activeTokens.size(), userId);
        }
    }

    /**
     * Récupère tous les tokens actifs d'un utilisateur
     */
    public List<ActiveToken> getActiveUserTokens(String userId) {
        return activeTokenRepository.findActiveTokensByUser(userId, LocalDateTime.now());
    }

    /**
     * Nettoie les tokens expirés (exécuté automatiquement toutes les heures)
     */
    @Scheduled(cron = "0 0 * * * *") // Toutes les heures
    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thirtyDaysAgo = now.minusDays(30);

        // Supprimer les tokens expirés depuis plus de 30 jours
        int deletedCount = activeTokenRepository.deleteOldTokens(thirtyDaysAgo, thirtyDaysAgo);

        if (deletedCount > 0) {
            log.info("Cleaned up {} expired tokens", deletedCount);
        }
    }
}
