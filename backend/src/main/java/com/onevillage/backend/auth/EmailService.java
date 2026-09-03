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
            this.fromAddress = "contact@bouffeamitie.ca";
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
            log.warn("  MAIL_FROM     = contact@bouffeamitie.ca");
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
            throw com.onevillage.backend.common.ApiException.badRequest("L'adresse courriel du destinataire est requise");
        }
        String cleanTo = toEmail.trim().toLowerCase();
        log.info("[EMAIL TEST] Attempting dispatch to [{}] via Host: {} | From: {}", cleanTo, mailHost, fromAddress);

        // Try Brevo HTTPS REST API (Port 443) first if key is present
        String restResult = "";
        if (!mailPassword.isBlank()) {
            restResult = sendViaBrevoApiResult(cleanTo, "Bouffe & Amitié - Courriel de test", "Ceci est un courriel de test envoyé via l'API REST de Brevo.",
                    "<div style=\"font-family: Arial, sans-serif; padding: 20px; border: 1px solid #efe6dd; border-radius: 12px;\">"
                    + "<h2 style=\"color: #2C1810;\">Test API REST réussi !</h2>"
                    + "<p style=\"color: #52433B;\">Courriel livré avec succès via Brevo (Port 443).</p>"
                    + "<pre style=\"background: #faf5ef; padding: 12px; border-radius: 8px; font-size: 12px;\">" + getEmailDiagnosticInfo() + "</pre>"
                    + "</div>");
            if (restResult.startsWith("SUCCESS")) {
                return "SUCCESS (Brevo HTTPS API Port 443): Courriel de test livré à " + cleanTo + " !";
            }
        }

        // Fallback to standard SMTP
        try {
            jakarta.mail.internet.InternetAddress from = new jakarta.mail.internet.InternetAddress(fromAddress, "Bouffe & Amitié");
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(from);
            helper.setReplyTo(from);
            helper.setTo(cleanTo);
            helper.setSubject("Bouffe & Amitié - Test SMTP");
            helper.setText("Bonjour,\n\nCeci est un courriel de test du backend de Bouffe & Amitié.\n\n"
                    + getEmailDiagnosticInfo(),
                    "<div style=\"font-family: Arial, sans-serif; padding: 20px; border: 1px solid #efe6dd; border-radius: 12px;\">"
                    + "<h2 style=\"color: #2C1810;\">Test SMTP Réussi !</h2>"
                    + "<p style=\"color: #52433B;\">Le service d'envoi de courriels fonctionne correctement.</p>"
                    + "<pre style=\"background: #faf5ef; padding: 12px; border-radius: 8px; font-size: 12px;\">" + getEmailDiagnosticInfo() + "</pre>"
                    + "</div>");
            mailSender.send(mimeMessage);
            log.info("[SMTP TEST SUCCESS] Email delivered to [{}]", cleanTo);
            return "SUCCESS (SMTP): Courriel de test envoyé à " + cleanTo + " via " + fromAddress;
        } catch (Exception e) {
            String apiFailInfo = !restResult.isBlank() ? " | API Error: " + restResult : "";
            throw com.onevillage.backend.common.ApiException.badRequest("Échec de l'envoi. SMTP: " + e.getMessage() + apiFailInfo);
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
                    "{\"sender\":{\"name\":\"Bouffe & Amitié\",\"email\":\"%s\"},\"to\":[{\"email\":\"%s\"}],\"subject\":\"%s\",\"htmlContent\":\"%s\"}",
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
        log.info("Verification email for {} — link: {}", user.getEmail(), link);
        sendHtml(user.getEmail(), "Activez votre compte Bouffe & Amitié",
                "Bonjour " + user.getFullName() + ",\n\n"
                        + "Bienvenue sur Bouffe & Amitié ! Veuillez confirmer votre adresse courriel en ouvrant ce lien :\n"
                        + link + "\n\n"
                        + "Ce lien expire dans 24 heures.",
                "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #efe6dd; border-radius: 16px; background-color: #ffffff;\">"
                        + "<h2 style=\"color: #2C1810;\">Bienvenue sur Bouffe &amp; Amitié !</h2>"
                        + "<p style=\"color: #52433B;\">Bonjour <strong>" + user.getFullName() + "</strong>,</p>"
                        + "<p style=\"color: #52433B;\">Veuillez activer votre compte en cliquant sur le bouton ci-dessous :</p>"
                        + "<p style=\"text-align: center; margin: 24px 0;\"><a href=\"" + link + "\" style=\"background-color: #E86225; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold;\">Activer mon compte</a></p>"
                        + "<p style=\"font-size: 12px; color: #94A3B8;\">Ou copiez ce lien dans votre navigateur : <br><a href=\"" + link + "\" style=\"color: #E86225;\">" + link + "</a></p>"
                        + "</div>"
        );
    }

    @Async
    public void sendPasswordResetEmail(User user, String token) {
        String link = frontendBaseUrl + "/reset-password?token=" + token;
        log.info("Password reset requested for {} — token: {}", user.getEmail(), token);
        sendHtml(user.getEmail(), "Réinitialisation de votre mot de passe - Bouffe & Amitié",
                "Bonjour " + user.getFullName() + ",\n\n"
                        + "Nous avons reçu une demande de réinitialisation de mot de passe. Ouvrez ce lien pour choisir un nouveau mot de passe :\n"
                        + link + "\n\n"
                        + "Si vous n'avez pas fait cette demande, vous pouvez ignorer ce courriel. Ce lien expire dans 1 heure.",
                "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #efe6dd; border-radius: 16px; background-color: #ffffff;\">"
                        + "<h2 style=\"color: #2C1810;\">Réinitialisation de mot de passe</h2>"
                        + "<p style=\"color: #52433B;\">Bonjour <strong>" + user.getFullName() + "</strong>,</p>"
                        + "<p style=\"color: #52433B;\">Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>"
                        + "<p style=\"text-align: center; margin: 24px 0;\"><a href=\"" + link + "\" style=\"background-color: #E86225; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold;\">Changer mon mot de passe</a></p>"
                        + "</div>"
        );
    }

    @Async
    public void sendPaymentReceiptEmail(String toEmail, String name, String planLabel, String amount, String memoCode) {
        String loginLink = frontendBaseUrl + "/login";
        String dashboardLink = frontendBaseUrl + "/dashboard";

        log.info("Sending payment receipt email to {} for plan {} ({})", toEmail, planLabel, amount);
        send(toEmail, "Confirmation de paiement Bouffe & Amitié - " + planLabel,
                "Bonjour " + (name != null && !name.isBlank() ? name : "Membre") + ",\n\n"
                        + "Merci pour votre inscription à la formule Bouffe & Amitié " + planLabel + " (" + amount + ") !\n\n"
                        + "Nous avons bien reçu vos informations de paiement (Code de référence : " + memoCode + ").\n"
                        + "Notre équipe validera votre demande sous peu pour activer tous vos accès.\n\n"
                        + "🔑 Connectez-vous à votre compte à tout moment :\n"
                        + loginLink + "\n\n"
                        + "🚀 Accédez à votre tableau de bord :\n"
                        + dashboardLink + "\n\n"
                        + "Si vous avez des questions, vous pouvez répondre à ce courriel ou écrire à contact@bouffeamitie.ca.\n\n"
                        + "Cordialement,\n"
                        + "L'équipe Bouffe & Amitié\n"
                        + "https://newvillages.ca");
    }

    @Async
    public void sendPaymentConfirmationEmail(String toEmail, String name, String paymentDetails, String amount) {
        String dashboardLink = frontendBaseUrl + "/dashboard";
        log.info("Sending payment confirmation email to {} for {} ({})", toEmail, paymentDetails, amount);
        send(toEmail, "Validation de votre paiement - Bouffe & Amitié",
                "Bonjour " + (name != null && !name.isBlank() ? name : "Membre") + ",\n\n"
                        + "Nous avons le plaisir de vous confirmer la réception et la validation de votre paiement de " + amount + " pour : " + paymentDetails + ".\n\n"
                        + "Vos accès sont maintenant actifs ! Vous pouvez dès à présent participer pleinement aux sorties et activités.\n\n"
                        + "🚀 Accéder à votre tableau de bord :\n"
                        + dashboardLink + "\n\n"
                        + "Cordialement,\n"
                        + "L'équipe Bouffe & Amitié\n"
                        + "https://newvillages.ca");
    }

    @Async
    public void sendContactSubmissionEmail(String senderName, String senderEmail, String subject, String message) {
        log.info("[CONTACT FORM] Submission from {} ({}) | Subject: {}", senderName, senderEmail, subject);

        // 1. Notify platform admin at contact@bouffeamitie.ca
        String adminSubject = "[Contact Bouffe & Amitié] " + subject;
        String adminPlainText = "Nouveau message reçu via le formulaire de contact Bouffe & Amitié :\n\n"
                + "Nom: " + senderName + "\n"
                + "Courriel: " + senderEmail + "\n"
                + "Sujet: " + subject + "\n\n"
                + "Message:\n" + message;

        String adminHtml = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #efe6dd; border-radius: 16px; background-color: #ffffff;\">"
                + "<h2 style=\"color: #2C1810; margin: 0 0 16px 0;\">Nouveau message de contact</h2>"
                + "<p style=\"font-size: 14px; color: #52433B;\"><strong>Nom :</strong> " + escapeJson(senderName) + "</p>"
                + "<p style=\"font-size: 14px; color: #52433B;\"><strong>Courriel :</strong> <a href=\"mailto:" + escapeJson(senderEmail) + "\">" + escapeJson(senderEmail) + "</a></p>"
                + "<p style=\"font-size: 14px; color: #52433B;\"><strong>Sujet :</strong> " + escapeJson(subject) + "</p>"
                + "<hr style=\"border: 0; border-top: 1px solid #efe6dd; margin: 16px 0;\" />"
                + "<p style=\"font-size: 14px; color: #2C1810; white-space: pre-wrap;\">" + escapeJson(message) + "</p>"
                + "</div>";

        sendHtml("contact@bouffeamitie.ca", adminSubject, adminPlainText, adminHtml);

        // 2. Send auto-reply to submitter
        String userSubject = "Nous avons bien reçu votre message - Bouffe & Amitié";
        String userPlainText = "Bonjour " + senderName + ",\n\n"
                + "Merci d'avoir contacté Bouffe & Amitié ! Nous avons bien reçu votre message concernant « " + subject + " ».\n"
                + "Notre équipe examinera votre demande et vous répondra très rapidement.\n\n"
                + "Cordialement,\n"
                + "L'équipe Bouffe & Amitié\n"
                + "contact@bouffeamitie.ca";

        String userHtml = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #efe6dd; border-radius: 16px; background-color: #ffffff;\">"
                + "<h2 style=\"color: #2C1810; margin: 0 0 8px 0;\">Merci de nous avoir contactés !</h2>"
                + "<p style=\"font-size: 14px; color: #52433B;\">Bonjour <strong>" + escapeJson(senderName) + "</strong>,</p>"
                + "<p style=\"font-size: 14px; color: #52433B;\">Nous avons bien reçu votre message et notre équipe vous répondra sous 24 heures.</p>"
                + "<div style=\"background-color: #FAF5EF; border-radius: 12px; padding: 16px; margin: 20px 0; border: 1px solid #EFE6DD;\">"
                + "<p style=\"font-size: 13px; color: #1E4D2B; margin: 0 0 4px 0;\"><strong>Votre message :</strong></p>"
                + "<p style=\"font-size: 13px; color: #2C1810; margin: 0;\">" + escapeJson(message) + "</p>"
                + "</div>"
                + "<p style=\"font-size: 12px; color: #94A3B8;\">L'équipe Bouffe &amp; Amitié &bull; contact@bouffeamitie.ca</p>"
                + "</div>";

        sendHtml(senderEmail, userSubject, userPlainText, userHtml);
    }

    @Async
    public void sendCommunityInvitationEmail(String toEmail, String inviterName, String communityName, String communityId) {
        String cleanEmail = toEmail != null ? toEmail.trim().toLowerCase() : "";
        String inviteLink = frontendBaseUrl + "/communities/" + communityId;
        String senderLabel = (inviterName != null && !inviterName.isBlank()) ? inviterName : "Un organisateur de groupe";
        
        log.info("[INVITATION DISPATCH] Email: {} | Inviter: {} | Community: {} | Link: {}", cleanEmail, senderLabel, communityName, inviteLink);
        
        String subject = "Invitation à rejoindre le groupe " + communityName + " - Bouffe & Amitié";
        String plainText = "Bonjour,\n\n"
                + senderLabel + " vous a invité(e) à rejoindre le groupe de sorties au restaurant « " + communityName + " » sur Bouffe & Amitié !\n\n"
                + "Ouvrez ce lien pour découvrir le groupe et accepter l'invitation :\n"
                + inviteLink + "\n\n"
                + "Bienvenue sur Bouffe & Amitié !\n"
                + "L'équipe Bouffe & Amitié";

        String htmlContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #efe6dd; border-radius: 16px; background-color: #ffffff;\">"
                + "<div style=\"text-align: center; margin-bottom: 24px;\">"
                + "<h2 style=\"color: #2C1810; margin: 0 0 4px 0;\">Vous êtes invité(e) !</h2>"
                + "<p style=\"color: #1E4D2B; font-size: 14px; margin: 0;\">Bouffe &amp; Amitié - Club de sorties au restaurant</p>"
                + "</div>"
                + "<div style=\"background-color: #FAF5EF; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #EFE6DD;\">"
                + "<p style=\"font-size: 15px; color: #2C1810; line-height: 1.6; margin: 0 0 12px 0;\">Bonjour,</p>"
                + "<p style=\"font-size: 15px; color: #2C1810; line-height: 1.6; margin: 0 0 16px 0;\"><strong>" + senderLabel + "</strong> vous invite à rejoindre le groupe <strong>« " + communityName + " »</strong> sur Bouffe &amp; Amitié !</p>"
                + "<div style=\"text-align: center; margin: 24px 0;\">"
                + "<a href=\"" + inviteLink + "\" style=\"background-color: #E86225; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;\">Voir le groupe &amp; Rejoindre</a>"
                + "</div>"
                + "<p style=\"font-size: 12px; color: #52433B; text-align: center; margin: 0;\">Ou copiez ce lien dans votre navigateur :<br><a href=\"" + inviteLink + "\" style=\"color: #E86225;\">" + inviteLink + "</a></p>"
                + "</div>"
                + "<p style=\"font-size: 12px; color: #94A3B8; text-align: center; margin: 0;\">L'équipe Bouffe &amp; Amitié &bull; Mangez. Rencontrez. Créez des amitiés.</p>"
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

        // Try direct Brevo HTTPS REST API (Port 443) first if Brevo credentials are in use
        if (!mailPassword.isBlank() && (mailHost.contains("brevo") || mailPassword.startsWith("xsmtpsib-") || mailPassword.startsWith("xkeysib-"))) {
            boolean restSuccess = sendViaBrevoApi(cleanTo, subject, plainText, htmlText);
            if (restSuccess) {
                log.info("Email successfully sent to [{}] via Brevo HTTPS REST API (Port 443)", cleanTo);
                return;
            }
        }

        // Fallback to standard SMTP
        try {
            jakarta.mail.internet.InternetAddress from = new jakarta.mail.internet.InternetAddress(fromAddress, "Bouffe & Amitié");
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
                message.setText(plainText != null ? plainText : "");
                mailSender.send(message);
            }
            log.info("Email sent to [{}] via standard SMTP", cleanTo);
        } catch (Exception e) {
            log.error("Failed to send email to [{}]: {}", cleanTo, e.getMessage(), e);
        }
    }
}
