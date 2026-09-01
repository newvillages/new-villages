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
        String officialBody = """
                Conditions d'adhésion - Bouffe & Amitié

                1. Objet de l'adhésion
                Bouffe & Amitié est un service communautaire qui facilite l'organisation de rencontres sociales, notamment des sorties dans des restaurants.
                L'adhésion concerne le service d'organisation et de participation aux activités de Bouffe & Amitié. Elle ne constitue pas l'achat d'un repas.

                2. Âge
                Le membre confirme avoir 18 ans ou plus au moment de son inscription.

                3. Frais d'adhésion
                L'adhésion est de 20 $ CAD pour le mois choisi, auxquels s'ajoutent les taxes applicables, le cas échéant.
                Le prix total et les modalités de paiement sont présentés au membre avant la confirmation du paiement.

                4. Aucun renouvellement automatique
                L'adhésion n'est pas renouvelée automatiquement.
                Aucun nouveau paiement de 20 $ n'est prélevé automatiquement sur le moyen de paiement du membre.
                Pour participer à un nouveau mois, le membre doit retourner sur la plateforme et effectuer volontairement un nouveau paiement.
                S'il ne paie pas pour le mois suivant, aucune nouvelle somme ne lui est facturée.

                5. Sorties
                Bouffe & Amitié organise des rencontres et activités pour ses différents groupes.
                Les dates, heures, restaurants et disponibilités peuvent varier.
                Certaines sorties peuvent avoir un nombre limité de places. Le paiement d'une adhésion ne garantit une place à une sortie particulière que lorsque cette place a été confirmée au membre.

                6. Repas et consommations
                Les repas, boissons, pourboires et autres dépenses personnelles ne sont pas compris dans les 20 $.
                Chaque membre commande et paie directement au restaurant ses propres consommations.

                7. Réservation, absence et retard
                Lorsqu'une réservation est nécessaire, le membre doit respecter les modalités communiquées pour la sortie.
                Un membre qui prévoit être absent ou en retard est invité à prévenir le responsable du groupe dès que possible.
                Les règles concernant une annulation ou un remboursement sont celles présentées au membre avant son paiement, sous réserve des droits prévus par les lois applicables.

                8. Modification ou annulation d'une activité
                Bouffe & Amitié peut devoir modifier le restaurant, la date ou l'heure d'une activité lorsqu'une situation raisonnable l'exige.
                Les membres concernés seront informés dès que raisonnablement possible.
                Les droits du consommateur prévus par les lois applicables demeurent applicables.

                9. Comportement
                Chaque membre doit adopter un comportement respectueux envers les autres membres, les responsables de groupe et le personnel des établissements visités.
                Le harcèlement, les menaces, la violence, la discrimination ou tout comportement gravement perturbateur peuvent entraîner une suspension ou une exclusion, sous réserve des droits prévus par la loi.

                10. Responsabilité
                Bouffe & Amitié organise ou facilite des rencontres sociales. Les restaurants demeurent responsables des produits et services qu'ils fournissent directement aux membres.
                Aucune disposition des présentes conditions ne vise à exclure ou limiter un droit ou une responsabilité lorsque la loi interdit une telle exclusion ou limitation.

                11. Renseignements personnels
                Les renseignements personnels recueillis lors de l'inscription sont utilisés notamment pour administrer l'adhésion, les paiements, les communications et les activités.
                Le traitement des renseignements personnels est également décrit dans la Politique de confidentialité de Bouffe & Amitié.

                12. Acceptation avant le paiement
                Avant d'effectuer son paiement, le membre doit confirmer son acceptation des présentes conditions.
                Checkbox: "J'ai lu et j'accepte les Conditions d'adhésion et la Politique de confidentialité de Bouffe & Amitié. Je comprends que je paie 20 $ CAD pour le mois choisi, que ce paiement ne sera pas renouvelé automatiquement et que mes repas et consommations ne sont pas inclus."
                """;

        Optional<TermsVersion> existing = termsVersionRepository.findByCurrentTrue();
        if (existing.isPresent()) {
            TermsVersion v = existing.get();
            v.setBody(officialBody);
            return termsVersionRepository.save(v);
        }
        TermsVersion version = new TermsVersion();
        version.setVersion(seedTermsVersion);
        version.setBody(officialBody);
        version.setPublishedAt(Instant.now());
        version.setCurrent(true);
        TermsVersion saved = termsVersionRepository.save(version);
        log.info("Seeded initial Terms of Use version {}", seedTermsVersion);
        return saved;
    }

    private void seedAdminUser(TermsVersion currentTerms) {
        Optional<User> existing = userRepository.findByEmailIgnoreCase(adminEmail)
                .or(() -> userRepository.findByEmailIgnoreCase("admin@onevillage.ca"))
                .or(() -> userRepository.findFirstByRole(UserRole.ADMIN));

        if (existing.isPresent()) {
            ensureTermsAccepted(existing.get(), currentTerms);
            return;
        }

        User admin = new User();
        admin.setFullName("Bouffe & Amitié Admin");
        admin.setEmail(adminEmail);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setRole(UserRole.ADMIN);
        admin.setCountry("Canada");
        admin.setCity("Toronto");
        admin.setAccountStatus(AccountStatus.ACTIVE);
        admin.setEmailVerified(true);
        User savedAdmin = userRepository.save(admin);

        ensureTermsAccepted(savedAdmin, currentTerms);
        log.info("Seeded Super Admin account '{}'.", adminEmail);
    }

    private void seedTestUser(String email, String name, UserRole role, TermsVersion currentTerms) {
        Optional<User> existing = userRepository.findByEmailIgnoreCase(email);
        if (existing.isPresent()) {
            ensureTermsAccepted(existing.get(), currentTerms);
            return;
        }

        User user = new User();
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
