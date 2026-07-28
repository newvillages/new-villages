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

export interface Plan {
  id: string;
  label: string;
  price: string;
  period: string;
  features: string[];
}

interface PaymentModalProps {
  plan: Plan;
  onBack: () => void;
  onSuccess: () => void;
}

export function PaymentModal({ plan, onBack, onSuccess }: PaymentModalProps) {
  const [method, setMethod] = useState<'interac' | 'card'>('interac');
  
  // Unique auto-generated reference code for Canadian Interac e-Transfer
  const memoCode = React.useMemo(() => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `NV-${plan.id.toUpperCase()}-${random}`;
  }, [plan.id]);

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);

  // Form states
  const [interacEmail, setInteracEmail] = useState('');
  const [interacSenderName, setInteracSenderName] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = (text: string, type: 'email' | 'memo') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
      toast.success('Recipient email copied to clipboard!');
    } else {
      setCopiedMemo(true);
      setTimeout(() => setCopiedMemo(false), 2000);
      toast.success('Memo reference code copied!');
    }
  };

  const handleInteracSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
    }, 1000);
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
    }, 1200);
  };

  const numericPrice = plan.price.replace('$', '');
  const currencyAmountCAD = `$${numericPrice}.00 CAD`;

  return (
    <div className="max-w-xl mx-auto py-4">
      <Button 
        variant="ghost" 
        className="mb-6 hover:bg-transparent px-0 font-semibold text-[#2D2159]" 
        onClick={onBack}
      >
        <ArrowLeft size={16} className="mr-2" /> Back to Plans
      </Button>

      <Card className="rounded-2xl sm:rounded-3xl border-gray-100 shadow-2xl overflow-hidden bg-white">
        {/* Header Badge */}
        <div className="bg-[#2D2159] text-white p-5 sm:p-8 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary-200 tracking-wide mb-2">
                <span>🇨🇦</span> Canadian Payment Options
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold font-heading text-white">{plan.label}</h2>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-2xl sm:text-4xl font-black text-white">{currencyAmountCAD}</div>
              <div className="text-xs text-primary-200">{plan.period}</div>
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
              onTouchEnd={(e) => {
                e.stopPropagation();
                setMethod('interac');
              }}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer touch-manipulation select-none active:scale-95 ${
                method === 'interac'
                  ? 'bg-white text-[#2D2159] shadow-lg scale-[1.02]'
                  : 'text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20'
              }`}
            >
              <Send size={15} className={method === 'interac' ? 'text-amber-600' : ''} />
              <span>Interac e-Transfer</span>
              <span className="hidden sm:inline-block bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-extrabold ml-1">FREE</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMethod('card');
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                setMethod('card');
              }}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer touch-manipulation select-none active:scale-95 ${
                method === 'card'
                  ? 'bg-white text-[#2D2159] shadow-lg scale-[1.02]'
                  : 'text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20'
              }`}
            >
              <CreditCard size={15} className={method === 'card' ? 'text-primary' : ''} />
              <span>Card / Wallet</span>
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
                {/* Interac Highlight Box */}
                <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4 sm:p-5">
                  <div className="flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                      <Send size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-950 text-sm sm:text-base">Direct Bank Transfer (Zero Fee)</h4>
                      <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                        Send payment directly from your Canadian online banking app (TD, RBC, Scotiabank, BMO, CIBC, Desjardins, etc.).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transfer Details Card */}
                <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 sm:p-5 space-y-3.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">e-Transfer Instructions</div>

                  {/* Recipient Email */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-white border border-gray-200 rounded-xl">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase">Recipient Email</div>
                      <div className="font-mono font-bold text-xs sm:text-sm text-[#2D2159] break-all">payments@newvillages.ca</div>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="h-8 sm:h-9 px-3 text-xs gap-1.5 font-bold border-gray-200 w-full sm:w-auto justify-center"
                      onClick={() => handleCopy('payments@newvillages.ca', 'email')}
                    >
                      {copiedEmail ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      {copiedEmail ? 'Copied' : 'Copy'}
                    </Button>
                  </div>

                  {/* Recipient Name */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 p-3 bg-white border border-gray-200 rounded-xl">
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase">Recipient Name</div>
                      <div className="font-bold text-xs sm:text-sm text-gray-800 flex items-center gap-1.5">
                        <Building2 size={14} className="text-gray-500 shrink-0" /> NewVillages Canada Inc.
                      </div>
                    </div>
                  </div>

                  {/* Reference Memo Code */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-indigo-50/80 border border-indigo-200/80 rounded-xl">
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-semibold text-indigo-600 uppercase">Required Message / Memo Code</div>
                      <div className="font-mono font-extrabold text-sm sm:text-base text-[#2D2159] tracking-wider">{memoCode}</div>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="h-8 sm:h-9 px-3 text-xs gap-1.5 font-bold border-indigo-200 bg-white text-indigo-900 hover:bg-indigo-50 w-full sm:w-auto justify-center"
                      onClick={() => handleCopy(memoCode, 'memo')}
                    >
                      {copiedMemo ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      {copiedMemo ? 'Copied' : 'Copy Memo'}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    <ShieldCheck size={16} className="flex-shrink-0" />
                    <span><strong>Auto-Deposit is ON</strong>: You do not need a secret question or answer.</span>
                  </div>
                </div>

                {/* Form to submit notification */}
                <form onSubmit={handleInteracSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Your Banking Email Address</label>
                    <Input 
                      type="email" 
                      placeholder="you@domain.ca" 
                      value={interacEmail}
                      onChange={(e) => setInteracEmail(e.target.value)}
                      className="bg-gray-50 border-gray-200 rounded-xl py-4" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Account Holder Name (Optional)</label>
                    <Input 
                      type="text" 
                      placeholder="Jane Doe" 
                      value={interacSenderName}
                      onChange={(e) => setInteracSenderName(e.target.value)}
                      className="bg-gray-50 border-gray-200 rounded-xl py-4" 
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-6 rounded-full bg-[#2D2159] hover:bg-[#3F2A78] text-white font-bold text-base shadow-lg shadow-[#2D2159]/20"
                  >
                    {isSubmitting ? 'Verifying Transfer...' : `Confirm e-Transfer Sent (${currencyAmountCAD})`}
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
                    <label className="block text-xs font-bold text-gray-700 mb-1">Cardholder Name</label>
                    <Input 
                      placeholder="Jane Doe" 
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="bg-gray-50 border-gray-200 rounded-xl py-4" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Card Number</label>
                    <Input 
                      placeholder="4242 4242 4242 4242" 
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="bg-gray-50 border-gray-200 rounded-xl py-4" 
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Expiry Date</label>
                      <Input 
                        placeholder="MM/YY" 
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="bg-gray-50 border-gray-200 rounded-xl py-4" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">CVC Code</label>
                      <Input 
                        placeholder="•••" 
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="bg-gray-50 border-gray-200 rounded-xl py-4" 
                        required 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Canadian Postal Code</label>
                    <Input 
                      placeholder="M5V 2T6" 
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="bg-gray-50 border-gray-200 rounded-xl py-4 uppercase" 
                      required 
                    />
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200/70 rounded-xl p-3">
                    <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
                    <span>Secured with 256-bit SSL encryption. Accepts Visa, Mastercard & AMEX.</span>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-6 rounded-full bg-[#2D2159] hover:bg-[#3F2A78] text-white font-bold text-base shadow-lg shadow-[#2D2159]/20"
                  >
                    {isSubmitting ? 'Processing Card...' : `Pay ${currencyAmountCAD}`}
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
