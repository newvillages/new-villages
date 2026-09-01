package com.onevillage.backend.subscription;

import com.onevillage.backend.common.BaseId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
public class Payment extends BaseId {

    @Column(name = "subscription_id")
    private UUID subscriptionId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "user_name")
    private String userName;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "community_name")
    private String communityName;

    @Column(name = "reference_number", unique = true)
    private String referenceNumber;

    @Column(name = "payment_method")
    private String paymentMethod = "INTERAC";

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency = "CAD";

    @Column(nullable = false)
    private String status; // PENDING | PAID | APPROVED | REJECTED

    @Column(name = "stripe_invoice_id")
    private String stripeInvoiceId;

    @Column(name = "paid_at")
    private Instant paidAt;

    @org.hibernate.annotations.CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
