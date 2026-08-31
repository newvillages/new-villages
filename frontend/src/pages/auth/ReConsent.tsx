import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { useAcceptTerms, useCurrentTerms } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export function ReConsent() {
  const navigate = useNavigate();
  const { data: terms, isLoading } = useCurrentTerms();
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

      <Modal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)} title={`Conditions d'utilisation & Politique de confidentialité${terms ? ` (v${terms.version})` : ''}`} className="max-w-2xl">
        <div className="prose prose-sm prose-amber whitespace-pre-wrap text-xs text-[#52433B]">
          {isLoading ? 'Chargement…' : terms?.body}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setTermsModalOpen(false)} className="bg-[#E86225] text-white font-bold">J'ai consulté les conditions</Button>
        </div>
      </Modal>
    </div>
  );
}

export default ReConsent;
