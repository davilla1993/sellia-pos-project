package com.follysitou.sellia_backend.repository;

import com.follysitou.sellia_backend.model.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByPublicId(String publicId);

    boolean existsByNameAndDeletedFalse(String name);

    @Query("SELECT c FROM Category c WHERE c.deleted = false ORDER BY c.name")
    List<Category> findAllNotDeleted();

    @Query("SELECT c FROM Category c WHERE c.deleted = false ORDER BY c.name")
    Page<Category> findAllNotDeletedPaged(Pageable pageable);

    @Query("SELECT c FROM Category c WHERE c.deleted = false AND c.available = true ORDER BY c.name")
    List<Category> findAllActiveCategories();

    @Query("SELECT c FROM Category c WHERE c.deleted = false AND c.displayOrder IS NOT NULL ORDER BY c.displayOrder")
    List<Category> findAllOrderedByDisplayOrder();
}
