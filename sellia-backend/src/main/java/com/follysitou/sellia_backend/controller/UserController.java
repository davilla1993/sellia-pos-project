package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.dto.request.ResetPasswordRequest;
import com.follysitou.sellia_backend.dto.request.UserPasswordChangeRequest;
import com.follysitou.sellia_backend.dto.request.UserRegistrationRequest;
import com.follysitou.sellia_backend.dto.request.UserUpdateRequest;
import com.follysitou.sellia_backend.dto.response.PagedResponse;
import com.follysitou.sellia_backend.dto.response.UserResponse;
import com.follysitou.sellia_backend.security.SecurityContextUtils;
import com.follysitou.sellia_backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRegistrationRequest request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{publicId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String publicId) {
        UserResponse response = userService.getUserById(publicId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PagedResponse<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserResponse> users = userService.getAllUsers(pageable);
        PagedResponse<UserResponse> response = PagedResponse.of(users);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{publicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable String publicId,
            @Valid @RequestBody UserUpdateRequest request) {
        UserResponse response = userService.updateUser(publicId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody UserPasswordChangeRequest request) {
        String userId = SecurityContextUtils.getCurrentUserId();
        userService.changePassword(userId, request.getCurrentPassword(), request.getNewPassword(), request.getConfirmPassword());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{publicId}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> resetPassword(
            @PathVariable String publicId,
            @Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(publicId, request.getNewPassword(), request.getConfirmPassword());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{publicId}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateUser(@PathVariable String publicId) {
        userService.deactivateUser(publicId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{publicId}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> activateUser(@PathVariable String publicId) {
        userService.activateUser(publicId);
        return ResponseEntity.noContent().build();
    }
}
