import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { useForgotPassword } from '../../hooks/useAuth';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const forgotPassword = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPassword.mutate(email);
  };

  if (forgotPassword.isSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 flex items-center justify-center font-body">
        <Card className="w-full max-w-md text-center border-[#EFE6DD] shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-[#FDF0E9] text-[#E86225] rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail size={32} />
            </div>
            <h1 className="text-2xl font-heading font-extrabold text-[#2C1810] mb-3">Consultez vos courriels</h1>
            <p className="text-xs text-[#52433B] mb-8 leading-relaxed">
              Si un compte existe pour <strong>{email}</strong>, nous vous avons envoyé un lien pour réinitialiser votre mot de passe.
            </p>
            <Link to="/login" className="text-[#E86225] hover:underline font-bold text-xs">Retour à la connexion</Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <h1 className="text-2xl font-heading font-extrabold text-[#2C1810] mb-2">Mot de passe oublié ?</h1>
            <p className="text-xs text-[#52433B]">Entrez votre adresse courriel pour recevoir un lien de réinitialisation.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2C1810] mb-1">Adresse courriel</label>
              <Input required type="email" placeholder="votre.courriel@exemple.ca" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" size="lg" className="w-full mt-2 bg-[#E86225] hover:bg-[#D0521B] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2" disabled={forgotPassword.isPending}>
              {forgotPassword.isPending && <Loader2 size={18} className="animate-spin" />}
              Envoyer le lien de réinitialisation
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

export default ForgotPassword;
