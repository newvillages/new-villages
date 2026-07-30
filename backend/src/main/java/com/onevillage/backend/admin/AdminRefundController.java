package com.onevillage.backend.admin;

import com.onevillage.backend.security.SecurityUtils;
import com.onevillage.backend.subscription.RefundRequestService;
import com.onevillage.backend.subscription.dto.RefundRequestResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/refund-requests")
public class AdminRefundController {

    private final RefundRequestService refundRequestService;

    public AdminRefundController(RefundRequestService refundRequestService) {
        this.refundRequestService = refundRequestService;
    }

    @GetMapping
    public List<RefundRequestResponse> listAll() {
        return refundRequestService.listAll();
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Void> approve(@PathVariable UUID id) {
        refundRequestService.review(id, SecurityUtils.currentUserId(), true);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Void> reject(@PathVariable UUID id) {
        refundRequestService.review(id, SecurityUtils.currentUserId(), false);
        return ResponseEntity.noContent().build();
    }
}
