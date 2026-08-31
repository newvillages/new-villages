import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Users, Utensils, CalendarCheck, UserCircle } from 'lucide-react';

const steps = [
  {
    title: 'Trouvez votre groupe',
    desc: 'Rejoignez le groupe de sorties au restaurant de votre arrondissement.',
    icon: Users,
    color: 'bg-[#1E4D2B]'
  },
  {
    title: 'Sorties mensuelles',
    desc: 'Participez à 1 sortie conviviale par mois dans de superbes restaurants.',
    icon: Utensils,
    color: 'bg-[#E86225]'
  },
  {
    title: 'Réservez votre place',
    desc: 'Confirmez votre présence et rencontrez les autres membres.',
    icon: CalendarCheck,
    color: 'bg-amber-700'
  },
  {
    title: 'Complétez votre profil',
    desc: 'Présentez-vous en quelques mots pour faciliter les échanges.',
    icon: UserCircle,
    color: 'bg-[#1E4D2B]'
  }
];

export function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(c => c + 1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-body">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full text-center">
        
        <div className="w-full relative h-64 mb-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div className={`w-28 h-28 ${steps[currentStep].color} text-white rounded-full flex items-center justify-center mb-6 shadow-xl`}>
                {React.createElement(steps[currentStep].icon, { size: 52 })}
              </div>
              <h2 className="text-2xl font-heading font-extrabold text-[#2C1810] mb-2">{steps[currentStep].title}</h2>
              <p className="text-[#52433B] text-sm max-w-xs">{steps[currentStep].desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
      
      <div className="p-8 max-w-lg mx-auto w-full">
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-[#E86225]' : 'w-2 bg-slate-200'}`}
            />
          ))}
        </div>
        
        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            className="flex-1 text-[#52433B] font-bold text-xs" 
            onClick={() => navigate('/dashboard')}
          >
            Passer
          </Button>
          <Button 
            className="flex-1 bg-[#E86225] hover:bg-[#D0521B] text-white font-bold py-3 rounded-xl text-xs" 
            onClick={handleNext}
          >
            {currentStep === steps.length - 1 ? 'Commencer' : 'Suivant'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
