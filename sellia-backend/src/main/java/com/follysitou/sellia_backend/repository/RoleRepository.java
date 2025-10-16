package com.follysitou.sellia_backend.repository;

import com.follysitou.sellia_backend.enums.RoleName;
import com.follysitou.sellia_backend.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(RoleName name);

    Optional<Role> findByPublicId(String publicId);

    @Query("SELECT r FROM Role r WHERE r.deleted = false")
    java.util.List<Role> findByDeletedFalse();

    @Query("SELECT r FROM Role r WHERE r.deleted = false AND r.active = true")
    java.util.List<Role> findAllActiveRoles();

    @Query("SELECT r FROM Role r WHERE r.deleted = false AND r.name = :name")
    Optional<Role> findActiveRoleByName(@Param("name") RoleName name);
}
