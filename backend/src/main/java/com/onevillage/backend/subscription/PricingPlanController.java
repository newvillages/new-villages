package com.onevillage.backend.subscription;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/pricing-plans")
public class PricingPlanController {

    private final PricingPlanRepository pricingPlanRepository;

    public PricingPlanController(PricingPlanRepository pricingPlanRepository) {
        this.pricingPlanRepository = pricingPlanRepository;
    }

    @GetMapping
    public List<PricingPlan> getActivePlans() {
        return pricingPlanRepository.findByActiveTrueOrderByPriceAsc();
    }
}
