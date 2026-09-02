package com.onevillage.backend.auth;

import com.onevillage.backend.auth.dto.RegisterRequest;
import com.onevillage.backend.auth.dto.RegisterResponse;
import com.onevillage.backend.common.ApiException;
import com.onevillage.backend.common.ErrorCode;
import com.onevillage.backend.security.JwtService;
import com.onevillage.backend.terms.TermsService;
import com.onevillage.backend.terms.TermsVersion;
import com.onevillage.backend.user.AccountStatus;
import com.onevillage.backend.user.User;
import com.onevillage.backend.user.UserRepository;
import com.onevillage.backend.user.UserRole;
import com.onevillage.backend.user.UserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import java.util.UUID;

@Service
public class AuthService {

    private static final Set<String> REGISTERABLE_ROLES = Set.of("MEMBER", "COMMUNITY_LEADER", "ORGANIZATION");

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final TermsService termsService;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final EmailVerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public AuthService(UserRepository userRepository,
                        UserService userService,
                        PasswordEncoder passwordEncoder,
                        TermsService termsService,
                        JwtService jwtService,
                        EmailService emailService,
                        EmailVerificationTokenRepository verificationTokenRepository,
                        PasswordResetTokenRepository passwordResetTokenRepository,
                        RefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.termsService = termsService;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.verificationTokenRepository = verificationTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request, String ipAddress) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw ApiException.conflict(ErrorCode.EMAIL_ALREADY_REGISTERED, "Un compte avec cette adresse courriel existe déjà");
        }

        String accountType = request.accountType().toUpperCase();
        if (!REGISTERABLE_ROLES.contains(accountType)) {
            throw ApiException.badRequest("Le type de compte doit être MEMBER, COMMUNITY_LEADER ou ORGANIZATION");
        }

        TermsVersion current = termsService.getCurrentVersionEntity();
        if (!current.getVersion().equals(request.acceptedTermsVersion())) {
            throw ApiException.badRequest("Vous devez accepter la version actuelle des conditions d'adhésion (" + current.getVersion() + ")");
        }

        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.valueOf(accountType));
        user.setCountry(request.country());
        user.setCity(request.city());
        user.setPreferredLanguage(request.preferredLanguage());
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setEmailVerified(false);
        userRepository.save(user);

        termsService.recordAcceptance(user.getId(), request.acceptedTermsVersion(), ipAddress);

        issueVerificationToken(user);

        return new RegisterResponse(user.getEmail(), "Compte créé avec succès. Veuillez consulter vos courriels pour activer votre adresse.");
    }

    private void issueVerificationToken(User user) {
        EmailVerificationToken token = new EmailVerificationToken();
        token.setUserId(user.getId());
        token.setToken(UUID.randomUUID().toString());
        token.setExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
        verificationTokenRepository.save(token);
        emailService.sendVerificationEmail(user, token.getToken());
    }

    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken verification = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> ApiException.badRequest("Lien de vérification invalide ou expiré"));
        if (verification.getExpiresAt().isBefore(Instant.now())) {
            throw ApiException.badRequest("Ce lien d'activation a expiré. Veuillez en demander un nouveau.");
        }
        User user = userRepository.findById(verification.getUserId())
                .orElseThrow(() -> ApiException.notFound("Utilisateur introuvable"));
        user.setEmailVerified(true);
        userRepository.save(user);
        verificationTokenRepository.delete(verification);
    }

    @Transactional
    public void resendVerification(String email) {
        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            if (!user.isEmailVerified()) {
                verificationTokenRepository.deleteByUserId(user.getId());
                issueVerificationToken(user);
            }
        });
    }

    @Transactional
    public AuthTokens login(String email, String password) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> ApiException.unauthorized(ErrorCode.INVALID_CREDENTIALS, "Adresse courriel ou mot de passe invalide"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw ApiException.unauthorized(ErrorCode.INVALID_CREDENTIALS, "Adresse courriel ou mot de passe invalide");
        }
        if (!user.isEmailVerified()) {
            throw new ApiException(HttpStatus.FORBIDDEN, ErrorCode.EMAIL_NOT_VERIFIED, "Veuillez confirmer votre adresse courriel avant de vous connecter");
        }
        if (!user.isActive()) {
            throw new ApiException(HttpStatus.FORBIDDEN, ErrorCode.ACCOUNT_SUSPENDED, "Ce compte a été suspendu");
        }

        return issueTokens(user);
    }

    private AuthTokens issueTokens(User user) {
        RefreshToken refreshTokenEntity = new RefreshToken();
        refreshTokenEntity.setUserId(user.getId());
        refreshTokenEntity.setExpiresAt(Instant.now().plus(jwtService.getRefreshTokenTtlDays(), ChronoUnit.DAYS));
        refreshTokenRepository.save(refreshTokenEntity);

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), refreshTokenEntity.getId());

        return new AuthTokens(accessToken, refreshToken, refreshTokenEntity.getExpiresAt(), userService.toResponse(user));
    }

    @Transactional
    public AuthTokens refresh(String refreshTokenJwt) {
        if (refreshTokenJwt == null || refreshTokenJwt.isBlank()) {
            throw ApiException.unauthorized(ErrorCode.UNAUTHORIZED, "Missing refresh token");
        }

        Claims claims;
        try {
            claims = jwtService.parseClaims(refreshTokenJwt);
        } catch (JwtException | IllegalArgumentException e) {
            throw ApiException.unauthorized(ErrorCode.UNAUTHORIZED, "Invalid refresh token");
        }
        if (!jwtService.isRefreshToken(claims)) {
            throw ApiException.unauthorized(ErrorCode.UNAUTHORIZED, "Invalid refresh token");
        }

        UUID tokenId = jwtService.getTokenId(claims);
        UUID userId = jwtService.getUserId(claims);

        RefreshToken record = refreshTokenRepository.findById(tokenId)
                .orElseThrow(() -> ApiException.unauthorized(ErrorCode.UNAUTHORIZED, "Refresh token not recognized"));

        if (record.isRevoked() || record.getExpiresAt().isBefore(Instant.now()) || !record.getUserId().equals(userId)) {
            throw ApiException.unauthorized(ErrorCode.UNAUTHORIZED, "Refresh token is no longer valid");
        }

        // Rotate: revoke the used refresh token and issue a brand new pair.
        record.setRevoked(true);
        refreshTokenRepository.save(record);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.unauthorized(ErrorCode.UNAUTHORIZED, "User not found"));
        if (!user.isActive()) {
            throw new ApiException(HttpStatus.FORBIDDEN, ErrorCode.ACCOUNT_SUSPENDED, "This account has been suspended");
        }

        return issueTokens(user);
    }

    @Transactional
    public void logout(String refreshTokenJwt) {
        if (refreshTokenJwt == null || refreshTokenJwt.isBlank()) {
            return;
        }
        try {
            Claims claims = jwtService.parseClaims(refreshTokenJwt);
            if (jwtService.isRefreshToken(claims)) {
                refreshTokenRepository.findById(jwtService.getTokenId(claims)).ifPresent(rt -> {
                    rt.setRevoked(true);
                    refreshTokenRepository.save(rt);
                });
            }
        } catch (JwtException | IllegalArgumentException ignored) {
            // Already invalid/expired — nothing to revoke.
        }
    }

    @Transactional
    public void forgotPassword(String email) {
        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            PasswordResetToken token = new PasswordResetToken();
            token.setUserId(user.getId());
            token.setToken(UUID.randomUUID().toString());
            token.setExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));
            passwordResetTokenRepository.save(token);
            emailService.sendPasswordResetEmail(user, token.getToken());
        });
        // Always behave the same whether or not the email exists, to avoid account enumeration.
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> ApiException.badRequest("Lien de réinitialisation invalide ou expiré"));
        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(Instant.now())) {
            throw ApiException.badRequest("Lien de réinitialisation invalide ou expiré");
        }
        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> ApiException.notFound("Utilisateur introuvable"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        // Force re-login on every device after a password reset.
        refreshTokenRepository.deleteByUserId(user.getId());
    }
}
