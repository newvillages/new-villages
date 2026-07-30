package com.onevillage.backend.messaging.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record StartConversationRequest(
        @NotBlank String type, // LEADER | ORG | ADMIN | USER | MEMBER
        UUID communityId,
        UUID organizationId,
        UUID targetUserId,
        @NotBlank String initialMessage
) {
}
