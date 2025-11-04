package com.follysitou.sellia_backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret:sellia_pos_saas_secret_key_for_jwt_token_generation_2024}")
    private String jwtSecret;

    @Value("${app.jwt.access-token-expiration:900000}")
    private long accessTokenExpiration;

    @Value("${app.jwt.refresh-token-expiration:432000000}")
    private long refreshTokenExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    // Classe interne pour retourner le token avec son JTI
    public static class TokenWithJti {
        private final String token;
        private final String jti;
        private final Date expiresAt;

        public TokenWithJti(String token, String jti, Date expiresAt) {
            this.token = token;
            this.jti = jti;
            this.expiresAt = expiresAt;
        }

        public String getToken() {
            return token;
        }

        public String getJti() {
            return jti;
        }

        public Date getExpiresAt() {
            return expiresAt;
        }
    }

    public TokenWithJti generateAccessToken(String username, String userId, String role) {
        return generateToken(username, userId, role, accessTokenExpiration);
    }

    public TokenWithJti generateRefreshToken(String username, String userId) {
        return generateToken(username, userId, null, refreshTokenExpiration);
    }

    private TokenWithJti generateToken(String username, String userId, String role, long expirationTime) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);
        String jti = UUID.randomUUID().toString();

        var builder = Jwts.builder()
                .setId(jti)
                .setSubject(username)
                .claim("userId", userId);

        if (role != null) {
            builder.claim("role", role);
        }

        String token = builder
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();

        return new TokenWithJti(token, jti, expiryDate);
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public String getUserIdFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("userId", String.class);
    }

    public String getRoleFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("role", String.class);
    }

    public String getJtiFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getId();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (SecurityException e) {
            return false;
        } catch (MalformedJwtException e) {
            return false;
        } catch (ExpiredJwtException e) {
            return false;
        } catch (UnsupportedJwtException e) {
            return false;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }
}
