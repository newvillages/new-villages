package com.onevillage.backend.admin;

import com.onevillage.backend.common.ApiException;
import com.onevillage.backend.moderation.ActivityLogService;
import com.onevillage.backend.security.SecurityUtils;
import com.onevillage.backend.subscription.PricingPlan;
import com.onevillage.backend.subscription.PricingPlanRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/pricing-plans")
public class AdminPricingPlanController {

    private final PricingPlanRepository pricingPlanRepository;
    private final ActivityLogService activityLogService;

    public AdminPricingPlanController(PricingPlanRepository pricingPlanRepository, ActivityLogService activityLogService) {
        this.pricingPlanRepository = pricingPlanRepository;
        this.activityLogService = activityLogService;
    }

    public record SavePricingPlanRequest(
            @NotBlank String code,
            @NotBlank String name,
            @NotNull BigDecimal price,
            String currency,
            String billingPeriod,
            String tag,
            String description,
            String features,
            Boolean active
    ) {}

    @GetMapping
    public List<PricingPlan> listAll() {
        return pricingPlanRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<PricingPlan> create(@Valid @RequestBody SavePricingPlanRequest request) {
        if (pricingPlanRepository.findByCode(request.code()).isPresent()) {
            throw ApiException.conflict(com.onevillage.backend.common.ErrorCode.CONFLICT, "Plan code already exists");
        }
        PricingPlan plan = new PricingPlan();
        plan.setCode(request.code());
        plan.setName(request.name());
        plan.setPrice(request.price());
        if (request.currency() != null) plan.setCurrency(request.currency());
        if (request.billingPeriod() != null) plan.setBillingPeriod(request.billingPeriod());
        plan.setTag(request.tag());
        plan.setDescription(request.description());
        plan.setFeatures(request.features());
        if (request.active() != null) plan.setActive(request.active());

        plan = pricingPlanRepository.save(plan);
        activityLogService.log(SecurityUtils.currentUserId(), "Pricing Plan Created", "PRICING_PLAN", plan.getId(), "Created plan " + plan.getName());
        return ResponseEntity.status(201).body(plan);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PricingPlan> update(@PathVariable UUID id, @Valid @RequestBody SavePricingPlanRequest request) {
        PricingPlan plan = pricingPlanRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Pricing plan not found"));
        plan.setCode(request.code());
        plan.setName(request.name());
        plan.setPrice(request.price());
        if (request.currency() != null) plan.setCurrency(request.currency());
        if (request.billingPeriod() != null) plan.setBillingPeriod(request.billingPeriod());
        plan.setTag(request.tag());
        plan.setDescription(request.description());
        plan.setFeatures(request.features());
        if (request.active() != null) plan.setActive(request.active());

        plan = pricingPlanRepository.save(plan);
        activityLogService.log(SecurityUtils.currentUserId(), "Pricing Plan Updated", "PRICING_PLAN", plan.getId(), "Updated plan " + plan.getName() + " to $" + plan.getPrice());
        return ResponseEntity.ok(plan);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        PricingPlan plan = pricingPlanRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Pricing plan not found"));
        pricingPlanRepository.delete(plan);
        activityLogService.log(SecurityUtils.currentUserId(), "Pricing Plan Deleted", "PRICING_PLAN", id, "Deleted plan " + plan.getName());
        return ResponseEntity.noContent().build();
    }
}
