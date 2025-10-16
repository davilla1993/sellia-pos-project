package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.enums.RoleName;
import com.follysitou.sellia_backend.exception.ResourceNotFoundException;
import com.follysitou.sellia_backend.model.Role;
import com.follysitou.sellia_backend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;

    public Role getRoleByName(RoleName roleName) {
        return roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName));
    }

    public Role getRoleById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));
    }

    public Role getRoleByPublicId(String publicId) {
        return roleRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "publicId", publicId));
    }

    public List<Role> getAllActiveRoles() {
        return roleRepository.findByDeletedFalse();
    }

    public Optional<Role> findByName(RoleName roleName) {
        return roleRepository.findByName(roleName);
    }
}
