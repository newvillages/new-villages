package com.onevillage.backend.subscription.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record InitiateInteracPaymentRequest(
        @NotBlank String plan,
        @NotNull BigDecimal amount,
        String communityName
) {
}
