package com.follysitou.sellia_backend.repository;

import com.follysitou.sellia_backend.model.RestaurantTable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {

    Optional<RestaurantTable> findByPublicId(String publicId);

    boolean existsByNumberAndDeletedFalse(String number);

    @Query("SELECT t FROM RestaurantTable t WHERE t.deleted = false ORDER BY t.room, t.number")
    List<RestaurantTable> findAllActiveTables();

    @Query("SELECT t FROM RestaurantTable t WHERE t.deleted = false AND t.available = true ORDER BY t.room, t.number")
    List<RestaurantTable> findAvailableTables();

    @Query("SELECT t FROM RestaurantTable t WHERE t.deleted = false AND t.room = :room ORDER BY t.number")
    List<RestaurantTable> findByRoom(@Param("room") String room);

    @Query("SELECT t FROM RestaurantTable t WHERE t.deleted = false AND t.isVip = true")
    List<RestaurantTable> findVipTables();

    @Query("SELECT t FROM RestaurantTable t WHERE t.deleted = false AND t.capacity >= :minCapacity ORDER BY t.capacity")
    List<RestaurantTable> findByMinCapacity(@Param("minCapacity") Integer minCapacity);

    @Query("SELECT t FROM RestaurantTable t WHERE t.deleted = false AND t.occupied = true")
    List<RestaurantTable> findOccupiedTables();

    @Query("SELECT COUNT(t) FROM RestaurantTable t WHERE t.deleted = false AND t.available = true")
    Long countAvailableTables();

    @Query("SELECT COUNT(t) FROM RestaurantTable t WHERE t.deleted = false AND t.occupied = true")
    Long countOccupiedTables();

    @Query("SELECT t FROM RestaurantTable t WHERE t.deleted = false AND t.qrCodeToken = :qrCodeToken")
    Optional<RestaurantTable> findByQrCodeToken(@Param("qrCodeToken") String qrCodeToken);

    @Query("SELECT t FROM RestaurantTable t WHERE t.deleted = false ORDER BY t.room, t.number")
    Page<RestaurantTable> findAllNotDeleted(Pageable pageable);

    @Query("SELECT t FROM RestaurantTable t WHERE t.publicId = :publicId AND t.deleted = false")
    Optional<RestaurantTable> findByPublicIdNotDeleted(@Param("publicId") String publicId);
}
