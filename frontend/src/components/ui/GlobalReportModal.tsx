import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';
import { useSubmitReport, type SubmitReportPayload } from '../../hooks/useReports';

interface GlobalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  targetType: SubmitReportPayload['targetType'];
  targetId: string;
}

export function GlobalReportModal({ isOpen, onClose, targetName, targetType, targetId }: GlobalReportModalProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const submitReport = useSubmitReport();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    submitReport.mutate(
      { targetType, targetId, reason, details: details || undefined },
      {
        onSuccess: () => {
          setTimeout(() => {
            submitReport.reset();
            setReason('');
            setDetails('');
            onClose();
          }, 2000);
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Signaler un contenu / membre`}>
      {submitReport.isSuccess ? (
        <div className="text-center py-6 space-y-3 font-body">
          <div className="w-12 h-12 bg-[#E8F3EB] rounded-full flex items-center justify-center mx-auto text-[#1E4D2B]">
            <Check size={24} />
          </div>
          <h3 className="font-extrabold text-lg text-[#2C1810]">Signalement transmis</h3>
          <p className="text-xs text-[#52433B]">Merci. L'équipe de modération a été notifiée et va examiner « {targetName} » sous peu.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 font-body">
          <p className="text-xs text-[#52433B]">
            Aidez-nous à préserver la sécurité de la communauté Bouffe &amp; Amitié. Pourquoi signalez-vous <strong>{targetName}</strong> ?
          </p>

          <div className="space-y-2">
            {[
              'Harcèlement, intimidation ou problème de sécurité',
              'Discours haineux ou discrimination',
              'Spam, arnaque ou informations trompeuses',
              'Contenu inapproprié ou comportement explicite',
              'Autre violation du règlement de la communauté'
            ].map(r => (
              <label key={r} className="flex items-center gap-3 p-3 border border-[#EFE6DD] rounded-xl cursor-pointer hover:bg-[#FAF5EF] text-xs font-bold text-[#2C1810]">
                <input
                  type="radio"
                  name="reportReason"
                  value={r}
                  onChange={e => setReason(e.target.value)}
                  className="text-[#E86225] focus:ring-[#E86225]"
                  required
                />
                <span>{r}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C1810] mb-1">Détails supplémentaires (optionnel)</label>
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              className="w-full border border-[#EFE6DD] rounded-xl p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#E86225]"
              rows={3}
              placeholder="Précisez votre signalement si nécessaire..."
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" className="flex-1 text-xs font-bold text-[#52433B]" onClick={onClose}>Annuler</Button>
            <Button type="submit" variant="danger" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs" disabled={!reason || submitReport.isPending}>
              {submitReport.isPending ? 'Transmission…' : 'Envoyer le signalement'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default GlobalReportModal;
