package com.onevillage.backend.event;

import com.onevillage.backend.common.ApiException;
import com.onevillage.backend.community.Community;
import com.onevillage.backend.community.CommunityRepository;
import com.onevillage.backend.event.dto.CreateEventRequest;
import com.onevillage.backend.event.dto.EventResponse;
import com.onevillage.backend.organization.Organization;
import com.onevillage.backend.organization.OrganizationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final EventRsvpRepository rsvpRepository;
    private final CommunityRepository communityRepository;
    private final OrganizationRepository organizationRepository;

    public EventService(EventRepository eventRepository,
                         EventRsvpRepository rsvpRepository,
                         CommunityRepository communityRepository,
                         OrganizationRepository organizationRepository) {
        this.eventRepository = eventRepository;
        this.rsvpRepository = rsvpRepository;
        this.communityRepository = communityRepository;
        this.organizationRepository = organizationRepository;
    }

    @Transactional
    public EventResponse create(UUID userId, CreateEventRequest request) {
        EventType type;
        try {
            type = EventType.valueOf(request.type().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Type de sortie invalide");
        }

        if (request.communityId() != null) {
            Community community = communityRepository.findById(request.communityId())
                    .orElseThrow(() -> ApiException.notFound("Groupe introuvable"));
            if (!community.getLeaderId().equals(userId)) {
                throw ApiException.forbidden("Seul l'organisateur du groupe peut publier des sorties pour ce groupe");
            }
        } else if (request.organizationId() != null) {
            Organization org = organizationRepository.findById(request.organizationId())
                    .orElseThrow(() -> ApiException.notFound("Organisation introuvable"));
            if (!org.getOwnerUserId().equals(userId)) {
                throw ApiException.forbidden("Seul le gestionnaire de l'organisation peut publier des sorties");
            }
        } else {
            throw ApiException.badRequest("Une sortie doit être rattachée à un groupe ou une organisation");
        }

        Event event = new Event();
        event.setCommunityId(request.communityId());
        event.setOrganizationId(request.organizationId());
        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setType(type);
        event.setStartAt(request.startAt());
        event.setOnline(request.online());
        event.setLocation(request.location());
        event.setOnlineLink(request.onlineLink());
        event.setCoverImageUrl(request.coverImageUrl());
        event.setCreatedBy(userId);
        // saveAndFlush: toResponse() below reads event.getCreatedAt(), which
        // @CreationTimestamp only populates once the INSERT actually executes.
        eventRepository.saveAndFlush(event);

        return toResponse(event, userId);
    }

    public Page<EventResponse> list(UUID communityId, boolean upcomingOnly, UUID currentUserId, Pageable pageable) {
        return eventRepository.findFiltered(communityId, upcomingOnly, Instant.now(), pageable)
                .map(e -> toResponse(e, currentUserId));
    }

    public EventResponse getById(UUID id, UUID currentUserId) {
        return toResponse(getEntity(id), currentUserId);
    }

    public Event getEntity(UUID id) {
        return eventRepository.findById(id).orElseThrow(() -> ApiException.notFound("Sortie introuvable"));
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        Event event = getEntity(id);
        if (!event.getCreatedBy().equals(userId)) {
            throw ApiException.forbidden("Seul le créateur de la sortie peut la supprimer");
        }
        eventRepository.delete(event);
    }

    @Transactional
    public EventResponse rsvp(UUID eventId, UUID userId, String statusRaw) {
        getEntity(eventId);
        RsvpStatus status;
        try {
            status = RsvpStatus.valueOf(statusRaw.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Statut d'inscription invalide");
        }
        EventRsvp rsvp = rsvpRepository.findByEventIdAndUserId(eventId, userId).orElseGet(EventRsvp::new);
        rsvp.setEventId(eventId);
        rsvp.setUserId(userId);
        rsvp.setStatus(status);
        rsvp.setRespondedAt(Instant.now());
        rsvpRepository.save(rsvp);
        return toResponse(getEntity(eventId), userId);
    }

    private EventResponse toResponse(Event e, UUID currentUserId) {
        String communityName = e.getCommunityId() == null ? null : communityRepository.findNameById(e.getCommunityId()).orElse(null);
        String orgName = e.getOrganizationId() == null ? null
                : organizationRepository.findById(e.getOrganizationId()).map(Organization::getName).orElse(null);
        long goingCount = rsvpRepository.countByEventIdAndStatus(e.getId(), RsvpStatus.GOING);
        RsvpStatus myStatus = currentUserId == null ? null
                : rsvpRepository.findByEventIdAndUserId(e.getId(), currentUserId).map(EventRsvp::getStatus).orElse(null);

        return new EventResponse(e.getId(), e.getCommunityId(), communityName, e.getOrganizationId(), orgName,
                e.getTitle(), e.getDescription(), e.getType(), e.getStartAt(), e.isOnline(), e.getLocation(),
                e.getOnlineLink(), e.getCoverImageUrl(), e.getCreatedBy(), goingCount, myStatus, e.getCreatedAt());
    }
}
