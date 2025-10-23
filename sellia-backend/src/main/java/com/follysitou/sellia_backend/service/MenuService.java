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

    /**
     * Génère automatiquement des MenuItems individuels pour chaque Produit disponible.
     * Crée ou récupère un Menu "Produits Individuels" et y ajoute un MenuItem par produit.
     * 
     * @return nombre de MenuItems créés
     */
    @Transactional
    public int generateIndividualProductMenuItems() {
        // Créer ou récupérer le menu "Produits Individuels"
        Menu individualsMenu = menuRepository.findByNameAndDeletedFalse("Produits Individuels")
                .orElseGet(() -> {
                    Menu newMenu = Menu.builder()
                            .name("Produits Individuels")
                            .description("Produits disponibles à l'unité")
                            .menuType(MenuType.STANDARD)
                            .active(true)
                            .build();
                    Menu saved = menuRepository.save(newMenu);
                    log.info("Menu 'Produits Individuels' créé: {}", saved.getPublicId());
                    return saved;
                });

        // Récupérer tous les produits disponibles
        List<Product> availableProducts = productRepository.findAll().stream()
                .filter(p -> p.getAvailable() && !p.getDeleted())
                .collect(Collectors.toList());

        int createdCount = 0;

        // Pour chaque produit, créer un MenuItem s'il n'existe pas déjà
        for (Product product : availableProducts) {
            // Vérifier si un MenuItem existe déjà pour ce produit dans ce menu
            boolean menuItemExists = menuItemRepository.findAll().stream()
                    .anyMatch(mi -> mi.getMenu().getId().equals(individualsMenu.getId())
                            && mi.getProducts().stream().anyMatch(p -> p.getId().equals(product.getId()))
                            && !mi.getDeleted());

            if (!menuItemExists) {
                MenuItem menuItem = MenuItem.builder()
                        .menu(individualsMenu)
                        .products(new java.util.HashSet<>(java.util.List.of(product)))
                        .displayOrder(createdCount)
                        .available(true)
                        .build();
                menuItemRepository.save(menuItem);
                createdCount++;
                log.info("MenuItem créé pour produit: {} ({})", product.getName(), product.getPublicId());
            }
        }

        log.info("Génération des MenuItems individuels terminée: {} créés", createdCount);
        return createdCount;
    }
}
