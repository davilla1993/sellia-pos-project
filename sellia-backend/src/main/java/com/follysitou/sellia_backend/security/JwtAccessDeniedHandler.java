package com.follysitou.sellia_backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.follysitou.sellia_backend.exception.ApiError;
import com.follysitou.sellia_backend.util.ErrorMessages;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;


@Component
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    private static final Logger logger = LoggerFactory.getLogger(JwtAccessDeniedHandler.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException)
            throws IOException, ServletException {

        // Log pour déboguer les erreurs 403
        logger.warn("🚫 Access Denied (403) - URI: {} | Method: {} | User: {} | Exception: {}",
            request.getRequestURI(),
            request.getMethod(),
            request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "anonymous",
            accessDeniedException.getMessage());

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ApiError apiError = ApiError.builder()
                .status(HttpServletResponse.SC_FORBIDDEN)
                .error("Accès refusé")
                .message(ErrorMessages.ACCESS_DENIED)
                .path(request.getRequestURI())
                .build();

        response.getWriter().write(objectMapper.writeValueAsString(apiError));
    }
}
