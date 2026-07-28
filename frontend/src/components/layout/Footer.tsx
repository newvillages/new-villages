import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#07192C] via-[#0A2540] to-[#07192C] text-white py-8 md:py-10 border-t border-[#1E3A5F] mt-auto mb-16 md:mb-0 shadow-inner w-full overflow-hidden">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        
        {/* Logo Container with clean white badge background for perfect visibility */}
        <div className="flex items-center justify-center">
          <Link to="/" className="bg-white hover:bg-white p-2 md:p-2.5 rounded-2xl transition-all shadow-md border border-white/20 group">
            <img
              src="/logo-new-villages.webp"
              alt="NewVillages"
              className="h-10 md:h-14 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Navigation Links - Fully responsive flex wrap */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-300">
          <Link to="/terms" className="hover:text-[#38BDF8] transition-colors whitespace-nowrap">
            Terms &amp; Conditions
          </Link>
          <span className="text-slate-600 font-bold">&bull;</span>
          <Link to="/privacy" className="hover:text-[#38BDF8] transition-colors whitespace-nowrap">
            Privacy Policy
          </Link>
          <span className="text-slate-600 font-bold">&bull;</span>
          <Link to="/contact" className="hover:text-[#38BDF8] transition-colors whitespace-nowrap">
            Contact
          </Link>
          <span className="text-slate-600 font-bold hidden sm:inline">&bull;</span>
          <span className="flex items-center justify-center gap-1.5 text-slate-300 w-full sm:w-auto mt-1 sm:mt-0">
            <span>Made With</span>
            <Heart size={14} className="fill-red-500 text-red-500 animate-pulse" />
            <span>by</span>
            <a
              href="https://www.luminex.rw"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline font-bold text-[#38BDF8] hover:text-white transition-colors"
            >
              Luminex
            </a>
          </span>
        </div>

        {/* Copyright */}
        <div className="text-[11px] sm:text-xs font-medium text-slate-400">
          &copy; {new Date().getFullYear()} NewVillages Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
