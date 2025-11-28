package com.follysitou.sellia_backend.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitFilter.class);

    // Store buckets per IP address
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    // Rate limit configuration from application.yml
    @Value("${app.security.rate-limit.login-capacity}")
    private int loginCapacity;

    @Value("${app.security.rate-limit.login-duration-minutes}")
    private int loginDurationMinutes;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();

        // Apply rate limiting only to login endpoint
        if (requestURI.equals("/api/auth/login") && request.getMethod().equals("POST")) {
            // Wrap request to allow reading body multiple times
            ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);

            String clientIp = getClientIP(wrappedRequest);
            Bucket bucket = resolveBucket(clientIp);

            if (bucket.tryConsume(1)) {
                filterChain.doFilter(wrappedRequest, response);
            } else {
                // Extract username from request body for logging
                String username = extractUsername(wrappedRequest);

                if (username != null && !username.isEmpty()) {
                    logger.warn("🔒 Rate limit exceeded - IP: {} | Username: {} | Endpoint: {}",
                        clientIp, username, requestURI);
                } else {
                    logger.warn("🔒 Rate limit exceeded - IP: {} | Endpoint: {}", clientIp, requestURI);
                }

                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                int retryAfterSeconds = loginDurationMinutes * 60;
                response.getWriter().write("{\"error\": \"Too many requests. Please try again later.\", \"retryAfter\": " + retryAfterSeconds + "}");
            }
        } else {
            filterChain.doFilter(request, response);
        }
    }

    private Bucket resolveBucket(String clientIp) {
        return cache.computeIfAbsent(clientIp, k -> createNewBucket());
    }

    private Bucket createNewBucket() {
        Duration duration = Duration.ofMinutes(loginDurationMinutes);
        Bandwidth limit = Bandwidth.classic(loginCapacity, Refill.intervally(loginCapacity, duration));
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        String ip;

        if (xfHeader == null || xfHeader.isEmpty()) {
            ip = request.getRemoteAddr();
        } else {
            ip = xfHeader.split(",")[0].trim();
        }

        // Normalize IPv6 localhost to IPv4 localhost to prevent bypass
        // Different browsers may use different localhost representations
        if (ip.equals("0:0:0:0:0:0:0:1") || ip.equals("::1")) {
            return "127.0.0.1";
        }

        return ip;
    }

    /**
     * Extract username from login request body for security logging
     */
    private String extractUsername(ContentCachingRequestWrapper request) {
        try {
            // Force reading the body to populate the cache
            byte[] content = request.getContentAsByteArray();

            // If cache is empty, read from input stream
            if (content.length == 0) {
                request.getInputStream().transferTo(java.io.OutputStream.nullOutputStream());
                content = request.getContentAsByteArray();
            }

            if (content.length > 0) {
                String body = new String(content, StandardCharsets.UTF_8);
                JsonNode jsonNode = objectMapper.readTree(body);
                if (jsonNode.has("username")) {
                    return jsonNode.get("username").asText();
                }
            }
        } catch (Exception e) {
            logger.debug("Failed to extract username from request body: {}", e.getMessage());
        }
        return null;
    }
}
