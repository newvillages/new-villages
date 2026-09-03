package com.onevillage.backend.subscription.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record InteracPaymentResponse(
        UUID id,
        UUID userId,
        String userName,
        String userEmail,
        UUID communityId,
        String communityName,
        String referenceNumber,
        BigDecimal amount,
        String currency,
        String paymentMethod,
        String status, // PENDING | APPROVED | REJECTED
        Instant paidAt,
        Instant createdAt
) {
}
