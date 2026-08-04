package com.onevillage.backend.common;

import com.onevillage.backend.auth.EmailService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public/contact")
public class ContactController {

    private final EmailService emailService;

    public ContactController(EmailService emailService) {
        this.emailService = emailService;
    }

    public record ContactRequest(
            @NotBlank(message = "Name is required") String name,
            @NotBlank(message = "Email is required") @Email(message = "Invalid email format") String email,
            @NotBlank(message = "Subject is required") String subject,
            @NotBlank(message = "Message is required") String message
    ) {}

    @PostMapping
    public ResponseEntity<Map<String, String>> submitContactForm(@Valid @RequestBody ContactRequest request) {
        emailService.sendContactSubmissionEmail(
                request.name().trim(),
                request.email().trim(),
                request.subject().trim(),
                request.message().trim()
        );

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Your message has been received! Our team will respond to " + request.email() + " shortly."
        ));
    }
}
