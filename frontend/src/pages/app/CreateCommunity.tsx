import { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Globe, Lock, Image, Loader2, X } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useCategories } from '../../hooks/useAdmin';
import { useCreateCommunityRequest } from '../../hooks/useCommunities';
import { useUploadImage } from '../../hooks/useUpload';
import { useStore } from '../../store/useStore';
import { ApiError } from '../../lib/apiClient';
import { toast } from '../../store/useToastStore';

const STEPS = ['Informations de base', 'Détails', 'Confidentialité', 'Vérification'];
const DEFAULT_CATEGORIES = ['Gastronomie & Sorties', 'Culture & Patrimoine', 'Rencontres & Amitié', 'Loisirs & Activités', 'Familles & Parents', 'Entraide locale'];

export function CreateCommunity() {
  const navigate = useNavigate();
  const currentUser = useStore((s) => s.currentUser);
  const { data: dynamicCategories } = useCategories();

  const categoriesList = dynamicCategories && dynamicCategories.length > 0 ? dynamicCategories.map(c => c.name) : DEFAULT_CATEGORIES;

  useEffect(() => {
    if (currentUser && currentUser.role !== 'COMMUNITY_LEADER') {
      navigate('/communities');
      toast.info('Seuls les organisateurs peuvent demander la création d\'un groupe.');
    }
  }, [currentUser, navigate]);

  const [step, setStep] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', category: '', description: '', privacy: 'public', city: currentUser?.city ?? '', coverImageUrl: '' });
  const createRequest = useCreateCommunityRequest();
  const uploadImage = useUploadImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.info('Veuillez sélectionner un fichier image.');
      return;
    }
    uploadImage.mutate(file, {
      onSuccess: (res) => update('coverImageUrl', res.url),
      onError: (err) => toast.info(err instanceof ApiError ? err.message : 'Impossible de téléverser cette image.'),
    });
  };

  const handleSubmit = () => {
    setFormError(null);
    createRequest.mutate(
      { name: form.name, description: form.description, category: form.category, city: form.city, visibility: form.privacy.toUpperCase(), coverImageUrl: form.coverImageUrl || undefined },
      { onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Impossible de soumettre votre demande.') }
    );
  };

  if (createRequest.isSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 font-body">
        <Card className="w-full max-w-md text-center border-[#EFE6DD] shadow-sm rounded-3xl">
          <CardContent className="p-10">
            <div className="w-20 h-20 bg-[#E8F3EB] rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎉</span>
            </div>
            <h2 className="text-2xl font-heading font-extrabold text-[#2C1810] mb-2">Demande soumise avec succès !</h2>
            <p className="text-[#52433B] text-sm mb-6">Votre demande de groupe d'arrondissement est en cours de validation par l'administration.</p>
            <Link to="/communities"><Button className="w-full bg-[#E86225] hover:bg-[#D0521B] text-white font-bold rounded-xl py-3">Retour aux groupes</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 font-body text-[#2C1810]">
      <div className="max-w-2xl mx-auto">
        <Link to="/communities" className="inline-flex items-center gap-2 text-[#E86225] font-semibold hover:underline mb-6 text-sm">
          <ArrowLeft size={16}/> Retour aux groupes
        </Link>
        <h1 className="text-3xl font-heading font-extrabold mb-2 text-[#2C1810]">Créer un groupe d'arrondissement</h1>
        <p className="text-[#52433B] text-sm mb-8">Remplissez les détails ci-dessous. Les nouveaux groupes sont validés par l'administration.</p>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((_s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors", i <= step ? 'bg-[#E86225] text-white' : 'bg-[#EFE6DD] text-[#52433B]')}>{i + 1}</div>
              {i < STEPS.length - 1 && <div className={cn("flex-1 h-1 mx-2 rounded", i < step ? 'bg-[#E86225]' : 'bg-[#EFE6DD]')} />}
            </div>
          ))}
        </div>

        <Card className="bg-white rounded-3xl border border-[#EFE6DD] shadow-sm">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

                {step === 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-heading font-bold text-[#2C1810] mb-4">Informations de base</h2>
                    <div><label className="block text-sm font-medium mb-1 text-[#2C1810]">Nom du groupe *</label><Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Ex : Bouffe & Amitié - Plateau-Mont-Royal" required className="bg-[#FAF5EF] border-[#EFE6DD]" /></div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#2C1810]">Catégorie *</label>
                      <div className="flex flex-wrap gap-2">
                        {categoriesList.map(cat => (
                          <button key={cat} type="button" onClick={() => update('category', cat)} className={cn("px-3.5 py-1.5 rounded-full border text-xs font-bold transition-colors cursor-pointer", form.category === cat ? 'bg-[#E86225] text-white border-[#E86225]' : 'border-[#EFE6DD] text-[#52433B] hover:border-[#E86225]')}>{cat}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-heading font-bold text-[#2C1810] mb-4">Détails du groupe</h2>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[#2C1810]">Description *</label>
                      <textarea value={form.description} onChange={e => update('description', e.target.value)} className="w-full border border-[#EFE6DD] rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#E86225] bg-[#FAF5EF] text-[#2C1810]" rows={4} placeholder="Présentez la communauté, le style de sorties et la philosophie du groupe..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[#2C1810]">Image de couverture (optionnelle)</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                      />
                      {form.coverImageUrl ? (
                        <div className="relative rounded-xl overflow-hidden border border-[#EFE6DD]">
                          <img src={form.coverImageUrl} alt="Aperçu" className="w-full h-40 object-cover" />
                          <button
                            type="button"
                            onClick={() => update('coverImageUrl', '')}
                            className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => !uploadImage.isPending && fileInputRef.current?.click()}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleFile(e.dataTransfer.files?.[0]);
                          }}
                          className={cn(
                            "border-2 border-dashed border-[#EFE6DD] bg-[#FAF5EF] rounded-2xl p-8 text-center transition-colors",
                            uploadImage.isPending ? "cursor-wait opacity-70" : "hover:border-[#E86225] cursor-pointer"
                          )}
                        >
                          {uploadImage.isPending ? (
                            <Loader2 size={32} className="mx-auto text-[#E86225] mb-2 animate-spin" />
                          ) : (
                            <Image size={32} className="mx-auto text-[#52433B]/40 mb-2"/>
                          )}
                          <p className="text-sm text-[#52433B]">{uploadImage.isPending ? 'Téléversement…' : 'Cliquez ou glissez une photo de couverture'}</p>
                          <p className="text-xs text-[#52433B]/60 mt-1">PNG, JPG jusqu'à 5 Mo</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-heading font-bold text-[#2C1810] mb-4">Paramètres de confidentialité</h2>
                    <div className="space-y-3">
                      {[
                        { id: 'public', label: 'Public', desc: 'Tout membre peut trouver et rejoindre ce groupe.', icon: Globe },
                        { id: 'private', label: 'Sur invitation', desc: 'Accès limité aux personnes invitées ou approuvées.', icon: Lock },
                      ].map(opt => (
                        <button key={opt.id} type="button" onClick={() => update('privacy', opt.id)} className={cn("w-full text-left p-4 rounded-2xl border-2 flex items-start gap-4 transition-colors cursor-pointer", form.privacy === opt.id ? 'border-[#E86225] bg-[#FDF0E9]' : 'border-[#EFE6DD] hover:border-gray-300')}>
                          <opt.icon size={22} className={form.privacy === opt.id ? 'text-[#E86225]' : 'text-gray-400'} />
                          <div><p className="font-semibold text-[#2C1810]">{opt.label}</p><p className="text-sm text-[#52433B]">{opt.desc}</p></div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-heading font-bold text-[#2C1810] mb-4">Vérification &amp; Soumission</h2>
                    <div className="bg-[#FAF5EF] rounded-2xl p-4 space-y-2 text-sm border border-[#EFE6DD]">
                      <div className="flex justify-between"><span className="text-[#52433B]">Nom</span><span className="font-medium text-[#2C1810]">{form.name || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-[#52433B]">Catégorie</span><span className="font-medium text-[#2C1810]">{form.category || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-[#52433B]">Visibilité</span><span className="font-medium capitalize text-[#2C1810]">{form.privacy}</span></div>
                      <div className="flex justify-between items-center"><span className="text-[#52433B]">Couverture</span><span className="font-medium text-[#2C1810]">{form.coverImageUrl ? '✓ Incluse' : 'Aucune'}</span></div>
                    </div>
                    {form.coverImageUrl && (
                      <img src={form.coverImageUrl} alt="Aperçu" className="w-full h-32 object-cover rounded-xl border border-[#EFE6DD]" />
                    )}
                    <p className="text-xs text-[#52433B]">En soumettant cette demande, votre groupe sera révisé par l'administration avant sa mise en ligne.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl mt-6">
                {formError}
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-[#EFE6DD]">
              <Button variant="ghost" onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/communities')} className="text-[#52433B]"><ArrowLeft size={16} className="mr-2"/>Retour</Button>
              {step < STEPS.length - 1
                ? <Button onClick={() => setStep(s => s + 1)} disabled={step === 0 && (!form.name || !form.category)} className="bg-[#E86225] hover:bg-[#D0521B] text-white font-bold rounded-xl px-5">Suivant <ArrowRight size={16} className="ml-2"/></Button>
                : <Button onClick={handleSubmit} disabled={createRequest.isPending} className="bg-[#E86225] hover:bg-[#D0521B] text-white font-bold rounded-xl px-5">{createRequest.isPending ? 'Soumission…' : 'Soumettre pour approbation'}</Button>
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
