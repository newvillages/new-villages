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
    private final String mailHost;
    private final String mailUsername;
    private final String mailPassword;

    public EmailService(JavaMailSender mailSender,
                         @Value("${app.mail.from:}") String fromAddress,
                         @Value("${spring.mail.username:}") String mailUsername,
                         @Value("${spring.mail.password:}") String mailPassword,
                         @Value("${spring.mail.host:}") String mailHost,
                         @Value("${app.frontend.base-url}") String frontendBaseUrl,
                         @Value("${server.port}") String serverPort) {
        this.mailSender = mailSender;
        this.frontendBaseUrl = frontendBaseUrl;
        this.backendBaseUrl = "http://localhost:" + serverPort;
        this.mailHost = mailHost != null ? mailHost.trim() : "";
        this.mailUsername = mailUsername != null ? mailUsername.trim() : "";
        this.mailPassword = mailPassword != null ? mailPassword.trim() : "";

        // Gmail SMTP strictly enforces that the From address must match the authenticated Gmail username
        if (this.mailHost.toLowerCase().contains("gmail") && !this.mailUsername.isBlank()) {
            this.fromAddress = this.mailUsername;
        } else if (fromAddress != null && !fromAddress.isBlank() && !fromAddress.contains("carmani")) {
            this.fromAddress = fromAddress.trim();
        } else {
            this.fromAddress = "contact@newvillages.ca";
        }

        log.info("[EMAIL SERVICE INIT] Configured From Address: {} | Host: {} | Auth Username: {}", this.fromAddress, this.mailHost, this.mailUsername);

        if (this.mailUsername.isBlank() || this.mailUsername.contains("carmani")) {
            log.warn("=================================================================================");
            log.warn("[SMTP CONFIG ALERT] Production SMTP credentials are missing in Environment Variables!");
            log.warn("To send real emails on Render, set these Environment Variables in Render Dashboard -> Environment:");
            log.warn("  MAIL_HOST     = smtp-relay.brevo.com (or smtp.gmail.com)");
            log.warn("  MAIL_PORT     = 587");
            log.warn("  MAIL_USERNAME = your-smtp-username");
            log.warn("  MAIL_PASSWORD = your-smtp-password-or-app-password");
            log.warn("  MAIL_FROM     = contact@newvillages.ca");
            log.warn("=================================================================================");
        }
    }

    public String getEmailDiagnosticInfo() {
        return String.format("Host: %s | Auth User: %s | Pass Configured: %s | From Address: %s",
                mailHost.isBlank() ? "NOT_SET (defaults to smtp.gmail.com)" : mailHost,
                mailUsername.isBlank() ? "NOT_SET" : mailUsername,
                !mailPassword.isBlank() ? "YES (len: " + mailPassword.length() + ")" : "NO",
                fromAddress);
    }

    public String sendTestEmail(String toEmail) {
        if (toEmail == null || toEmail.isBlank()) {
            throw com.onevillage.backend.common.ApiException.badRequest("Recipient email address is required");
        }
        String cleanTo = toEmail.trim().toLowerCase();
        log.info("[SMTP TEST] Attempting dispatch to [{}] via Host: {} | From: {}", cleanTo, mailHost, fromAddress);
        try {
            jakarta.mail.internet.InternetAddress from = new jakarta.mail.internet.InternetAddress(fromAddress, "New Villages Test");
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(from);
            helper.setReplyTo(from);
            helper.setTo(cleanTo);
            helper.setSubject("New Villages - SMTP Test Email");
            helper.setText("Hi,\n\nThis is a test email sent from New Villages backend.\n\n"
                    + getEmailDiagnosticInfo(),
                    "<div style=\"font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;\">"
                    + "<h2 style=\"color: #0F172A;\">SMTP Test Successful!</h2>"
                    + "<p style=\"color: #334155;\">Your email delivery pipeline on Render is working properly.</p>"
                    + "<pre style=\"background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 12px;\">" + getEmailDiagnosticInfo() + "</pre>"
                    + "</div>");
            mailSender.send(mimeMessage);
            log.info("[SMTP TEST SUCCESS] Email delivered to [{}]", cleanTo);
            return "SUCCESS (SMTP): Test email sent to " + cleanTo + " using " + fromAddress + " via host " + (mailHost.isBlank() ? "smtp.gmail.com" : mailHost);
        } catch (Exception e) {
            log.warn("[SMTP TEST TIMEOUT/ERROR] SMTP dispatch failed: {}. Attempting HTTPS REST API fallback...", e.getMessage());
            String restResult = sendViaBrevoApiResult(cleanTo, "New Villages - Test Email (HTTPS)", "This is a test email sent via Brevo HTTPS REST API fallback.",
                    "<div style=\"font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;\">"
                    + "<h2 style=\"color: #0F172A;\">HTTPS REST API Test Successful!</h2>"
                    + "<p style=\"color: #334155;\">Email delivered via Brevo HTTPS REST API (Port 443 fallback).</p>"
                    + "</div>");
            if (restResult.startsWith("SUCCESS")) {
                return "SUCCESS (Brevo HTTPS API Fallback): Test email sent to " + cleanTo + " over Port 443!";
            }
            throw com.onevillage.backend.common.ApiException.badRequest("SMTP Timeout (" + e.getMessage() + ") & HTTPS API Failure: " + restResult);
        }
    }

    private boolean sendViaBrevoApi(String cleanTo, String subject, String plainText, String htmlContent) {
        String result = sendViaBrevoApiResult(cleanTo, subject, plainText, htmlContent);
        return result.startsWith("SUCCESS");
    }

    private String sendViaBrevoApiResult(String cleanTo, String subject, String plainText, String htmlContent) {
        String brevoKey = (mailPassword != null && !mailPassword.isBlank()) ? mailPassword.trim() : "";
        if (brevoKey.isBlank()) {
            log.warn("[BREVO REST API] Skipping HTTPS fallback: MAIL_PASSWORD is empty in environment variables.");
            return "FAILED: MAIL_PASSWORD environment variable is missing or empty on Render.";
        }
        log.info("[BREVO REST API] Attempting direct HTTPS email dispatch (Port 443) to [{}]", cleanTo);
        try {
            String finalHtml = htmlContent != null && !htmlContent.isBlank() ? htmlContent : plainText;
            String jsonPayload = String.format(
                    "{\"sender\":{\"name\":\"New Villages\",\"email\":\"%s\"},\"to\":[{\"email\":\"%s\"}],\"subject\":\"%s\",\"htmlContent\":\"%s\"}",
                    escapeJson(fromAddress),
                    escapeJson(cleanTo),
                    escapeJson(subject),
                    escapeJson(finalHtml)
            );

            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .header("api-key", brevoKey)
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonPayload, java.nio.charset.StandardCharsets.UTF_8))
                    .build();

            java.net.http.HttpResponse<String> response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("[BREVO REST API SUCCESS] Email successfully delivered to [{}] via HTTPS port 443! Response: {}", cleanTo, response.body());
                return "SUCCESS: Email sent via Brevo HTTPS API";
            } else {
                log.warn("[BREVO REST API FAILED] Status: {} | Body: {}", response.statusCode(), response.body());
                return "Brevo HTTPS API HTTP " + response.statusCode() + ": " + response.body();
            }
        } catch (Exception ex) {
            log.error("[BREVO REST API ERROR] Failed to send via HTTPS REST API: {}", ex.getMessage(), ex);
            return "Brevo HTTPS API Exception: " + ex.getMessage();
        }
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
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
            log.warn("SMTP send failed for [{}]: {}. Attempting HTTPS REST API fallback...", cleanTo, e.getMessage());
            boolean restSuccess = sendViaBrevoApi(cleanTo, subject, plainText, htmlText);
            if (!restSuccess) {
                log.error("Failed to send email to [{}]: {} (Cause: {})", cleanTo, e.getMessage(), e.getCause() != null ? e.getCause().getMessage() : "none", e);
            }
        }
    }
}


