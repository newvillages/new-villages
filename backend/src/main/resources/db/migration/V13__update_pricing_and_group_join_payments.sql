-- Migration V13: Update pricing plans (Leader 50 CAD, Org 100 CAD, Member 20 CAD per group) and support group join payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES communities(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_payments_community_id ON payments(community_id);

-- Update pricing plans
UPDATE pricing_plans
SET name = 'Membre Gratuit',
    price = 0.00,
    tag = 'Pour découvrir',
    description = 'Inscription gratuite. Adhésion à un groupe : 20 $ CAD.',
    features = 'Création de profil|Consulter le calendrier des sorties|Parcourir les groupes par arrondissement|Accès aux notifications|Adhésion aux groupes (20 $ CAD / groupe validé par l''admin)',
    updated_at = CURRENT_TIMESTAMP
WHERE code = 'free';

UPDATE pricing_plans
SET name = 'Organisateur de groupe (Leader)',
    price = 50.00,
    tag = 'Pour créateurs de groupes',
    description = '50 $ CAD à l''inscription pour créer et administrer vos propres groupes.',
    features = 'Créer et gérer ses propres groupes|Publier annonces et sorties resto|Gestion des membres du groupe|Rejoindre d''autres groupes comme membre (20 $ CAD)',
    updated_at = CURRENT_TIMESTAMP
WHERE code = 'leader';

UPDATE pricing_plans
SET name = 'Organisation / Entreprise',
    price = 100.00,
    tag = 'Partenaires & Restaurateurs',
    description = '100 $ CAD à l''inscription pour les partenaires et entreprises.',
    features = 'Page entreprise/partenaire officielle vérifiée|Visibilité auprès des groupes de sorties|Événements partenaires|Support prioritaire',
    updated_at = CURRENT_TIMESTAMP
WHERE code = 'org';

-- Apply group join condition to current group memberships:
-- Set any non-leader members to PENDING_REQUEST so admin payment confirmation is required
UPDATE community_memberships
SET status = 'PENDING_REQUEST', joined_at = NULL
WHERE role_in_community = 'MEMBER';
