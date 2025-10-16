package com.follysitou.sellia_backend.mapper;

import com.follysitou.sellia_backend.dto.request.UserRegistrationRequest;
import com.follysitou.sellia_backend.dto.request.UserUpdateRequest;
import com.follysitou.sellia_backend.dto.response.UserResponse;
import com.follysitou.sellia_backend.model.User;
import com.follysitou.sellia_backend.model.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserMapper {

    public User toEntity(UserRegistrationRequest request, Role role) {
        return User.builder()
                .username(request.getUsername())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(request.getPassword())
                .role(role)
                .phoneNumber(request.getPhoneNumber())
                .active(true)
                .firstLogin(true)
                .build();
    }

    public UserResponse toResponse(User user) {
        UserResponse response = new UserResponse();
        response.setPublicId(user.getPublicId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setProfileImage(user.getProfileImage());
        response.setRole(toRoleResponse(user.getRole()));
        response.setActive(user.getActive());
        response.setFirstLogin(user.getFirstLogin());
        response.setLastLogin(user.getLastLogin());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }

    public void updateEntityFromRequest(UserUpdateRequest request, User user) {
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getRoleId() != null) {
            // Note: This would need service to fetch and set the actual Role entity
            // For now, we'll handle this in the service layer
        }
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }
    }

    private UserResponse.RoleResponse toRoleResponse(Role role) {
        UserResponse.RoleResponse roleResponse = new UserResponse.RoleResponse();
        roleResponse.setPublicId(role.getPublicId());
        roleResponse.setName(role.getName().name());
        roleResponse.setDisplayName(role.getName().getDisplayName());
        roleResponse.setDescription(role.getDescription());
        return roleResponse;
    }
}
