package com.follysitou.sellia_backend.mapper;

import com.follysitou.sellia_backend.dto.request.StockCreateRequest;
import com.follysitou.sellia_backend.dto.request.StockUpdateRequest;
import com.follysitou.sellia_backend.dto.response.StockResponse;
import com.follysitou.sellia_backend.model.Stock;
import org.springframework.stereotype.Component;

@Component
public class StockMapper {

    public Stock toEntity(StockCreateRequest request) {
        return Stock.builder()
                .currentQuantity(request.getCurrentQuantity())
                .initialQuantity(request.getInitialQuantity())
                .unitOfMeasure(request.getUnitOfMeasure())
                .alertThreshold(request.getAlertThreshold())
                .minimumQuantity(request.getMinimumQuantity())
                .maximumQuantity(request.getMaximumQuantity())
                .active(request.getActive() != null ? request.getActive() : true)
                .supplierInfo(request.getSupplierInfo())
                .build();
    }

    public StockResponse toResponse(Stock stock) {
        StockResponse response = new StockResponse();
        response.setPublicId(stock.getPublicId());
        response.setProductPublicId(stock.getProduct() != null ? stock.getProduct().getPublicId() : null);
        response.setProductName(stock.getProduct() != null ? stock.getProduct().getName() : null);
        response.setCurrentQuantity(stock.getCurrentQuantity());
        response.setInitialQuantity(stock.getInitialQuantity());
        response.setUnitOfMeasure(stock.getUnitOfMeasure());
        response.setAlertThreshold(stock.getAlertThreshold());
        response.setMinimumQuantity(stock.getMinimumQuantity());
        response.setMaximumQuantity(stock.getMaximumQuantity());
        response.setActive(stock.getActive());
        response.setLastRestocked(stock.getLastRestocked());
        response.setSupplierInfo(stock.getSupplierInfo());
        
        // Calculate status flags
        if (stock.getAlertThreshold() != null) {
            response.setIsLowStock(stock.getCurrentQuantity() <= stock.getAlertThreshold());
        }
        if (stock.getMinimumQuantity() != null) {
            response.setIsBelowMinimum(stock.getCurrentQuantity() < stock.getMinimumQuantity());
        }
        if (stock.getMaximumQuantity() != null) {
            response.setIsAboveMaximum(stock.getCurrentQuantity() >= stock.getMaximumQuantity());
        }
        
        response.setCreatedAt(stock.getCreatedAt());
        response.setUpdatedAt(stock.getUpdatedAt());
        
        return response;
    }

    public void updateEntityFromRequest(StockUpdateRequest request, Stock stock) {
        if (request.getCurrentQuantity() != null) {
            stock.setCurrentQuantity(request.getCurrentQuantity());
        }
        if (request.getAlertThreshold() != null) {
            stock.setAlertThreshold(request.getAlertThreshold());
        }
        if (request.getMinimumQuantity() != null) {
            stock.setMinimumQuantity(request.getMinimumQuantity());
        }
        if (request.getMaximumQuantity() != null) {
            stock.setMaximumQuantity(request.getMaximumQuantity());
        }
        if (request.getActive() != null) {
            stock.setActive(request.getActive());
        }
        if (request.getSupplierInfo() != null) {
            stock.setSupplierInfo(request.getSupplierInfo());
        }
    }
}
