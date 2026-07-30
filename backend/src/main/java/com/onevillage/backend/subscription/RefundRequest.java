package com.onevillage.backend.subscription;

import com.onevillage.backend.common.BaseId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "refund_requests")
@Getter
@Setter
@NoArgsConstructor
public class RefundRequest extends BaseId {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "subscription_id")
    private UUID subscriptionId;

    private BigDecimal amount;

    @Column(nullable = false)
    private String reason;

    @Column(columnDefinition = "text")
    private String details;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
