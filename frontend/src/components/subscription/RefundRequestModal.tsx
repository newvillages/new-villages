import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useSubmitRefundRequest } from '../../hooks/useAdmin';
import { toast } from '../../store/useToastStore';
import { ApiError } from '../../lib/apiClient';
import { AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';

interface RefundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: number;
  defaultReason?: string;
  defaultDetails?: string;
  title?: string;
  onSuccess?: () => void;
}

export function RefundRequestModal({
  isOpen,
  onClose,
  defaultAmount,
  defaultReason = '',
  defaultDetails = '',
  title = 'Demande de remboursement',
  onSuccess,
}: RefundRequestModalProps) {
  const [amount, setAmount] = useState<string>(defaultAmount ? defaultAmount.toFixed(2) : '20.00');
  const [reason, setReason] = useState<string>(defaultReason);
  const [details, setDetails] = useState<string>(defaultDetails);
  const [error, setError] = useState<string | null>(null);

  const submitMutation = useSubmitRefundRequest();

  React.useEffect(() => {
    if (isOpen) {
      if (defaultAmount) setAmount(defaultAmount.toFixed(2));
      if (defaultReason) setReason(defaultReason);
      if (defaultDetails) setDetails(defaultDetails);
      setError(null);
    }
  }, [isOpen, defaultAmount, defaultReason, defaultDetails]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Veuillez spécifier un montant valide supérieur à 0.');
      return;
    }

    if (!reason.trim()) {
      setError('Veuillez préciser le motif de votre demande de remboursement.');
      return;
    }

    submitMutation.mutate(
      {
        amount: parsedAmount,
        reason: reason.trim(),
        details: details.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Demande de remboursement transmise aux administrateurs !');
          onSuccess?.();
          onClose();
        },
        onError: (err) => {
          setError(err instanceof ApiError ? err.message : 'Une erreur est survenue lors de la soumission.');
        },
      }
    );
  };

  const PRESET_REASONS = [
    'Adhésion de groupe (20 $ CAD)',
    'Double paiement ou virement excédentaire',
    'Changement d’avis avant confirmation',
    'Annulation de forfait organisateur',
    'Autre motif',
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4 font-body">
        <div className="bg-[#FAF5EF] border border-[#EFE6DD] rounded-2xl p-4 text-xs text-[#52433B] flex items-start gap-3">
          <ShieldCheck size={18} className="text-[#E86225] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Toute demande de remboursement est traitée individuellement par l'administration de Bouffe &amp; Amitié. Une fois validée, les fonds sont retournés par virement bancaire / Interac.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-3 py-2.5 rounded-xl flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Montant */}
        <div>
          <label className="block text-xs font-bold text-[#2C1810] mb-1">
            Montant réclamé ($ CAD) *
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white border border-[#EFE6DD] rounded-xl pl-8 pr-3 py-2.5 text-xs font-semibold text-[#2C1810] focus:ring-2 focus:ring-[#E86225] focus:outline-none"
              placeholder="20.00"
            />
            <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">$</span>
          </div>
        </div>

        {/* Motif */}
        <div>
          <label className="block text-xs font-bold text-[#2C1810] mb-1">
            Motif de la demande *
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {PRESET_REASONS.map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => setReason(preset)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                  reason === preset
                    ? 'bg-[#E86225] text-white border-[#E86225] font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <Input
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Précisez la raison de votre demande..."
            className="bg-white border-[#EFE6DD] text-xs py-2"
          />
        </div>

        {/* Détails / Référence */}
        <div>
          <label className="block text-xs font-bold text-[#2C1810] mb-1">
            Détails complémentaires &amp; Référence du virement
          </label>
          <textarea
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full bg-white border border-[#EFE6DD] rounded-xl p-3 text-xs text-[#2C1810] focus:ring-2 focus:ring-[#E86225] focus:outline-none"
            placeholder="Indiquez le nom du groupe, la référence mémoire Interac (ex: BA-JOIN-1234), votre courriel ou vos coordonnées bancaires..."
          />
        </div>

        <div className="flex gap-2.5 pt-2">
          <Button
            type="button"
            variant="ghost"
            className="flex-1 text-xs font-bold"
            onClick={onClose}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-[#E86225] hover:bg-[#D0521B] text-white text-xs font-bold py-2.5 rounded-xl shadow-sm"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <span className="flex items-center gap-1.5">
                <Loader2 size={14} className="animate-spin" /> Envoi en cours…
              </span>
            ) : (
              'Envoyer la demande'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
