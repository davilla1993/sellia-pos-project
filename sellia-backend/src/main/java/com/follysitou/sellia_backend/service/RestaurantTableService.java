package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.request.RestaurantTableCreateRequest;
import com.follysitou.sellia_backend.dto.request.RestaurantTableUpdateRequest;
import com.follysitou.sellia_backend.dto.response.RestaurantTableResponse;
import com.follysitou.sellia_backend.exception.ConflictException;
import com.follysitou.sellia_backend.exception.ResourceNotFoundException;
import com.follysitou.sellia_backend.mapper.RestaurantTableMapper;
import com.follysitou.sellia_backend.model.RestaurantTable;
import com.follysitou.sellia_backend.repository.RestaurantTableRepository;
import com.follysitou.sellia_backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantTableService {

    private final RestaurantTableRepository tableRepository;
    private final RestaurantTableMapper tableMapper;

    @Transactional
    public RestaurantTableResponse createTable(RestaurantTableCreateRequest request) {
        if (tableRepository.existsByNumberAndDeletedFalse(request.getNumber())) {
            throw new ConflictException("number", request.getNumber(), "Table number already exists");
        }

        RestaurantTable table = RestaurantTable.builder()
                .number(request.getNumber())
                .name(request.getName())
                .capacity(request.getCapacity())
                .room(request.getRoom())
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .isVip(request.getIsVip() != null ? request.getIsVip() : false)
                .occupied(false)
                .build();

        RestaurantTable saved = tableRepository.save(table);
        return tableMapper.toResponse(saved);
    }

    public RestaurantTableResponse getTableById(String publicId) {
        RestaurantTable table = tableRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("RestaurantTable", "publicId", publicId));
        return tableMapper.toResponse(table);
    }

    public Page<RestaurantTableResponse> getAllTables(Pageable pageable) {
        Page<RestaurantTable> tables = tableRepository.findAll(pageable);
        return tables.map(tableMapper::toResponse);
    }

    public List<RestaurantTableResponse> getAllActiveTables() {
        List<RestaurantTable> tables = tableRepository.findAllActiveTables();
        return tables.stream()
                .map(tableMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<RestaurantTableResponse> getAvailableTables() {
        List<RestaurantTable> tables = tableRepository.findAvailableTables();
        return tables.stream()
                .map(tableMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<RestaurantTableResponse> getTablesByRoom(String room) {
        List<RestaurantTable> tables = tableRepository.findByRoom(room);
        return tables.stream()
                .map(tableMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<RestaurantTableResponse> getVipTables() {
        List<RestaurantTable> tables = tableRepository.findVipTables();
        return tables.stream()
                .map(tableMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<RestaurantTableResponse> getTablesByMinCapacity(Integer minCapacity) {
        List<RestaurantTable> tables = tableRepository.findByMinCapacity(minCapacity);
        return tables.stream()
                .map(tableMapper::toResponse)
                .collect(Collectors.toList());
    }

    public Long countAvailableTables() {
        return tableRepository.countAvailableTables();
    }

    public Long countOccupiedTables() {
        return tableRepository.countOccupiedTables();
    }

    @Transactional
    public RestaurantTableResponse updateTable(String publicId, RestaurantTableUpdateRequest request) {
        RestaurantTable table = tableRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("RestaurantTable", "publicId", publicId));

        if (request.getNumber() != null && !request.getNumber().equals(table.getNumber())) {
            if (tableRepository.existsByNumberAndDeletedFalse(request.getNumber())) {
                throw new ConflictException("number", request.getNumber(), "Table number already exists");
            }
            table.setNumber(request.getNumber());
        }
        if (request.getName() != null) {
            table.setName(request.getName());
        }
        if (request.getCapacity() != null) {
            table.setCapacity(request.getCapacity());
        }
        if (request.getRoom() != null) {
            table.setRoom(request.getRoom());
        }
        if (request.getAvailable() != null) {
            table.setAvailable(request.getAvailable());
        }
        if (request.getIsVip() != null) {
            table.setIsVip(request.getIsVip());
        }

        RestaurantTable updated = tableRepository.save(table);
        return tableMapper.toResponse(updated);
    }

    @Transactional
    public void deleteTable(String publicId) {
        RestaurantTable table = tableRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("RestaurantTable", "publicId", publicId));
        table.setDeleted(true);
        table.setDeletedAt(java.time.LocalDateTime.now());
        table.setDeletedBy(SecurityUtil.getCurrentUsername());
        tableRepository.save(table);
    }

    @Transactional
    public void occupyTable(String publicId, String orderId) {
        RestaurantTable table = tableRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("RestaurantTable", "publicId", publicId));
        table.setOccupied(true);
        table.setCurrentOrderId(orderId);
        tableRepository.save(table);
    }

    @Transactional
    public void releaseTable(String publicId) {
        RestaurantTable table = tableRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("RestaurantTable", "publicId", publicId));
        table.setOccupied(false);
        table.setCurrentOrderId(null);
        tableRepository.save(table);
    }
}
