import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import {
  Users,
  Calendar,
  ShieldCheck,
  Utensils,
  Heart,
  UserPlus,
  CreditCard,
  CalendarCheck,
  Sparkles,
  ArrowRight,
  MapPin,
  Check
} from 'lucide-react';
import { Card } from '../../components/ui/Card';

const featuredOutings = [
  {
    title: 'Bistro Gourmand — Plateau-Mont-Royal',
    restaurant: 'Le Petit Bistro',
    arrondissement: 'Plateau-Mont-Royal',
    date: 'Samedi 14 Octobre • 19h00',
    placesLeft: '3 places disponibles',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    tag: 'Sortie mensuelle',
  },
  {
    title: 'Table Italienne — Ville-Marie',
    restaurant: 'Trattoria & Vino',
    arrondissement: 'Ville-Marie / Centre-Ville',
    date: 'Vendredi 20 Octobre • 18h30',
    placesLeft: '2 places disponibles',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    tag: 'Repas convivial',
  },
  {
    title: 'Brunch Dominical — Rosemont',
    restaurant: 'Café & Croissants',
    arrondissement: 'Rosemont–La Petite-Patrie',
    date: 'Dimanche 22 Octobre • 11h00',
    placesLeft: '4 places disponibles',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    tag: 'Brunch du week-end',
  },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C1810] overflow-hidden font-body">
      
      {/* HERO SECTION */}
      <section className="relative px-6 lg:px-12 pt-8 pb-16 lg:py-16 max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Copy & Actions */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-6"
          >
            {/* Main Brand Title */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-tight">
                <span className="text-[#1E4D2B]">BOUFFE &amp;</span> <br />
                <span className="text-[#E86225]">AMITIÉ</span>
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-[#2C1810] mt-3">
                Rencontrez. Partagez. <br className="hidden sm:inline" />
                Créez des amitiés.
              </p>
            </div>

            <p className="text-base text-[#52433B] leading-relaxed max-w-lg">
              Un club mensuel de sorties au restaurant pour rencontrer de nouvelles personnes,
              partager de bons moments et créer de vraies amitiés.
            </p>

            {/* CTAs - Compacted to fit 6-col grid cleanly */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 pt-2">
              <Link to="/register" className="w-full sm:w-auto shrink-0">
                <Button className="w-full sm:w-auto px-4 sm:px-5 py-2.5 h-11 rounded-full bg-[#E86225] hover:bg-[#D0521B] text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wide whitespace-nowrap">
                  <Users size={16} />
                  <span>Rejoindre mon groupe</span>
                </Button>
              </Link>

              <Link to="/events" className="w-full sm:w-auto shrink-0">
                <Button variant="outline" className="w-full sm:w-auto px-4 sm:px-5 py-2.5 h-11 rounded-full border-2 border-[#2C1810] text-[#2C1810] hover:bg-[#FAF5EF] font-extrabold text-xs transition-all flex items-center justify-center gap-2 uppercase tracking-wide whitespace-nowrap">
                  <Calendar size={16} />
                  <span>Voir les prochaines sorties</span>
                </Button>
              </Link>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-[#1E4D2B]">
              <div className="w-6 h-6 rounded-full bg-[#E8F3EB] flex items-center justify-center border border-[#1E4D2B]/30">
                <ShieldCheck size={14} className="text-[#1E4D2B]" />
              </div>
              <span>Communauté bienveillante et sécuritaire — 18 ans et plus</span>
            </div>
          </motion.div>

          {/* Right Column: Hero Image with Floating Feature Card */}
          <div className="lg:col-span-6 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
            >
              <img
                src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=80"
                alt="Friends dining together at restaurant"
                className="w-full h-[380px] sm:h-[460px] object-cover"
              />

              {/* Floating Glassmorphism Feature Card at Bottom Center/Left */}
              <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/40">
                <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-100">
                  
                  {/* Pillar 1 */}
                  <div className="flex flex-col items-center px-1">
                    <div className="w-9 h-9 rounded-full bg-[#E8F3EB] text-[#1E4D2B] flex items-center justify-center mb-1.5 shadow-sm">
                      <Users size={18} />
                    </div>
                    <span className="text-xs font-bold text-[#2C1810]">Rencontres</span>
                    <span className="text-[11px] text-[#52433B]">authentiques</span>
                  </div>

                  {/* Pillar 2 */}
                  <div className="flex flex-col items-center px-1">
                    <div className="w-9 h-9 rounded-full bg-[#FDF0E9] text-[#E86225] flex items-center justify-center mb-1.5 shadow-sm">
                      <Utensils size={18} />
                    </div>
                    <span className="text-xs font-bold text-[#2C1810]">Sortie au restaurant</span>
                    <span className="text-[11px] text-[#52433B]">1 fois par mois</span>
                  </div>

                  {/* Pillar 3 */}
                  <div className="flex flex-col items-center px-1">
                    <div className="w-9 h-9 rounded-full bg-[#FAF5EF] text-amber-700 flex items-center justify-center mb-1.5 shadow-sm">
                      <Heart size={18} className="fill-amber-600/30" />
                    </div>
                    <span className="text-xs font-bold text-[#2C1810]">Amitiés</span>
                    <span className="text-[11px] text-[#52433B]">qui durent</span>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>


      {/* FEATURE HIGHLIGHT BAR (4 CARDS) */}
      <section className="py-12 bg-white border-y border-[#EFE6DD]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1 */}
          <div className="p-4 rounded-2xl bg-[#FAF5EF] border border-[#EFE6DD] flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#E8F3EB] text-[#1E4D2B] flex items-center justify-center shrink-0">
              <Users size={22} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#2C1810]">Groupes par arrondissement</h4>
              <p className="text-xs text-[#52433B]">Des sorties près de chez vous</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-2xl bg-[#FAF5EF] border border-[#EFE6DD] flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#FDF0E9] text-[#E86225] flex items-center justify-center shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#2C1810]">Communauté sécuritaire</h4>
              <p className="text-xs text-[#52433B]">Respect, bienveillance et modération</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-2xl bg-[#FAF5EF] border border-[#EFE6DD] flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#E8F3EB] text-[#1E4D2B] flex items-center justify-center shrink-0">
              <Calendar size={22} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#2C1810]">1 sortie par mois</h4>
              <p className="text-xs text-[#52433B]">Dans un nouveau restaurant</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-4 rounded-2xl bg-[#FAF5EF] border border-[#EFE6DD] flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#FDF0E9] text-[#E86225] flex items-center justify-center shrink-0">
              <Sparkles size={22} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#2C1810]">Places limitées</h4>
              <p className="text-xs text-[#52433B]">Pour favoriser les échanges</p>
            </div>
          </div>

        </div>
      </section>


      {/* HOW IT WORKS SECTION */}
      <section className="py-20 max-w-[1400px] mx-auto px-6 lg:px-12 text-center">
        
        {/* Section Heading */}
        <div className="mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#2C1810]">
            Comment ça fonctionne ?
          </h2>
          <div className="w-16 h-1 bg-[#E86225] mx-auto mt-3 rounded-full" />
        </div>

        {/* 4 Steps Flow */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center space-y-3 relative group">
            <div className="relative mb-2">
              <div className="w-16 h-16 rounded-full bg-[#E8F3EB] text-[#1E4D2B] flex items-center justify-center shadow-md">
                <UserPlus size={28} />
              </div>
              <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#1E4D2B] text-white text-xs font-extrabold flex items-center justify-center border-2 border-white shadow">
                1
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#2C1810]">Inscrivez-vous</h3>
            <p className="text-xs text-[#52433B] leading-relaxed max-w-xs">
              Créez votre compte et choisissez votre arrondissement.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center space-y-3 relative group">
            <div className="relative mb-2">
              <div className="w-16 h-16 rounded-full bg-[#FDF0E9] text-[#E86225] flex items-center justify-center shadow-md">
                <CreditCard size={28} />
              </div>
              <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#E86225] text-white text-xs font-extrabold flex items-center justify-center border-2 border-white shadow">
                2
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#2C1810]">Réglez votre participation</h3>
            <p className="text-xs text-[#52433B] leading-relaxed max-w-xs">
              Abonnement mensuel pour participer à 1 sortie par mois.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center space-y-3 relative group">
            <div className="relative mb-2">
              <div className="w-16 h-16 rounded-full bg-[#FAF5EF] text-amber-700 flex items-center justify-center shadow-md">
                <CalendarCheck size={28} />
              </div>
              <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-amber-800 text-white text-xs font-extrabold flex items-center justify-center border-2 border-white shadow">
                3
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#2C1810]">Réservez votre place</h3>
            <p className="text-xs text-[#52433B] leading-relaxed max-w-xs">
              Recevez les détails et confirmez votre présence.
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center space-y-3 relative group">
            <div className="relative mb-2">
              <div className="w-16 h-16 rounded-full bg-[#E8F3EB] text-[#1E4D2B] flex items-center justify-center shadow-md">
                <Users size={28} />
              </div>
              <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#1E4D2B] text-white text-xs font-extrabold flex items-center justify-center border-2 border-white shadow">
                4
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#2C1810]">Rencontrez &amp; profitez</h3>
            <p className="text-xs text-[#52433B] leading-relaxed max-w-xs">
              Partagez un bon repas et créez de belles amitiés !
            </p>
          </div>

        </div>
      </section>


      {/* FEATURED OUTINGS / RESTAURANT MEETUPS */}
      <section className="py-16 bg-[#FAF6F0] border-t border-[#EFE6DD]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#E86225]">
                Calendrier des rencontres
              </span>
              <h2 className="text-3xl font-extrabold font-heading text-[#2C1810] mt-1">
                Prochaines sorties au restaurant
              </h2>
            </div>
            <Link to="/events">
              <Button variant="ghost" className="text-[#E86225] font-bold hover:bg-[#FDF0E9] flex items-center gap-2">
                <span>Voir toutes les sorties</span>
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredOutings.map((outing, i) => (
              <Card
                key={i}
                className="overflow-hidden bg-white border border-[#EFE6DD] rounded-2xl shadow-sm hover:shadow-lg transition-all flex flex-col group"
              >
                <div className="relative h-48 bg-[#FAF5EF] overflow-hidden">
                  <img
                    src={outing.image}
                    alt={outing.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-[#1E4D2B] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow z-10">
                    {outing.tag}
                  </span>
                  <span className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-[#E86225] text-xs font-bold px-2.5 py-1 rounded-full shadow border border-[#E86225]/20 z-10">
                    {outing.placesLeft}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-extrabold text-base text-[#2C1810] group-hover:text-[#E86225] transition-colors mb-1">
                      {outing.title}
                    </h3>
                    <p className="text-xs text-[#52433B] flex items-center gap-1.5 font-medium">
                      <MapPin size={14} className="text-[#E86225]" />
                      <span>{outing.arrondissement}</span>
                    </p>
                    <p className="text-xs text-[#52433B] flex items-center gap-1.5 font-medium mt-1">
                      <Calendar size={14} className="text-[#1E4D2B]" />
                      <span>{outing.date}</span>
                    </p>
                  </div>

                  <Link to="/events">
                    <Button className="w-full py-2.5 rounded-xl bg-[#E86225] hover:bg-[#D0521B] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2">
                      <span>Réserver ma place</span>
                      <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

        </div>
      </section>


      {/* SUBSCRIPTION PLANS OVERVIEW */}
      <section className="py-20 bg-white border-t border-[#EFE6DD]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#E86225]">
              Formules d'abonnement
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#2C1810] mt-1 mb-3">
              Rejoignez le club des gastronomes
            </h2>
            <p className="text-sm text-[#52433B]">
              Participez à des sorties mensuelles conviviales et développez votre réseau d'amis.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Free / Discovery */}
            <Card className="p-8 border border-[#EFE6DD] rounded-3xl bg-[#FAF6F0] flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#52433B]">Pour découvrir</span>
                <h3 className="text-2xl font-bold text-[#2C1810] mt-1 mb-2">Membre Gratuit</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-[#2C1810]">Gratuit</span>
                </div>
                <ul className="space-y-3 mb-8 text-xs text-[#52433B]">
                  {['Création de profil', 'Consulter le calendrier des sorties', 'Parcourir les groupes par arrondissement', 'Accès à la FAQ'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <Check size={16} className="text-[#1E4D2B] shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/register">
                <Button className="w-full py-3 rounded-xl border border-[#2C1810] text-[#2C1810] hover:bg-[#E8F3EB] font-bold text-xs">
                  S'inscrire gratuitement
                </Button>
              </Link>
            </Card>

            {/* Popular / Standard Member */}
            <Card className="p-8 border-2 border-[#E86225] rounded-3xl bg-white shadow-xl relative flex flex-col justify-between">
              <span className="absolute top-4 right-4 bg-[#E86225] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                Recommandé
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E86225]">Sorties mensuelles</span>
                <h3 className="text-2xl font-bold text-[#2C1810] mt-1 mb-2">Membre Privilège</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-[#2C1810]">10 $</span>
                  <span className="text-xs text-[#52433B] mb-1">/mois</span>
                </div>
                <ul className="space-y-3 mb-8 text-xs text-[#52433B]">
                  {['Accès à 1 sortie restaurant par mois', 'Réservation prioritaire des places', 'Accès à la messagerie du groupe', 'Changement d\'arrondissement sans frais'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <Check size={16} className="text-[#E86225] shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/register">
                <Button className="w-full py-3 rounded-xl bg-[#E86225] hover:bg-[#D0521B] text-white font-bold text-xs shadow-md">
                  Rejoindre le club
                </Button>
              </Link>
            </Card>

            {/* Group Leader / Org */}
            <Card className="p-8 border border-[#EFE6DD] rounded-3xl bg-[#FAF6F0] flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1E4D2B]">Pour organisateurs</span>
                <h3 className="text-2xl font-bold text-[#2C1810] mt-1 mb-2">Organisateur de groupe</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-[#2C1810]">20 $</span>
                  <span className="text-xs text-[#52433B] mb-1">/mois</span>
                </div>
                <ul className="space-y-3 mb-8 text-xs text-[#52433B]">
                  {['Création et gestion d\'un groupe d\'arrondissement', 'Proposer de nouveaux restaurants', 'Gestion des réservations et présences', 'Badges exclusifs d\'hôte'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <Check size={16} className="text-[#1E4D2B] shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/register">
                <Button className="w-full py-3 rounded-xl bg-[#1E4D2B] hover:bg-[#163E22] text-white font-bold text-xs shadow-sm">
                  Devenir organisateur
                </Button>
              </Link>
            </Card>

          </div>

        </div>
      </section>

    </div>
  );
}

export default Landing;
