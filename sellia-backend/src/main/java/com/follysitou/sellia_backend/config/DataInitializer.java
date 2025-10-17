package com.follysitou.sellia_backend.config;

import com.follysitou.sellia_backend.enums.RoleName;
import com.follysitou.sellia_backend.model.Role;
import com.follysitou.sellia_backend.model.User;
import com.follysitou.sellia_backend.repository.RoleRepository;
import com.follysitou.sellia_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeRoles();
        initializeDemoUsers();
    }

    private void initializeRoles() {
        if (roleRepository.count() == 0) {
            Role adminRole = Role.builder().name(RoleName.ADMIN).description("Administrator").active(true).build();
            Role cashierRole = Role.builder().name(RoleName.CAISSIER).description("Cashier").active(true).build();
            Role chefRole = Role.builder().name(RoleName.CUISINE).description("Chef").active(true).build();
            roleRepository.saveAll(java.util.List.of(adminRole, cashierRole, chefRole));
            log.info("Roles initialized");
        }
    }

    private void initializeDemoUsers() {
        // Admin
        if (!userRepository.existsByUsernameAndDeletedFalse("admin@maison.local")) {
            Role adminRole = roleRepository.findByName(RoleName.ADMIN).orElseThrow();
            User admin = User.builder()
                    .username("admin@maison.local")
                    .email("admin@maison.local")
                    .password(passwordEncoder.encode("password"))
                    .firstName("Admin")
                    .lastName("System")
                    .role(adminRole)
                    .firstLogin(false)
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info("Demo admin user created");
        }

        // Cashier
        if (!userRepository.existsByUsernameAndDeletedFalse("cashier@maison.local")) {
            Role cashierRole = roleRepository.findByName(RoleName.CAISSIER).orElseThrow();
            User cashier = User.builder()
                    .username("cashier@maison.local")
                    .email("cashier@maison.local")
                    .password(passwordEncoder.encode("password"))
                    .firstName("Jean")
                    .lastName("Caissier")
                    .role(cashierRole)
                    .firstLogin(false)
                    .active(true)
                    .build();
            userRepository.save(cashier);
            log.info("Demo cashier user created");
        }

        // Chef
        if (!userRepository.existsByUsernameAndDeletedFalse("chef@maison.local")) {
            Role chefRole = roleRepository.findByName(RoleName.CUISINE).orElseThrow();
            User chef = User.builder()
                    .username("chef@maison.local")
                    .email("chef@maison.local")
                    .password(passwordEncoder.encode("password"))
                    .firstName("Marie")
                    .lastName("Cuisinier")
                    .role(chefRole)
                    .firstLogin(false)
                    .active(true)
                    .build();
            userRepository.save(chef);
            log.info("Demo chef user created");
        }
    }
}
