package com.onevillage.backend.subscription;

import com.onevillage.backend.security.SecurityUtils;
import com.onevillage.backend.subscription.dto.InitiateInteracPaymentRequest;
import com.onevillage.backend.subscription.dto.InteracPaymentResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class InteracPaymentController {

    private final SubscriptionService subscriptionService;

    public InteracPaymentController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping("/api/subscriptions/interac/initiate")
    public ResponseEntity<InteracPaymentResponse> initiate(@Valid @RequestBody InitiateInteracPaymentRequest request) {
        UUID userId = SecurityUtils.currentUserId();
        InteracPaymentResponse response = subscriptionService.initiateInteracPayment(
                userId, request.plan(), request.amount(), request.communityName());
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/api/admin/payments/interac")
    @PreAuthorize("hasRole('ADMIN')")
    public List<InteracPaymentResponse> adminListPayments() {
        return subscriptionService.adminListInteracPayments();
    }

    @PostMapping("/api/admin/payments/interac/{id}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InteracPaymentResponse> adminConfirmPayment(@PathVariable UUID id) {
        UUID adminId = SecurityUtils.currentUserId();
        InteracPaymentResponse response = subscriptionService.adminConfirmInteracPayment(id, adminId);
        return ResponseEntity.ok(response);
    }
}
