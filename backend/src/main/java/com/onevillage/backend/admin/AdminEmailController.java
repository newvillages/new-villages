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
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(Map.of(
                "status", "ACTIVE",
                "diagnosticInfo", emailService.getEmailDiagnosticInfo()
        ));
    }

    @RequestMapping(value = "/test", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<Map<String, Object>> sendTestEmail(@RequestParam(required = false, defaultValue = "contact@newvillages.ca") String to) {
        try {
            String result = emailService.sendTestEmail(to);
            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "message", result,
                    "diagnosticInfo", emailService.getEmailDiagnosticInfo()
            ));
        } catch (Exception e) {
            String causeMsg = e.getCause() != null ? e.getCause().getMessage() : e.getMessage();
            return ResponseEntity.status(500).body(Map.of(
                    "status", "FAILED",
                    "error", e.getMessage() != null ? e.getMessage() : "Unknown SMTP error",
                    "cause", causeMsg != null ? causeMsg : "None",
                    "diagnosticInfo", emailService.getEmailDiagnosticInfo()
            ));
        }
    }
}
