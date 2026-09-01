import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { useAcceptTerms, useCurrentTerms } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export function ReConsent() {
  const navigate = useNavigate();
  const { data: terms } = useCurrentTerms();
  const acceptTerms = useAcceptTerms();

  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [hasViewedTerms, setHasViewedTerms] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accepted && terms) {
      acceptTerms.mutate(terms.version, { onSuccess: () => navigate('/dashboard') });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 flex items-center justify-center font-body">
      <Card className="w-full max-w-md border-[#EFE6DD] shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <span className="text-4xl">⚖️</span>
            <h1 className="text-2xl font-heading font-extrabold text-[#2C1810] mt-4 mb-2">Conditions mises à jour</h1>
            <p className="text-xs text-[#52433B]">
              Nous avons mis à jour nos Conditions d'utilisation et notre Politique de confidentialité{terms ? ` (v${terms.version})` : ''}. Veuillez les consulter et les accepter pour continuer à utiliser Bouffe &amp; Amitié.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-t border-[#EFE6DD] pt-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="mt-1 w-5 h-5 rounded border-slate-300 text-[#E86225] focus:ring-[#E86225] disabled:opacity-50"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  disabled={!hasViewedTerms}
                />
                <span className="text-xs text-[#52433B]">
                  J'accepte les nouvelles{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setTermsModalOpen(true);
                      setHasViewedTerms(true);
                    }}
                    className="text-[#E86225] hover:underline font-bold"
                  >
                    Conditions d'utilisation et la Politique de confidentialité
                  </a>.
                </span>
              </label>
              {!hasViewedTerms && (
                <p className="text-xs text-red-600 mt-1 pl-8">
                  Vous devez consulter le document avant de pouvoir accepter.
                </p>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full bg-[#E86225] hover:bg-[#D0521B] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2" disabled={!accepted || acceptTerms.isPending}>
              {acceptTerms.isPending && <Loader2 size={18} className="animate-spin" />}
              Accepter et continuer
            </Button>
          </form>
        </CardContent>
      </Card>

      <Modal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)} title={`Conditions d'adhésion - Bouffe & Amitié${terms ? ` (v${terms.version})` : ' (v2.0.0)'}`} className="max-w-2xl">
        <div className="prose prose-sm prose-amber whitespace-pre-wrap text-xs text-[#52433B] max-h-96 overflow-y-auto p-4 bg-[#FAF5EF] rounded-xl border border-[#EFE6DD] leading-relaxed">
          {(!terms?.body || terms.body.includes('NewVillages - Terms')) ? `Conditions d'adhésion - Bouffe & Amitié

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
J'ai lu et j'accepte les Conditions d'adhésion et la Politique de confidentialité de Bouffe & Amitié. Je comprends que je paie 20 $ CAD pour le mois choisi, que ce paiement ne sera pas renouvelé automatiquement et que mes repas et consommations ne sont pas inclus.` : terms.body}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setTermsModalOpen(false)} className="bg-[#E86225] text-white font-bold">J'ai consulté les conditions</Button>
        </div>
      </Modal>
    </div>
  );
}

export default ReConsent;
