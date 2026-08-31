import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#133820] text-white pt-12 pb-8 border-t border-[#1E4D2B] mt-auto w-full overflow-hidden font-body">
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-left">
        
        {/* Brand & Description */}
        <div className="space-y-4">
          <Link to="/" className="inline-block bg-white p-2.5 rounded-2xl shadow-md group">
            <img
              src="/logo-bouffe-amitie.png"
              alt="Bouffe &amp; Amitié"
              className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
          <p className="text-xs text-emerald-100/80 leading-relaxed">
            Un club de sorties au restaurant pour rencontrer de nouvelles personnes et créer de vraies amitiés.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors" aria-label="Facebook">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors" aria-label="Instagram">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="mailto:info@bouffeamitie.ca" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors" aria-label="Courriel">
              <Mail size={16} />
            </a>
          </div>
        </div>

        {/* Useful Links */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Liens utiles</h4>
          <ul className="space-y-2 text-xs text-emerald-100/80 font-medium">
            <li>
              <Link to="/" className="hover:text-amber-400 transition-colors">Accueil</Link>
            </li>
            <li>
              <Link to="/communities" className="hover:text-amber-400 transition-colors">Prochaines sorties</Link>
            </li>
            <li>
              <Link to="/communities" className="hover:text-amber-400 transition-colors">Groupes par arrondissement</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-amber-400 transition-colors">FAQ</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-amber-400 transition-colors">Nous contacter</Link>
            </li>
          </ul>
        </div>

        {/* Information Links */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Informations</h4>
          <ul className="space-y-2 text-xs text-emerald-100/80 font-medium">
            <li>
              <Link to="/terms" className="hover:text-amber-400 transition-colors">Conditions d'utilisation</Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-amber-400 transition-colors">Politique de confidentialité</Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-amber-400 transition-colors">Règles de la communauté</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Nous joindre</h4>
          <a href="mailto:info@bouffeamitie.ca" className="flex items-center gap-2 text-xs text-emerald-100 hover:text-amber-400 transition-colors">
            <Mail size={16} className="text-amber-400 shrink-0" />
            <span>info@bouffeamitie.ca</span>
          </a>
          <div>
            <h5 className="text-xs font-bold text-white mb-1">Suivez-nous !</h5>
            <p className="text-xs text-emerald-100/80">Restez à l'affût de nos prochaines sorties.</p>
          </div>
        </div>
      </div>

      {/* Sub-footer Copyright */}
      <div className="border-t border-emerald-900/60 pt-6 mt-6 text-center text-xs text-emerald-200/70 space-y-1">
        <p>
          Espace membre accessible sur{' '}
          <a href="https://newvillages.ca" target="_blank" rel="noreferrer" className="underline hover:text-white transition-colors">
            NewVillages.ca
          </a>
        </p>
        <p>&copy; 2026 Bouffe &amp; Amitié – Tous droits réservés.</p>
      </div>
    </footer>
  );
}

export default Footer;
