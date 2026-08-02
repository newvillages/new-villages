package com.onevillage.backend.config;

import com.onevillage.backend.terms.TermsVersion;
import com.onevillage.backend.terms.TermsVersionRepository;
import com.onevillage.backend.terms.UserTermsAcceptance;
import com.onevillage.backend.terms.UserTermsAcceptanceRepository;
import com.onevillage.backend.user.AccountStatus;
import com.onevillage.backend.user.User;
import com.onevillage.backend.user.UserRepository;
import com.onevillage.backend.user.UserRole;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

/**
 * Seeds and maintains minimum required system data: current published Terms of Use,
 * the default Administrator account, and test accounts for development/testing.
 */
@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final TermsVersionRepository termsVersionRepository;
    private final UserTermsAcceptanceRepository userTermsAcceptanceRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.terms.seed-version}")
    private String seedTermsVersion;

    @Value("${app.seed.admin-email:admin@newvillages.ca}")
    private String adminEmail;

    @Value("${app.seed.admin-password:ChangeMe123!}")
    private String adminPassword;

    public DataSeeder(TermsVersionRepository termsVersionRepository,
                       UserTermsAcceptanceRepository userTermsAcceptanceRepository,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.termsVersionRepository = termsVersionRepository;
        this.userTermsAcceptanceRepository = userTermsAcceptanceRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        TermsVersion currentTerms = seedTermsVersion();
        seedAdminUser(currentTerms);
        seedTestUser("member@newvillages.ca", "Community Member", UserRole.MEMBER, currentTerms);
        seedTestUser("leader@newvillages.ca", "Community Leader", UserRole.COMMUNITY_LEADER, currentTerms);
        seedTestUser("christian.leader@newvillages.ca", "Christian Leader", UserRole.COMMUNITY_LEADER, currentTerms);
        seedTestUser("org@newvillages.ca", "Organization Lead", UserRole.ORGANIZATION, currentTerms);
    }

    private TermsVersion seedTermsVersion() {
        Optional<TermsVersion> existing = termsVersionRepository.findByCurrentTrue();
        if (existing.isPresent()) {
            return existing.get();
        }
        TermsVersion version = new TermsVersion();
        version.setVersion(seedTermsVersion);
        version.setBody("""
                NewVillages - Terms and Conditions

                1. Users are responsible for their own posts, messages, and behavior.
                2. The platform acts only as an intermediary and is not responsible for agreements made between users.
                3. Users must provide accurate information when creating an account.
                4. Illegal, hateful, violent, fraudulent, or rights-infringing content is prohibited.
                5. Users must comply with all applicable laws in their country or region.
                6. Subscriptions and participation fees, when applicable, must be paid according to the displayed terms and may be non-refundable unless required by law.
                7. Each user is responsible for their own personal expenses, including transportation, food, purchases, and other costs.
                8. The platform may suspend or permanently remove accounts that violate these Terms.
                9. The platform may modify its features, pricing, or these Terms and Conditions at any time. Changes become effective once published on the platform unless applicable law requires otherwise. Continued use of the platform after changes means you accept the updated Terms.
                10. The platform does not guarantee the success, quality, or outcome of any event, activity, or interaction between users.
                11. To the maximum extent permitted by law, the platform is not liable for damages, losses, or disputes arising from interactions between users.
                12. Users agree to the platform's Privacy Policy regarding the collection and use of personal information.
                13. Any fraudulent activity or attempt to bypass the platform's security measures may result in account termination.
                14. By accessing or using the platform, users acknowledge that they have read, understood, and agree to these Terms and Conditions.
                """);
        version.setPublishedAt(Instant.now());
        version.setCurrent(true);
        TermsVersion saved = termsVersionRepository.save(version);
        log.info("Seeded initial Terms of Use version {}", seedTermsVersion);
        return saved;
    }

    private void seedAdminUser(TermsVersion currentTerms) {
        User admin = userRepository.findByEmailIgnoreCase(adminEmail)
                .orElseGet(() -> userRepository.findByEmailIgnoreCase("admin@onevillage.ca")
                        .orElseGet(() -> userRepository.findFirstByRole(UserRole.ADMIN)
                                .orElseGet(User::new)));

        admin.setFullName("New Villages Admin");
        admin.setEmail(adminEmail);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setRole(UserRole.ADMIN);
        admin.setCountry("Canada");
        admin.setCity("Toronto");
        admin.setAccountStatus(AccountStatus.ACTIVE);
        admin.setEmailVerified(true);
        User savedAdmin = userRepository.save(admin);

        ensureTermsAccepted(savedAdmin, currentTerms);
        log.info("Seeded/updated Super Admin account '{}' with configured password.", adminEmail);
    }

    private void seedTestUser(String email, String name, UserRole role, TermsVersion currentTerms) {
        User user = userRepository.findByEmailIgnoreCase(email).orElseGet(User::new);
        user.setFullName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(adminPassword));
        user.setRole(role);
        user.setCountry("Canada");
        user.setCity("Toronto");
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setEmailVerified(true);
        User savedUser = userRepository.save(user);

        ensureTermsAccepted(savedUser, currentTerms);
        log.info("Seeded test account '{}' ({})", email, role);
    }

    private void ensureTermsAccepted(User user, TermsVersion termsVersion) {
        if (termsVersion == null || user == null) return;
        boolean accepted = userTermsAcceptanceRepository.existsByUserIdAndTermsVersionId(user.getId(), termsVersion.getId());
        if (!accepted) {
            UserTermsAcceptance acceptance = new UserTermsAcceptance();
            acceptance.setUserId(user.getId());
            acceptance.setTermsVersionId(termsVersion.getId());
            acceptance.setAcceptedAt(Instant.now());
            acceptance.setIpAddress("127.0.0.1");
            userTermsAcceptanceRepository.save(acceptance);
        }
    }
}
