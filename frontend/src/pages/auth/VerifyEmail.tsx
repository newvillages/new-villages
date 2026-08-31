import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useResendVerification, useVerifyEmailQuery } from '../../hooks/useAuth';
import { ApiError } from '../../lib/apiClient';
import { Mail, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const emailFromState = (location.state as { email?: string } | null)?.email;

  const verifyEmailQuery = useVerifyEmailQuery(token);
  const resend = useResendVerification();
  const [resendEmail, setResendEmail] = useState(emailFromState ?? '');

  if (token) {
    if (verifyEmailQuery.isLoading) {
      return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#E86225]" />
        </div>
      );
    }
    if (verifyEmailQuery.isSuccess) {
      return (
        <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 flex items-center justify-center font-body">
          <Card className="w-full max-w-md text-center border-[#EFE6DD] shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-[#E8F3EB] text-[#1E4D2B] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h1 className="text-2xl font-heading font-extrabold text-[#2C1810] mb-3">Courriel vérifié !</h1>
              <p className="text-xs text-[#52433B] mb-8">Votre compte est activé. Vous pouvez maintenant vous connecter.</p>
              <Button className="w-full bg-[#E86225] hover:bg-[#D0521B] text-white font-bold py-3.5 rounded-xl" onClick={() => navigate('/login')}>Se connecter</Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 flex items-center justify-center font-body">
        <Card className="w-full max-w-md text-center border-[#EFE6DD] shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={32} />
            </div>
            <h1 className="text-2xl font-heading font-extrabold text-[#2C1810] mb-3">Lien expiré ou invalide</h1>
            <p className="text-xs text-[#52433B] mb-8">
              {verifyEmailQuery.error instanceof ApiError ? verifyEmailQuery.error.message : 'Ce lien de vérification n\'est plus valide.'}
            </p>
            <Button variant="outline" className="w-full border-[#E86225] text-[#E86225] font-bold" onClick={() => navigate('/login')}>Retour à la connexion</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 flex items-center justify-center font-body">
      <Card className="w-full max-w-md text-center border-[#EFE6DD] shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-8">
          <div className="w-16 h-16 bg-[#FDF0E9] text-[#E86225] rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={32} />
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-[#2C1810] mb-3">Vérifiez vos courriels</h1>
          <p className="text-xs text-[#52433B] mb-6">
            Nous avons envoyé un lien d'activation à {emailFromState ? <strong>{emailFromState}</strong> : 'votre adresse courriel'}. Veuillez cliquer sur le lien pour activer votre compte.
          </p>
          <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-8 text-center font-medium">
            💡 Vous ne trouvez pas le courriel ? Pensez à vérifier votre dossier <strong>Indésirables / Spam</strong>.
          </div>

          <div className="space-y-4">
            {!emailFromState && (
              <input
                type="email"
                placeholder="votre.courriel@exemple.ca"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="w-full border border-[#EFE6DD] rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#E86225]"
              />
            )}
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-[#E86225] text-[#E86225] font-bold py-3.5 rounded-xl"
              disabled={!resendEmail || resend.isPending}
              onClick={() => resend.mutate(resendEmail)}
            >
              {resend.isPending && <Loader2 size={16} className="animate-spin" />}
              {resend.isSuccess ? 'Courriel envoyé !' : 'Renvoyer le courriel'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default VerifyEmail;
