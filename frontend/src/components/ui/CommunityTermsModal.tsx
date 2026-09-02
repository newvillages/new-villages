import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface CommunityTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  communityName: string;
  customTerms: string;
  isPending?: boolean;
}

export function CommunityTermsModal({
  isOpen,
  onClose,
  onAccept,
  communityName,
  customTerms,
  isPending,
}: CommunityTermsModalProps) {
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    onAccept();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Règles et conditions du groupe`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-sm">
          <ShieldCheck className="shrink-0 text-amber-600" size={24} />
          <div>
            <span className="font-bold block">Accepter les règles pour rejoindre {communityName}</span>
            <span className="text-xs text-amber-700">
              Ce groupe comporte des conditions particulières configurées par l'organisateur de groupe.
            </span>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-56 overflow-y-auto text-xs text-gray-700 space-y-2 whitespace-pre-wrap">
          {customTerms}
        </div>

        <label className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 text-xs">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 rounded text-primary focus:ring-primary"
            required
          />
          <span>
            J'ai lu et j'accepte de respecter ces règles particulières lors de ma participation au groupe <strong>{communityName}</strong>.
          </span>
        </label>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={!agreed || isPending}>
            {isPending ? 'Adhésion en cours…' : 'Accepter et rejoindre le groupe'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
