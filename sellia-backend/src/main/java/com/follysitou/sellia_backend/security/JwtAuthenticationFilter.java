package com.follysitou.sellia_backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.follysitou.sellia_backend.exception.ApiError;
import com.follysitou.sellia_backend.service.ActiveTokenService;
import com.follysitou.sellia_backend.util.ErrorMessages;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.Collections;


@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final ActiveTokenService activeTokenService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt)) {
                // Validate token format and expiration
                if (!tokenProvider.validateToken(jwt)) {
                    sendErrorResponse(response, ErrorMessages.TOKEN_EXPIRED, request.getRequestURI());
                    return;
                }

                // SECURITY: Check if token has been revoked
                String jti = tokenProvider.getJtiFromToken(jwt);
                if (!activeTokenService.isTokenActive(jti)) {
                    sendErrorResponse(response, "Token has been revoked. Please login again.", request.getRequestURI());
                    return;
                }

                String username = tokenProvider.getUsernameFromToken(jwt);
                String userId = tokenProvider.getUserIdFromToken(jwt);
                String role = tokenProvider.getRoleFromToken(jwt);

                // Build authorities from JWT role
                Collection<GrantedAuthority> authorities = Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + role)
                );

                // Create UserPrincipal directly from JWT data (without DB query)
                UserPrincipal userPrincipal = UserPrincipal.builder()
                        .userId(userId)
                        .username(username)
                        .authorities(authorities)
                        .active(true)
                        .build();

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userPrincipal, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            logger.error("Authentication error: " + ex.getMessage(), ex);
            sendErrorResponse(response, ErrorMessages.TOKEN_INVALID, request.getRequestURI());
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void sendErrorResponse(HttpServletResponse response, String message, String path) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ApiError apiError = ApiError.builder()
                .status(HttpServletResponse.SC_UNAUTHORIZED)
                .error("Authentification requise")
                .message(message)
                .path(path)
                .build();

        response.getWriter().write(objectMapper.writeValueAsString(apiError));
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
