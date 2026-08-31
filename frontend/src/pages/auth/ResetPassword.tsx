import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { useResetPassword } from '../../hooks/useAuth';
import { ApiError } from '../../lib/apiClient';
import { Loader2, ArrowLeft } from 'lucide-react';

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const resetPassword = useResetPassword();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (newPassword !== confirmPassword) {
      setFormError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!token) {
      setFormError('Le jeton de réinitialisation est manquant. Veuillez faire une nouvelle demande.');
      return;
    }

    resetPassword.mutate(
      { token, newPassword },
      {
        onSuccess: () => navigate('/login'),
        onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Une erreur est survenue.'),
      }
    );
  };

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
            <h1 className="text-2xl font-heading font-extrabold text-[#2C1810] mb-2">Choisir un nouveau mot de passe</h1>
            <p className="text-xs text-[#52433B]">Choisissez un mot de passe sécurisé à 8 caractères minimum.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-4 py-3 rounded-xl">
                {formError}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-[#2C1810] mb-1">Nouveau mot de passe</label>
              <Input required type="password" minLength={8} placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C1810] mb-1">Confirmer le nouveau mot de passe</label>
              <Input required type="password" minLength={8} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <Button type="submit" size="lg" className="w-full mt-2 bg-[#E86225] hover:bg-[#D0521B] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2" disabled={resetPassword.isPending}>
              {resetPassword.isPending && <Loader2 size={18} className="animate-spin" />}
              Réinitialiser le mot de passe
            </Button>
            <p className="text-center text-xs text-[#52433B] mt-6">
              <Link to="/login" className="text-[#E86225] hover:underline font-bold">Retour à la connexion</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResetPassword;
