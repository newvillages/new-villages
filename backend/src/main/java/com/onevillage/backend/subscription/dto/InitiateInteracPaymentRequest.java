package com.onevillage.backend.subscription.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record InitiateInteracPaymentRequest(
        @NotBlank String plan,
        @NotNull BigDecimal amount,
        UUID communityId,
        String communityName
) {
}
