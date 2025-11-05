package com.follysitou.sellia_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CashOperationTotalsResponse {

    private Long totalEntrees;      // Total cash in
    private Long totalSorties;      // Total cash out
    private Long netAmount;         // Net amount (entrees - sorties)
    private Integer entreesCount;   // Number of cash in operations
    private Integer sortiesCount;   // Number of cash out operations
}
