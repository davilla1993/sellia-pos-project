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

@Service
@RequiredArgsConstructor
public class PublicMenuService {

    private final RestaurantTableRepository tableRepository;
    private final MenuRepository menuRepository;
    private final MenuItemRepository menuItemRepository;
    private final CustomerSessionRepository customerSessionRepository;

    @Transactional
    public PublicMenuResponse getPublicMenuByTable(String tablePublicId) {
        // Récupérer la table
        RestaurantTable table = tableRepository.findByPublicId(tablePublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        // Chercher ou créer une session active pour cette table
        CustomerSession customerSession = customerSessionRepository.findActiveByTable(tablePublicId)
                .orElseGet(() -> {
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

        // Grouper les items par catégorie
        Map<String, PublicMenuResponse.MenuCategoryResponse> categories = new HashMap<>();
        List<PublicMenuResponse.MenuItemResponse> popularItems = new ArrayList<>();

        for (Menu menu : applicableMenus) {
            List<MenuItem> menuItems = menu.getMenuItems();
            if (menuItems != null) {
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

        return PublicMenuResponse.builder()
                .tablePublicId(table.getPublicId())
                .tableNumber(table.getNumber())
                .isVip(table.getIsVip())
                .customerSessionToken(customerSession.getPublicId())
                .categories(new ArrayList<>(categories.values()))
                .popularItems(popularItems)
                .build();
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
