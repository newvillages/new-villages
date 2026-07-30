package com.onevillage.backend.subscription;

import com.onevillage.backend.security.SecurityUtils;
import com.onevillage.backend.subscription.dto.RefundRequestResponse;
import com.onevillage.backend.subscription.dto.SubmitRefundRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leader/refund-requests")
public class LeaderRefundController {

    private final RefundRequestService refundRequestService;

    public LeaderRefundController(RefundRequestService refundRequestService) {
        this.refundRequestService = refundRequestService;
    }

    @GetMapping
    public List<RefundRequestResponse> getMyRefundRequests() {
        return refundRequestService.getForUser(SecurityUtils.currentUserId());
    }

    @PostMapping
    public ResponseEntity<RefundRequestResponse> submitRefundRequest(@Valid @RequestBody SubmitRefundRequest request) {
        RefundRequestResponse response = refundRequestService.submit(SecurityUtils.currentUserId(), request);
        return ResponseEntity.status(201).body(response);
    }
}
