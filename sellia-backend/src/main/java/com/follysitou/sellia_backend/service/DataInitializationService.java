package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.enums.RoleName;
import com.follysitou.sellia_backend.model.Role;
import com.follysitou.sellia_backend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataInitializationService {

    private final RoleRepository roleRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initializeDefaultRoles() {
        log.info("Initializing default roles...");

        // Check and create ADMIN role
        if (roleRepository.findByName(RoleName.ADMIN).isEmpty()) {
            Role adminRole = Role.builder()
                    .name(RoleName.ADMIN)
                    .description("Maître absolu. Gère utilisateurs, rôles, menus, QR Codes, rapports et configuration générale.")
                    .active(true)
                    .build();
            roleRepository.save(adminRole);
            log.info("✓ ADMIN role created");
        } else {
            log.info("✓ ADMIN role already exists");
        }

        // Check and create CAISSE role
        if (roleRepository.findByName(RoleName.CAISSE).isEmpty()) {
            Role caisseRole = Role.builder()
                    .name(RoleName.CAISSE)
                    .description("Gère commandes, encaissements, rapports de vente.")
                    .active(true)
                    .build();
            roleRepository.save(caisseRole);
            log.info("✓ CAISSE role created");
        } else {
            log.info("✓ CAISSE role already exists");
        }

        // Check and create CUISINE role
        if (roleRepository.findByName(RoleName.CUISINE).isEmpty()) {
            Role cuisineRole = Role.builder()
                    .name(RoleName.CUISINE)
                    .description("Consulte et met à jour le statut des commandes.")
                    .active(true)
                    .build();
            roleRepository.save(cuisineRole);
            log.info("✓ CUISINE role created");
        } else {
            log.info("✓ CUISINE role already exists");
        }

        log.info("Default roles initialization completed");
    }
}
