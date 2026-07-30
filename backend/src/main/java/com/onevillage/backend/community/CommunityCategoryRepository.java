package com.onevillage.backend.community;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CommunityCategoryRepository extends JpaRepository<CommunityCategory, UUID> {
    List<CommunityCategory> findAllByOrderByNameAsc();
}
