-- Migration V11: Update pricing plans to French titles, tags, features, and $20 rate
UPDATE pricing_plans
SET name = 'Membre Gratuit',
    tag = 'Pour découvrir',
    description = 'Accès gratuit pour tous les membres',
    features = 'Création de profil|Consulter le calendrier des sorties|Parcourir les groupes par arrondissement|Accès aux notifications',
    updated_at = CURRENT_TIMESTAMP
WHERE code = 'free';

UPDATE pricing_plans
SET name = 'Membre Privilège',
    price = 20.00,
    tag = 'Recommandé',
    description = 'Pour participer aux sorties au restaurant et réserver vos places',
    features = 'Tous les avantages Membre|Accès à 1 sortie au restaurant par mois|Réservation prioritaire des places|Messagerie du groupe',
    updated_at = CURRENT_TIMESTAMP
WHERE code = 'leader';

UPDATE pricing_plans
SET name = 'Organisateur / Partner',
    price = 20.00,
    tag = 'Pour organisateurs & partenaires',
    description = 'Pour administrer un groupe et organiser des sorties',
    features = 'Créer et gérer un groupe d''arrondissement|Proposer de nouveaux restaurants|Gestion des présences et réservations|Page officielle d''organisation',
    updated_at = CURRENT_TIMESTAMP
WHERE code = 'org';
