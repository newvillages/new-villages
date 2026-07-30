package com.onevillage.backend.subscription;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PricingPlanRepository extends JpaRepository<PricingPlan, UUID> {
    List<PricingPlan> findByActiveTrueOrderByPriceAsc();
    Optional<PricingPlan> findByCode(String code);
}
