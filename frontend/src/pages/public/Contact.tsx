import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { PageTransition } from '../../components/ui/PageTransition';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

import { api, ApiError } from '../../lib/apiClient';

export function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;
    
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await api.post('/api/public/contact', { name, email, subject, message });
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg((err as Error)?.message || 'Impossible d\'envoyer le message. Veuillez réessayer.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FDFBF7]">
        {/* Header Hero */}
        <div className="bg-[#FAF6F0] py-16 md:py-20 border-b border-[#EFE6DD]">
          <div className="max-w-5xl mx-auto px-6">
            <Link to="/" className="inline-flex items-center text-[#E86225] font-bold hover:underline mb-6 text-sm">
              <ArrowLeft size={16} className="mr-2" /> Retour à l'accueil
            </Link>
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-[#2C1810] mb-3">Nous contacter</h1>
            <p className="text-[#52433B] font-medium max-w-xl text-base">
              Une question sur nos sorties au restaurant ou sur le fonctionnement du club ? Écrivez-nous et notre équipe vous répondra rapidement.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#FAF6F0] border border-[#EFE6DD] rounded-3xl p-8 space-y-8">
                <div>
                  <h3 className="text-xl font-heading font-bold text-[#2C1810] mb-2">Entrer en contact</h3>
                  <p className="text-[#52433B] text-xs">
                    Nous serions ravis de discuter avec vous. Voici les différents moyens de nous joindre.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl border border-[#EFE6DD] flex items-center justify-center text-[#E86225] shrink-0 shadow-sm">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2C1810] text-sm">Support par courriel</h4>
                      <p className="text-xs text-[#52433B] mt-0.5">Écrivez-nous directement</p>
                      <a href="mailto:info@bouffeamitie.ca" className="text-sm font-bold text-[#E86225] hover:underline mt-1 block">
                        info@bouffeamitie.ca
                      </a>
                    </div>
                  </div>

                  {/* Office */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl border border-[#EFE6DD] flex items-center justify-center text-[#1E4D2B] shrink-0 shadow-sm">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2C1810] text-sm">Localisation</h4>
                      <p className="text-xs text-[#52433B] mt-0.5">Fièrement créé au Canada</p>
                      <span className="text-sm font-semibold text-[#2C1810] mt-1 block">
                        Montréal &amp; Québec, Canada
                      </span>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl border border-[#EFE6DD] flex items-center justify-center text-[#E86225] shrink-0 shadow-sm">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2C1810] text-sm">Délai de réponse</h4>
                      <p className="text-xs text-[#52433B] mt-0.5">Support durant les heures ouvrables</p>
                      <span className="text-sm font-semibold text-[#2C1810] mt-1 block">
                        Généralement sous 24 heures
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <Card className="border-[#EFE6DD] shadow-sm rounded-3xl overflow-hidden bg-white">
                <CardContent className="p-8">
                  {submitted ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-16 h-16 bg-[#E8F3EB] rounded-full flex items-center justify-center mx-auto text-[#1E4D2B]">
                        <CheckCircle2 size={36} />
                      </div>
                      <h2 className="text-2xl font-heading font-bold text-[#2C1810]">Message envoyé avec succès !</h2>
                      <p className="text-sm text-[#52433B] max-w-sm mx-auto">
                        Merci de nous avoir contactés. Nous avons bien reçu votre message et nous vous répondrons sous peu.
                      </p>
                      <div className="pt-6">
                        <Button variant="ghost" onClick={() => setSubmitted(false)} className="text-[#E86225] font-bold">
                          Envoyer un autre message
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <h3 className="text-lg font-heading font-bold text-[#2C1810] mb-1">Envoyer un message</h3>
                        <p className="text-xs text-[#52433B]">
                          Remplissez le formulaire ci-dessous et notre équipe vous répondra rapidement.
                        </p>
                      </div>

                      {errorMsg && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-4 py-3 rounded-xl">
                          {errorMsg}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#2C1810] mb-1.5">Votre nom *</label>
                          <Input
                            required
                            type="text"
                            placeholder="Marie Tremblay"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={submitting}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#2C1810] mb-1.5">Votre courriel *</label>
                          <Input
                            required
                            type="email"
                            placeholder="vous@exemple.ca"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={submitting}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#2C1810] mb-1.5">Sujet *</label>
                        <Input
                          required
                          type="text"
                          placeholder="Comment pouvons-nous vous aider ?"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          disabled={submitting}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#2C1810] mb-1.5">Message *</label>
                        <textarea
                          required
                          rows={5}
                          placeholder="Écrivez votre message ou votre question ici..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          disabled={submitting}
                          className="w-full border border-[#EFE6DD] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E86225] focus:border-transparent disabled:opacity-50 text-[#2C1810]"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          type="submit"
                          disabled={submitting}
                          className="flex items-center gap-2 px-6 py-3 bg-[#E86225] hover:bg-[#D0521B] text-white font-bold rounded-xl"
                        >
                          {submitting ? (
                            <span>Envoi en cours...</span>
                          ) : (
                            <>
                              <Send size={16} />
                              <span>Envoyer le message</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default Contact;
