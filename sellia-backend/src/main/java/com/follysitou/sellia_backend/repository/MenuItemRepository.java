package com.follysitou.sellia_backend.repository;

import com.follysitou.sellia_backend.model.MenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    Optional<MenuItem> findByPublicId(String publicId);

    @Query("SELECT DISTINCT mi FROM MenuItem mi LEFT JOIN FETCH mi.products WHERE mi.publicId = :publicId")
    Optional<MenuItem> findByPublicIdWithProducts(@Param("publicId") String publicId);

    Page<MenuItem> findByMenuPublicId(String menuPublicId, Pageable pageable);

    List<MenuItem> findByMenuPublicIdOrderByDisplayOrder(String menuPublicId);

    Page<MenuItem> findByAvailableTrue(Pageable pageable);

    Page<MenuItem> findByMenuPublicIdAndAvailableTrue(String menuPublicId, Pageable pageable);
}
