import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Printer,
  ShieldCheck,
  UserCheck,
  CreditCard,
  Scale,
  AlertTriangle,
  FileText,
  Lock,
  DollarSign,
  UserX,
  RefreshCw,
  Award,
  ShieldAlert,
  CheckCircle2,
  Mail,
  ExternalLink
} from 'lucide-react';
import { PageTransition } from '../../components/ui/PageTransition';

interface TermItem {
  id: number;
  title: string;
  category: 'conduct' | 'intermediary' | 'financial' | 'legal';
  categoryLabel: string;
  icon: typeof ShieldCheck;
  text: string;
  summary: string;
}

const TERMS_DATA: TermItem[] = [
  {
    id: 1,
    title: 'User Conduct & Responsibility',
    category: 'conduct',
    categoryLabel: 'User Conduct',
    icon: UserCheck,
    text: 'Users are responsible for their own posts, messages, and behavior.',
    summary: 'You are accountable for all activities, messages, and content posted under your account.'
  },
  {
    id: 2,
    title: 'Platform Intermediary Role',
    category: 'intermediary',
    categoryLabel: 'Platform Role',
    icon: Scale,
    text: 'The platform acts only as an intermediary and is not responsible for agreements made between users.',
    summary: 'NewVillages facilitates connections; agreements made between members are strictly private between those parties.'
  },
  {
    id: 3,
    title: 'Accurate Account Registration',
    category: 'conduct',
    categoryLabel: 'User Conduct',
    icon: ShieldCheck,
    text: 'Users must provide accurate information when creating an account.',
    summary: 'Full name, email address, and location details provided during signup must be truthful and accurate.'
  },
  {
    id: 4,
    title: 'Prohibited Content & Behavior',
    category: 'conduct',
    categoryLabel: 'User Conduct',
    icon: AlertTriangle,
    text: 'Illegal, hateful, violent, fraudulent, or rights-infringing content is prohibited.',
    summary: 'Zero tolerance for hate speech, harassment, violence, fraud, spam, or intellectual property violations.'
  },
  {
    id: 5,
    title: 'Compliance with Applicable Laws',
    category: 'conduct',
    categoryLabel: 'User Conduct',
    icon: FileText,
    text: 'Users must comply with all applicable laws in their country or region.',
    summary: 'All interactions and activities must abide by local, regional, national, and international laws.'
  },
  {
    id: 6,
    title: 'Subscriptions & Participation Fees',
    category: 'financial',
    categoryLabel: 'Fees & Expenses',
    icon: CreditCard,
    text: 'Subscriptions and participation fees, when applicable, must be paid according to the displayed terms and may be non-refundable unless required by law.',
    summary: 'All paid membership, leader, or event fees follow published pricing rules and are non-refundable where allowed by law.'
  },
  {
    id: 7,
    title: 'Personal Expense Responsibility',
    category: 'financial',
    categoryLabel: 'Fees & Expenses',
    icon: DollarSign,
    text: 'Each user is responsible for their own personal expenses, including transportation, food, purchases, and other costs.',
    summary: 'Costs incurred to attend community gatherings, events, or travel are solely your personal responsibility.'
  },
  {
    id: 8,
    title: 'Account Suspension & Removal',
    category: 'legal',
    categoryLabel: 'Account & Legal',
    icon: UserX,
    text: 'The platform may suspend or permanently remove accounts that violate these Terms.',
    summary: 'Violations of community safety or terms may lead to immediate temporary suspension or permanent deletion.'
  },
  {
    id: 9,
    title: 'Modifications to Features & Terms',
    category: 'legal',
    categoryLabel: 'Account & Legal',
    icon: RefreshCw,
    text: 'The platform may modify its features, pricing, or these Terms and Conditions at any time. Changes become effective once published on the platform unless applicable law requires otherwise. Continued use of the platform after changes means you accept the updated Terms.',
    summary: 'We may update services, terms, or fees. Continued use after publication signifies your acceptance of updated terms.'
  },
  {
    id: 10,
    title: 'No Guarantee of Event or Activity Outcomes',
    category: 'intermediary',
    categoryLabel: 'Platform Role',
    icon: Award,
    text: 'The platform does not guarantee the success, quality, or outcome of any event, activity, or interaction between users.',
    summary: 'Events and activities organized on NewVillages are run independently by members/leaders without outcome guarantees.'
  },
  {
    id: 11,
    title: 'Limitation of Liability',
    category: 'intermediary',
    categoryLabel: 'Platform Role',
    icon: ShieldAlert,
    text: 'To the maximum extent permitted by law, the platform is not liable for damages, losses, or disputes arising from interactions between users.',
    summary: 'NewVillages is not liable for personal disputes, financial claims, or losses stemming from member interactions.'
  },
  {
    id: 12,
    title: 'Privacy Policy & Data Use',
    category: 'legal',
    categoryLabel: 'Account & Legal',
    icon: Lock,
    text: "Users agree to the platform's Privacy Policy regarding the collection and use of personal information.",
    summary: 'Personal data processing and protection follow our dedicated Privacy Policy guidelines.'
  },
  {
    id: 13,
    title: 'Fraud Prevention & Security Integrity',
    category: 'legal',
    categoryLabel: 'Account & Legal',
    icon: Lock,
    text: 'Any fraudulent activity or attempt to bypass the platform\'s security measures may result in account termination.',
    summary: 'Bypassing technical security measures, unauthorized API access, or fraud leads to immediate termination and legal action.'
  },
  {
    id: 14,
    title: 'Binding Agreement & Acknowledgment',
    category: 'legal',
    categoryLabel: 'Account & Legal',
    icon: CheckCircle2,
    text: 'By accessing or using the platform, users acknowledge that they have read, understood, and agree to these Terms and Conditions.',
    summary: 'Accessing or registering on NewVillages constitutes your explicit agreement to all terms in full.'
  }
];

export function Terms() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'conduct' | 'intermediary' | 'financial' | 'legal'>('all');

  const filteredTerms = TERMS_DATA.filter((item) => {
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
                <span className="bg-[#1D4ED8] text-white px-3 py-1 rounded-full uppercase tracking-wider text-[11px]">Official Document</span>
                <span>Version 1.0.0</span>
                <span>&bull;</span>
                <span>Last Updated: July 2026</span>
              </div>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight mb-4">
                Terms and Conditions
              </h1>
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-light">
                Please read these Terms and Conditions carefully. They govern your access to and use of the NewVillages platform, services, and community network.
              </p>
            </div>

            {/* Actions & Quick Stats */}
            <div className="mt-10 pt-8 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-[#38BDF8]" />
                  <span>14 Binding Clauses</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#38BDF8]" />
                  <span>Community Standards</span>
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

        {/* Main Content Area */}
        <main className="max-w-5xl mx-auto px-6 py-12 flex-1 w-full space-y-10">

          {/* Search & Filter Control Bar */}
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-[#E2E8F0] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search terms by keyword or clause number..."
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

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {[
                { id: 'all', label: 'All Terms' },
                { id: 'conduct', label: 'User Conduct' },
                { id: 'intermediary', label: 'Platform Role' },
                { id: 'financial', label: 'Fees' },
                { id: 'legal', label: 'Account & Legal' }
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

          {/* Key Principles Summary Box */}
          <div className="bg-[#0A2540] text-white rounded-2xl p-6 md:p-8 shadow-md">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="text-[#38BDF8]" size={22} />
              Key Platform Principles
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mt-4">
              <div className="bg-[#0F3054] p-4 rounded-xl border border-[#1E3A5F]">
                <h4 className="font-bold text-sm text-white mb-1">1. User Ownership</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You retain responsibility for all messages, posts, and commitments you make on NewVillages.
                </p>
              </div>
              <div className="bg-[#0F3054] p-4 rounded-xl border border-[#1E3A5F]">
                <h4 className="font-bold text-sm text-white mb-1">2. Platform Intermediary</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  NewVillages connects people but is not party to private agreements or personal arrangements between users.
                </p>
              </div>
              <div className="bg-[#0F3054] p-4 rounded-xl border border-[#1E3A5F]">
                <h4 className="font-bold text-sm text-white mb-1">3. Active Consent</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every account creation requires explicit acknowledgement and acceptance of these binding terms.
                </p>
              </div>
            </div>
          </div>

          {/* Terms List Grid / Cards */}
          {filteredTerms.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0]">
              <AlertTriangle size={36} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-lg font-bold text-[#102A43] mb-1">No terms found</h3>
              <p className="text-sm text-[#486581] max-w-md mx-auto mb-4">
                No Terms and Conditions clauses match your query "{searchQuery}".
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
              {filteredTerms.map((term) => {
                const IconComponent = term.icon;
                return (
                  <article
                    key={term.id}
                    id={`term-${term.id}`}
                    className="bg-white rounded-2xl border border-[#E2E8F0] p-6 md:p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                  >
                    <div className="flex flex-col md:flex-row items-start gap-5">
                      {/* Number Badge & Icon */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-[#0A2540] text-white font-black text-lg flex items-center justify-center border border-[#1E3A5F]">
                          {term.id}
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1D4ED8] flex items-center justify-center md:hidden">
                          <IconComponent size={20} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-xl font-bold text-[#102A43] group-hover:text-[#1D4ED8] transition-colors">
                            {term.id}. {term.title}
                          </h3>
                          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 bg-slate-100 text-[#486581] rounded-full">
                            {term.categoryLabel}
                          </span>
                        </div>

                        {/* Full Clause Text from PDF */}
                        <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                          <p className="text-base text-[#102A43] font-medium leading-relaxed">
                            "{term.text}"
                          </p>
                        </div>

                        {/* Summary */}
                        <p className="text-xs text-[#486581] leading-relaxed flex items-start gap-1.5">
                          <span className="font-semibold text-[#102A43] shrink-0">Summary:</span>
                          <span>{term.summary}</span>
                        </p>
                      </div>

                      {/* Icon Desktop */}
                      <div className="hidden md:flex w-12 h-12 rounded-2xl bg-blue-50 text-[#1D4ED8] items-center justify-center shrink-0">
                        <IconComponent size={24} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Mandatory Terms Acceptance & Re-Consent Policy Section */}
          <section className="bg-gradient-to-r from-[#07192C] to-[#0A2540] text-white rounded-3xl p-8 md:p-10 shadow-lg relative overflow-hidden">
            <div className="max-w-3xl space-y-4 relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full text-[#38BDF8]">
                Terms Acceptance Requirement
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-white">
                How Terms Acceptance Works on NewVillages
              </h2>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed font-light">
                Before creating an account, every user is required to actively read and accept the Terms of Use and Privacy Policy via an unchecked checkbox on registration. The date, time, and version accepted are securely logged.
              </p>
              <ul className="space-y-2 text-xs md:text-sm text-slate-300 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#38BDF8]" /> Explicit opt-in checkbox required prior to account creation.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#38BDF8]" /> Server-side version and timestamp audit tracking.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#38BDF8]" /> Automatic re-consent prompt whenever Terms & Conditions are updated.
                </li>
              </ul>
            </div>
          </section>

          {/* Additional Links & Support */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E2E8F0] flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-bold text-lg text-[#102A43] mb-1">Questions about our Terms?</h4>
              <p className="text-xs text-[#486581]">
                If you have questions regarding legal compliance or data privacy, reach out to our team.
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <Link
                to="/privacy"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#102A43] hover:underline px-4 py-2.5 rounded-xl border border-[#E2E8F0]"
              >
                <span>Privacy Policy</span>
                <ExternalLink size={14} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <Mail size={14} />
                <span>Contact Support</span>
              </Link>
            </div>
          </div>

        </main>
      </div>
    </PageTransition>
  );
}

export default Terms;
