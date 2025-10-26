package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.response.PublicMenuResponse;
import com.follysitou.sellia_backend.enums.MenuType;
import com.follysitou.sellia_backend.exception.ResourceNotFoundException;
import com.follysitou.sellia_backend.model.CustomerSession;
import com.follysitou.sellia_backend.model.Menu;
import com.follysitou.sellia_backend.model.MenuItem;
import com.follysitou.sellia_backend.model.RestaurantTable;
import com.follysitou.sellia_backend.repository.CustomerSessionRepository;
import com.follysitou.sellia_backend.repository.MenuItemRepository;
import com.follysitou.sellia_backend.repository.MenuRepository;
import com.follysitou.sellia_backend.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PublicMenuService {

    private final RestaurantTableRepository tableRepository;
    private final MenuRepository menuRepository;
    private final MenuItemRepository menuItemRepository;
    private final CustomerSessionRepository customerSessionRepository;

    @Transactional
    public PublicMenuResponse getPublicMenuByTable(String tablePublicId) {
        try {
            log.info("Loading public menu for table: {}", tablePublicId);
            
            // Récupérer la table
            RestaurantTable table = tableRepository.findByPublicId(tablePublicId)
                    .orElseThrow(() -> {
                        log.error("Table not found: {}", tablePublicId);
                        return new ResourceNotFoundException("Table not found");
                    });

            if (table.getDeleted() != null && table.getDeleted()) {
                log.error("Table is deleted: {}", tablePublicId);
                throw new ResourceNotFoundException("Table has been deleted");
            }

            log.info("Table found: {} ({}), VIP: {}", table.getNumber(), table.getName(), table.getIsVip());

            // Chercher ou créer une session active pour cette table
            CustomerSession customerSession = customerSessionRepository.findActiveByTable(tablePublicId)
                    .orElseGet(() -> {
                        log.info("Creating new customer session for table: {}", tablePublicId);
                        // Créer une nouvelle session si aucune session active
                        CustomerSession newSession = CustomerSession.builder()
                                .table(table)
                                .active(true)
                                .sessionStart(java.time.LocalDateTime.now())
                                .numberOfCustomers(1)
                                .isPaid(false)
                                .build();
                        return customerSessionRepository.save(newSession);
                    });

            // Récupérer les menus selon VIP ou standard
            List<Menu> applicableMenus = getApplicableMenus(table.getIsVip());
            log.info("Found {} applicable menus for table: {}", applicableMenus.size(), tablePublicId);

            // Grouper les items par catégorie
            Map<String, PublicMenuResponse.MenuCategoryResponse> categories = new HashMap<>();
            List<PublicMenuResponse.MenuItemResponse> popularItems = new ArrayList<>();

            for (Menu menu : applicableMenus) {
                List<MenuItem> menuItems = menu.getMenuItems();
                if (menuItems != null) {
                    log.debug("Menu: {} has {} items", menu.getName(), menuItems.size());
                    for (MenuItem menuItem : menuItems) {
                        if (menuItem.getAvailable()) {
                            String categoryKey = menu.getName();
                            
                            categories.putIfAbsent(categoryKey, PublicMenuResponse.MenuCategoryResponse.builder()
                                    .publicId(menu.getPublicId())
                                    .name(menu.getName())
                                    .description(menu.getDescription())
                                    .itemCount(0)
                                    .build());

                            PublicMenuResponse.MenuCategoryResponse category = categories.get(categoryKey);
                            category.setItemCount(category.getItemCount() + 1);

                            // Ajouter au menu item response
                            PublicMenuResponse.MenuItemResponse itemResponse = mapMenuItemToResponse(menuItem);
                            if (Boolean.TRUE.equals(menuItem.getIsSpecial())) {
                                popularItems.add(itemResponse);
                            }
                        }
                    }
                }
            }

            log.info("Menu loaded successfully for table: {} - Categories: {}, Items: {}", 
                    tablePublicId, categories.size(), 
                    categories.values().stream().mapToInt(PublicMenuResponse.MenuCategoryResponse::getItemCount).sum());

            return PublicMenuResponse.builder()
                    .tablePublicId(table.getPublicId())
                    .tableNumber(table.getNumber())
                    .isVip(table.getIsVip())
                    .customerSessionToken(customerSession.getPublicId())
                    .categories(new ArrayList<>(categories.values()))
                    .popularItems(popularItems)
                    .build();
        } catch (ResourceNotFoundException e) {
            log.error("Resource not found for table {}: {}", tablePublicId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error loading menu for table {}: {}", tablePublicId, e.getMessage(), e);
            throw new ResourceNotFoundException("Failed to load menu: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    @Deprecated
    public PublicMenuResponse getPublicMenu(String qrCodeToken) {
        // Ancienne méthode gardée pour compatibilité
        CustomerSession customerSession = customerSessionRepository.findByQrCodeToken(qrCodeToken)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid QR code token"));

        RestaurantTable table = customerSession.getTable();
        if (table == null) {
            throw new ResourceNotFoundException("Table not found");
        }

        return getPublicMenuByTable(table.getPublicId());
    }

    private List<Menu> getApplicableMenus(Boolean isVip) {
        if (Boolean.TRUE.equals(isVip)) {
            // Menus VIP et Menu du Jour
            List<Menu> vipMenus = menuRepository.findByMenuTypeAndActive(MenuType.VIP, true);
            List<Menu> dailyMenus = menuRepository.findByMenuTypeAndActive(MenuType.MENU_DU_JOUR, true);
            vipMenus.addAll(dailyMenus);
            return vipMenus;
        } else {
            // Menus standard et menu du jour (pas VIP)
            List<Menu> standardMenus = menuRepository.findByMenuTypeAndActive(MenuType.STANDARD, true);
            List<Menu> dailyMenus = menuRepository.findByMenuTypeAndActive(MenuType.MENU_DU_JOUR, true);
            standardMenus.addAll(dailyMenus);
            return standardMenus;
        }
    }

    private PublicMenuResponse.MenuItemResponse mapMenuItemToResponse(MenuItem menuItem) {
        long price = menuItem.getPriceOverride() != null 
                ? menuItem.getPriceOverride() 
                : (menuItem.getBundlePrice() != null ? menuItem.getBundlePrice() : 0L);

        return PublicMenuResponse.MenuItemResponse.builder()
                .publicId(menuItem.getPublicId())
                .menuName(menuItem.getMenu().getName())
                .itemName(menuItem.getPublicId()) // Ou un champ dedicated si applicable
                .price(price)
                .description(menuItem.getMenu().getDescription())
                .preparationTime(15) // Valeur par défaut
                .isSpecial(menuItem.getIsSpecial())
                .specialDescription(menuItem.getSpecialDescription())
                .build();
    }

    @Transactional
    public PublicMenuResponse getPublicMenuByQrToken(String qrCodeToken) {
        // Récupérer la table par QR code token
        RestaurantTable table = tableRepository.findByQrCodeToken(qrCodeToken)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid QR code token"));

        // Récupérer le menu par table public ID
        return getPublicMenuByTable(table.getPublicId());
    }

    @Transactional
    @Deprecated
    public CustomerSession createSessionFromQrCode(String qrCodeToken) {
        // Cette méthode est deprecated, utiliser getPublicMenuByTable() à la place
        // qui crée automatiquement la session
        RestaurantTable table = tableRepository.findByQrCodeToken(qrCodeToken)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid QR code"));

        // Vérifier s'il y a déjà une session active pour cette table
        var existingSession = customerSessionRepository.findActiveByTable(table.getPublicId());
        if (existingSession.isPresent()) {
            return existingSession.get();
        }

        CustomerSession session = CustomerSession.builder()
                .table(table)
                .qrCodeToken(qrCodeToken)
                .active(true)
                .sessionStart(java.time.LocalDateTime.now())
                .numberOfCustomers(1)
                .build();

        return customerSessionRepository.save(session);
    }
}
