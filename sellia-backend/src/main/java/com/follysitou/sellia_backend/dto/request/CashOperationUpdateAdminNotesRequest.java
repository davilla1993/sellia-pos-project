package com.follysitou.sellia_backend.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CashOperationUpdateAdminNotesRequest {

    @Size(max = 5000, message = "Admin notes cannot exceed 5000 characters")
    private String adminNotes;
}
