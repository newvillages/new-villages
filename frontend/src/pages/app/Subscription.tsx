import { useState, useEffect } from 'react';
import { Check, Mail } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { toast } from '../../store/useToastStore';
import { PageTransition } from '../../components/ui/PageTransition';
import { PaymentModal } from '../../components/subscription/PaymentModal';
import { usePricingPlans } from '../../hooks/useAdmin';

export function Subscription() {
  const [selected, setSelected] = useState('leader');
  const [checkout, setCheckout] = useState(false);
  const [success, setSuccess] = useState(false);

  const { data: dynamicPlans } = usePricingPlans();

  const defaultPlans = [
    {
      id: 'free',
      label: 'Membre Gratuit',
      price: 'Gratuit',
      period: '',
      tag: 'Pour découvrir',
      features: ['Création de profil', 'Consulter le calendrier des sorties', 'Parcourir les groupes par arrondissement', 'Accès aux notifications'],
    },
    {
      id: 'leader',
      label: 'Membre Privilège',
      price: '20 $',
      priceRaw: 20,
      period: '/mois',
      tag: 'Recommandé',
      features: ['Tous les avantages Membre', 'Accès à 1 sortie au restaurant par mois', 'Réservation prioritaire des places', 'Messagerie du groupe'],
    },
    {
      id: 'org',
      label: 'Organisateur / Resto',
      price: '20 $',
      priceRaw: 20,
      period: '/mois',
      tag: 'Pour organisateurs & partenaires',
      features: ['Créer et gérer un groupe d\'arrondissement', 'Proposer de nouveaux restaurants', 'Gestion des présences et réservations', 'Page officielle d\'organisation'],
    },
  ];

  const plans =
    dynamicPlans && dynamicPlans.length > 0
      ? dynamicPlans.map((p) => ({
          id: p.code,
          label: p.name === 'Member' ? 'Membre Gratuit' : p.name === 'Community Leader' ? 'Membre Privilège' : p.name,
          price: p.price === 0 ? 'Gratuit' : `${p.price} $`,
          priceRaw: p.price,
          period: p.price === 0 ? '' : `/${p.billingPeriod || 'mois'}`,
          tag: p.tag || '',
          features: p.features ? p.features.split('|') : [],
        }))
      : defaultPlans;

  const selectedPlan = plans.find((p) => p.id === selected) || plans[0];

  useEffect(() => {
    if (success) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      toast.success(`Paiement soumis avec succès ! Transmis à l'équipe pour activation.`);
    }
  }, [success, selectedPlan.label]);

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6 bg-[#FDFBF7] font-body">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-[#EFE6DD]"
        >
          <div className="w-20 h-20 bg-[#E8F3EB] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-[#1E4D2B]" />
          </div>

          <div className="inline-flex items-center gap-1.5 bg-[#FDF0E9] text-[#E86225] border border-[#E86225]/30 text-xs font-extrabold px-3.5 py-1.5 rounded-full mb-4">
            <span className="w-2 h-2 rounded-full bg-[#E86225] animate-ping" />
            <span>En attente de confirmation</span>
          </div>

          <h2 className="text-2xl font-heading font-extrabold mb-2 text-[#2C1810]">Paiement soumis ! 🎉</h2>
          <p className="text-[#52433B] mb-6 text-xs font-medium leading-relaxed">
            Vos informations de paiement pour la formule <strong>{selectedPlan.label}</strong> ont bien été reçues. Notre équipe validera votre inscription sous peu !
          </p>

          <div className="bg-[#FAF5EF] border border-[#EFE6DD] rounded-2xl p-4 mb-6 text-left flex items-start gap-3">
            <Mail size={18} className="text-[#E86225] mt-0.5 shrink-0" />
            <div className="text-xs text-[#52433B] leading-relaxed">
              <span className="font-bold text-[#2C1810] block mb-0.5">Courriel de confirmation envoyé 📩</span>
              Un reçu contenant votre code de référence a été envoyé à votre adresse courriel pour vos dossiers.
            </div>
          </div>

          <Button
            className="w-full py-3.5 rounded-xl bg-[#E86225] hover:bg-[#D0521B] text-white font-bold text-sm shadow-md"
            onClick={() => {
              setSuccess(false);
              setCheckout(false);
            }}
          >
            Retour au tableau de bord
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FDFBF7] py-16 md:py-24 font-body">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatePresence mode="wait">
            {!checkout ? (
              <motion.div key="plans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-16">
                  <div className="text-[#E86225] text-xs font-extrabold tracking-widest uppercase mb-2">Formules claires</div>
                  <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-[#2C1810]">Choisissez votre formule de sorties.</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto items-center">
                  {plans.map((p, idx) => {
                    const isFeatured = p.id === 'leader' || idx === 1;
                    return (
                      <Card
                        key={p.id}
                        className={cn(
                          'p-8 rounded-3xl cursor-pointer transition-all',
                          isFeatured
                            ? 'bg-white border-2 border-[#E86225] shadow-xl scale-100 md:scale-105 z-10'
                            : selected === p.id
                            ? 'bg-white border-2 border-[#1E4D2B] shadow-sm'
                            : 'bg-[#FAF6F0] border border-[#EFE6DD] hover:border-[#E86225]/40 shadow-sm'
                        )}
                        onClick={() => setSelected(p.id)}
                      >
                        {p.tag && (
                          <div
                            className={cn(
                              'text-[10px] font-extrabold uppercase tracking-widest mb-3',
                              isFeatured ? 'text-[#E86225]' : 'text-[#52433B]'
                            )}
                          >
                            {p.tag}
                          </div>
                        )}
                        <h3 className="text-2xl font-bold mb-2 text-[#2C1810]">
                          {p.label}
                        </h3>
                        <div className="flex items-end gap-1 mb-8">
                          <span className="text-4xl font-extrabold text-[#2C1810]">
                            {p.price}
                          </span>
                          {p.period && (
                            <span className="text-xs mb-1 text-[#52433B]">
                              {p.period}
                            </span>
                          )}
                        </div>
                        <ul className="space-y-4 mb-8">
                          {p.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-3 text-xs text-[#52433B]">
                              <Check size={16} className={isFeatured ? 'text-[#E86225]' : 'text-[#1E4D2B]'} /> {f}
                            </li>
                          ))}
                        </ul>
                        <Button
                          className={cn(
                            'w-full py-3.5 rounded-xl font-bold transition-all text-xs',
                            isFeatured
                              ? 'bg-[#E86225] text-white hover:bg-[#D0521B] shadow-md'
                              : selected === p.id
                              ? 'bg-[#1E4D2B] text-white hover:bg-[#163E22]'
                              : 'border border-[#2C1810] text-[#2C1810] hover:bg-[#FAF5EF]'
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (p.price === 'Gratuit' || p.price === 'Free') {
                              setSelected(p.id);
                            } else {
                              setSelected(p.id);
                              setCheckout(true);
                            }
                          }}
                        >
                          {p.price === 'Gratuit' || p.price === 'Free' ? (selected === p.id ? 'Forfait actuel' : 'Sélectionner Gratuit') : `Choisir la formule ${p.label}`}
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div key="checkout" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <PaymentModal plan={selectedPlan} onBack={() => setCheckout(false)} onSuccess={() => setSuccess(true)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
export default Subscription;
