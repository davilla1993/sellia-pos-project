package com.follysitou.sellia_backend.mapper;

import com.follysitou.sellia_backend.dto.request.RestaurantTableCreateRequest;
import com.follysitou.sellia_backend.dto.request.RestaurantTableUpdateRequest;
import com.follysitou.sellia_backend.dto.response.RestaurantTableResponse;
import com.follysitou.sellia_backend.dto.response.RestaurantTableSummaryResponse;
import com.follysitou.sellia_backend.model.RestaurantTable;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RestaurantTableMapper {

    public RestaurantTable toEntity(RestaurantTableCreateRequest request) {
        return RestaurantTable.builder()
                .number(request.getNumber())
                .name(request.getName())
                .capacity(request.getCapacity())
                .room(request.getRoom())
                .available(request.getAvailable())
                .isVip(request.getIsVip())
                .occupied(false)
                .build();
    }

    public RestaurantTableResponse toResponse(RestaurantTable table) {
        RestaurantTableResponse response = new RestaurantTableResponse();
        response.setPublicId(table.getPublicId());
        response.setNumber(table.getNumber());
        response.setName(table.getName());
        response.setCapacity(table.getCapacity());
        response.setRoom(table.getRoom());
        response.setAvailable(table.getAvailable());
        response.setIsVip(table.getIsVip());
        response.setQrCodeUrl(table.getQrCodeUrl());
        response.setCurrentOrderId(table.getCurrentOrderId());
        response.setOccupied(table.getOccupied());
        response.setCreatedAt(table.getCreatedAt());
        response.setUpdatedAt(table.getUpdatedAt());
        return response;
    }

    public RestaurantTableSummaryResponse toSummaryResponse(RestaurantTable table) {
        RestaurantTableSummaryResponse response = new RestaurantTableSummaryResponse();
        response.setPublicId(table.getPublicId());
        response.setNumber(table.getNumber());
        response.setName(table.getName());
        response.setRoom(table.getRoom());
        response.setCapacity(table.getCapacity());
        response.setAvailable(table.getAvailable());
        response.setIsVip(table.getIsVip());
        response.setOccupied(table.getOccupied());
        return response;
    }

    public void updateEntityFromRequest(RestaurantTableUpdateRequest request, RestaurantTable table) {
        if (request.getNumber() != null) {
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
        if (request.getQrCodeUrl() != null) {
            table.setQrCodeUrl(request.getQrCodeUrl());
        }
        if (request.getOccupied() != null) {
            table.setOccupied(request.getOccupied());
        }
    }
}
