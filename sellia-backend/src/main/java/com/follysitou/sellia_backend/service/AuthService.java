package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.request.LoginRequest;
import com.follysitou.sellia_backend.dto.response.AuthResponse;
import com.follysitou.sellia_backend.exception.UnauthorizedException;
import com.follysitou.sellia_backend.mapper.UserMapper;
import com.follysitou.sellia_backend.model.User;
import com.follysitou.sellia_backend.repository.UserRepository;
import com.follysitou.sellia_backend.security.JwtTokenProvider;
import com.follysitou.sellia_backend.util.ErrorMessages;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final ActiveTokenService activeTokenService;
    private final CashierSessionService cashierSessionService;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UnauthorizedException(ErrorMessages.CREDENTIALS_INVALID));

        if (!user.getActive()) {
            throw new UnauthorizedException(ErrorMessages.ACCOUNT_DISABLED);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException(ErrorMessages.CREDENTIALS_INVALID);
        }

        // Update last login timestamp
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Generate new tokens with JTI
        JwtTokenProvider.TokenWithJti accessTokenWithJti = jwtTokenProvider.generateAccessToken(
                user.getUsername(),
                user.getPublicId(),
                user.getRole().getName().name()
        );
        JwtTokenProvider.TokenWithJti refreshTokenWithJti = jwtTokenProvider.generateRefreshToken(
                user.getUsername(),
                user.getPublicId()
        );

        // Get client info (IP and User-Agent)
        String ipAddress = getClientIpAddress();
        String userAgent = getClientUserAgent();

        // SECURITY: Revoke all old access tokens for this user (new login detected)
        activeTokenService.revokeOldAccessTokens(user.getPublicId(), accessTokenWithJti.getJti());

        // SECURITY: Force close all active cashier sessions for this user
        // This prevents session hijacking - the new login must go through PIN validation
        cashierSessionService.forceCloseAllUserSessions(user.getPublicId(), "New login detected from " + ipAddress);

        // Save new tokens
        activeTokenService.saveToken(
                user,
                accessTokenWithJti.getJti(),
                "ACCESS",
                LocalDateTime.ofInstant(accessTokenWithJti.getExpiresAt().toInstant(), ZoneId.systemDefault()),
                ipAddress,
                userAgent
        );

        activeTokenService.saveToken(
                user,
                refreshTokenWithJti.getJti(),
                "REFRESH",
                LocalDateTime.ofInstant(refreshTokenWithJti.getExpiresAt().toInstant(), ZoneId.systemDefault()),
                ipAddress,
                userAgent
        );

        log.info("User {} logged in successfully from IP: {}", user.getUsername(), ipAddress);

        return AuthResponse.builder()
                .accessToken(accessTokenWithJti.getToken())
                .refreshToken(refreshTokenWithJti.getToken())
                .expiresIn(jwtTokenProvider.getAccessTokenExpiration())
                .user(userMapper.toResponse(user))
                .build();
    }

    public AuthResponse refreshAccessToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException(ErrorMessages.TOKEN_EXPIRED);
        }

        String refreshJti = jwtTokenProvider.getJtiFromToken(refreshToken);

        // Check if refresh token is active (not revoked)
        if (!activeTokenService.isTokenActive(refreshJti)) {
            throw new UnauthorizedException("Token has been revoked");
        }

        String username = jwtTokenProvider.getUsernameFromToken(refreshToken);
        String userId = jwtTokenProvider.getUserIdFromToken(refreshToken);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException(ErrorMessages.USER_NOT_FOUND));

        if (!user.getActive()) {
            throw new UnauthorizedException(ErrorMessages.ACCOUNT_DISABLED);
        }

        // Generate new access token
        JwtTokenProvider.TokenWithJti newAccessTokenWithJti = jwtTokenProvider.generateAccessToken(
                username,
                userId,
                user.getRole().getName().name()
        );

        // Get client info
        String ipAddress = getClientIpAddress();
        String userAgent = getClientUserAgent();

        // Save new access token
        activeTokenService.saveToken(
                user,
                newAccessTokenWithJti.getJti(),
                "ACCESS",
                LocalDateTime.ofInstant(newAccessTokenWithJti.getExpiresAt().toInstant(), ZoneId.systemDefault()),
                ipAddress,
                userAgent
        );

        return AuthResponse.builder()
                .accessToken(newAccessTokenWithJti.getToken())
                .refreshToken(refreshToken)
                .expiresIn(jwtTokenProvider.getAccessTokenExpiration())
                .user(userMapper.toResponse(user))
                .build();
    }

    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                    return xForwardedFor.split(",")[0].trim();
                }
                return request.getRemoteAddr();
            }
        } catch (Exception e) {
            log.warn("Could not get client IP address", e);
        }
        return "unknown";
    }

    private String getClientUserAgent() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String userAgent = request.getHeader("User-Agent");
                if (userAgent != null && userAgent.length() > 500) {
                    return userAgent.substring(0, 500);
                }
                return userAgent != null ? userAgent : "unknown";
            }
        } catch (Exception e) {
            log.warn("Could not get client user agent", e);
        }
        return "unknown";
    }
}
