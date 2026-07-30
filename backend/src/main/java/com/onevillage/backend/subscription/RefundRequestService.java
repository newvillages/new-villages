package com.onevillage.backend.subscription;

import com.onevillage.backend.common.ApiException;
import com.onevillage.backend.moderation.ActivityLogService;
import com.onevillage.backend.subscription.dto.RefundRequestResponse;
import com.onevillage.backend.subscription.dto.SubmitRefundRequest;
import com.onevillage.backend.user.User;
import com.onevillage.backend.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class RefundRequestService {

    private final RefundRequestRepository refundRequestRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    public RefundRequestService(RefundRequestRepository refundRequestRepository,
                                SubscriptionRepository subscriptionRepository,
                                UserRepository userRepository,
                                ActivityLogService activityLogService) {
        this.refundRequestRepository = refundRequestRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
        this.activityLogService = activityLogService;
    }

    @Transactional
    public RefundRequestResponse submit(UUID userId, SubmitRefundRequest request) {
        Subscription sub = subscriptionRepository.findByUserId(userId).orElse(null);

        RefundRequest rr = new RefundRequest();
        rr.setUserId(userId);
        if (sub != null) rr.setSubscriptionId(sub.getId());
        rr.setAmount(request.amount());
        rr.setReason(request.reason());
        rr.setDetails(request.details());
        rr.setStatus("PENDING");

        refundRequestRepository.saveAndFlush(rr);
        return toResponse(rr);
    }

    public List<RefundRequestResponse> getForUser(UUID userId) {
        return refundRequestRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<RefundRequestResponse> listAll() {
        return refundRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void review(UUID requestId, UUID adminId, boolean approve) {
        RefundRequest rr = refundRequestRepository.findById(requestId)
                .orElseThrow(() -> ApiException.notFound("Refund request not found"));
        if (!"PENDING".equalsIgnoreCase(rr.getStatus())) {
            throw ApiException.badRequest("Refund request has already been reviewed");
        }

        rr.setStatus(approve ? "APPROVED" : "REJECTED");
        rr.setReviewedBy(adminId);
        rr.setReviewedAt(Instant.now());
        refundRequestRepository.save(rr);

        activityLogService.log(adminId, "Refund Request " + (approve ? "Approved" : "Rejected"), "REFUND_REQUEST", rr.getId(),
                "Refund request #" + rr.getId() + " was " + (approve ? "approved" : "rejected"));
    }

    private RefundRequestResponse toResponse(RefundRequest rr) {
        User user = userRepository.findById(rr.getUserId()).orElse(null);
        return new RefundRequestResponse(
                rr.getId(),
                rr.getUserId(),
                user == null ? null : user.getFullName(),
                user == null ? null : user.getEmail(),
                rr.getAmount(),
                rr.getReason(),
                rr.getDetails(),
                rr.getStatus(),
                rr.getReviewedBy(),
                rr.getReviewedAt(),
                rr.getCreatedAt()
        );
    }
}
