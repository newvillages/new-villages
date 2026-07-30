package com.onevillage.backend.admin;

import com.onevillage.backend.common.ApiException;
import com.onevillage.backend.community.CommunityCategory;
import com.onevillage.backend.community.CommunityCategoryRepository;
import com.onevillage.backend.moderation.ActivityLogService;
import com.onevillage.backend.security.SecurityUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {

    private final CommunityCategoryRepository categoryRepository;
    private final ActivityLogService activityLogService;

    public AdminCategoryController(CommunityCategoryRepository categoryRepository, ActivityLogService activityLogService) {
        this.categoryRepository = categoryRepository;
        this.activityLogService = activityLogService;
    }

    public record CategoryRequest(
            @NotBlank String name,
            String description,
            String iconName
    ) {}

    @GetMapping
    public List<CommunityCategory> list() {
        return categoryRepository.findAllByOrderByNameAsc();
    }

    @PostMapping
    public ResponseEntity<CommunityCategory> create(@Valid @RequestBody CategoryRequest request) {
        CommunityCategory cat = new CommunityCategory();
        cat.setName(request.name());
        cat.setDescription(request.description());
        cat.setIconName(request.iconName() != null ? request.iconName() : "Users");
        cat = categoryRepository.save(cat);

        activityLogService.log(SecurityUtils.currentUserId(), "Category created", "CATEGORY", cat.getId(), "Created category " + cat.getName());
        return ResponseEntity.status(201).body(cat);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommunityCategory> update(@PathVariable UUID id, @Valid @RequestBody CategoryRequest request) {
        CommunityCategory cat = categoryRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Category not found"));
        cat.setName(request.name());
        cat.setDescription(request.description());
        if (request.iconName() != null) cat.setIconName(request.iconName());
        cat = categoryRepository.save(cat);

        activityLogService.log(SecurityUtils.currentUserId(), "Category updated", "CATEGORY", cat.getId(), "Updated category " + cat.getName());
        return ResponseEntity.ok(cat);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        CommunityCategory cat = categoryRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Category not found"));
        categoryRepository.delete(cat);

        activityLogService.log(SecurityUtils.currentUserId(), "Category deleted", "CATEGORY", id, "Deleted category " + cat.getName());
        return ResponseEntity.noContent().build();
    }
}
