import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Users, Globe, Calendar, ArrowRight, Check, Shield, Sparkles } from 'lucide-react';
import { Card } from '../../components/ui/Card';

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1503756234508-e32369269deb?auto=format&fit=crop&w=1200&q=80',
    community: 'Toronto Newcomers Circle',
    event: 'Winter Coats Drive',
    date: 'Sat, Oct 19',
    location: 'Regent Park',
  },
  {
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    community: 'GTA Tech Founders',
    event: 'Founder Demo Night',
    date: 'Thu, Nov 6',
    location: 'Downtown Toronto',
  },
  {
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80',
    community: 'Filipino Heritage Club',
    event: 'Heritage Festival',
    date: 'Sun, Nov 16',
    location: 'Mississauga',
  },
  {
    image: 'https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=1200&q=80',
    community: 'Caregivers of Ontario',
    event: 'Caregiver Support Circle',
    date: 'Wed, Nov 26',
    location: 'Ottawa',
  },
  {
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
    community: 'Vancouver Trailblazers',
    event: 'Sunrise Hike Meetup',
    date: 'Sat, Dec 6',
    location: 'North Shore',
  },
];

const featuredCommunities = [
  { name: 'Toronto Newcomers Circle', members: '1,284 members', icon: '🍁', tag: 'Verified Circle' },
  { name: 'GTA Tech Founders', members: '892 members', icon: '💻', tag: 'Tech Hub' },
  { name: 'Filipino Heritage Club', members: '546 members', icon: '👥', tag: 'Cultural Group' },
  { name: 'Caregivers of Ontario', members: '421 members', icon: '🤍', tag: 'Support Network' },
];

function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[index];

  return (
    <div className="relative w-full aspect-[4/3] max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/20">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img src={slide.image} alt={slide.event} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-black/30 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest bg-[#1D4ED8] text-white px-2.5 py-0.5 rounded-full">
              {slide.community}
            </span>
            <h3 className="text-xl font-bold font-heading text-white drop-shadow-md">{slide.event}</h3>
            <p className="text-xs text-slate-200">{slide.date} &bull; {slide.location}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicators */}
      <div className="absolute top-4 right-4 flex gap-1.5 z-10 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === index ? 'bg-[#38BDF8] w-5' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}

function AnimatedCounter({ to, duration = 2, suffix = '+' }: { to: number; duration?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView && ref.current) {
      const node = ref.current;
      const controls = animate(0, to, {
        duration,
        onUpdate(value) {
          node.textContent = Math.floor(value).toLocaleString() + suffix;
        },
      });
      return () => controls.stop();
    }
  }, [isInView, to, duration, suffix]);

  return <span ref={ref} className="text-4xl md:text-5xl font-extrabold font-heading text-white" />;
}

export function Landing() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#102A43] overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 pt-16 pb-24 max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 text-[#1D4ED8] border border-blue-200 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles size={14} className="text-[#1D4ED8]" />
              <span>Canada's Modern Village Network</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-heading font-extrabold text-[#102A43] leading-tight mb-6">
              Find your circle. <br />
              <span className="text-[#1D4ED8]">Build your village.</span>
            </h1>

            <p className="text-lg text-[#486581] leading-relaxed mb-8 max-w-xl">
              Connect with local groups, attend verified events, and organize meaningful meetups in a trusted, moderated Canadian network.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button className="w-full sm:w-auto px-8 py-6 rounded-full bg-[#1D4ED8] text-white hover:bg-[#1E40AF] font-bold text-base shadow-lg transition-all">
                  Join NewVillages
                </Button>
              </Link>
              <Link to="/communities">
                <Button variant="outline" className="w-full sm:w-auto px-8 py-6 rounded-full border-2 border-[#102A43] text-[#102A43] hover:bg-slate-100 font-bold text-base transition-all">
                  Browse Communities
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                <img src="https://i.pravatar.cc/100?u=10" className="w-10 h-10 rounded-full border-2 border-white bg-[#1D4ED8]" alt=""/>
                <img src="https://i.pravatar.cc/100?u=11" className="w-10 h-10 rounded-full border-2 border-white bg-blue-500" alt=""/>
                <img src="https://i.pravatar.cc/100?u=12" className="w-10 h-10 rounded-full border-2 border-white bg-green-500" alt=""/>
                <img src="https://i.pravatar.cc/100?u=13" className="w-10 h-10 rounded-full border-2 border-white bg-orange-500" alt=""/>
              </div>
              <div className="text-sm text-[#486581] font-medium">
                <span className="font-bold text-[#102A43]">12,000+ members</span> across <span className="font-bold text-[#102A43]">300+ circles</span>
              </div>
            </div>
          </motion.div>

          <div className="flex-1 shrink-0 relative w-full max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <HeroSlider />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="bg-[#0A2540] text-white py-16">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
          <div className="px-4">
            <AnimatedCounter to={12483} duration={2.5} />
            <div className="text-[#38BDF8] text-[11px] font-bold uppercase tracking-widest mt-2">Active Members</div>
          </div>
          <div className="px-4">
            <AnimatedCounter to={312} duration={2} />
            <div className="text-[#38BDF8] text-[11px] font-bold uppercase tracking-widest mt-2">Communities</div>
          </div>
          <div className="px-4 border-t md:border-t-0 border-white/10 pt-8 md:pt-0">
            <AnimatedCounter to={68} duration={1.5} suffix="" />
            <div className="text-[#38BDF8] text-[11px] font-bold uppercase tracking-widest mt-2">Cities</div>
          </div>
          <div className="px-4 border-t md:border-t-0 border-white/10 pt-8 md:pt-0">
            <AnimatedCounter to={4890} duration={2} />
            <div className="text-[#38BDF8] text-[11px] font-bold uppercase tracking-widest mt-2">Events Hosted</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 md:py-32 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="text-[#1D4ED8] text-[11px] font-bold tracking-widest uppercase mb-3">How it works</div>
            <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-[#102A43]">Three steps to your village</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
            {[
              { icon: Users, title: 'Find your people', desc: 'Search by cause, culture, or career. Every circle is a real, moderated community.' },
              { icon: Calendar, title: 'Show up together', desc: 'RSVP to dinners, workshops, and support meetings — online or across the country.' },
              { icon: Globe, title: 'Grow the village', desc: 'Start your own circle, publish announcements, and mentor the next wave.' }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="bg-[#F8FAFC] p-8 rounded-3xl border border-[#E2E8F0] space-y-4 hover:border-[#1D4ED8]/40 transition-all shadow-sm"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#0A2540] text-white flex items-center justify-center font-bold text-xl border border-[#1E3A5F]">
                  <step.icon size={26} className="text-[#38BDF8]" />
                </div>
                <h3 className="text-xl font-bold text-[#102A43] font-heading">{step.title}</h3>
                <p className="text-sm text-[#486581] leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Communities */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="text-[#1D4ED8] text-[11px] font-bold tracking-widest uppercase mb-2">Popular Circles</div>
              <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-[#102A43]">Trending Communities</h2>
            </div>
            <Link to="/communities">
              <Button variant="ghost" className="text-[#1D4ED8] font-bold hover:bg-blue-50 flex items-center gap-2">
                See all communities <ArrowRight size={16} />
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCommunities.map((c, i) => (
              <Card
                key={i}
                className="relative overflow-hidden bg-gradient-to-b from-white via-[#F8FAFC] to-[#F1F5F9] border border-[#E2E8F0] rounded-3xl hover:-translate-y-2 hover:shadow-2xl hover:border-[#1D4ED8]/40 transition-all duration-300 group flex flex-col justify-between"
              >
                {/* Top Luxury Midnight Gradient Accent Bar */}
                <div className="h-1.5 bg-gradient-to-r from-[#0A2540] via-[#1D4ED8] to-[#38BDF8] w-full" />

                <div className="p-6">
                  {/* Category Pill Tag */}
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-[#1D4ED8] border border-blue-100/80">
                      <Sparkles size={11} className="text-[#1D4ED8]" />
                      <span>{c.tag}</span>
                    </span>
                  </div>

                  {/* Icon Badge */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0A2540] to-[#1D4ED8] text-white flex items-center justify-center text-2xl mb-4 shadow-md border border-white/20">
                    {c.icon}
                  </div>

                  <h3 className="font-heading font-extrabold text-[#102A43] text-lg mb-1 group-hover:text-[#1D4ED8] transition-colors leading-tight">
                    {c.name}
                  </h3>

                  <p className="text-xs font-semibold text-[#486581] mb-6 flex items-center gap-1.5">
                    <Users size={14} className="text-[#1D4ED8]" />
                    <span>{c.members}</span>
                  </p>
                </div>

                <div className="px-6 pb-6 pt-0">
                  <Link to="/communities">
                    <Button className="w-full rounded-xl bg-[#0A2540] hover:bg-[#1D4ED8] text-white font-bold text-xs py-3.5 shadow-md flex items-center justify-center gap-2 group-hover:shadow-lg transition-all">
                      <span>View Circle</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / Roles Section */}
      <section className="py-24 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-[#1D4ED8] text-[11px] font-bold tracking-widest uppercase mb-3">Simple Plans</div>
            <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-[#102A43] mb-4">Belonging for everyone</h2>
            <p className="text-[#486581] text-base">Choose the tier that matches your community goals.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Member */}
            <Card className="p-8 border border-[#E2E8F0] rounded-3xl bg-gradient-to-b from-white to-[#F8FAFC] shadow-sm hover:border-[#1D4ED8]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold text-[#486581] uppercase tracking-widest mb-4">For individuals</div>
                <h3 className="text-2xl font-bold text-[#102A43] mb-2">Member</h3>
                <div className="flex items-end gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-[#102A43]">Free</span>
                  <span className="text-[#486581] text-sm mb-1">/forever</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {['Join public communities', 'RSVP to events', 'Participate in chats', 'Personal profile'].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-[#486581]">
                      <Check size={16} className="text-[#1D4ED8]"/> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/register">
                <Button className="w-full py-3.5 rounded-xl bg-slate-100 hover:bg-[#1D4ED8] hover:text-white text-[#102A43] font-bold transition-all border border-slate-200">
                  Join for free
                </Button>
              </Link>
            </Card>

            {/* Leader Highlight Plan */}
            <Card className="p-8 border-2 border-[#1D4ED8] rounded-3xl bg-gradient-to-b from-[#0A2540] to-[#07192C] text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-4 right-4 bg-[#1D4ED8] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Popular
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#38BDF8] uppercase tracking-widest mb-4">For organizers</div>
                <h3 className="text-2xl font-bold text-white mb-2">Community Leader</h3>
                <div className="flex items-end gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-white">$10</span>
                  <span className="text-slate-300 text-sm mb-1">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {['Create & manage circles', 'Host unlimited events', 'Broadcast announcements', 'Member analytics'].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-200">
                      <Check size={16} className="text-[#38BDF8]"/> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/register">
                <Button className="w-full py-3.5 rounded-xl bg-[#1D4ED8] text-white hover:bg-[#1E40AF] font-bold transition-all shadow-lg">
                  Get started
                </Button>
              </Link>
            </Card>

            {/* Org */}
            <Card className="p-8 border border-[#E2E8F0] rounded-3xl bg-gradient-to-b from-white to-[#F8FAFC] shadow-sm hover:border-[#1D4ED8]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold text-[#486581] uppercase tracking-widest mb-4">For businesses & nonprofits</div>
                <h3 className="text-2xl font-bold text-[#102A43] mb-2">Organization</h3>
                <div className="flex items-end gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-[#102A43]">$20</span>
                  <span className="text-[#486581] text-sm mb-1">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {['All Leader features', 'Verified org page', 'Contact communities directly', 'Team seats'].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-[#486581]">
                      <Check size={16} className="text-[#1D4ED8]"/> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/register">
                <Button className="w-full py-3.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold transition-all shadow-sm">
                  Get started
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Footer Block */}
      <section className="bg-gradient-to-r from-[#07192C] via-[#0A2540] to-[#07192C] text-white py-16 md:py-20 px-6">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-[#38BDF8] text-xs font-bold uppercase tracking-widest mb-4">
              <Shield size={16} /> Built on trust
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold mb-4 text-white">Safe, moderated, Canadian-owned.</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Real names, real moderation, and a clear Terms of Use every member signs. Because a village only works when everyone belongs.
            </p>
          </div>
          <Link to="/register" className="shrink-0">
            <Button className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-full px-8 py-6 whitespace-nowrap font-bold flex items-center gap-2 shadow-lg">
              Join NewVillages <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Landing;
