package com.follysitou.sellia_backend.service;

import com.follysitou.sellia_backend.dto.request.StockCreateRequest;
import com.follysitou.sellia_backend.dto.request.StockUpdateRequest;
import com.follysitou.sellia_backend.dto.response.PagedResponse;
import com.follysitou.sellia_backend.dto.response.StockResponse;
import com.follysitou.sellia_backend.exception.ResourceNotFoundException;
import com.follysitou.sellia_backend.mapper.StockMapper;
import com.follysitou.sellia_backend.model.Product;
import com.follysitou.sellia_backend.model.Stock;
import com.follysitou.sellia_backend.repository.ProductRepository;
import com.follysitou.sellia_backend.repository.StockRepository;
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
@Transactional
public class StockService {

    private final StockRepository stockRepository;
    private final ProductRepository productRepository;
    private final StockMapper stockMapper;
    private final InventoryMovementService inventoryMovementService;

    public StockResponse createStock(StockCreateRequest request) {
        Product product = productRepository.findByPublicId(request.getProductPublicId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Stock stock = stockMapper.toEntity(request);
        stock.setProduct(product);

        Stock saved = stockRepository.save(stock);
        log.info("Stock created for product: {}", product.getName());

        return stockMapper.toResponse(saved);
    }

    public StockResponse getStockById(String publicId) {
        Stock stock = stockRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found"));
        return stockMapper.toResponse(stock);
    }

    public PagedResponse<StockResponse> getAllStocks(Pageable pageable) {
        Page<Stock> stocks = stockRepository.findAllStocks(pageable);
        return PagedResponse.of(stocks.map(stockMapper::toResponse));
    }

    public PagedResponse<StockResponse> getAllActiveStocks(Pageable pageable) {
        Page<Stock> stocks = stockRepository.findAllActive(pageable);
        return PagedResponse.of(stocks.map(stockMapper::toResponse));
    }

    public List<StockResponse> getLowStockItems() {
        List<Stock> stocks = stockRepository.findLowStockItems();
        return stocks.stream()
                .map(stockMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<StockResponse> getBelowMinimumQuantity() {
        List<Stock> stocks = stockRepository.findBelowMinimumQuantity();
        return stocks.stream()
                .map(stockMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<StockResponse> getAboveMaximumQuantity() {
        List<Stock> stocks = stockRepository.findAboveMaximumQuantity();
        return stocks.stream()
                .map(stockMapper::toResponse)
                .collect(Collectors.toList());
    }

    public StockResponse updateStock(String publicId, StockUpdateRequest request) {
        Stock stock = stockRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found"));

        stockMapper.updateEntityFromRequest(request, stock);
        Stock updated = stockRepository.save(stock);

        log.info("Stock updated: {}", publicId);
        return stockMapper.toResponse(updated);
    }

    public void deleteStock(String publicId) {
        Stock stock = stockRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found"));

        stock.setDeleted(true);
        stock.setDeletedAt(java.time.LocalDateTime.now());
        stock.setDeletedBy(SecurityUtil.getCurrentUsername());
        stockRepository.save(stock);

        log.info("Stock soft deleted: {}", publicId);
    }

    public StockResponse adjustStock(String publicId, Long quantityChange, String reason) {
        Stock stock = stockRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found"));

        Long previousQuantity = stock.getCurrentQuantity();
        Long newQuantity = previousQuantity + quantityChange;

        if (newQuantity < 0) {
            throw new IllegalArgumentException("Adjustment would result in negative quantity");
        }

        stock.setCurrentQuantity(newQuantity);
        Stock updated = stockRepository.save(stock);

        inventoryMovementService.recordAdjustment(stock, quantityChange, previousQuantity, newQuantity, reason);

        log.info("Stock adjusted for product: {} by {}", stock.getProduct().getName(), quantityChange);
        return stockMapper.toResponse(updated);
    }
}
