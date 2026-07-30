package com.onevillage.backend.admin;

import com.onevillage.backend.community.Community;
import com.onevillage.backend.community.CommunityRepository;
import com.onevillage.backend.community.CommunityStatus;
import com.onevillage.backend.moderation.ActivityLogService;
import com.onevillage.backend.notification.NotificationDispatcher;
import com.onevillage.backend.notification.NotificationType;
import com.onevillage.backend.post.CommunityPost;
import com.onevillage.backend.post.CommunityPostRepository;
import com.onevillage.backend.security.SecurityUtils;
import com.onevillage.backend.user.User;
import com.onevillage.backend.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/broadcast")
public class AdminBroadcastController {

    private final CommunityRepository communityRepository;
    private final CommunityPostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationDispatcher notificationDispatcher;
    private final ActivityLogService activityLogService;

    public AdminBroadcastController(CommunityRepository communityRepository,
                                    CommunityPostRepository postRepository,
                                    UserRepository userRepository,
                                    NotificationDispatcher notificationDispatcher,
                                    ActivityLogService activityLogService) {
        this.communityRepository = communityRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.notificationDispatcher = notificationDispatcher;
        this.activityLogService = activityLogService;
    }

    public record BroadcastRequest(
            String title,
            @NotBlank String message,
            List<UUID> targetCommunityIds
    ) {}

    @PostMapping
    public ResponseEntity<Void> broadcast(@Valid @RequestBody BroadcastRequest request) {
        UUID adminId = SecurityUtils.currentUserId();
        String broadcastBody = (request.title() != null && !request.title().isBlank() ? "📢 " + request.title() + "\n\n" : "📢 ") + request.message();

        List<Community> activeCommunities = communityRepository.findAll().stream()
                .filter(c -> c.getStatus() == CommunityStatus.ACTIVE)
                .filter(c -> request.targetCommunityIds() == null || request.targetCommunityIds().isEmpty() || request.targetCommunityIds().contains(c.getId()))
                .toList();

        for (Community community : activeCommunities) {
            CommunityPost post = new CommunityPost();
            post.setCommunityId(community.getId());
            post.setAuthorId(adminId);
            post.setBody(broadcastBody);
            postRepository.save(post);
        }

        List<User> allUsers = userRepository.findAll();
        String notifTitle = request.title() != null && !request.title().isBlank() ? request.title() : "Platform Announcement";
        for (User user : allUsers) {
            if (!user.getId().equals(adminId)) {
                notificationDispatcher.dispatch(
                        user.getId(),
                        NotificationType.ANNOUNCEMENT,
                        notifTitle,
                        request.message(),
                        null
                );
            }
        }

        activityLogService.log(adminId, "Admin Broadcast Sent", "SYSTEM", null, "Broadcast message sent to " + activeCommunities.size() + " communities");

        return ResponseEntity.noContent().build();
    }
}
