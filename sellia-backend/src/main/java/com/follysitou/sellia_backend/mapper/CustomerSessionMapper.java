package com.follysitou.sellia_backend.mapper;

import com.follysitou.sellia_backend.dto.response.CustomerSessionResponse;
import com.follysitou.sellia_backend.model.CustomerSession;
import org.springframework.stereotype.Component;

@Component
public class CustomerSessionMapper {

    public CustomerSessionResponse toResponse(CustomerSession session) {
        if (session == null) {
            return null;
        }

        CustomerSessionResponse response = new CustomerSessionResponse();
        response.setPublicId(session.getPublicId());
        response.setTablePublicId(session.getTable() != null ? session.getTable().getPublicId() : null);
        response.setTableNumber(session.getTable() != null ? session.getTable().getNumber() : null);
        response.setTableName(session.getTable() != null ? session.getTable().getName() : null);
        response.setCustomerName(session.getCustomerName());
        response.setCustomerPhone(session.getCustomerPhone());
        response.setActive(session.getActive());
        response.setSessionStart(session.getSessionStart());
        response.setSessionEnd(session.getSessionEnd());
        response.setIsPaid(session.getIsPaid());
        response.setTotalAmount(session.getTotalAmount());
        response.setFinalizedAt(session.getFinalizedAt());
        response.setNumberOfCustomers(session.getNumberOfCustomers());
        response.setNotes(session.getNotes());

        return response;
    }
}
