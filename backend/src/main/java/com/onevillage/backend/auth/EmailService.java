package com.onevillage.backend.auth;

import com.onevillage.backend.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String frontendBaseUrl;
    private final String backendBaseUrl;

    public EmailService(JavaMailSender mailSender,
                         @Value("${app.mail.from}") String fromAddress,
                         @Value("${app.frontend.base-url}") String frontendBaseUrl,
                         @Value("${server.port}") String serverPort) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.frontendBaseUrl = frontendBaseUrl;
        this.backendBaseUrl = "http://localhost:" + serverPort;
    }

    public void sendVerificationEmail(User user, String token) {
        String link = frontendBaseUrl + "/verify-email?token=" + token;
        String directApiLink = backendBaseUrl + "/api/auth/verify-email?token=" + token;
        // Logged at INFO so you can verify accounts locally without a real mail server —
        // the direct API link can be opened in a browser or hit with curl/Postman.
        log.info("Verification email for {} — direct API link: {}", user.getEmail(), directApiLink);
        send(user.getEmail(), "Verify your New Villages email",
                "Hi " + user.getFullName() + ",\n\n"
                        + "Welcome to New Villages! Please verify your email address by opening this link:\n"
                        + link + "\n\n"
                        + "This link expires in 24 hours.");
    }

    public void sendPasswordResetEmail(User user, String token) {
        String link = frontendBaseUrl + "/reset-password?token=" + token;
        log.info("Password reset requested for {} — token: {}", user.getEmail(), token);
        send(user.getEmail(), "Reset your New Villages password",
                "Hi " + user.getFullName() + ",\n\n"
                        + "We received a request to reset your password. Open this link to choose a new one:\n"
                        + link + "\n\n"
                        + "If you didn't request this, you can safely ignore this email. This link expires in 1 hour.");
    }

    public void sendPaymentReceiptEmail(String toEmail, String name, String planLabel, String amount, String memoCode) {
        String loginLink = frontendBaseUrl + "/login";
        String dashboardLink = frontendBaseUrl + "/dashboard";

        log.info("Sending payment receipt email to {} for plan {} ({})", toEmail, planLabel, amount);
        send(toEmail, "NewVillages Payment Confirmation - " + planLabel + " Plan",
                "Hi " + (name != null && !name.isBlank() ? name : "Leader") + ",\n\n"
                        + "Thank you for subscribing to the NewVillages " + planLabel + " plan (" + amount + ")!\n\n"
                        + "We have received your payment details (Reference Code: " + memoCode + ").\n"
                        + "Our admin team is reviewing your payment and will enable your full leader/org account features shortly.\n\n"
                        + "🔑 Log back into your account anytime to enjoy your dashboard and features:\n"
                        + loginLink + "\n\n"
                        + "🚀 Access your dashboard directly:\n"
                        + dashboardLink + "\n\n"
                        + "If you have any questions, reply directly to this email or contact support@newvillages.ca.\n\n"
                        + "Warm regards,\n"
                        + "The NewVillages Canada Team\n"
                        + "https://www.luminex.rw");
    }

    public void sendCommunityInvitationEmail(String toEmail, String inviterName, String communityName, String communityId) {
        String cleanEmail = toEmail != null ? toEmail.trim().toLowerCase() : "";
        String inviteLink = frontendBaseUrl + "/communities/" + communityId;
        log.info("Sending community invitation email to {} from {} for community {} — link: {}", cleanEmail, inviterName, communityName, inviteLink);
        String senderLabel = (inviterName != null && !inviterName.isBlank()) ? inviterName : "A Community Leader";
        send(cleanEmail, "Invitation to join " + communityName + " on New Villages",
                "Hi,\n\n"
                        + senderLabel
                        + " has invited you to join the community circle \"" + communityName + "\" on New Villages!\n\n"
                        + "Please open this link to view the community and accept the invitation:\n"
                        + inviteLink + "\n\n"
                        + "Welcome to New Villages!\n"
                        + "The New Villages Team");
    }

    private void send(String to, String subject, String text) {
        if (to == null || to.isBlank()) {
            log.warn("Email dispatch skipped: recipient email address is blank.");
            return;
        }
        String cleanTo = to.trim().toLowerCase();
        log.info("Sending email to [{}] | Subject: '{}'", cleanTo, subject);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(cleanTo);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("Email successfully sent to [{}]", cleanTo);
        } catch (Exception e) {
            // Log error with cause details without throwing to avoid breaking workflow
            log.error("Failed to send email to [{}]: {} (Cause: {})", cleanTo, e.getMessage(), e.getCause() != null ? e.getCause().getMessage() : "none", e);
        }
    }
}

