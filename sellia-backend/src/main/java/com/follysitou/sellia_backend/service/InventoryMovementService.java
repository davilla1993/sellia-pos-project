package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.model.InventoryMovement;
import com.follysitou.sellia_backend.model.Stock;
import com.follysitou.sellia_backend.repository.InventoryMovementRepository;
import com.follysitou.sellia_backend.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InventoryMovementService {

    private final InventoryMovementRepository inventoryMovementRepository;
    private final StockRepository stockRepository;

    public void recordSale(Stock stock, Long quantity, String referenceOrderId) {
        Long previousQuantity = stock.getCurrentQuantity();
        Long newQuantity = previousQuantity - quantity;

        stock.setCurrentQuantity(newQuantity);
        stockRepository.save(stock);

        InventoryMovement movement = InventoryMovement.builder()
                .stock(stock)
                .movementType(InventoryMovement.MovementType.SALE)
                .quantity(quantity)
                .previousQuantity(previousQuantity)
                .newQuantity(newQuantity)
                .referenceOrderId(referenceOrderId)
                .reason("Sale from order: " + referenceOrderId)
                .performedBy(getCurrentUser())
                .build();

        inventoryMovementRepository.save(movement);
        log.info("Sale recorded for product {} - quantity: {}", stock.getProduct().getName(), quantity);
    }

    public void recordRestock(Stock stock, Long quantity, String supplierRef, Long costPerUnit) {
        Long previousQuantity = stock.getCurrentQuantity();
        Long newQuantity = previousQuantity + quantity;

        stock.setCurrentQuantity(newQuantity);
        stock.setLastRestocked(LocalDateTime.now());
        stockRepository.save(stock);

        InventoryMovement movement = InventoryMovement.builder()
                .stock(stock)
                .movementType(InventoryMovement.MovementType.RESTOCK)
                .quantity(quantity)
                .previousQuantity(previousQuantity)
                .newQuantity(newQuantity)
                .referencePurchaseId(supplierRef)
                .reason("Restock: " + supplierRef)
                .performedBy(getCurrentUser())
                .costPerUnit(costPerUnit)
                .totalCost(quantity * costPerUnit)
                .build();

        inventoryMovementRepository.save(movement);
        log.info("Restock recorded for product {} - quantity: {}", stock.getProduct().getName(), quantity);
    }

    public void recordAdjustment(Stock stock, Long quantityChange, Long previousQuantity, Long newQuantity, String reason) {
        InventoryMovement.MovementType movementType = quantityChange > 0
                ? InventoryMovement.MovementType.ADJUSTMENT_IN
                : InventoryMovement.MovementType.ADJUSTMENT_OUT;

        InventoryMovement movement = InventoryMovement.builder()
                .stock(stock)
                .movementType(movementType)
                .quantity(Math.abs(quantityChange))
                .previousQuantity(previousQuantity)
                .newQuantity(newQuantity)
                .reason(reason)
                .performedBy(getCurrentUser())
                .build();

        inventoryMovementRepository.save(movement);
        log.info("Adjustment recorded for product {} - change: {}", stock.getProduct().getName(), quantityChange);
    }

    public void recordWaste(Stock stock, Long quantity, String reason) {
        Long previousQuantity = stock.getCurrentQuantity();
        Long newQuantity = previousQuantity - quantity;

        stock.setCurrentQuantity(newQuantity);
        stockRepository.save(stock);

        InventoryMovement movement = InventoryMovement.builder()
                .stock(stock)
                .movementType(InventoryMovement.MovementType.WASTE)
                .quantity(quantity)
                .previousQuantity(previousQuantity)
                .newQuantity(newQuantity)
                .reason(reason)
                .performedBy(getCurrentUser())
                .build();

        inventoryMovementRepository.save(movement);
        log.info("Waste recorded for product {} - quantity: {}", stock.getProduct().getName(), quantity);
    }

    public void recordReturn(Stock stock, Long quantity, String reason) {
        Long previousQuantity = stock.getCurrentQuantity();
        Long newQuantity = previousQuantity + quantity;

        stock.setCurrentQuantity(newQuantity);
        stockRepository.save(stock);

        InventoryMovement movement = InventoryMovement.builder()
                .stock(stock)
                .movementType(InventoryMovement.MovementType.RETURN)
                .quantity(quantity)
                .previousQuantity(previousQuantity)
                .newQuantity(newQuantity)
                .reason(reason)
                .performedBy(getCurrentUser())
                .build();

        inventoryMovementRepository.save(movement);
        log.info("Return recorded for product {} - quantity: {}", stock.getProduct().getName(), quantity);
    }

    private String getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : "SYSTEM";
    }
}
