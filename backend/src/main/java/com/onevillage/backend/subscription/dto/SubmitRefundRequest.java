package com.onevillage.backend.subscription.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record SubmitRefundRequest(
        BigDecimal amount,
        @NotBlank String reason,
        String details
) {
}
