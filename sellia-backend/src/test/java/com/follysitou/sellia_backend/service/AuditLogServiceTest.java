package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.model.AuditLog;
import com.follysitou.sellia_backend.repository.AuditLogRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AuditLogService auditLogService;

    @Test
    @DisplayName("Log success should create audit log with SUCCESS status")
    void logSuccess_ShouldCreateAuditLogWithSuccessStatus() {
        // Arrange
        String userEmail = "admin@test.com";
        String action = "CREATE";
        String entityType = "Product";
        String entityId = "prod-123";
        String details = "Created product: Pizza Margherita";

        ArgumentCaptor<AuditLog> auditLogCaptor = ArgumentCaptor.forClass(AuditLog.class);

        // Act
        auditLogService.logSuccess(userEmail, action, entityType, entityId, details);

        // Assert
        verify(auditLogRepository).save(auditLogCaptor.capture());
        AuditLog savedLog = auditLogCaptor.getValue();

        assertEquals(userEmail, savedLog.getUserEmail());
        assertEquals(action, savedLog.getAction());
        assertEquals(entityType, savedLog.getEntityType());
        assertEquals(entityId, savedLog.getEntityId());
        assertEquals(details, savedLog.getDetails());
        assertEquals(AuditLog.ActionStatus.SUCCESS, savedLog.getStatus());
        assertNull(savedLog.getErrorMessage());
        assertNotNull(savedLog.getActionDate());
    }

    @Test
    @DisplayName("Log failure should create audit log with FAILED status and error message")
    void logFailure_ShouldCreateAuditLogWithFailedStatus() {
        // Arrange
        String userEmail = "user@test.com";
        String action = "UPDATE";
        String entityType = "Order";
        String entityId = "order-456";
        String details = "Attempted to update order status";
        String errorMessage = "Order not found";

        ArgumentCaptor<AuditLog> auditLogCaptor = ArgumentCaptor.forClass(AuditLog.class);

        // Act
        auditLogService.logFailure(userEmail, action, entityType, entityId, details, errorMessage);

        // Assert
        verify(auditLogRepository).save(auditLogCaptor.capture());
        AuditLog savedLog = auditLogCaptor.getValue();

        assertEquals(userEmail, savedLog.getUserEmail());
        assertEquals(action, savedLog.getAction());
        assertEquals(entityType, savedLog.getEntityType());
        assertEquals(AuditLog.ActionStatus.FAILED, savedLog.getStatus());
        assertEquals(errorMessage, savedLog.getErrorMessage());
    }

    @Test
    @DisplayName("Log with null user email should default to ANONYMOUS")
    void logSuccess_WithNullUserEmail_ShouldDefaultToAnonymous() {
        // Arrange
        ArgumentCaptor<AuditLog> auditLogCaptor = ArgumentCaptor.forClass(AuditLog.class);

        // Act
        auditLogService.logSuccess(null, "VIEW", "Menu", "menu-1", "Viewed menu");

        // Assert
        verify(auditLogRepository).save(auditLogCaptor.capture());
        AuditLog savedLog = auditLogCaptor.getValue();

        assertEquals("ANONYMOUS", savedLog.getUserEmail());
    }

    @Test
    @DisplayName("Log generic action with custom status")
    void log_WithCustomStatus_ShouldCreateAuditLogCorrectly() {
        // Arrange
        ArgumentCaptor<AuditLog> auditLogCaptor = ArgumentCaptor.forClass(AuditLog.class);

        // Act
        auditLogService.log(
                "test@test.com",
                "PAYMENT",
                "Order",
                "order-789",
                "Payment processing",
                AuditLog.ActionStatus.SUCCESS,
                null
        );

        // Assert
        verify(auditLogRepository).save(auditLogCaptor.capture());
        AuditLog savedLog = auditLogCaptor.getValue();

        assertEquals("PAYMENT", savedLog.getAction());
        assertEquals(AuditLog.ActionStatus.SUCCESS, savedLog.getStatus());
    }

    @Test
    @DisplayName("Multiple log calls should save multiple entries")
    void multipleLogs_ShouldSaveMultipleEntries() {
        // Act
        auditLogService.logSuccess("user1@test.com", "LOGIN", "User", "u1", "Login successful");
        auditLogService.logSuccess("user2@test.com", "LOGOUT", "User", "u2", "Logout successful");
        auditLogService.logFailure("user3@test.com", "LOGIN", "User", "u3", "Login attempt", "Invalid password");

        // Assert
        verify(auditLogRepository, times(3)).save(any(AuditLog.class));
    }
}
