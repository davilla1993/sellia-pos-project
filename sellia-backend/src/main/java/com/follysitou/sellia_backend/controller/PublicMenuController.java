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
     * URL publique: /qr/{qrToken} pour angular
     */
    @GetMapping("/menu/{qrToken}")
    public ResponseEntity<PublicMenuResponse> getPublicMenu(@PathVariable String qrToken) {
        PublicMenuResponse menu = publicMenuService.getPublicMenu(qrToken);
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
