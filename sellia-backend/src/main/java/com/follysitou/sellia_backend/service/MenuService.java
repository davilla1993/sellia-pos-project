package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.request.MenuCreateRequest;
import com.follysitou.sellia_backend.dto.request.MenuUpdateRequest;
import com.follysitou.sellia_backend.dto.response.MenuResponse;
import com.follysitou.sellia_backend.enums.MenuType;
import com.follysitou.sellia_backend.exception.ConflictException;
import com.follysitou.sellia_backend.exception.ResourceNotFoundException;
import com.follysitou.sellia_backend.mapper.MenuMapper;
import com.follysitou.sellia_backend.model.Menu;
import com.follysitou.sellia_backend.model.MenuItem;
import com.follysitou.sellia_backend.model.Product;
import com.follysitou.sellia_backend.repository.MenuRepository;
import com.follysitou.sellia_backend.repository.MenuItemRepository;
import com.follysitou.sellia_backend.repository.ProductRepository;
import com.follysitou.sellia_backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MenuService {

    private final MenuRepository menuRepository;
    private final MenuItemRepository menuItemRepository;
    private final ProductRepository productRepository;
    private final MenuMapper menuMapper;
    private final FileService fileService;

    @Transactional
    public MenuResponse createMenu(MenuCreateRequest request) {
        if (menuRepository.existsByNameAndDeletedFalse(request.getName())) {
            throw new ConflictException("name", request.getName(), "Menu already exists");
        }

        Menu menu = menuMapper.toEntity(request);

        // Upload image if provided
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            String fileName = fileService.uploadProductImage(request.getImage());
            menu.setImageUrl("/api/menus/images/" + fileName);
            log.info("Menu image uploaded: /api/menus/images/{}", fileName);
        }

        Menu saved = menuRepository.save(menu);
        return menuMapper.toResponse(saved);
    }

    public MenuResponse getMenuById(String publicId) {
        Menu menu = menuRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu", "publicId", publicId));
        return menuMapper.toResponse(menu);
    }

    public Page<MenuResponse> getAllMenus(Pageable pageable) {
        Page<Menu> menus = menuRepository.findAllMenus(pageable);
        return menus.map(menuMapper::toResponse);
    }

    public Page<MenuResponse> getAllActiveMenus(Pageable pageable) {
        Page<Menu> menus = menuRepository.findAllActiveMenus(pageable);
        return menus.map(menuMapper::toResponse);
    }

    public Page<MenuResponse> getMenusByType(MenuType menuType, Pageable pageable) {
        Page<Menu> menus = menuRepository.findByMenuType(menuType, pageable);
        return menus.map(menuMapper::toResponse);
    }

    public List<MenuResponse> getActiveMenusByType(MenuType menuType) {
        List<Menu> menus = menuRepository.findActiveMenusByType(menuType);
        return menus.stream()
                .map(menuMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<MenuResponse> getCurrentActiveMenus() {
        List<Menu> menus = menuRepository.findCurrentActiveMenus();
        return menus.stream()
                .map(menuMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MenuResponse updateMenu(String publicId, MenuUpdateRequest request) {
        Menu menu = menuRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu", "publicId", publicId));

        if (request.getName() != null && !request.getName().equals(menu.getName())) {
            if (menuRepository.existsByNameAndDeletedFalse(request.getName())) {
                throw new ConflictException("name", request.getName(), "Menu already exists");
            }
        }

        // Handle image upload
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            // Delete old image if it exists
            if (menu.getImageUrl() != null) {
                try {
                    String oldFileName = menu.getImageUrl().substring(menu.getImageUrl().lastIndexOf('/') + 1);
                    fileService.deleteFile("/uploads/products/" + oldFileName);
                    log.info("Old menu image deleted: {}", oldFileName);
                } catch (Exception e) {
                    log.warn("Failed to delete old menu image: {}", e.getMessage());
                }
            }
            // Upload new image
            String newFileName = fileService.uploadProductImage(request.getImage());
            menu.setImageUrl("/api/menus/images/" + newFileName);
            log.info("New menu image uploaded: /api/menus/images/{}", newFileName);
        }

        menuMapper.updateEntityFromRequest(request, menu);
        Menu updated = menuRepository.save(menu);
        return menuMapper.toResponse(updated);
    }

    @Transactional
    public void deleteMenu(String publicId) {
        Menu menu = menuRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu", "publicId", publicId));
        menu.setDeleted(true);
        menu.setDeletedAt(java.time.LocalDateTime.now());
        menu.setDeletedBy(SecurityUtil.getCurrentUsername());
        menuRepository.save(menu);
    }

    @Transactional
    public void activateMenu(String publicId) {
        Menu menu = menuRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu", "publicId", publicId));
        menu.setActive(true);
        menuRepository.save(menu);
    }

    @Transactional
    public void deactivateMenu(String publicId) {
        Menu menu = menuRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu", "publicId", publicId));
        menu.setActive(false);
        menuRepository.save(menu);
    }
}
