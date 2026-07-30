package com.onevillage.backend.subscription;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RefundRequestRepository extends JpaRepository<RefundRequest, UUID> {
    List<RefundRequest> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<RefundRequest> findAllByOrderByCreatedAtDesc();
}
