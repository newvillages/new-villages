import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { useLogin, useTermsStatus } from '../../hooks/useAuth';
import { ApiError } from '../../lib/apiClient';
import { Loader2, ArrowLeft } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [loggedInPendingTermsCheck, setLoggedInPendingTermsCheck] = useState(false);

  // Only fires once login succeeds, to decide whether to route to /re-consent or target route.
  const { data: termsStatus } = useTermsStatus(loggedInPendingTermsCheck);

  React.useEffect(() => {
    if (!termsStatus) return;
    navigate(termsStatus.upToDate ? fromPath : '/re-consent', { replace: true });
  }, [termsStatus, navigate, fromPath]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => setLoggedInPendingTermsCheck(true),
        onError: (err) => {
          if (err instanceof ApiError) {
            if (err.code === 'EMAIL_NOT_VERIFIED') {
              navigate('/verify-email', { state: { email } });
              return;
            }
            setFormError(err.message);
          } else {
            setFormError((err as Error)?.message || 'Une erreur est survenue. Veuillez réessayer.');
          }
        },
      }
    );
  };

  const searchParams = new URLSearchParams(location.search);
  const reason = searchParams.get('reason');

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 flex flex-col items-center justify-center font-body">
      <div className="w-full max-w-md mb-4 text-left">
        <Link to="/" className="inline-flex items-center text-xs font-bold text-[#E86225] hover:underline">
          <ArrowLeft size={16} className="mr-2" /> Retour à l'accueil
        </Link>
      </div>
      <Card className="w-full max-w-md border-[#EFE6DD] shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-3">
              <img src="/logo-bouffe-amitie.png" alt="Bouffe &amp; Amitié" className="h-12 w-auto mx-auto object-contain" />
            </Link>
            <h1 className="text-2xl font-heading font-extrabold text-[#2C1810] mb-1">Connexion</h1>
            <p className="text-xs text-[#52433B]">Accédez à votre espace Bouffe &amp; Amitié.</p>
          </div>

          {reason === 'inactivity' && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium px-4 py-3 rounded-xl mb-6 text-center">
              Vous avez été déconnecté(e) automatiquement en raison d'une inactivité.
            </div>
          )}

          {reason === 'session_expired' && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium px-4 py-3 rounded-xl mb-6 text-center">
              Votre session a expiré. Veuillez vous reconnecter.
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-4 py-3 rounded-xl">
                {formError}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-[#2C1810] mb-1">Courriel</label>
              <Input
                required
                type="email"
                placeholder="votre.courriel@exemple.ca"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-[#2C1810]">Mot de passe</label>
                <Link to="/forgot-password" className="text-xs text-[#E86225] font-semibold hover:underline">Mot de passe oublié ?</Link>
              </div>
              <Input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" size="lg" className="w-full mt-6 bg-[#E86225] hover:bg-[#D0521B] text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2" disabled={loginMutation.isPending}>
              {loginMutation.isPending && <Loader2 size={18} className="animate-spin" />}
              Se connecter
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#EFE6DD]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-slate-400">Ou continuer avec</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" className="opacity-50 cursor-not-allowed text-xs">Google</Button>
              <Button type="button" variant="outline" className="opacity-50 cursor-not-allowed text-xs">Apple</Button>
            </div>

            <p className="text-center text-xs text-[#52433B] mt-6">
              Vous n'avez pas de compte ? <Link to="/register" className="text-[#E86225] hover:underline font-bold">S'inscrire</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
