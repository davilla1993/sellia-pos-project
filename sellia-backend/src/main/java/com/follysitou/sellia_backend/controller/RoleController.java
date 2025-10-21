package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.dto.response.RoleResponse;
import com.follysitou.sellia_backend.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        List<RoleResponse> roles = roleService.getAllActiveRolesAsResponse();
        return ResponseEntity.ok(roles);
    }
}
