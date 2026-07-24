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
        <div className="min-h-screen bg-background-light flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      );
    }
    if (verifyEmailQuery.isSuccess) {
      return (
        <div className="min-h-screen bg-background-light py-12 px-4 flex items-center justify-center">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h1 className="text-2xl font-heading font-bold mb-4">Email verified!</h1>
              <p className="text-gray-600 mb-8">Your account is ready. You can log in now.</p>
              <Button className="w-full" onClick={() => navigate('/login')}>Go to log in</Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-background-light py-12 px-4 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={32} />
            </div>
            <h1 className="text-2xl font-heading font-bold mb-4">Link expired or invalid</h1>
            <p className="text-gray-600 mb-8">
              {verifyEmailQuery.error instanceof ApiError ? verifyEmailQuery.error.message : 'This verification link is no longer valid.'}
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>Back to log in</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light py-12 px-4 flex items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={32} />
          </div>
          <h1 className="text-2xl font-heading font-bold mb-4">Check your email</h1>
          <p className="text-gray-600 mb-6">
            We've sent a verification link to {emailFromState ? <strong>{emailFromState}</strong> : 'your email address'}. Please click the link to activate your account.
          </p>
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-8 text-center font-medium">
            💡 Can't find the email? Please check your <strong>Spam</strong> or <strong>Junk</strong> folder.
          </div>

          <div className="space-y-4">
            {!emailFromState && (
              <input
                type="email"
                placeholder="you@newvillages.ca"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              disabled={!resendEmail || resend.isPending}
              onClick={() => resend.mutate(resendEmail)}
            >
              {resend.isPending && <Loader2 size={16} className="animate-spin" />}
              {resend.isSuccess ? 'Email sent!' : 'Resend Email'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
