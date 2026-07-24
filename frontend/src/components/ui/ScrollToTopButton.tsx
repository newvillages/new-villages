import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={scrollToTop}
          aria-label="Scroll back to top"
          className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0A2540] via-[#0F3054] to-[#1D4ED8] text-white flex items-center justify-center shadow-xl shadow-[#0A2540]/30 hover:shadow-2xl hover:shadow-[#1D4ED8]/40 border border-white/20 transition-all duration-300 hover:scale-110 active:scale-95 group"
        >
          <ArrowUp size={20} className="text-white group-hover:-translate-y-0.5 transition-transform duration-200" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default ScrollToTopButton;
