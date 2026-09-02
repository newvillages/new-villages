-- Migration V12: Clean Slate Reset & Complete French Localization for Bouffe & Amitié

-- 1. Unlink selected community from all users
UPDATE users SET selected_community_id = NULL;

-- 2. Clear old test posts and notifications
DELETE FROM community_posts;
DELETE FROM notifications;

-- 3. Clear old test events and rsvps
DELETE FROM event_rsvps;
DELETE FROM events;

-- 4. Clear old invitations and creation requests
DELETE FROM community_invitations;
DELETE FROM community_creation_requests;

-- 5. Clear old memberships and communities
DELETE FROM community_memberships;
DELETE FROM communities;

-- 6. Update user names to official French designations
UPDATE users 
SET full_name = 'Administration Bouffe & Amitié' 
WHERE email = 'admin@newvillages.ca' 
   OR full_name IN ('New Villages Admin', 'OneVillage Admin', 'Admin');

UPDATE users 
SET full_name = 'Jean Tremblay' 
WHERE email = 'member@newvillages.ca' 
   OR full_name = 'Community Member';

UPDATE users 
SET full_name = 'Marc Tremblay' 
WHERE email = 'leader@newvillages.ca' 
   OR full_name = 'Community Leader';

UPDATE users 
SET full_name = 'Christian Tremblay' 
WHERE email = 'christian.leader@newvillages.ca' 
   OR full_name = 'Christian Leader';

UPDATE users 
SET full_name = 'Association Restos Montréal' 
WHERE email = 'org@newvillages.ca' 
   OR full_name = 'Organization Lead';

-- 7. Reset community categories in French
DELETE FROM community_categories;

INSERT INTO community_categories (id, name, description, icon_name, created_at) VALUES
('a1000000-0000-0000-0000-000000000001', 'Gastronomie & Restos', 'Rencontres dans les meilleurs restaurants de quartier, dégustations et découvertes culinaires.', 'Utensils', CURRENT_TIMESTAMP),
('a1000000-0000-0000-0000-000000000002', 'Sorties & Amitié', 'Rencontres conviviales, soirées sociales et création de nouvelles amitiés autour d''une bonne table.', 'Heart', CURRENT_TIMESTAMP),
('a1000000-0000-0000-0000-000000000003', 'Culture & Découvertes', 'Échanges culturels, sorties musée, soirées thématiques et découvertes gastronomiques.', 'Globe', CURRENT_TIMESTAMP),
('a1000000-0000-0000-0000-000000000004', 'Plein air & Loisirs', 'Activités douces, promenades urbaines, parcs et pique-niques conviviaux.', 'Activity', CURRENT_TIMESTAMP),
('a1000000-0000-0000-0000-000000000005', 'Cafés & Discussions', 'Discussions enrichissantes autour d''un café ou d''un brunch détendu.', 'Coffee', CURRENT_TIMESTAMP);

-- 8. Seed official Montreal borough communities for Bouffe & Amitié
DO $$
DECLARE
    v_leader_id uuid;
    v_member_id uuid;
    v_c1_id uuid := 'c1000000-0000-0000-0000-000000000001';
    v_c2_id uuid := 'c1000000-0000-0000-0000-000000000002';
    v_c3_id uuid := 'c1000000-0000-0000-0000-000000000003';
    v_c4_id uuid := 'c1000000-0000-0000-0000-000000000004';
    v_c5_id uuid := 'c1000000-0000-0000-0000-000000000005';
BEGIN
    SELECT id INTO v_leader_id FROM users WHERE email = 'leader@newvillages.ca' LIMIT 1;
    IF v_leader_id IS NULL THEN
        SELECT id INTO v_leader_id FROM users WHERE role IN ('COMMUNITY_LEADER', 'ADMIN') ORDER BY created_at ASC LIMIT 1;
    END IF;

    SELECT id INTO v_member_id FROM users WHERE email = 'member@newvillages.ca' LIMIT 1;

    IF v_leader_id IS NOT NULL THEN
        INSERT INTO communities (id, name, description, category, visibility, icon_name, color, status, leader_id, created_at, custom_terms) VALUES
        (v_c1_id, 'Bouffe & Amitié - Plateau-Mont-Royal', 'Rencontrez vos voisins du Plateau-Mont-Royal lors d''une sortie mensuelle au restaurant. Ambiance chaleureuse, bistrots typiques et nouvelles amitiés garanties !', 'Gastronomie & Restos', 'PUBLIC', 'Utensils', 'orange', 'APPROVED', v_leader_id, CURRENT_TIMESTAMP, '1. Respect et courtoisie : Chaque membre s''engage à respecter les autres convives dans un esprit bienveillant.' || chr(10) || '2. Présence aux sorties : Confirmez votre participation à l''avance afin de faciliter les réservations de groupe.' || chr(10) || '3. Bonne humeur et convivialité indispensables !'),
        (v_c2_id, 'Bouffe & Amitié - Ville-Marie / Centre-Ville', 'Le groupe des passionnés de bonne chère au cœur de Montréal. Découvertes culinaires, terrasses branchées et belles rencontres au Centre-Ville.', 'Gastronomie & Restos', 'PUBLIC', 'Sparkles', 'emerald', 'APPROVED', v_leader_id, CURRENT_TIMESTAMP, '1. Convivialité et respect mutuel au sein de la table.' || chr(10) || '2. Ponctualité appréciée pour les réservations en restaurant.'),
        (v_c3_id, 'Bouffe & Amitié - Rosemont-La Petite-Patrie', 'Les amoureux de gastronomie de Rosemont et de la Petite Italie. Brunchs du week-end, soupers conviviaux et échanges sympathiques.', 'Sorties & Amitié', 'PUBLIC', 'Heart', 'blue', 'APPROVED', v_leader_id, CURRENT_TIMESTAMP, '1. Bienveillance et ouverture d''esprit obligatoires.' || chr(10) || '2. Respect des réservations et des horaires du restaurant.'),
        (v_c4_id, 'Bouffe & Amitié - Villeray / Mile-End', 'Cafés sympas, bonnes adresses italiennes ou bagels mythiques : partageons de savoureux moments et agrandissons notre cercle d''amis.', 'Cafés & Discussions', 'PUBLIC', 'Coffee', 'purple', 'APPROVED', v_leader_id, CURRENT_TIMESTAMP, '1. Échanges courtois et respectueux entre convives.' || chr(10) || '2. Participation aux frais de repas directement auprès du restaurateur.'),
        (v_c5_id, 'Bouffe & Amitié - Le Sud-Ouest / Griffintown', 'Des berges du canal Lachine aux meilleures tables de Notre-Dame et Griffintown. Un groupe dynamique pour sortir, manger et lier amitié.', 'Gastronomie & Restos', 'PUBLIC', 'Activity', 'amber', 'APPROVED', v_leader_id, CURRENT_TIMESTAMP, '1. Respect de tous les membres de la table.' || chr(10) || '2. Avertir au moins 24h à l''avance en cas d''empêchement.');

        -- Add leader as LEADER in community_memberships
        INSERT INTO community_memberships (id, community_id, user_id, role_in_community, status, requested_at, joined_at) VALUES
        (gen_random_uuid(), v_c1_id, v_leader_id, 'LEADER', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (gen_random_uuid(), v_c2_id, v_leader_id, 'LEADER', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (gen_random_uuid(), v_c3_id, v_leader_id, 'LEADER', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (gen_random_uuid(), v_c4_id, v_leader_id, 'LEADER', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (gen_random_uuid(), v_c5_id, v_leader_id, 'LEADER', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

        -- Add test member as MEMBER in the Plateau group
        IF v_member_id IS NOT NULL THEN
            INSERT INTO community_memberships (id, community_id, user_id, role_in_community, status, requested_at, joined_at) VALUES
            (gen_random_uuid(), v_c1_id, v_member_id, 'MEMBER', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
            
            UPDATE users SET selected_community_id = v_c1_id WHERE id = v_member_id;
        END IF;

        -- Set leader's selected community
        UPDATE users SET selected_community_id = v_c1_id WHERE id = v_leader_id;
    END IF;
END $$;
