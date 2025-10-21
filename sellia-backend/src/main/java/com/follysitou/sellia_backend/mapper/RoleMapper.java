package com.follysitou.sellia_backend.mapper;

import com.follysitou.sellia_backend.dto.response.RoleResponse;
import com.follysitou.sellia_backend.model.Role;
import org.springframework.stereotype.Component;

@Component
public class RoleMapper {

    public RoleResponse toResponse(Role role) {
        if (role == null) {
            return null;
        }

        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName().name())
                .description(role.getDescription())
                .active(role.getActive())
                .build();
    }
}
