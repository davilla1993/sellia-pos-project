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
            
            // Récupérer la table (non supprimée)
            RestaurantTable table = tableRepository.findByPublicIdNotDeleted(tablePublicId)
                    .orElseThrow(() -> {
                        log.error("Table not found or deleted: {}", tablePublicId);
                        return new ResourceNotFoundException("Table not found");
                    });

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
                    
                    List<PublicMenuResponse.MenuItemResponse> menuItemResponses = new ArrayList<>();
                    
                    for (MenuItem menuItem : menuItems) {
                        if (menuItem.getAvailable()) {
                            String categoryKey = menu.getName();
                            
                            categories.putIfAbsent(categoryKey, PublicMenuResponse.MenuCategoryResponse.builder()
                                    .publicId(menu.getPublicId())
                                    .name(menu.getName())
                                    .description(menu.getDescription())
                                    .itemCount(0)
                                    .items(new ArrayList<>())
                                    .build());

                            PublicMenuResponse.MenuCategoryResponse category = categories.get(categoryKey);
                            category.setItemCount(category.getItemCount() + 1);

                            // Ajouter au menu item response
                            PublicMenuResponse.MenuItemResponse itemResponse = mapMenuItemToResponse(menuItem);
                            menuItemResponses.add(itemResponse);
                            category.getItems().add(itemResponse);
                            
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
        List<Menu> menus = new ArrayList<>();
        
        if (Boolean.TRUE.equals(isVip)) {
            // Menus VIP et Menu du Jour
            List<Menu> vipMenus = menuRepository.findByMenuTypeAndActive(MenuType.VIP, true);
            log.debug("Found {} VIP menus", vipMenus.size());
            menus.addAll(vipMenus);
            
            List<Menu> dailyMenus = menuRepository.findByMenuTypeAndActive(MenuType.MENU_DU_JOUR, true);
            log.debug("Found {} MENU_DU_JOUR menus", dailyMenus.size());
            menus.addAll(dailyMenus);
        } else {
            // Menus standard et menu du jour (pas VIP)
            List<Menu> standardMenus = menuRepository.findByMenuTypeAndActive(MenuType.STANDARD, true);
            log.debug("Found {} STANDARD menus", standardMenus.size());
            menus.addAll(standardMenus);
            
            List<Menu> dailyMenus = menuRepository.findByMenuTypeAndActive(MenuType.MENU_DU_JOUR, true);
            log.debug("Found {} MENU_DU_JOUR menus", dailyMenus.size());
            menus.addAll(dailyMenus);
        }
        
        if (menus.isEmpty()) {
            log.warn("No applicable menus found for VIP={}", isVip);
        }
        
        return menus;
    }

    private PublicMenuResponse.MenuItemResponse mapMenuItemToResponse(MenuItem menuItem) {
        // Déterminer le prix
        long price = menuItem.getPriceOverride() != null 
                ? menuItem.getPriceOverride() 
                : (menuItem.getBundlePrice() != null ? menuItem.getBundlePrice() : 0L);

        // Récupérer le premier produit pour l'image et le nom
        String itemName = menuItem.getMenu().getName();
        String imageUrl = null;
        
        if (menuItem.getProducts() != null && !menuItem.getProducts().isEmpty()) {
            com.follysitou.sellia_backend.model.Product firstProduct = menuItem.getProducts().stream().findFirst().orElse(null);
            if (firstProduct != null) {
                itemName = firstProduct.getName();
                imageUrl = firstProduct.getImageUrl();
                // Si aucun prix override, utiliser le prix du produit
                if (menuItem.getPriceOverride() == null && menuItem.getBundlePrice() == null) {
                    price = firstProduct.getPrice();
                }
            }
        }

        return PublicMenuResponse.MenuItemResponse.builder()
                .publicId(menuItem.getPublicId())
                .menuName(menuItem.getMenu().getName())
                .itemName(itemName)
                .price(price)
                .description(menuItem.getMenu().getDescription())
                .imageUrl(imageUrl)
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
