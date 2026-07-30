package com.onevillage.backend.community;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CommunityCategoryRepository categoryRepository;

    public CategoryController(CommunityCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public List<CommunityCategory> listAll() {
        return categoryRepository.findAllByOrderByNameAsc();
    }
}
