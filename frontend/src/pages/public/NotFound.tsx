import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-heading font-extrabold text-[#E86225] mb-4">404</h1>
      <h2 className="text-2xl font-bold text-[#2C1810] mb-4">Page introuvable</h2>
      <p className="text-[#52433B] text-sm mb-8 max-w-md">
        Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link to="/">
        <Button className="bg-[#E86225] hover:bg-[#D0521B] text-white font-bold px-6 py-3 rounded-xl">
          Retour à l'accueil
        </Button>
      </Link>
    </div>
  );
}

export default NotFound;
