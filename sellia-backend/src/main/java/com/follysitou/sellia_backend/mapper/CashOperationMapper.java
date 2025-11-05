package com.follysitou.sellia_backend.mapper;

import com.follysitou.sellia_backend.dto.response.CashOperationResponse;
import com.follysitou.sellia_backend.model.CashOperation;
import org.springframework.stereotype.Component;

@Component
public class CashOperationMapper {

    public CashOperationResponse toResponse(CashOperation cashOperation) {
        CashOperationResponse response = new CashOperationResponse();
        response.setPublicId(cashOperation.getPublicId());
        response.setCashierSessionPublicId(cashOperation.getCashierSession().getPublicId());
        response.setCashierName(cashOperation.getCashierSession().getCashier().getName());
        response.setUserName(cashOperation.getUser().getFirstName() + " " + cashOperation.getUser().getLastName());
        response.setType(cashOperation.getType());
        response.setAmount(cashOperation.getAmount());
        response.setDescription(cashOperation.getDescription());
        response.setReference(cashOperation.getReference());
        response.setAuthorizedBy(cashOperation.getAuthorizedBy());
        response.setOperationDate(cashOperation.getOperationDate());
        response.setAdminNotes(cashOperation.getAdminNotes());
        response.setCreatedAt(cashOperation.getCreatedAt());
        response.setUpdatedAt(cashOperation.getUpdatedAt());
        return response;
    }
}
