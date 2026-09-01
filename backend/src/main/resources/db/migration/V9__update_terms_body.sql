-- Migration V9: Update Terms of Use to official 12-point French Conditions d'adhésion - Bouffe & Amitié
UPDATE terms_versions
SET is_current = false
WHERE is_current = true;

INSERT INTO terms_versions (id, version, body, published_at, is_current)
VALUES (
    gen_random_uuid(),
    '2.0.0',
    'Conditions d''adhésion - Bouffe & Amitié

1. Objet de l''adhésion
Bouffe & Amitié est un service communautaire qui facilite l''organisation de rencontres sociales, notamment des sorties dans des restaurants.
L''adhésion concerne le service d''organisation et de participation aux activités de Bouffe & Amitié. Elle ne constitue pas l''achat d''un repas.

2. Âge
Le membre confirme avoir 18 ans ou plus au moment de son inscription.

3. Frais d''adhésion
L''adhésion est de 20 $ CAD pour le mois choisi, auxquels s''ajoutent les taxes applicables, le cas échéant.
Le prix total et les modalités de paiement sont présentés au membre avant la confirmation du paiement.

4. Aucun renouvellement automatique
L''adhésion n''est pas renouvelée automatiquement.
Aucun nouveau paiement de 20 $ n''est prélevé automatiquement sur le moyen de paiement du membre.
Pour participer à un nouveau mois, le membre doit retourner sur la plateforme et effectuer volontairement un nouveau paiement.
S''il ne paie pas pour le mois suivant, aucune nouvelle somme ne lui est facturée.

5. Sorties
Bouffe & Amitié organise des rencontres et activités pour ses différents groupes.
Les dates, heures, restaurants et disponibilités peuvent varier.
Certaines sorties peuvent avoir un nombre limité de places. Le paiement d''une adhésion ne garantit une place à une sortie particulière que lorsque cette place a été confirmée au membre.

6. Repas et consommations
Les repas, boissons, pourboires et autres dépenses personnelles ne sont pas compris dans les 20 $.
Chaque membre commande et paie directement au restaurant ses propres consommations.

7. Réservation, absence et retard
Lorsqu''une réservation est nécessaire, le membre doit respecter les modalités communiquées pour la sortie.
Un membre qui prévoit être absent ou en retard est invité à prévenir le responsable du groupe dès que possible.
Les règles concernant une annulation ou un remboursement sont celles présentées au membre avant son paiement, sous réserve des droits prévus par les lois applicables.

8. Modification ou annulation d''une activité
Bouffe & Amitié peut devoir modifier le restaurant, la date ou l''heure d''une activité lorsqu''une situation raisonnable l''exige.
Les membres concernés seront informés dès que raisonnablement possible.
Les droits du consommateur prévus par les lois applicables demeurent applicables.

9. Comportement
Chaque membre doit adopter un comportement respectueux envers les autres membres, les responsables de groupe et le personnel des établissements visités.
Le harcèlement, les menaces, la violence, la discrimination ou tout comportement gravement perturbateur peuvent entraîner une suspension ou une exclusion, sous réserve des droits prévus par la loi.

10. Responsabilité
Bouffe & Amitié organise ou facilite des rencontres sociales. Les restaurants demeurent responsables des produits et services qu''ils fournissent directement aux membres.
Aucune disposition des présentes conditions ne vise à exclure ou limiter un droit ou une responsabilité lorsque la loi interdit une telle exclusion ou limitation.

11. Renseignements personnels
Les renseignements personnels recueillis lors de l''inscription sont utilisés notamment pour administrer l''adhésion, les paiements, les communications et les activités.
Le traitement des renseignements personnels est également décrit dans la Politique de confidentialité de Bouffe & Amitié.

12. Acceptation avant le paiement
Avant d''effectuer son paiement, le membre doit confirmer son acceptation des présentes conditions.
J''ai lu et j''accepte les Conditions d''adhésion et la Politique de confidentialité de Bouffe & Amitié. Je comprends que je paie 20 $ CAD pour le mois choisi, que ce paiement ne sera pas renouvelé automatiquement et que mes repas et consommations ne sont pas inclus.',
    NOW(),
    true
);
