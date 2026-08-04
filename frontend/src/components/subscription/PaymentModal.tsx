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
  ArrowLeft,
  Fingerprint,
  CheckCircle2,
  Lock,
  X,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '../../store/useToastStore';
import { cn } from '../../lib/utils';

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
  const [activeWallet, setActiveWallet] = useState<'apple' | 'google' | null>(null);
  const [isWalletProcessing, setIsWalletProcessing] = useState(false);

  const availableWalletCards = [
    { id: 'card-1', name: 'TD Mastercard', number: '•••• 8912', type: 'MC', badgeBg: 'bg-blue-600' },
    { id: 'card-2', name: 'RBC Visa Infinite', number: '•••• 4829', type: 'VISA', badgeBg: 'bg-slate-900' },
    { id: 'card-3', name: 'Scotiabank Passport', number: '•••• 3012', type: 'VISA', badgeBg: 'bg-red-600' },
    { id: 'card-4', name: 'CIBC Dividend Visa', number: '•••• 5541', type: 'VISA', badgeBg: 'bg-emerald-700' }
  ];

  const [selectedWalletCard, setSelectedWalletCard] = useState(availableWalletCards[0]);
  const [showCardSelector, setShowCardSelector] = useState(false);
  
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

                  {/* Strict Minimum Due Amount Badge */}
                  <div className="flex items-center justify-between p-3 bg-red-50/70 border border-red-200/80 rounded-xl">
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-bold text-red-600 uppercase tracking-wider">Strict Required Amount</div>
                      <div className="font-extrabold text-sm sm:text-base text-red-950">{currencyAmountCAD}</div>
                    </div>
                    <span className="text-[10px] font-extrabold bg-red-100 text-red-800 px-2.5 py-1 rounded-full border border-red-200 shrink-0">
                      Underpayments Rejected 🔒
                    </span>
                  </div>

                  {/* Recipient Email */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-white border border-gray-200 rounded-xl">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase">Recipient Email</div>
                      <div className="font-mono font-bold text-xs sm:text-sm text-[#2D2159] break-all">payment@newvillages.ca</div>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="h-8 sm:h-9 px-3 text-xs gap-1.5 font-bold border-gray-200 w-full sm:w-auto justify-center"
                      onClick={() => handleCopy('payment@newvillages.ca', 'email')}
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
                {/* Feature Flag: Set to true to enable Express Apple Pay & Google Pay */}
                {false as boolean && (
                  <>
                    {/* Express Digital Wallets (Apple Pay & Google Pay) */}
                    <div className="space-y-3">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 text-center">Express Wallet Checkout</div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* Apple Pay Button */}
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => setActiveWallet('apple')}
                          className="w-full py-3.5 px-4 rounded-xl bg-black hover:bg-gray-900 text-white font-medium flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          <span className="text-xs font-semibold">Pay with</span>
                          <span className="text-base font-extrabold tracking-tight">Pay</span>
                        </button>

                        {/* Google Pay Button */}
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => setActiveWallet('google')}
                          className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-medium flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          <span className="text-xs font-semibold">Pay with</span>
                          <span className="text-base font-extrabold tracking-tight flex items-center gap-0.5">
                            <span className="text-blue-500">G</span>
                            <span className="text-red-500">o</span>
                            <span className="text-yellow-500">o</span>
                            <span className="text-blue-500">g</span>
                            <span className="text-green-500">l</span>
                            <span className="text-red-500">e</span>
                            <span className="ml-1 text-gray-800">Pay</span>
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="relative flex items-center justify-center my-2">
                      <div className="border-t border-gray-200 w-full" />
                      <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 shrink-0">
                        Or pay with credit / debit card
                      </span>
                    </div>
                  </>
                )}

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

      {/* Apple Pay & Google Pay Express Wallet Authorization Sheet */}
      <AnimatePresence>
        {activeWallet && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 120 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 120 }}
              className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden text-gray-900 border border-gray-100"
            >
              {/* Wallet Sheet Header */}
              <div className={cn(
                "p-5 text-white flex justify-between items-center",
                activeWallet === 'apple' ? "bg-black" : "bg-[#1A73E8]"
              )}>
                <div className="flex items-center gap-2">
                  {activeWallet === 'apple' ? (
                    <span className="text-xl font-extrabold tracking-tight">Pay</span>
                  ) : (
                    <span className="text-xl font-extrabold tracking-tight flex items-center gap-0.5">
                      <span>Google Pay</span>
                    </span>
                  )}
                  <span className="text-xs opacity-80 font-medium ml-2 border-l border-white/20 pl-2">Payment Authorization</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveWallet(null)}
                  disabled={isWalletProcessing}
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Sheet Body */}
              <div className="p-6 space-y-5">
                {/* Payee Info */}
                <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Merchant</div>
                    <div className="font-extrabold text-gray-900 text-base">NewVillages Canada Inc.</div>
                    <div className="text-xs text-gray-500 font-medium">{plan.label} Plan</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Amount</div>
                    <div className="text-2xl font-black text-[#2D2159]">{currencyAmountCAD}</div>
                  </div>
                </div>

                {/* Selected Wallet Card */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Payment Instrument</div>
                    <button
                      type="button"
                      onClick={() => setShowCardSelector(!showCardSelector)}
                      className="text-xs font-bold text-[#1A73E8] hover:underline flex items-center gap-1"
                    >
                      <span>{showCardSelector ? 'Close' : 'Change Card'}</span>
                      <ChevronDown size={14} className={cn("transition-transform", showCardSelector && "rotate-180")} />
                    </button>
                  </div>

                  {/* Main Active Card Box */}
                  <div 
                    onClick={() => setShowCardSelector(!showCardSelector)}
                    className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-7 rounded-md flex items-center justify-center font-black text-[11px] text-white tracking-wider shadow-xs",
                        selectedWalletCard.badgeBg
                      )}>
                        {selectedWalletCard.type}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-gray-900">
                          {selectedWalletCard.name} ({selectedWalletCard.number})
                        </div>
                        <div className="text-[11px] text-gray-500">Selected Wallet Payment Method</div>
                      </div>
                    </div>
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  </div>

                  {/* Dropdown Card List */}
                  <AnimatePresence>
                    {showCardSelector && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="bg-white rounded-xl border border-gray-200 shadow-lg p-2 space-y-1 mt-2"
                      >
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">
                          Select from your saved cards
                        </div>
                        {availableWalletCards.map((card) => (
                          <button
                            key={card.id}
                            type="button"
                            onClick={() => {
                              setSelectedWalletCard(card);
                              setShowCardSelector(false);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors text-xs font-semibold",
                              selectedWalletCard.id === card.id ? "bg-blue-50 text-[#1A73E8]" : "hover:bg-gray-50 text-gray-700"
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className={cn("px-2 py-0.5 rounded text-[10px] font-black text-white", card.badgeBg)}>
                                {card.type}
                              </span>
                              <span>{card.name} ({card.number})</span>
                            </div>
                            {selectedWalletCard.id === card.id && <CheckCircle2 size={16} className="text-[#1A73E8]" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Biometric Prompt */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <Fingerprint size={22} className="animate-pulse text-sky-400" />
                  </div>
                  <div className="text-xs text-gray-600 leading-relaxed font-medium">
                    {activeWallet === 'apple' 
                      ? 'Double-click side button to confirm payment using Face ID or Touch ID.'
                      : 'Confirm payment using Google Biometric Authentication or Device PIN.'
                    }
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <Button
                    type="button"
                    disabled={isWalletProcessing}
                    onClick={() => {
                      setIsWalletProcessing(true);
                      setTimeout(() => {
                        setIsWalletProcessing(false);
                        setActiveWallet(null);
                        onSuccess();
                      }, 1200);
                    }}
                    className={cn(
                      "w-full py-6 rounded-full font-bold text-base shadow-xl transition-all flex items-center justify-center gap-2",
                      activeWallet === 'apple' ? "bg-black hover:bg-gray-900 text-white" : "bg-[#1A73E8] hover:bg-[#1557B0] text-white"
                    )}
                  >
                    {isWalletProcessing ? (
                      <span className="flex items-center gap-2">
                        <Lock size={16} className="animate-spin" /> Authorizing Payment...
                      </span>
                    ) : (
                      <>
                        <Lock size={16} />
                        <span>Confirm &amp; Pay {currencyAmountCAD}</span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isWalletProcessing}
                    onClick={() => setActiveWallet(null)}
                    className="w-full py-3 text-xs font-semibold text-gray-500 hover:text-gray-900"
                  >
                    Cancel Payment
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
