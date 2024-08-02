package com.library.DTO;

import lombok.Data;

@Data
public class FineRecordGroup {
    private String fineReasonDisplayName;
    private double fineAmount;
    private Long count;

    public FineRecordGroup(String fineReasonDisplayName, double fineAmount, Long count) {
        this.fineReasonDisplayName = fineReasonDisplayName;
        this.fineAmount = fineAmount;
        this.count = count;
    }


}