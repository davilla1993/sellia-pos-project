package com.follysitou.sellia_backend.repository;

import com.follysitou.sellia_backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByPublicId(String publicId);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByUsernameAndDeletedFalse(String username);

    boolean existsByEmailAndDeletedFalse(String email);

    @Query("SELECT u FROM User u WHERE u.deleted = false")
    Page<User> findByDeletedFalse(Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.deleted = false AND u.active = true")
    Page<User> findAllActiveUsers(Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.deleted = false AND u.role.id = :roleId")
    Page<User> findByRoleId(@Param("roleId") Long roleId, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.deleted = false AND u.firstName LIKE %:firstName% OR u.lastName LIKE %:lastName%")
    Page<User> findByNameContaining(@Param("firstName") String firstName, @Param("lastName") String lastName, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.deleted = false AND u.firstLogin = true")
    Page<User> findUsersWithFirstLogin(Pageable pageable);
}
