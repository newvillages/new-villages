package com.onevillage.backend.admin;

import com.onevillage.backend.auth.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/email")
public class AdminEmailController {

    private final EmailService emailService;

    public AdminEmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> getStatus() {
        return ResponseEntity.ok(Map.of(
                "status", emailService.getEmailDiagnosticInfo()
        ));
    }

    @PostMapping("/test")
    public ResponseEntity<Map<String, String>> sendTestEmail(@RequestParam String to) {
        String result = emailService.sendTestEmail(to);
        return ResponseEntity.ok(Map.of("message", result));
    }
}
