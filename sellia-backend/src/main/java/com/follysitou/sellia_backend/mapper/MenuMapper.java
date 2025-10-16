package com.follysitou.sellia_backend.mapper;

import com.follysitou.sellia_backend.dto.request.MenuCreateRequest;
import com.follysitou.sellia_backend.dto.request.MenuUpdateRequest;
import com.follysitou.sellia_backend.dto.response.MenuResponse;
import com.follysitou.sellia_backend.model.Menu;
import com.follysitou.sellia_backend.model.MenuItem;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class MenuMapper {

    public Menu toEntity(MenuCreateRequest request) {
        return Menu.builder()
                .name(request.getName())
                .description(request.getDescription())
                .menuType(request.getMenuType())
                .active(request.getActive() != null ? request.getActive() : true)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .imageUrl(request.getImageUrl())
                .build();
    }

    public MenuResponse toResponse(Menu menu) {
        MenuResponse response = new MenuResponse();
        response.setPublicId(menu.getPublicId());
        response.setName(menu.getName());
        response.setDescription(menu.getDescription());
        response.setMenuType(menu.getMenuType());
        response.setActive(menu.getActive());
        response.setStartDate(menu.getStartDate());
        response.setEndDate(menu.getEndDate());
        response.setImageUrl(menu.getImageUrl());
        response.setCreatedAt(menu.getCreatedAt());
        response.setUpdatedAt(menu.getUpdatedAt());

        if (menu.getMenuItems() != null) {
            response.setMenuItems(menu.getMenuItems().stream()
                    .map(this::toMenuItemResponse)
                    .collect(Collectors.toList()));
        }

        return response;
    }

    public void updateEntityFromRequest(MenuUpdateRequest request, Menu menu) {
        if (request.getName() != null) {
            menu.setName(request.getName());
        }
        if (request.getDescription() != null) {
            menu.setDescription(request.getDescription());
        }
        if (request.getMenuType() != null) {
            menu.setMenuType(request.getMenuType());
        }
        if (request.getActive() != null) {
            menu.setActive(request.getActive());
        }
        if (request.getStartDate() != null) {
            menu.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            menu.setEndDate(request.getEndDate());
        }
        if (request.getImageUrl() != null) {
            menu.setImageUrl(request.getImageUrl());
        }
    }

    private MenuResponse.MenuItemResponse toMenuItemResponse(MenuItem menuItem) {
        MenuResponse.MenuItemResponse response = new MenuResponse.MenuItemResponse();
        response.setPublicId(menuItem.getPublicId());
        if (menuItem.getProduct() != null) {
            response.setProductName(menuItem.getProduct().getName());
            response.setPrice(menuItem.getProduct().getPrice());
        }
        response.setPosition(menuItem.getDisplayOrder());
        return response;
    }
}
