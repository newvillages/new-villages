import React, { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Check, 
  Copy, 
  Send, 
  ShieldCheck, 
  Building2, 
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '../../store/useToastStore';
import { api } from '../../lib/apiClient';

export interface Plan {
  id: string;
  label: string;
  price: string;
  period: string;
  features: string[];
}

interface PaymentModalProps {
  plan: Plan;
  onBack?: () => void;
  onSuccess: (memoCode?: string) => void;
  communityId?: string;
  communityName?: string;
  isGroupJoin?: boolean;
}

export function PaymentModal({ 
  plan, 
  onBack, 
  onSuccess,
  communityId,
  communityName,
  isGroupJoin = false,
}: PaymentModalProps) {
  // Unique auto-generated reference code for Canadian Interac e-Transfer
  const memoCode = React.useMemo(() => {
    const random = Math.floor(1000 + Math.random() * 9000);
    if (isGroupJoin) {
      return `BA-JOIN-${random}`;
    }
    return `BA-${plan.id.toUpperCase()}-${random}`;
  }, [plan.id, isGroupJoin]);

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);

  // Terms acceptance & Form states
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const INTERAC_EMAIL = 'bouffe@newvillages.ca';

  const handleCopy = (text: string, type: 'email' | 'memo') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
      toast.success('Courriel copié ! Quittez cette page pour faire le virement dans votre banque.');
    } else {
      setCopiedMemo(true);
      setTimeout(() => setCopiedMemo(false), 2500);
      toast.success('Code de référence mémoire copié !');
    }
  };

  const numericPrice = plan.price.replace('$', '').replace(' ', '').trim();
  const parsedPriceNumber = Number(numericPrice) || 20;
  const currencyAmountCAD = `${numericPrice},00 $ CAD`;

  const handleInteracSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/api/subscriptions/interac/initiate', {
        plan: isGroupJoin ? 'GROUP_JOIN' : plan.id.toUpperCase(),
        amount: parsedPriceNumber,
        communityId: communityId || undefined,
        communityName: communityName || plan.label,
      });
    } catch (err) {
      // Gracefully continue even if session is in registration transition
      console.warn('Interac initiate log:', err);
    } finally {
      setIsSubmitting(false);
      onSuccess(memoCode);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-2 font-body">
      {onBack && (
        <Button 
          variant="ghost" 
          className="mb-4 hover:bg-transparent px-0 font-bold text-[#E86225]" 
          onClick={onBack}
        >
          <ArrowLeft size={16} className="mr-2" /> {isGroupJoin ? 'Annuler' : 'Retour aux forfaits'}
        </Button>
      )}

      <Card className="rounded-2xl sm:rounded-3xl border-[#EFE6DD] shadow-2xl overflow-hidden bg-white">
        {/* Header Banner */}
        <div className="bg-[#133820] text-white p-5 sm:p-7 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#E86225]/20 rounded-full blur-2xl" />
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-3">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-100 tracking-wide mb-2">
                <span>🇨🇦</span> Virement Interac direct
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-white">
                {isGroupJoin ? `Adhésion au groupe` : plan.label}
              </h2>
              {isGroupJoin && communityName && (
                <p className="text-sm font-semibold text-emerald-200 mt-1">{communityName}</p>
              )}
            </div>
            <div className="text-left sm:text-right">
              <div className="text-2xl sm:text-4xl font-black text-white">{currencyAmountCAD}</div>
              <div className="text-xs text-emerald-200">
                {isGroupJoin ? 'Paiement unique • Validation admin' : plan.period}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4 sm:p-7 space-y-5 sm:space-y-6">
          {/* USER SPECIFIED NOTICE: Paiement par Virement Interac seulement */}
          <motion.div 
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#FFF8F3] border-2 border-[#E86225] rounded-2xl p-4 sm:p-5 shadow-sm"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#E86225] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <Send size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-[#2C1810] text-base sm:text-lg leading-snug">
                  Paiement par Virement Interac seulement
                </h3>
                <p className="text-xs sm:text-sm font-bold text-[#E86225] mt-1 leading-relaxed">
                  Copiez l’adresse courriel ci-dessous, puis quittez cette page pour effectuer le paiement dans votre compte bancaire.
                </p>
              </div>
            </div>
          </motion.div>

          {/* 3 Step Process Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-[#FAF5EF] border border-[#EFE6DD] p-3 rounded-xl">
              <div className="font-black text-[#E86225] text-[10px] uppercase tracking-wider mb-1">Étape 1</div>
              <div className="text-[#2C1810] font-semibold">Copiez le courriel ci-dessous</div>
            </div>
            <div className="bg-[#FAF5EF] border border-[#EFE6DD] p-3 rounded-xl">
              <div className="font-black text-[#E86225] text-[10px] uppercase tracking-wider mb-1">Étape 2</div>
              <div className="text-[#2C1810] font-semibold">Faites le virement dans votre banque</div>
            </div>
            <div className="bg-[#FAF5EF] border border-[#EFE6DD] p-3 rounded-xl">
              <div className="font-black text-[#E86225] text-[10px] uppercase tracking-wider mb-1">Étape 3</div>
              <div className="text-[#2C1810] font-semibold">Revenez confirmer ci-dessous</div>
            </div>
          </div>

          {/* Transfer Details Card */}
          <div className="bg-[#FAF6F0] border border-[#EFE6DD] rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#1E4D2B]">
              Coordonnées de virement Interac
            </div>

            {/* Recipient Email (Highlighted & Big Copy Button) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3.5 bg-white border-2 border-[#E86225]/40 rounded-xl shadow-sm">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] sm:text-[11px] font-bold text-[#E86225] uppercase tracking-wider">
                  Courriel du destinataire (Auto-Dépôt)
                </div>
                <div className="font-mono font-black text-sm sm:text-base text-[#133820] break-all select-all">
                  {INTERAC_EMAIL}
                </div>
              </div>
              <Button 
                type="button" 
                variant="primary" 
                size="sm" 
                className={`h-9 px-4 text-xs gap-1.5 font-bold text-white w-full sm:w-auto justify-center shadow transition-all ${
                  copiedEmail ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#E86225] hover:bg-[#D0521B]'
                }`}
                onClick={() => handleCopy(INTERAC_EMAIL, 'email')}
              >
                {copiedEmail ? <Check size={14} className="text-white" /> : <Copy size={14} />}
                {copiedEmail ? 'Courriel copié !' : 'Copier le courriel'}
              </Button>
            </div>

            {/* Strict Amount */}
            <div className="flex items-center justify-between p-3 bg-white border border-[#EFE6DD] rounded-xl">
              <div>
                <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase">Montant exact à envoyer</div>
                <div className="font-extrabold text-sm sm:text-base text-[#2C1810]">{currencyAmountCAD}</div>
              </div>
              <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200 shrink-0">
                Montant unique 🔒
              </span>
            </div>

            {/* Recipient Name */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 p-3 bg-white border border-[#EFE6DD] rounded-xl">
              <div>
                <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase">Nom du destinataire</div>
                <div className="font-bold text-xs sm:text-sm text-[#2C1810] flex items-center gap-1.5">
                  <Building2 size={14} className="text-[#1E4D2B] shrink-0" /> Bouffe &amp; Amitié Inc.
                </div>
              </div>
            </div>

            {/* Reference Memo Code */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-[#FDF0E9] border border-[#E86225]/30 rounded-xl">
              <div>
                <div className="text-[10px] sm:text-[11px] font-bold text-[#E86225] uppercase">
                  N° de référence mémoire (à indiquer dans le virement)
                </div>
                <div className="font-mono font-extrabold text-sm sm:text-base text-[#2C1810] tracking-wider">
                  {memoCode}
                </div>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="h-8 sm:h-9 px-3 text-xs gap-1.5 font-bold border-[#E86225]/40 bg-white text-[#E86225] hover:bg-[#FDF0E9] w-full sm:w-auto justify-center"
                onClick={() => handleCopy(memoCode, 'memo')}
              >
                {copiedMemo ? <Check size={14} className="text-[#1E4D2B]" /> : <Copy size={14} />}
                {copiedMemo ? 'Copié' : 'Copier le code'}
              </Button>
            </div>

            {/* Auto-Deposit Banner */}
            <div className="flex items-center gap-2 text-xs text-[#1E4D2B] bg-[#E8F3EB] p-3 rounded-xl border border-[#1E4D2B]/20">
              <ShieldCheck size={16} className="flex-shrink-0 text-[#1E4D2B]" />
              <span><strong>Dépôt automatique activé</strong> : Aucune question secrète ni mot de passe n'est requis par votre banque.</span>
            </div>
          </div>

          {/* Conditions d'adhésion Checkbox */}
          <div className="bg-[#FAF5EF] border border-[#EFE6DD] rounded-2xl p-4 sm:p-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-slate-300 text-[#E86225] focus:ring-[#E86225]"
              />
              <div className="text-xs text-[#2C1810] leading-relaxed">
                {isGroupJoin ? (
                  <>
                    <strong>J'ai lu et j'accepte les Conditions d'adhésion et la Politique de confidentialité de Bouffe &amp; Amitié.</strong> Je confirme que j'effectue le virement Interac de 20 $ CAD pour adhérer à ce groupe, que mon adhésion sera validée dès réception par l'administration, et que mes repas et consommations restent à ma charge lors des sorties au restaurant.
                  </>
                ) : (
                  <>
                    <strong>J'ai lu et j'accepte les Conditions d'adhésion et la Politique de confidentialité de Bouffe &amp; Amitié.</strong> Je confirme que j'effectue le virement Interac de {currencyAmountCAD} pour ma formule, transmis à l'administration pour validation et activation.
                  </>
                )}
              </div>
            </label>
          </div>

          {/* Form to submit notification */}
          <form onSubmit={handleInteracSubmit} className="space-y-3">
            <Button 
              type="submit" 
              disabled={!termsAccepted || isSubmitting}
              className={`w-full py-6 rounded-full font-bold text-base shadow-lg transition-all ${
                termsAccepted ? 'bg-[#E86225] hover:bg-[#D0521B] text-white cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Enregistrement de la demande…' : `J'ai effectué mon virement (${currencyAmountCAD})`}
            </Button>
            <p className="text-center text-[11px] text-[#52433B] flex items-center justify-center gap-1">
              <AlertCircle size={13} className="text-[#E86225] shrink-0" />
              <span>Cliquez ci-dessus une fois que vous avez envoyé le virement depuis votre compte bancaire.</span>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentModal;
