import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { PageTransition } from '../../components/ui/PageTransition';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;
    
    setSubmitting(true);
    // Simulate API submission call
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      // Reset form
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1200);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
        {/* Header Hero */}
        <div className="bg-[#F2F0FA] py-16 md:py-24 border-b border-[#E5E2F3]">
          <div className="max-w-5xl mx-auto px-6">
            <Link to="/" className="inline-flex items-center text-[#3F2A78] font-semibold hover:underline mb-8">
              <ArrowLeft size={16} className="mr-2" /> Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-[#2D2159] mb-4">Contact Us</h1>
            <p className="text-[#3F2A78]/80 font-medium max-w-xl text-lg">
              Have questions, feedback, or need help? Send us a message and our team will get back to you shortly.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            
            {/* Contact Info (2 Columns width) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#F2F0FA]/50 border border-[#E5E2F3] rounded-3xl p-8 space-y-8">
                <div>
                  <h3 className="text-xl font-heading font-bold text-[#2D2159] mb-2">Get in touch</h3>
                  <p className="text-gray-600 text-sm">
                    We'd love to hear from you. Here are the ways you can reach us.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl border border-[#E5E2F3] flex items-center justify-center text-primary shrink-0">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2D2159] text-sm">Email support</h4>
                      <p className="text-sm text-gray-500 mt-0.5">Send us a direct email</p>
                      <a href="mailto:contact@newvillages.ca" className="text-sm font-semibold text-primary hover:underline mt-1 block">
                        contact@newvillages.ca
                      </a>
                    </div>
                  </div>

                  {/* Office */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl border border-[#E5E2F3] flex items-center justify-center text-primary shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2D2159] text-sm">Location</h4>
                      <p className="text-sm text-gray-500 mt-0.5">Proudly built in Canada</p>
                      <span className="text-sm font-semibold text-gray-700 mt-1 block">
                        Toronto, ON, Canada
                      </span>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl border border-[#E5E2F3] flex items-center justify-center text-primary shrink-0">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2D2159] text-sm">Response Time</h4>
                      <p className="text-sm text-gray-500 mt-0.5">Working hours support</p>
                      <span className="text-sm font-semibold text-gray-700 mt-1 block">
                        Usually under 24 hours
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form (3 Columns width) */}
            <div className="lg:col-span-3">
              <Card className="border-gray-100 shadow-md shadow-[#F2F0FA] rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  {submitted ? (
                    <div className="text-center py-12 space-y-4 animate-in fade-in zoom-in-95 duration-500">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                        <CheckCircle2 size={36} />
                      </div>
                      <h2 className="text-2xl font-heading font-bold text-gray-900">Message Sent Successfully!</h2>
                      <p className="text-gray-600 max-w-sm mx-auto">
                        Thank you for reaching out. We have received your message and will get back to you soon.
                      </p>
                      <div className="pt-6">
                        <Button variant="ghost" onClick={() => setSubmitted(false)}>
                          Send another message
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <h3 className="text-lg font-heading font-bold text-gray-900 mb-1">Send a Message</h3>
                        <p className="text-sm text-gray-500">
                          Complete the form below and our team will check it right away.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name *</label>
                          <Input
                            required
                            type="text"
                            placeholder="Amara Okafor"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={submitting}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Email *</label>
                          <Input
                            required
                            type="email"
                            placeholder="you@newvillages.ca"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={submitting}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
                        <Input
                          required
                          type="text"
                          placeholder="How can we help you?"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          disabled={submitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                        <textarea
                          required
                          rows={5}
                          placeholder="Write your details or feedback here..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          disabled={submitting}
                          className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          type="submit"
                          disabled={submitting}
                          className="flex items-center gap-2 px-6"
                        >
                          {submitting ? (
                            <span>Sending...</span>
                          ) : (
                            <>
                              <Send size={16} />
                              <span>Send Message</span>
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
