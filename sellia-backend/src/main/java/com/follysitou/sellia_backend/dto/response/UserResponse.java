package com.follysitou.sellia_backend.dto.response;

import com.follysitou.sellia_backend.model.Role;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponse {

    private String publicId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String profileImage;
    private RoleResponse role;
    private Boolean active;
    private Boolean firstLogin;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class RoleResponse {
        private String publicId;
        private String name;
        private String displayName;
        private String description;
    }
}
