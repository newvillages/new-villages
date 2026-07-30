package com.onevillage.backend.subscription;

import com.onevillage.backend.common.BaseId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "pricing_plans")
@Getter
@Setter
@NoArgsConstructor
public class PricingPlan extends BaseId {

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private String currency = "CAD";

    @Column(name = "billing_period", nullable = false)
    private String billingPeriod = "monthly";

    private String tag;

    @Column(columnDefinition = "text")
    private String description;

    @Column(columnDefinition = "text")
    private String features; // pipe-separated list e.g. "Feature A|Feature B"

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
