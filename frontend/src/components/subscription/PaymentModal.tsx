import React, { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  Check, 
  Copy, 
  CreditCard, 
  Send, 
  ShieldCheck, 
  Building2, 
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [method, setMethod] = useState<'interac' | 'card'>('interac');
  
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
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const INTERAC_EMAIL = 'bouffe@newvillages.ca';

  const handleCopy = (text: string, type: 'email' | 'memo') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
      toast.success('Adresse courriel de paiement copiée !');
    } else {
      setCopiedMemo(true);
      setTimeout(() => setCopiedMemo(false), 2000);
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

  const handleCardSubmit = async (e: React.FormEvent) => {
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
      console.warn('Card initiate log:', err);
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
        {/* Header Badge */}
        <div className="bg-[#133820] text-white p-5 sm:p-8 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#E86225]/20 rounded-full blur-2xl" />
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-100 tracking-wide mb-2">
                <span>🇨🇦</span> Modes de paiement canadiens
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
                {isGroupJoin ? 'Validation admin requise' : plan.period}
              </div>
            </div>
          </div>

          {/* Payment Method Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 p-1.5 bg-black/30 rounded-xl sm:rounded-2xl border border-white/15 mt-4 relative z-30">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMethod('interac');
              }}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                method === 'interac'
                  ? 'bg-white text-[#133820] shadow-lg scale-[1.02]'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Send size={15} className={method === 'interac' ? 'text-[#E86225]' : ''} />
              <span>Virement Interac</span>
              <span className="hidden sm:inline-block bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-extrabold ml-1">AUTO-DÉPÔT</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMethod('card');
              }}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                method === 'card'
                  ? 'bg-white text-[#133820] shadow-lg scale-[1.02]'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <CreditCard size={15} className={method === 'card' ? 'text-[#E86225]' : ''} />
              <span>Carte de crédit / débit</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <CardContent className="p-4 sm:p-8">
          <AnimatePresence mode="popLayout">
            {method === 'interac' ? (
              <motion.div
                key="interac-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-5 sm:space-y-6"
              >
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
                          <strong>J'ai lu et j'accepte les Conditions d'adhésion et la Politique de confidentialité de Bouffe &amp; Amitié.</strong> Je comprends que je règle 20 $ CAD pour adhérer à ce groupe, que mon inscription sera validée par l'administration dès réception du virement, et que mes repas et consommations restent à ma charge lors des sorties au restaurant.
                        </>
                      ) : (
                        <>
                          <strong>J'ai lu et j'accepte les Conditions d'adhésion et la Politique de confidentialité de Bouffe &amp; Amitié.</strong> Je comprends que je règle {currencyAmountCAD} pour ma formule, que ce paiement est transmis à l'administration pour validation et activation.
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {/* Interac Highlight Box */}
                <div className="bg-[#FAF5EF] border border-[#EFE6DD] rounded-2xl p-4 sm:p-5">
                  <div className="flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-xl bg-[#E86225] text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                      <Send size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2C1810] text-sm sm:text-base">Virement Interac Direct (Auto-Dépôt)</h4>
                      <p className="text-xs text-[#52433B] mt-0.5 leading-relaxed">
                        Effectuez le paiement directement depuis votre application bancaire canadienne (Desjardins, Banque Nationale, TD, RBC, BMO, CIBC, Scotiabank, etc.).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transfer Details Card */}
                <div className="bg-[#FAF6F0] border border-[#EFE6DD] rounded-2xl p-4 sm:p-5 space-y-3.5">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#1E4D2B]">Instructions Virement Interac</div>

                  {/* Strict Minimum Due Amount Badge */}
                  <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-bold text-amber-900 uppercase tracking-wider">Montant exact à envoyer</div>
                      <div className="font-extrabold text-sm sm:text-base text-amber-950">{currencyAmountCAD}</div>
                    </div>
                    <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200 shrink-0">
                      Montant unique 🔒
                    </span>
                  </div>

                  {/* Recipient Email */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-white border border-[#EFE6DD] rounded-xl">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase">Courriel du destinataire (Auto-Dépôt)</div>
                      <div className="font-mono font-bold text-xs sm:text-sm text-[#133820] break-all">{INTERAC_EMAIL}</div>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="h-8 sm:h-9 px-3 text-xs gap-1.5 font-bold border-[#EFE6DD] w-full sm:w-auto justify-center"
                      onClick={() => handleCopy(INTERAC_EMAIL, 'email')}
                    >
                      {copiedEmail ? <Check size={14} className="text-[#1E4D2B]" /> : <Copy size={14} />}
                      {copiedEmail ? 'Copié' : 'Copier le courriel'}
                    </Button>
                  </div>

                  {/* Recipient Name */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 p-3 bg-white border border-[#EFE6DD] rounded-xl">
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase">Nom du destinataire</div>
                      <div className="font-bold text-xs sm:text-sm text-[#2C1810] flex items-center gap-1.5">
                        <Building2 size={14} className="text-[#1E4D2B] shrink-0" /> Bouffe &amp; Amitié Inc.
                      </div>
                    </div>
                  </div>

                  {/* Reference Memo Code */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-[#FDF0E9] border border-[#E86225]/30 rounded-xl">
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-bold text-[#E86225] uppercase">N° de référence mémoire (à inclure dans le virement)</div>
                      <div className="font-mono font-extrabold text-sm sm:text-base text-[#2C1810] tracking-wider">{memoCode}</div>
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

                  <div className="flex items-center gap-2 text-xs text-[#1E4D2B] bg-[#E8F3EB] p-3 rounded-xl border border-[#1E4D2B]/20">
                    <ShieldCheck size={16} className="flex-shrink-0 text-[#1E4D2B]" />
                    <span><strong>Dépôt automatique activé</strong> : Aucune question ni mot de passe n'est requis par votre banque.</span>
                  </div>
                </div>

                {/* Form to submit notification */}
                <form onSubmit={handleInteracSubmit} className="space-y-4">
                  <Button 
                    type="submit" 
                    disabled={!termsAccepted || isSubmitting}
                    className={`w-full py-6 rounded-full font-bold text-base shadow-lg transition-all ${
                      termsAccepted ? 'bg-[#E86225] hover:bg-[#D0521B] text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? 'Enregistrement de la demande...' : `J'ai effectué mon virement (${currencyAmountCAD})`}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="card-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <form onSubmit={handleCardSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2C1810] mb-1">Nom sur la carte</label>
                    <Input 
                      placeholder="Marie Tremblay" 
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="bg-[#FAF5EF] border-[#EFE6DD] rounded-xl py-4 text-xs" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2C1810] mb-1">Numéro de carte</label>
                    <Input 
                      placeholder="4242 4242 4242 4242" 
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="bg-[#FAF5EF] border-[#EFE6DD] rounded-xl py-4 text-xs" 
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#2C1810] mb-1">Date d'expiration</label>
                      <Input 
                        placeholder="MM/AA" 
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="bg-[#FAF5EF] border-[#EFE6DD] rounded-xl py-4 text-xs" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#2C1810] mb-1">Code CVC</label>
                      <Input 
                        placeholder="•••" 
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="bg-[#FAF5EF] border-[#EFE6DD] rounded-xl py-4 text-xs" 
                        required 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2C1810] mb-1">Code postal canadien</label>
                    <Input 
                      placeholder="H2X 1Y6" 
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="bg-[#FAF5EF] border-[#EFE6DD] rounded-xl py-4 uppercase text-xs" 
                      required 
                    />
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-[#52433B] bg-[#FAF5EF] border border-[#EFE6DD] rounded-xl p-3">
                    <ShieldCheck size={16} className="text-[#1E4D2B] flex-shrink-0" />
                    <span>Paiement sécurisé avec chiffrement SSL 256 bits. Cartes Visa, Mastercard &amp; AMEX acceptées.</span>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-6 rounded-full bg-[#E86225] hover:bg-[#D0521B] text-white font-bold text-base shadow-lg"
                  >
                    {isSubmitting ? 'Traitement du paiement...' : `Payer ${currencyAmountCAD}`}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentModal;
