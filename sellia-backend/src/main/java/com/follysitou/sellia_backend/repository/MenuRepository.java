package com.follysitou.sellia_backend.repository;

import com.follysitou.sellia_backend.enums.MenuType;
import com.follysitou.sellia_backend.model.Menu;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {

    Optional<Menu> findByPublicId(String publicId);

    boolean existsByNameAndDeletedFalse(String name);

    @Query("SELECT m FROM Menu m WHERE m.deleted = false AND m.active = true")
    Page<Menu> findAllActiveMenus(Pageable pageable);

    @Query("SELECT m FROM Menu m WHERE m.deleted = false AND m.menuType = :menuType")
    Page<Menu> findByMenuType(@Param("menuType") MenuType menuType, Pageable pageable);

    @Query("SELECT m FROM Menu m WHERE m.deleted = false AND m.active = true AND m.menuType = :menuType")
    List<Menu> findActiveMenusByType(@Param("menuType") MenuType menuType);

    @Query("SELECT m FROM Menu m WHERE m.deleted = false AND m.active = true AND CURRENT_TIMESTAMP BETWEEN m.startDate AND m.endDate")
    List<Menu> findCurrentActiveMenus();

    @Query("SELECT m FROM Menu m WHERE m.deleted = false ORDER BY m.name")
    Page<Menu> findAllMenus(Pageable pageable);

    @Query("SELECT m FROM Menu m WHERE m.deleted = false AND m.active = :active AND m.menuType = :menuType")
    List<Menu> findByMenuTypeAndActive(@Param("menuType") MenuType menuType, @Param("active") Boolean active);

    @Query("SELECT m FROM Menu m WHERE m.name = :name AND m.deleted = false")
    Optional<Menu> findByNameAndDeletedFalse(@Param("name") String name);

    @Query("SELECT DISTINCT m FROM Menu m " +
           "LEFT JOIN FETCH m.menuItems mi " +
           "LEFT JOIN FETCH mi.products " +
           "WHERE m.publicId = :publicId AND m.deleted = false")
    Optional<Menu> findByPublicIdWithProducts(@Param("publicId") String publicId);
}
