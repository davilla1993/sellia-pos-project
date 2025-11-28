package com.follysitou.sellia_backend.config;

import com.follysitou.sellia_backend.security.JwtAccessDeniedHandler;
import com.follysitou.sellia_backend.security.JwtAuthenticationEntryPoint;
import com.follysitou.sellia_backend.security.JwtAuthenticationFilter;
import com.follysitou.sellia_backend.security.JwtTokenProvider;
import com.follysitou.sellia_backend.security.RateLimitFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RateLimitFilter rateLimitFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
    private final UserDetailsService userDetailsService;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Value("${app.security.hsts.enabled:false}")
    private boolean hstsEnabled;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Parse comma-separated allowed origins from environment variable
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> {
                    headers
                        .frameOptions(HeadersConfigurer.FrameOptionsConfig::deny)
                        .xssProtection(HeadersConfigurer.XXssConfig::disable) // Disabled as modern browsers have built-in XSS protection
                        .contentTypeOptions(HeadersConfigurer.ContentTypeOptionsConfig::disable) // Spring Boot enables this by default
                        .contentSecurityPolicy(csp -> csp
                                .policyDirectives("default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'")
                        );

                    // HSTS: Only enable if SSL/HTTPS is configured
                    if (hstsEnabled) {
                        headers.httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(31536000)
                        );
                    }
                })
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(jwtAccessDeniedHandler)
                )
                .authorizeHttpRequests(authz -> authz
                        // Auth endpoints
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/refresh").permitAll()
                        .requestMatchers(HttpMethod.GET, "/actuator/health").permitAll()
                        // Actuator endpoints for monitoring (AUDITOR role)
                        .requestMatchers("/actuator/**").hasAnyRole("ADMIN", "AUDITOR")
                        // Swagger/OpenAPI documentation
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/swagger-resources/**", "/webjars/**").permitAll()
                        // Static files (uploads)
                        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                        // Angular SPA - Allow all static resources
                        .requestMatchers("/", "/index.html", "/favicon.ico").permitAll()
                        .requestMatchers("/*.js", "/*.css", "/*.woff", "/*.woff2", "/*.ttf", "/*.eot", "/*.svg", "/*.png", "/*.jpg", "/*.jpeg", "/*.gif", "/*.ico").permitAll()
                        .requestMatchers("/assets/**").permitAll()
                        // Public API endpoints (QR code menu, orders, health)
                        .requestMatchers("/api/public/**").permitAll()
                        // Public GET endpoints for products, categories, menus, tables
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/menus/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/tables/**").permitAll()
                        // Restaurant logo (public for branding)
                        .requestMatchers(HttpMethod.GET, "/api/restaurant/logo/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/restaurant").permitAll()
                        // Customer session endpoints (public for QR code flow)
                        .requestMatchers(HttpMethod.POST, "/api/customer-sessions").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/customer-sessions/**").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/customer-sessions/**").permitAll()
                        // Orders creation and viewing (public for customers)
                        .requestMatchers(HttpMethod.POST, "/api/orders").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/orders/**").permitAll()
                        // Authenticated requests
                        .requestMatchers(HttpMethod.POST, "/api/users/change-password").authenticated()
                        // All API requests require authentication
                        .requestMatchers("/api/**").authenticated()
                        // Allow all other requests (for Angular routing)
                        .anyRequest().permitAll()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
