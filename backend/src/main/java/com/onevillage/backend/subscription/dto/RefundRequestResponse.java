package com.onevillage.backend.subscription.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record RefundRequestResponse(
        UUID id,
        UUID userId,
        String userName,
        String userEmail,
        BigDecimal amount,
        String reason,
        String details,
        String status,
        UUID reviewedBy,
        Instant reviewedAt,
        Instant createdAt
) {
}
