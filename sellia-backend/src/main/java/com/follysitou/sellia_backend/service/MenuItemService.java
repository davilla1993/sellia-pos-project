package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.request.MenuItemCreateRequest;
import com.follysitou.sellia_backend.dto.request.MenuItemUpdateRequest;
import com.follysitou.sellia_backend.dto.response.MenuItemResponse;
import com.follysitou.sellia_backend.dto.response.PagedResponse;
import com.follysitou.sellia_backend.exception.ResourceNotFoundException;
import com.follysitou.sellia_backend.mapper.MenuItemMapper;
import com.follysitou.sellia_backend.model.Menu;
import com.follysitou.sellia_backend.model.MenuItem;
import com.follysitou.sellia_backend.model.Product;
import com.follysitou.sellia_backend.repository.MenuItemRepository;
import com.follysitou.sellia_backend.repository.MenuRepository;
import com.follysitou.sellia_backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final MenuRepository menuRepository;
    private final ProductRepository productRepository;
    private final MenuItemMapper menuItemMapper;

    public MenuItemResponse createMenuItem(MenuItemCreateRequest request) {
        // Fetch menu
        Menu menu = menuRepository.findByPublicId(request.getMenuId())
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found"));

        // Fetch all products
        Set<Product> products = new HashSet<>();
        for (String productId : request.getProductIds()) {
            Product product = productRepository.findByPublicId(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));
            products.add(product);
        }

        // Create and save MenuItem
        MenuItem menuItem = menuItemMapper.toEntity(request, menu, products);
        MenuItem saved = menuItemRepository.save(menuItem);

        return menuItemMapper.toResponse(saved);
    }

    public MenuItemResponse getMenuItemById(String publicId) {
        MenuItem menuItem = menuItemRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem not found"));
        return menuItemMapper.toResponse(menuItem);
    }

    public PagedResponse<MenuItemResponse> getMenuItemsByMenu(String menuPublicId, Pageable pageable) {
        // Verify menu exists
        menuRepository.findByPublicId(menuPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found"));

        Page<MenuItem> page = menuItemRepository.findByMenuPublicId(menuPublicId, pageable);
        return PagedResponse.of(page.map(menuItemMapper::toResponse));
    }

    public List<MenuItemResponse> getMenuItemsByMenuOrdered(String menuPublicId) {
        // Verify menu exists
        menuRepository.findByPublicId(menuPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found"));

        return menuItemRepository.findByMenuPublicIdOrderByDisplayOrder(menuPublicId)
                .stream()
                .map(menuItemMapper::toResponse)
                .collect(Collectors.toList());
    }

    public PagedResponse<MenuItemResponse> getAvailableMenuItems(Pageable pageable) {
        Page<MenuItem> page = menuItemRepository.findByAvailableTrue(pageable);
        return PagedResponse.of(page.map(menuItemMapper::toResponse));
    }

    public PagedResponse<MenuItemResponse> getAvailableMenuItemsByMenu(String menuPublicId, Pageable pageable) {
        // Verify menu exists
        menuRepository.findByPublicId(menuPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found"));

        Page<MenuItem> page = menuItemRepository.findByMenuPublicIdAndAvailableTrue(menuPublicId, pageable);
        return PagedResponse.of(page.map(menuItemMapper::toResponse));
    }

    public MenuItemResponse updateMenuItem(String publicId, MenuItemUpdateRequest request) {
        MenuItem menuItem = menuItemRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem not found"));

        // Fetch products if provided
        Set<Product> products = menuItem.getProducts();
        if (request.getProductIds() != null && !request.getProductIds().isEmpty()) {
            products = new HashSet<>();
            for (String productId : request.getProductIds()) {
                Product product = productRepository.findByPublicId(productId)
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));
                products.add(product);
            }
        }

        menuItemMapper.updateEntityFromRequest(request, menuItem, products);
        MenuItem updated = menuItemRepository.save(menuItem);

        return menuItemMapper.toResponse(updated);
    }

    public void deleteMenuItem(String publicId) {
        MenuItem menuItem = menuItemRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem not found"));
        menuItemRepository.delete(menuItem);
    }
}
