import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Printer,
  Shield,
  Lock,
  Eye,
  Share2,
  UserCheck,
  CheckCircle2,
  Mail,
  ExternalLink,
  Database,
  Key,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { PageTransition } from '../../components/ui/PageTransition';

interface PrivacyPillar {
  id: number;
  title: string;
  category: 'collection' | 'usage' | 'sharing' | 'rights' | 'security';
  categoryLabel: string;
  icon: typeof Shield;
  text: string;
  summary: string;
}

const PRIVACY_PILLARS: PrivacyPillar[] = [
  {
    id: 1,
    title: 'Information We Collect',
    category: 'collection',
    categoryLabel: 'Data Collection',
    icon: Database,
    text: 'We collect information you provide directly to us when you create an account, update your profile, or interact with communities. This includes your full name, email address, country, city, and preferred language.',
    summary: 'Only necessary account details provided during signup or profile updates are collected.'
  },
  {
    id: 2,
    title: 'How We Use Your Information',
    category: 'usage',
    categoryLabel: 'Data Usage',
    icon: Eye,
    text: 'We use the information we collect to provide, maintain, and improve our community services, verify accounts, process subscriptions, facilitate local group interactions, and deliver security notifications.',
    summary: 'Your data is strictly used to run the platform, connect you with local communities, and protect your account.'
  },
  {
    id: 3,
    title: 'Information Sharing & Confidentiality',
    category: 'sharing',
    categoryLabel: 'Third-Party Sharing',
    icon: Share2,
    text: 'We do not sell your personal data. We may share information only with trusted service providers who assist us in operating our platform (e.g., payment processing via Stripe, transactional email providers), subject to strict confidentiality agreements.',
    summary: 'We never monetize or sell personal information to third parties or advertisers.'
  },
  {
    id: 4,
    title: 'Your Privacy Rights & Controls',
    category: 'rights',
    categoryLabel: 'User Rights',
    icon: UserCheck,
    text: 'You have the right to access, export, correct, or request deletion of your personal data at any time. You can manage your profile settings, notification preferences, and privacy visibility directly from your account dashboard.',
    summary: 'You hold complete authority over your personal information and can update or request data deletion anytime.'
  },
  {
    id: 5,
    title: 'Security & Encryption Measures',
    category: 'security',
    categoryLabel: 'Security',
    icon: Lock,
    text: 'We implement industry-standard technical and organizational security measures, including HTTPS encryption, salted password hashing, stateless JWT session tokens, and regular system audits to protect against unauthorized access.',
    summary: 'Enterprise-grade encryption and secure access tokens protect your account data in transit and at rest.'
  }
];

export function Privacy() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'collection' | 'usage' | 'sharing' | 'rights' | 'security'>('all');

  const filteredPillars = PRIVACY_PILLARS.filter((item) => {
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toString() === searchQuery.trim();
    return matchesTab && matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F8FAFC] text-[#102A43] flex flex-col">
        {/* Header Hero */}
        <section className="bg-gradient-to-b from-[#07192C] to-[#0A2540] text-white py-16 md:py-20 relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <Link
                to="/"
                className="inline-flex items-center text-slate-300 hover:text-white font-semibold transition-colors bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-sm border border-white/10"
              >
                <ArrowLeft size={16} className="mr-2" /> Back to Home
              </Link>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
                <span className="bg-[#1D4ED8] text-white px-3 py-1 rounded-full uppercase tracking-wider text-[11px]">Privacy Policy</span>
                <span>Version 1.0.0</span>
                <span>&bull;</span>
                <span>Last Updated: July 2026</span>
              </div>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight mb-4">
                Privacy Policy
              </h1>
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-light">
                Your privacy is paramount. Learn how NewVillages collects, protects, and handles your personal information with full transparency and security.
              </p>
            </div>

            {/* Actions & Quick Highlights */}
            <div className="mt-10 pt-8 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-[#38BDF8]" />
                  <span>No Data Selling</span>
                </div>
                <div className="flex items-center gap-2">
                  <Key size={18} className="text-[#38BDF8]" />
                  <span>Encrypted Storage</span>
                </div>
              </div>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl transition-all border border-white/20 text-sm"
              >
                <Printer size={16} />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-6 py-12 flex-1 w-full space-y-10">

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-[#E2E8F0] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search privacy topics (e.g., encryption, rights, cookies)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:bg-white transition-all text-[#102A43]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {[
                { id: 'all', label: 'All Policy Pillars' },
                { id: 'collection', label: 'Data Collection' },
                { id: 'usage', label: 'Data Usage' },
                { id: 'sharing', label: 'Third-Party Sharing' },
                { id: 'rights', label: 'User Rights' },
                { id: 'security', label: 'Security' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#1D4ED8] text-white shadow-sm'
                      : 'bg-slate-100 text-[#486581] hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Guarantees Summary */}
          <div className="bg-[#0A2540] text-white rounded-2xl p-6 md:p-8 shadow-md">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Shield className="text-[#38BDF8]" size={22} />
              Core Privacy Commitments
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mt-4">
              <div className="bg-[#0F3054] p-4 rounded-xl border border-[#1E3A5F]">
                <h4 className="font-bold text-sm text-white mb-1">1. Transparent Collection</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We only request information necessary to build secure community profiles and verify accounts.
                </p>
              </div>
              <div className="bg-[#0F3054] p-4 rounded-xl border border-[#1E3A5F]">
                <h4 className="font-bold text-sm text-white mb-1">2. Zero Commercial Selling</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your personal data is never sold, traded, or rented to ad networks or third-party brokers.
                </p>
              </div>
              <div className="bg-[#0F3054] p-4 rounded-xl border border-[#1E3A5F]">
                <h4 className="font-bold text-sm text-white mb-1">3. User Data Control</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Export or permanently delete your account data at any time via your account management settings.
                </p>
              </div>
            </div>
          </div>

          {/* Pillars Cards */}
          {filteredPillars.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0]">
              <AlertTriangle size={36} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-lg font-bold text-[#102A43] mb-1">No matching privacy topics</h3>
              <p className="text-sm text-[#486581] max-w-md mx-auto mb-4">
                No privacy sections match your query "{searchQuery}".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                }}
                className="text-xs font-bold text-[#1D4ED8] hover:underline"
              >
                Reset Search & Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPillars.map((pillar) => {
                const IconComponent = pillar.icon;
                return (
                  <article
                    key={pillar.id}
                    className="bg-white rounded-2xl border border-[#E2E8F0] p-6 md:p-8 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex flex-col md:flex-row items-start gap-5">
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-[#0A2540] text-white font-black text-lg flex items-center justify-center border border-[#1E3A5F]">
                          0{pillar.id}
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1D4ED8] flex items-center justify-center md:hidden">
                          <IconComponent size={20} />
                        </div>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-xl font-bold text-[#102A43] group-hover:text-[#1D4ED8] transition-colors">
                            {pillar.id}. {pillar.title}
                          </h3>
                          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 bg-slate-100 text-[#486581] rounded-full">
                            {pillar.categoryLabel}
                          </span>
                        </div>

                        <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                          <p className="text-base text-[#102A43] font-medium leading-relaxed">
                            {pillar.text}
                          </p>
                        </div>

                        <p className="text-xs text-[#486581] leading-relaxed flex items-start gap-1.5">
                          <span className="font-semibold text-[#102A43] shrink-0">Key Takeaway:</span>
                          <span>{pillar.summary}</span>
                        </p>
                      </div>

                      <div className="hidden md:flex w-12 h-12 rounded-2xl bg-blue-50 text-[#1D4ED8] items-center justify-center shrink-0">
                        <IconComponent size={24} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* User Controls Box */}
          <section className="bg-gradient-to-r from-[#07192C] to-[#0A2540] text-white rounded-3xl p-8 md:p-10 shadow-lg">
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full text-[#38BDF8]">
                User Rights & GDPR/PIPEDA Compliance
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-white">
                How to Manage Your Data & Privacy Controls
              </h2>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed font-light">
                We believe in user autonomy. You can update your information, manage notification settings, or request permanent deletion of your account history anytime.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-2 bg-white text-[#0A2540] font-bold text-xs px-5 py-3 rounded-xl hover:bg-slate-100 transition-colors shadow-sm"
                >
                  <FileCheck size={16} />
                  <span>Manage Account Settings</span>
                </Link>
                <Link
                  to="/terms"
                  className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold text-xs px-5 py-3 rounded-xl hover:bg-white/20 transition-colors border border-white/20"
                >
                  <span>Read Terms & Conditions</span>
                  <ExternalLink size={14} />
                </Link>
              </div>
            </div>
          </section>

          {/* Support */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E2E8F0] flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-bold text-lg text-[#102A43] mb-1">Privacy or Data Inquiries?</h4>
              <p className="text-xs text-[#486581]">
                For questions regarding data processing or subject access requests, contact our privacy officer.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] px-5 py-2.5 rounded-xl transition-all shadow-sm shrink-0"
            >
              <Mail size={14} />
              <span>Contact Privacy Officer</span>
            </Link>
          </div>

        </main>
      </div>
    </PageTransition>
  );
}

export default Privacy;
