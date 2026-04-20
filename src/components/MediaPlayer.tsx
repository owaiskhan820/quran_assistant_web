"use client";

import { useAudioContext } from "@/context/AudioContext";
import { getSurahNameArabic } from "@/utils/surah";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  ChevronUp, 
  User, 
  Check, 
  RefreshCcw,
  Languages,
  SkipBack,
  SkipForward
} from "lucide-react";
import { useState, useEffect } from "react";

export default function MediaPlayer() {
  const { 
    currentAyah, 
    isPlaying, 
    isAutoplay, 
    togglePlay, 
    toggleAutoplay, 
    stopAudio,
    playNextAyah,
    playPreviousAyah,
    reciters, 
    reciterId, 
    setReciter,
    translationId,
    setTranslationId,
    translationText,
    translations
  } = useAudioContext();

  const [isReciterMenuOpen, setIsReciterMenuOpen] = useState(false);
  const [isTranslationMenuOpen, setIsTranslationMenuOpen] = useState(false);

  // Close menus when ayah changes or player is closed
  useEffect(() => {
    setIsReciterMenuOpen(false);
    setIsTranslationMenuOpen(false);
  }, [currentAyah?.surah, currentAyah?.ayah]);

  if (!currentAyah) return null;

  const surahName = getSurahNameArabic(currentAyah.surah);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[95vw] max-w-md"
      >
        <div className="relative bg-white/80 backdrop-blur-xl border border-primary/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl p-4 flex flex-col gap-3 overflow-visible">
          
          {/* Qari Selector Popup (Centralized) */}
          <AnimatePresence mode="wait">
            {isReciterMenuOpen && (
              <motion.div
                key="reciter-menu"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute bottom-[calc(100%+12px)] left-0 right-0 mx-auto w-full max-w-[320px] bg-white/95 backdrop-blur-md border border-gray-100 shadow-2xl rounded-2xl overflow-hidden py-2 z-50 max-h-[300px] overflow-y-auto custom-scrollbar"
              >
                <div className="sticky top-0 bg-white/90 backdrop-blur-sm px-4 py-2 border-b border-gray-50 mb-1 z-10">
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">Choose Reciter</span>
                </div>
                <div className="px-1">
                  {reciters.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setReciter(r.id);
                        setIsReciterMenuOpen(false);
                      }}
                      className="w-full px-3 py-2.5 text-left flex items-center justify-between hover:bg-primary/5 rounded-xl transition-colors mb-0.5"
                    >
                      <div className="flex flex-col">
                        <span className={`${reciterId === r.id ? 'text-primary font-semibold' : 'text-gray-700'} text-sm`}>
                          {r.name}
                        </span>
                        {r.style && <span className="text-[10px] text-muted opacity-80">{r.style}</span>}
                      </div>
                      {reciterId === r.id && (
                        <div className="bg-primary/10 p-1 rounded-full">
                          <Check size={14} className="text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {isTranslationMenuOpen && (
              <motion.div
                key="translation-menu"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute bottom-[calc(100%+12px)] left-0 right-0 mx-auto w-full max-w-[320px] bg-white/95 backdrop-blur-md border border-gray-100 shadow-2xl rounded-2xl overflow-hidden py-2 z-50 max-h-[300px] overflow-y-auto custom-scrollbar"
              >
                <div className="sticky top-0 bg-white/90 backdrop-blur-sm px-4 py-2 border-b border-gray-50 mb-1 z-10">
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">Choose Translation</span>
                </div>
                <div className="px-1">
                  {translations.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTranslationId(t.id);
                        setIsTranslationMenuOpen(false);
                      }}
                      className="w-full px-3 py-2.5 text-left flex items-center justify-between hover:bg-primary/5 rounded-xl transition-colors mb-0.5"
                    >
                      <div className="flex flex-col">
                        <span className={`${translationId === t.id ? 'text-primary font-semibold' : 'text-gray-700'} text-sm`}>
                          {t.name}
                        </span>
                        <span className="text-[10px] text-muted opacity-80">{t.author}</span>
                      </div>
                      {translationId === t.id && (
                        <div className="bg-primary/10 p-1 rounded-full">
                          <Check size={14} className="text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top Section: Info and Close */}
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-muted font-bold">Now Playing</span>
              <div className="flex items-center gap-2">
                <span 
                  className="text-primary font-semibold text-xl" 
                  style={{ fontFamily: "surah-name-v3", textRendering: "optimizeLegibility" }}
                >
                  سُورَةُ {surahName}
                </span>
                <span className="text-muted text-sm font-medium">Ayah {currentAyah.ayah}</span>
              </div>
            </div>
            <button 
              onClick={stopAudio}
              className="p-1.5 hover:bg-black/5 rounded-full transition-colors text-muted hover:text-primary"
            >
              <X size={18} />
            </button>
          </div>

          {/* Translation Text Display */}
          <AnimatePresence mode="wait">
            {currentAyah && translationText && (
              <motion.div
                key={`${currentAyah.surah}:${currentAyah.ayah}-${translationId}`}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="px-4 py-1 pb-2"
              >
                {/* 
                  Urdu IDs for RTL and Arabic Font:
                  158, 97, 234, 54, 151, 819 
                */}
                <p 
                  className={`text-gray-700 leading-relaxed text-center font-medium selection:bg-primary/20 transition-all duration-300
                    ${[158, 97, 234, 54, 151, 819].includes(translationId) 
                      ? 'font-arabic text-xl border-t border-primary/5 pt-2' 
                      : 'text-sm'}`}
                  dir={[158, 97, 234, 54, 151, 819].includes(translationId) ? "rtl" : "ltr"}
                >
                  {[158, 97, 234, 54, 151, 819].includes(translationId) ? translationText : `"${translationText}"`}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls Section */}
          <div className="flex items-center justify-between bg-emerald-50/50 rounded-2xl p-2">
            
            <div className="flex items-center gap-1">
              {/* Reciter Selector Button */}
              <button 
                onClick={() => {
                  setIsReciterMenuOpen(!isReciterMenuOpen);
                  setIsTranslationMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl transition-all flex items-center gap-2 ${isReciterMenuOpen ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-primary/10 text-primary'}`}
                title="Choose Qari"
              >
                <User size={20} />
              </button>

              {/* Translation Selector Button */}
              <button 
                onClick={() => {
                  setIsTranslationMenuOpen(!isTranslationMenuOpen);
                  setIsReciterMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl transition-all flex items-center gap-2 ${isTranslationMenuOpen ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-primary/10 text-primary'}`}
                title="Choose Translation"
              >
                <Languages size={20} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Previous Ayah Button */}
              <button 
                onClick={playPreviousAyah}
                className="p-2 rounded-xl text-primary hover:bg-primary/10 transition-all active:scale-90"
                title="Previous Ayah"
              >
                <SkipBack size={20} fill="currentColor" className="opacity-80" />
              </button>

              {/* Play/Pause Button */}
              <button 
                onClick={togglePlay}
                className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
              >
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
              </button>

              {/* Next Ayah Button */}
              <button 
                onClick={playNextAyah}
                className="p-2 rounded-xl text-primary hover:bg-primary/10 transition-all active:scale-90"
                title="Next Ayah"
              >
                <SkipForward size={20} fill="currentColor" className="opacity-80" />
              </button>
            </div>

            {/* Autoplay Toggle */}
            <button 
              onClick={toggleAutoplay}
              className={`p-2.5 rounded-xl transition-all flex items-center gap-2 ${isAutoplay ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-black/5'}`}
              title={isAutoplay ? "Autoplay On" : "Autoplay Off"}
            >
              <RefreshCcw size={20} className={isAutoplay ? 'animate-spin-slow' : ''} />
              {isAutoplay && <span className="text-xs font-bold uppercase tracking-tighter">Auto</span>}
            </button>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

