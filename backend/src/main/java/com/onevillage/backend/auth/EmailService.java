package com.onevillage.backend.auth;

import com.onevillage.backend.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;

import org.springframework.scheduling.annotation.Async;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String frontendBaseUrl;
    private final String backendBaseUrl;

    public EmailService(JavaMailSender mailSender,
                         @Value("${app.mail.from:}") String fromAddress,
                         @Value("${spring.mail.username:}") String mailUsername,
                         @Value("${app.frontend.base-url}") String frontendBaseUrl,
                         @Value("${server.port}") String serverPort) {
        this.mailSender = mailSender;
        this.frontendBaseUrl = frontendBaseUrl;
        this.backendBaseUrl = "http://localhost:" + serverPort;

        // Ensure fromAddress matches authenticated mail username when sending via Gmail/SMTP to prevent DMARC / GoDaddy domain rejection
        if (fromAddress != null && !fromAddress.isBlank() && !fromAddress.contains("carmani")) {
            this.fromAddress = fromAddress.trim();
        } else if (mailUsername != null && !mailUsername.isBlank()) {
            this.fromAddress = mailUsername.trim();
        } else {
            this.fromAddress = "newvillagesca@gmail.com";
        }

        log.info("[EMAIL SERVICE INIT] Configured From Address: {} | Auth Username: {}", this.fromAddress, mailUsername);

        if (mailUsername == null || mailUsername.isBlank() || mailUsername.contains("carmani")) {
            log.warn("=================================================================================");
            log.warn("[SMTP CONFIG ALERT] Production SMTP credentials are missing in Environment Variables!");
            log.warn("To send real emails on Render, set these Environment Variables in Render Dashboard -> Environment:");
            log.warn("  MAIL_HOST     = smtp.gmail.com (or smtp-relay.brevo.com)");
            log.warn("  MAIL_PORT     = 587");
            log.warn("  MAIL_USERNAME = your-email@gmail.com");
            log.warn("  MAIL_PASSWORD = your-16-char-app-password");
            log.warn("  MAIL_FROM     = your-email@gmail.com");
            log.warn("=================================================================================");
        }
    }

    @Async
    public void sendVerificationEmail(User user, String token) {
        String link = frontendBaseUrl + "/verify-email?token=" + token;
        String directApiLink = backendBaseUrl + "/api/auth/verify-email?token=" + token;
        log.info("Verification email for {} — direct API link: {}", user.getEmail(), directApiLink);
        sendHtml(user.getEmail(), "Verify your New Villages email",
                "Hi " + user.getFullName() + ",\n\n"
                        + "Welcome to New Villages! Please verify your email address by opening this link:\n"
                        + link + "\n\n"
                        + "This link expires in 24 hours.",
                "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;\">"
                        + "<h2 style=\"color: #0F172A;\">Welcome to New Villages!</h2>"
                        + "<p style=\"color: #475569;\">Hi <strong>" + user.getFullName() + "</strong>,</p>"
                        + "<p style=\"color: #475569;\">Please verify your email address by clicking the button below:</p>"
                        + "<p style=\"text-align: center; margin: 24px 0;\"><a href=\"" + link + "\" style=\"background-color: #2563EB; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;\">Verify Email Address</a></p>"
                        + "<p style=\"font-size: 12px; color: #94A3B8;\">Or copy and paste this link in your browser: <br><a href=\"" + link + "\">" + link + "</a></p>"
                        + "</div>"
        );
    }

    @Async
    public void sendPasswordResetEmail(User user, String token) {
        String link = frontendBaseUrl + "/reset-password?token=" + token;
        log.info("Password reset requested for {} — token: {}", user.getEmail(), token);
        sendHtml(user.getEmail(), "Reset your New Villages password",
                "Hi " + user.getFullName() + ",\n\n"
                        + "We received a request to reset your password. Open this link to choose a new one:\n"
                        + link + "\n\n"
                        + "If you didn't request this, you can safely ignore this email. This link expires in 1 hour.",
                "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;\">"
                        + "<h2 style=\"color: #0F172A;\">Password Reset Request</h2>"
                        + "<p style=\"color: #475569;\">Hi <strong>" + user.getFullName() + "</strong>,</p>"
                        + "<p style=\"color: #475569;\">We received a request to reset your password. Click below to set a new password:</p>"
                        + "<p style=\"text-align: center; margin: 24px 0;\"><a href=\"" + link + "\" style=\"background-color: #2563EB; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;\">Reset Password</a></p>"
                        + "</div>"
        );
    }

    @Async
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

    @Async
    public void sendCommunityInvitationEmail(String toEmail, String inviterName, String communityName, String communityId) {
        String cleanEmail = toEmail != null ? toEmail.trim().toLowerCase() : "";
        String inviteLink = frontendBaseUrl + "/communities/" + communityId;
        String senderLabel = (inviterName != null && !inviterName.isBlank()) ? inviterName : "A Community Leader";
        
        log.info("[INVITATION DISPATCH] Email: {} | Inviter: {} | Community: {} | Link: {}", cleanEmail, senderLabel, communityName, inviteLink);
        
        String subject = "Invitation to join " + communityName + " on New Villages";
        String plainText = "Hi,\n\n"
                + senderLabel + " has invited you to join the community circle \"" + communityName + "\" on New Villages!\n\n"
                + "Please open this link to view the community and accept the invitation:\n"
                + inviteLink + "\n\n"
                + "Welcome to New Villages!\n"
                + "The New Villages Team";

        String htmlContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;\">"
                + "<div style=\"text-align: center; margin-bottom: 24px;\">"
                + "<h2 style=\"color: #0F172A; margin: 0 0 4px 0;\">You're Invited!</h2>"
                + "<p style=\"color: #64748B; font-size: 14px; margin: 0;\">New Villages Community Circle</p>"
                + "</div>"
                + "<div style=\"background-color: #F8FAFC; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #F1F5F9;\">"
                + "<p style=\"font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 12px 0;\">Hi,</p>"
                + "<p style=\"font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;\"><strong>" + senderLabel + "</strong> has invited you to join the community circle <strong>\"" + communityName + "\"</strong> on New Villages!</p>"
                + "<div style=\"text-align: center; margin: 24px 0;\">"
                + "<a href=\"" + inviteLink + "\" style=\"background-color: #2563EB; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;\">View Community & Join Circle</a>"
                + "</div>"
                + "<p style=\"font-size: 12px; color: #64748B; text-align: center; margin: 0;\">Or copy and paste this link into your browser:<br><a href=\"" + inviteLink + "\" style=\"color: #2563EB;\">" + inviteLink + "</a></p>"
                + "</div>"
                + "<p style=\"font-size: 12px; color: #94A3B8; text-align: center; margin: 0;\">The New Villages Team &bull; Connecting Communities</p>"
                + "</div>";

        sendHtml(cleanEmail, subject, plainText, htmlContent);
    }

    private void send(String to, String subject, String text) {
        sendHtml(to, subject, text, null);
    }

    private void sendHtml(String to, String subject, String plainText, String htmlText) {
        if (to == null || to.isBlank()) {
            log.warn("Email dispatch skipped: recipient email address is blank.");
            return;
        }
        String cleanTo = to.trim().toLowerCase();
        log.info("Sending email to [{}] | Subject: '{}'", cleanTo, subject);
        try {
            jakarta.mail.internet.InternetAddress from = new jakarta.mail.internet.InternetAddress(fromAddress, "New Villages");
            if (htmlText != null && !htmlText.isBlank()) {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                helper.setFrom(from);
                helper.setReplyTo(from);
                helper.setTo(cleanTo);
                helper.setSubject(subject);
                helper.setText(plainText, htmlText);
                mailSender.send(mimeMessage);
            } else {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromAddress);
                message.setTo(cleanTo);
                message.setSubject(subject);
                message.setText(plainText);
                mailSender.send(message);
            }
            log.info("Email successfully sent to [{}] via {}", cleanTo, fromAddress);
        } catch (Exception e) {
            log.error("Failed to send email to [{}]: {} (Cause: {})", cleanTo, e.getMessage(), e.getCause() != null ? e.getCause().getMessage() : "none", e);
        }
    }
}


