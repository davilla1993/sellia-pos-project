package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.request.LoginRequest;
import com.follysitou.sellia_backend.dto.response.AuthResponse;
import com.follysitou.sellia_backend.enums.RoleName;
import com.follysitou.sellia_backend.model.Role;
import com.follysitou.sellia_backend.model.User;
import com.follysitou.sellia_backend.repository.UserRepository;
import com.follysitou.sellia_backend.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private Role adminRole;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        adminRole = Role.builder()
                .name(RoleName.ADMIN)
                .description("Administrateur")
                .active(true)
                .build();

        testUser = User.builder()
                .email("test@example.com")
                .password("encodedPassword")
                .firstName("Test")
                .lastName("User")
                .role(adminRole)
                .active(true)
                .firstLogin(false)
                .build();
        testUser.setPublicId("user-123");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");
    }

    @Test
    @DisplayName("Login successful with valid credentials")
    void login_WithValidCredentials_ShouldReturnAuthResponse() {
        // Arrange
        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(userRepository.findByEmailAndDeletedFalse("test@example.com"))
                .thenReturn(Optional.of(testUser));
        when(tokenProvider.generateAccessToken(any(User.class))).thenReturn("access-token");
        when(tokenProvider.generateRefreshToken(any(User.class))).thenReturn("refresh-token");

        // Act
        AuthResponse response = authService.login(loginRequest);

        // Assert
        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("ADMIN", response.getRole());

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(auditLogService).logSuccess(eq("test@example.com"), eq("LOGIN"), eq("User"), any(), any());
    }

    @Test
    @DisplayName("Login fails with invalid credentials")
    void login_WithInvalidCredentials_ShouldThrowException() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        // Act & Assert
        assertThrows(BadCredentialsException.class, () -> authService.login(loginRequest));

        verify(auditLogService).logFailure(
                eq("test@example.com"),
                eq("LOGIN"),
                eq("User"),
                isNull(),
                any(),
                any()
        );
    }

    @Test
    @DisplayName("Login fails with inactive user")
    void login_WithInactiveUser_ShouldThrowException() {
        // Arrange
        testUser.setActive(false);
        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(userRepository.findByEmailAndDeletedFalse("test@example.com"))
                .thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
    }

    @Test
    @DisplayName("Login fails when user not found")
    void login_WithNonExistentUser_ShouldThrowException() {
        // Arrange
        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(userRepository.findByEmailAndDeletedFalse("test@example.com"))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
    }

    @Test
    @DisplayName("First login flag is correctly returned")
    void login_WithFirstLoginTrue_ShouldReturnFirstLoginFlag() {
        // Arrange
        testUser.setFirstLogin(true);
        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(userRepository.findByEmailAndDeletedFalse("test@example.com"))
                .thenReturn(Optional.of(testUser));
        when(tokenProvider.generateAccessToken(any(User.class))).thenReturn("access-token");
        when(tokenProvider.generateRefreshToken(any(User.class))).thenReturn("refresh-token");

        // Act
        AuthResponse response = authService.login(loginRequest);

        // Assert
        assertTrue(response.isFirstLogin());
    }
}
