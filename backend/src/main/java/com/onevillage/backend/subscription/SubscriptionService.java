package com.onevillage.backend.subscription;

import com.onevillage.backend.common.ApiException;
import com.onevillage.backend.subscription.dto.CheckoutSessionResponse;
import com.onevillage.backend.subscription.dto.PlanResponse;
import com.onevillage.backend.subscription.dto.SubscriptionResponse;
import com.onevillage.backend.user.User;
import com.onevillage.backend.user.UserRepository;
import com.onevillage.backend.user.UserRole;
import com.stripe.model.Event;
import com.stripe.model.Invoice;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.onevillage.backend.auth.EmailService;
import com.onevillage.backend.community.Community;
import com.onevillage.backend.community.CommunityMemberRole;
import com.onevillage.backend.community.CommunityMembership;
import com.onevillage.backend.community.CommunityMembershipRepository;
import com.onevillage.backend.community.CommunityRepository;
import com.onevillage.backend.community.MembershipStatus;
import com.onevillage.backend.notification.NotificationDispatcher;
import com.onevillage.backend.notification.NotificationType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SubscriptionService {

    private static final List<PlanResponse> PLANS = List.of(
            new PlanResponse("FREE", "Membre Gratuit", "Gratuit", "", "Pour découvrir",
                    List.of("Création de profil", "Consulter le calendrier des sorties", "Parcourir les groupes par arrondissement", "Accès aux notifications", "Adhésion aux groupes : 20 $ CAD / groupe (validation admin)")),
            new PlanResponse("COMMUNITY_LEADER", "Organisateur de groupe (Leader)", "$50", "", "Pour créateurs de groupes",
                    List.of("Tous les avantages Membre", "Créer & administrer vos propres groupes", "Organiser des sorties au restaurant", "Adhésion aux autres groupes comme membre : 20 $ CAD")),
            new PlanResponse("ORGANIZATION", "Organisation / Entreprise", "$100", "", "Partenaires & Restaurateurs",
                    List.of("Tous les avantages Leader", "Page officielle d'organisation vérifiée", "Partenaire restaurant officiel", "Mise en avant auprès des groupes"))
    );

    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final StripeService stripeService;
    private final CommunityMembershipRepository membershipRepository;
    private final CommunityRepository communityRepository;
    private final EmailService emailService;
    private final NotificationDispatcher notificationDispatcher;

    public SubscriptionService(SubscriptionRepository subscriptionRepository,
                                PaymentRepository paymentRepository,
                                UserRepository userRepository,
                                StripeService stripeService,
                                CommunityMembershipRepository membershipRepository,
                                CommunityRepository communityRepository,
                                EmailService emailService,
                                NotificationDispatcher notificationDispatcher) {
        this.subscriptionRepository = subscriptionRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.stripeService = stripeService;
        this.membershipRepository = membershipRepository;
        this.communityRepository = communityRepository;
        this.emailService = emailService;
        this.notificationDispatcher = notificationDispatcher;
    }

    public List<PlanResponse> getPlans() {
        return PLANS;
    }

    public BigDecimal getRequiredPlanAmountCAD(SubscriptionPlan plan) {
        return switch (plan) {
            case COMMUNITY_LEADER -> new BigDecimal("50.00");
            case ORGANIZATION -> new BigDecimal("100.00");
            default -> BigDecimal.ZERO;
        };
    }

    public void validatePlanPaymentAmount(SubscriptionPlan plan, BigDecimal submittedAmount) {
        BigDecimal required = getRequiredPlanAmountCAD(plan);
        if (submittedAmount == null || submittedAmount.compareTo(required) < 0) {
            throw ApiException.badRequest("Montant insuffisant : Le tarif requis pour " + plan.name() 
                    + " est de " + required + " $ CAD. Montant soumis de " + (submittedAmount == null ? "0.00" : submittedAmount) 
                    + " $ CAD.");
        }
    }

    public SubscriptionResponse getMine(UUID userId) {
        return subscriptionRepository.findByUserId(userId)
                .map(this::toResponse)
                .orElse(new SubscriptionResponse(null, SubscriptionPlan.FREE, SubscriptionStatus.ACTIVE, null));
    }

    public CheckoutSessionResponse createCheckoutSession(UUID userId, String planRaw) {
        SubscriptionPlan plan;
        try {
            plan = SubscriptionPlan.valueOf(planRaw.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("plan must be one of COMMUNITY_LEADER, ORGANIZATION");
        }
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        Session session = stripeService.createCheckoutSession(userId, user.getEmail(), plan);
        return new CheckoutSessionResponse(session.getUrl());
    }

    @Transactional
    public void cancel(UUID userId) {
        Subscription subscription = subscriptionRepository.findByUserId(userId)
                .orElseThrow(() -> ApiException.notFound("You do not have an active subscription"));
        if (subscription.getStripeSubscriptionId() == null) {
            throw ApiException.badRequest("This subscription is not linked to a payment provider");
        }
        stripeService.cancelAtPeriodEnd(subscription.getStripeSubscriptionId());
    }

    // --- Interac e-Transfer Payments ---

    @Transactional
    public com.onevillage.backend.subscription.dto.InteracPaymentResponse initiateInteracPayment(
            UUID userId, String planRaw, BigDecimal amount, UUID communityId, String communityName) {
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));

        String refCode;
        if ("GROUP_JOIN".equalsIgnoreCase(planRaw) || communityId != null) {
            if (amount == null || amount.compareTo(new BigDecimal("20.00")) < 0) {
                throw ApiException.badRequest("Montant insuffisant : La cotisation requise pour rejoindre un groupe est de 20.00 $ CAD.");
            }
            refCode = "BA-JOIN-" + java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase();

            // Ensure pending membership is recorded
            if (communityId != null) {
                membershipRepository.findByCommunityIdAndUserId(communityId, userId).orElseGet(() -> {
                    CommunityMembership m = new CommunityMembership();
                    m.setCommunityId(communityId);
                    m.setUserId(userId);
                    m.setRoleInCommunity(CommunityMemberRole.MEMBER);
                    m.setStatus(MembershipStatus.PENDING_REQUEST);
                    return membershipRepository.save(m);
                });
            }
        } else {
            SubscriptionPlan plan;
            try {
                plan = SubscriptionPlan.valueOf(planRaw.toUpperCase());
            } catch (IllegalArgumentException e) {
                plan = SubscriptionPlan.COMMUNITY_LEADER;
            }
            validatePlanPaymentAmount(plan, amount);
            refCode = "BA-" + (plan == SubscriptionPlan.ORGANIZATION ? "ORG-" : "LEADER-") 
                    + java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        }

        Payment payment = new Payment();
        payment.setUserId(userId);
        payment.setUserName(user.getFullName());
        payment.setUserEmail(user.getEmail());
        payment.setCommunityId(communityId);
        payment.setCommunityName(communityName != null && !communityName.isBlank() ? communityName : "Général");
        payment.setReferenceNumber(refCode);
        payment.setPaymentMethod("INTERAC");
        payment.setAmount(amount);
        payment.setCurrency("CAD");
        payment.setStatus("PENDING");

        Payment saved = paymentRepository.save(payment);
        return toInteracResponse(saved);
    }

    @Transactional
    public com.onevillage.backend.subscription.dto.InteracPaymentResponse adminConfirmInteracPayment(UUID paymentId, UUID adminId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> ApiException.notFound("Payment request not found"));

        payment.setStatus("APPROVED");
        payment.setPaidAt(Instant.now());

        if (payment.getUserId() != null) {
            User user = userRepository.findById(payment.getUserId()).orElse(null);
            if (user != null) {
                boolean isGroupJoin = payment.getCommunityId() != null 
                        || (payment.getCommunityName() != null && !payment.getCommunityName().isBlank() && !"Général".equalsIgnoreCase(payment.getCommunityName()));

                if (isGroupJoin) {
                    UUID targetCommunityId = payment.getCommunityId();
                    if (targetCommunityId == null && payment.getCommunityName() != null) {
                        targetCommunityId = communityRepository.findAll().stream()
                                .filter(c -> c.getName().equalsIgnoreCase(payment.getCommunityName().trim()))
                                .map(Community::getId)
                                .findFirst().orElse(null);
                    }

                    if (targetCommunityId != null) {
                        final UUID cId = targetCommunityId;
                        CommunityMembership membership = membershipRepository.findByCommunityIdAndUserId(cId, user.getId())
                                .orElseGet(() -> {
                                    CommunityMembership m = new CommunityMembership();
                                    m.setCommunityId(cId);
                                    m.setUserId(user.getId());
                                    m.setRoleInCommunity(CommunityMemberRole.MEMBER);
                                    return m;
                                });
                        membership.setStatus(MembershipStatus.JOINED);
                        membership.setJoinedAt(Instant.now());
                        membershipRepository.save(membership);

                        if (user.getSelectedCommunityId() == null) {
                            user.setSelectedCommunityId(cId);
                            userRepository.save(user);
                        }

                        String cName = communityRepository.findById(cId).map(Community::getName).orElse(payment.getCommunityName());
                        emailService.sendPaymentConfirmationEmail(user.getEmail(), user.getFullName(), "Adhésion au groupe " + cName, "$" + payment.getAmount() + " CAD");
                        notificationDispatcher.dispatch(
                                user.getId(),
                                NotificationType.SYSTEM,
                                "Adhésion confirmée !",
                                "Votre paiement de 20 $ CAD a été confirmé. Bienvenue dans le groupe « " + cName + " » !",
                                cId
                        );
                    }
                } else {
                    // Registration subscription (Leader $50 or Org $100)
                    SubscriptionPlan plan = payment.getAmount().compareTo(new BigDecimal("100.00")) >= 0
                            ? SubscriptionPlan.ORGANIZATION
                            : SubscriptionPlan.COMMUNITY_LEADER;

                    Subscription subscription = subscriptionRepository.findByUserId(user.getId()).orElseGet(Subscription::new);
                    subscription.setUserId(user.getId());
                    subscription.setPlan(plan);
                    subscription.setStatus(SubscriptionStatus.ACTIVE);
                    subscription.setCurrentPeriodEnd(Instant.now().plus(365, java.time.temporal.ChronoUnit.DAYS));
                    subscriptionRepository.save(subscription);

                    payment.setSubscriptionId(subscription.getId());

                    if (user.getRole() == UserRole.MEMBER) {
                        user.setRole(plan == SubscriptionPlan.ORGANIZATION ? UserRole.ORGANIZATION : UserRole.COMMUNITY_LEADER);
                        userRepository.save(user);
                    }

                    String planLabel = plan == SubscriptionPlan.ORGANIZATION ? "Organisation / Partenaire" : "Organisateur de groupe (Leader)";
                    emailService.sendPaymentConfirmationEmail(user.getEmail(), user.getFullName(), planLabel, "$" + payment.getAmount() + " CAD");
                    notificationDispatcher.dispatch(
                            user.getId(),
                            NotificationType.SYSTEM,
                            "Compte activé !",
                            "Votre inscription en tant que " + planLabel + " a été validée avec succès.",
                            null
                    );
                }
            }
        }

        Payment saved = paymentRepository.save(payment);
        return toInteracResponse(saved);
    }

    public List<com.onevillage.backend.subscription.dto.InteracPaymentResponse> adminListInteracPayments() {
        return paymentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toInteracResponse)
                .toList();
    }

    private com.onevillage.backend.subscription.dto.InteracPaymentResponse toInteracResponse(Payment p) {
        return new com.onevillage.backend.subscription.dto.InteracPaymentResponse(
                p.getId(), p.getUserId(), p.getUserName(), p.getUserEmail(), p.getCommunityId(), p.getCommunityName(),
                p.getReferenceNumber(), p.getAmount(), p.getCurrency(), p.getPaymentMethod(),
                p.getStatus(), p.getPaidAt(), p.getCreatedAt()
        );
    }

    // --- Admin ---

    public List<com.onevillage.backend.subscription.dto.AdminSubscriptionResponse> adminListAll() {
        return subscriptionRepository.findAll().stream().map(s -> {
            User user = userRepository.findById(s.getUserId()).orElse(null);
            return new com.onevillage.backend.subscription.dto.AdminSubscriptionResponse(
                    s.getId(), s.getUserId(),
                    user == null ? null : user.getFullName(),
                    user == null ? null : user.getEmail(),
                    s.getPlan(), s.getStatus(), s.getCurrentPeriodEnd(), s.getCreatedAt());
        }).toList();
    }

    public long countByStatus(SubscriptionStatus status) {
        return subscriptionRepository.countByStatus(status);
    }

    // --- Stripe webhook handling ---

    @Transactional
    public void handleWebhookEvent(String payload, String sigHeader) {
        Event event = stripeService.constructWebhookEvent(payload, sigHeader);
        StripeObject dataObject = event.getDataObjectDeserializer().getObject().orElse(null);
        if (dataObject == null) {
            return;
        }

        switch (event.getType()) {
            case "checkout.session.completed" -> {
                if (dataObject instanceof Session session) {
                    handleCheckoutCompleted(session);
                }
            }
            case "invoice.paid" -> {
                if (dataObject instanceof Invoice invoice) {
                    handleInvoicePaid(invoice);
                }
            }
            case "customer.subscription.updated" -> {
                if (dataObject instanceof com.stripe.model.Subscription stripeSub) {
                    handleSubscriptionUpdated(stripeSub);
                }
            }
            case "customer.subscription.deleted" -> {
                if (dataObject instanceof com.stripe.model.Subscription stripeSub) {
                    handleSubscriptionDeleted(stripeSub);
                }
            }
            default -> { /* ignore other event types */ }
        }
    }

    private void handleCheckoutCompleted(Session session) {
        String userIdStr = session.getMetadata() != null ? session.getMetadata().get("userId") : session.getClientReferenceId();
        String planStr = session.getMetadata() != null ? session.getMetadata().get("plan") : null;
        if (userIdStr == null || planStr == null) {
            return;
        }
        UUID userId = UUID.fromString(userIdStr);
        SubscriptionPlan plan = SubscriptionPlan.valueOf(planStr);
        String stripeSubscriptionId = session.getSubscription();
        String stripeCustomerId = session.getCustomer();

        Subscription subscription = subscriptionRepository.findByUserId(userId).orElseGet(Subscription::new);
        subscription.setUserId(userId);
        subscription.setPlan(plan);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setStripeCustomerId(stripeCustomerId);
        subscription.setStripeSubscriptionId(stripeSubscriptionId);
        subscription.setCurrentPeriodEnd(stripeSubscriptionId != null ? stripeService.retrievePeriodEnd(stripeSubscriptionId) : null);
        subscriptionRepository.save(subscription);

        userRepository.findById(userId).ifPresent(user -> {
            UserRole targetRole = plan == SubscriptionPlan.ORGANIZATION ? UserRole.ORGANIZATION : UserRole.COMMUNITY_LEADER;
            if (user.getRole() == UserRole.MEMBER) {
                user.setRole(targetRole);
                userRepository.save(user);
            }
        });
    }

    private void handleInvoicePaid(Invoice invoice) {
        String stripeSubscriptionId = invoice.getSubscription();
        if (stripeSubscriptionId == null || paymentRepository.existsByStripeInvoiceId(invoice.getId())) {
            return;
        }
        Optional<Subscription> subscriptionOpt = subscriptionRepository.findByStripeSubscriptionId(stripeSubscriptionId);
        if (subscriptionOpt.isEmpty()) {
            return;
        }
        Payment payment = new Payment();
        payment.setSubscriptionId(subscriptionOpt.get().getId());
        payment.setAmount(BigDecimal.valueOf(invoice.getAmountPaid()).divide(BigDecimal.valueOf(100)));
        payment.setCurrency(invoice.getCurrency());
        payment.setStatus("paid");
        payment.setStripeInvoiceId(invoice.getId());
        payment.setPaidAt(Instant.now());
        paymentRepository.save(payment);
    }

    private void handleSubscriptionUpdated(com.stripe.model.Subscription stripeSub) {
        subscriptionRepository.findByStripeSubscriptionId(stripeSub.getId()).ifPresent(subscription -> {
            subscription.setStatus(mapStripeStatus(stripeSub.getStatus()));
            subscription.setCurrentPeriodEnd(Instant.ofEpochSecond(stripeSub.getCurrentPeriodEnd()));
            subscriptionRepository.save(subscription);
        });
    }

    private void handleSubscriptionDeleted(com.stripe.model.Subscription stripeSub) {
        subscriptionRepository.findByStripeSubscriptionId(stripeSub.getId()).ifPresent(subscription -> {
            subscription.setStatus(SubscriptionStatus.CANCELLED);
            subscriptionRepository.save(subscription);

            userRepository.findById(subscription.getUserId()).ifPresent(user -> {
                UserRole planRole = subscription.getPlan() == SubscriptionPlan.ORGANIZATION ? UserRole.ORGANIZATION : UserRole.COMMUNITY_LEADER;
                if (user.getRole() == planRole) {
                    user.setRole(UserRole.MEMBER);
                    userRepository.save(user);
                }
            });
        });
    }

    private SubscriptionStatus mapStripeStatus(String stripeStatus) {
        return switch (stripeStatus) {
            case "active", "trialing" -> SubscriptionStatus.ACTIVE;
            case "past_due", "unpaid", "incomplete" -> SubscriptionStatus.PAST_DUE;
            default -> SubscriptionStatus.CANCELLED;
        };
    }

    private SubscriptionResponse toResponse(Subscription s) {
        return new SubscriptionResponse(s.getId(), s.getPlan(), s.getStatus(), s.getCurrentPeriodEnd());
    }
}
