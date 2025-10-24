package com.follysitou.sellia_backend.controller;

import com.follysitou.sellia_backend.dto.request.PublicOrderRequest;
import com.follysitou.sellia_backend.dto.response.PublicMenuResponse;
import com.follysitou.sellia_backend.dto.response.PublicOrderResponse;
import com.follysitou.sellia_backend.service.PublicMenuService;
import com.follysitou.sellia_backend.service.PublicOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class PublicMenuController {

    private final PublicMenuService publicMenuService;
    private final PublicOrderService publicOrderService;

    /**
     * Récupérer le menu public pour une table via QR code
     * Accessible sans authentification
     * URL publique: /menu?table={tablePublicId}
     * Crée ou réutilise une session active pour la table
     */
    @GetMapping("/menu")
    public ResponseEntity<PublicMenuResponse> getPublicMenu(@RequestParam String table) {
        PublicMenuResponse menu = publicMenuService.getPublicMenuByTable(table);
        return ResponseEntity.ok(menu);
    }

    /**
     * Récupérer le menu public via QR code token
     * Accessible sans authentification
     * URL publique: /qr/{qrCodeToken}
     */
    @GetMapping("/menu/{qrCodeToken}")
    public ResponseEntity<PublicMenuResponse> getPublicMenuByQrToken(@PathVariable String qrCodeToken) {
        PublicMenuResponse menu = publicMenuService.getPublicMenuByQrToken(qrCodeToken);
        return ResponseEntity.ok(menu);
    }

    /**
     * Créer une commande via QR code (sans authentification)
     * Les items sont validés:
     * - MenuItem doit exister et être disponible
     * - Table VIP: accès aux menus VIP uniquement
     * - Table standard: menus standard et menu du jour
     */
    @PostMapping("/orders")
    public ResponseEntity<PublicOrderResponse> createPublicOrder(@Valid @RequestBody PublicOrderRequest request) {
        PublicOrderResponse response = publicOrderService.createOrderFromQrCode(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Endpoint santé pour vérifier que l'API publique fonctionne
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Public API is running");
    }
}
