"use client";

import Link from 'next/link';
import { useAudioContext } from "@/context/AudioContext";
import { 
  ChevronLeft, 
  Globe, 
  User, 
  BookOpen, 
  Check, 
  Mic2,
  Languages
} from "lucide-react";

export default function SettingsPage() {
  const { 
    language, 
    setLanguage, 
    reciters, 
    reciterId, 
    setReciter, 
    translations, 
    translationId, 
    setTranslationId 
  } = useAudioContext();

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-2xl px-6 pt-10 pb-6 flex items-center justify-between sticky top-0 bg-surface/80 backdrop-blur-md z-50">
        <Link 
          href="/" 
          className="p-3 rounded-2xl bg-white shadow-sm border border-gray-100 text-muted hover:text-primary hover:border-primary/20 transition-all active:scale-95"
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold font-serif text-primary">Settings</h1>
        <div className="w-12" /> {/* Spacer */}
      </header>

      <main className="w-full max-w-2xl px-6 pb-20 space-y-10">
        
        {/* Language Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Globe size={18} />
            </div>
            <h2 className="font-bold text-gray-800 tracking-tight">Display Language</h2>
          </div>
          
          <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100 grid grid-cols-2 gap-1">
            <button 
              onClick={() => setLanguage('en')}
              className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${language === 'en' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-gray-50 text-gray-600'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${language === 'en' ? 'bg-white/20' : 'bg-gray-100'}`}>A</div>
              <span className="font-bold">English</span>
              {language === 'en' && <Check size={16} className="ml-auto" />}
            </button>

            <button 
              onClick={() => setLanguage('ur')}
              className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${language === 'ur' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-gray-50 text-gray-600'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-arabic ${language === 'ur' ? 'bg-white/20' : 'bg-gray-100'}`}>ع</div>
              <span className="font-bold">Urdu</span>
              {language === 'ur' && <Check size={16} className="ml-auto" />}
            </button>
          </div>
        </section>

        {/* Reciter Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Mic2 size={18} />
            </div>
            <h2 className="font-bold text-gray-800 tracking-tight">Reciter (Qari)</h2>
          </div>
          
          <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100 max-h-[400px] overflow-y-auto custom-scrollbar space-y-1">
            {reciters.map((r) => (
              <button
                key={r.id}
                onClick={() => setReciter(r.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${reciterId === r.id ? 'bg-primary/5 border border-primary/20 shadow-inner' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${reciterId === r.id ? 'bg-primary text-white' : 'bg-gray-100 text-muted'}`}>
                    <User size={20} />
                  </div>
                  <div className="text-left">
                    <p className={`font-bold text-sm ${reciterId === r.id ? 'text-primary' : 'text-gray-700'}`}>{r.name}</p>
                    <p className="text-[10px] text-muted uppercase tracking-wider font-medium">{r.style || 'Murattal'}</p>
                  </div>
                </div>
                {reciterId === r.id && <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white"><Check size={14} /></div>}
              </button>
            ))}
          </div>
        </section>

        {/* Translation Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Languages size={18} />
            </div>
            <h2 className="font-bold text-gray-800 tracking-tight">Verse Translation</h2>
          </div>
          
          <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100 max-h-[400px] overflow-y-auto custom-scrollbar space-y-1">
            {/* Split translations by language for clarity */}
            <div className="px-4 py-2">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Available Translations</span>
            </div>
            {translations.map((t) => (
              <button
                key={t.id}
                onClick={() => setTranslationId(t.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${translationId === t.id ? 'bg-primary/5 border border-primary/20 shadow-inner' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${translationId === t.id ? 'bg-primary text-white' : 'bg-gray-100 text-muted'}`}>
                    <BookOpen size={20} />
                  </div>
                  <div className="text-left">
                    <p className={`font-bold text-sm ${translationId === t.id ? 'text-primary' : 'text-gray-700'}`}>{t.name}</p>
                    <p className="text-[10px] text-muted font-medium">{t.author}</p>
                  </div>
                </div>
                {translationId === t.id && <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white"><Check size={14} /></div>}
              </button>
            ))}
          </div>
        </section>

        {/* Action Button */}
        <Link 
          href="/" 
          className="w-full flex items-center justify-center px-8 py-5 bg-primary text-white font-bold rounded-[2rem] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-lg"
        >
          Finish & Return to Mushaf
        </Link>

      </main>
    </div>
  );
}
