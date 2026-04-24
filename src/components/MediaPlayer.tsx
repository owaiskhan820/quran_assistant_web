"use client";

import { useAudioContext } from "@/context/AudioContext";
import chaptersData from "../../public/data/chapters/chapters.json";
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
  SkipForward,
  Repeat,
  Repeat1
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

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
    translations,
    playAyah
  } = useAudioContext();

  const [isReciterMenuOpen, setIsReciterMenuOpen] = useState(false);
  const [isTranslationMenuOpen, setIsTranslationMenuOpen] = useState(false);
  const [isRepeatMenuOpen, setIsRepeatMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    repeatMode,
    setRepeatMode,
    repeatCount,
    setRepeatCount,
    repeatRange,
    setRepeatRange,
    rangeRepeatCount,
    setRangeRepeatCount,
    currentRepeatIndex,
    rangeCycleIndex
  } = useAudioContext();

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsReciterMenuOpen(false);
        setIsTranslationMenuOpen(false);
        setIsRepeatMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Close menus when ayah changes or player is closed
  useEffect(() => {
    setIsReciterMenuOpen(false);
    setIsTranslationMenuOpen(false);
    setIsRepeatMenuOpen(false);
  }, [currentAyah?.surah, currentAyah?.ayah]);

  if (!currentAyah) return null;

  const surahName = getSurahNameArabic(currentAyah.surah);

  return (
    <AnimatePresence>
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.1}
        dragConstraints={{ top: -1000, left: -1000, right: 1000, bottom: 0 }}
        initial={{ y: 100, opacity: 0, x: "-50%" }}
        animate={{ y: 0, opacity: 1, x: "-50%" }}
        exit={{ y: 100, opacity: 0, x: "-50%" }}
        whileDrag={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
        className="fixed bottom-6 left-1/2 z-[100] w-[95vw] max-w-md touch-none"
      >
        <div ref={containerRef} className="relative bg-white/70 backdrop-blur-3xl border border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-[2.5rem] p-4 flex flex-col gap-3 overflow-visible">
          
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 rounded-[2.5rem] border border-white/20 pointer-events-none" />
          
          {/* Drag Handle Indicator */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 rounded-full opacity-50 mb-1 pointer-events-none" />
          
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
                <div className="px-1 border-b border-gray-50 pb-1 mb-1">
                  <button
                    onClick={() => {
                      setTranslationId(0);
                      setIsTranslationMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors ${translationId === 0 ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-500'}`}
                  >
                    <span className="text-sm">Turn Off Translation</span>
                    {translationId === 0 && <Check size={14} />}
                  </button>
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

            {isRepeatMenuOpen && (
              <motion.div
                key="repeat-menu"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute bottom-[calc(100%+12px)] left-0 right-0 mx-auto w-full max-w-[320px] bg-white/95 backdrop-blur-md border border-gray-100 shadow-2xl rounded-2xl overflow-hidden py-4 z-50 px-4"
              >
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-muted uppercase tracking-wider block">Repeat Settings</span>
                    <button 
                      onClick={() => setIsRepeatMenuOpen(false)}
                      className="p-1 hover:bg-black/5 rounded-full text-muted transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-3">Repeat Mode</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setRepeatMode('none')}
                        className={`py-2 px-1 text-xs rounded-xl border transition-all ${repeatMode === 'none' ? 'bg-primary text-white border-primary shadow-md' : 'border-gray-100 hover:bg-gray-50 text-gray-600'}`}
                      >
                        Off
                      </button>
                      <button
                        onClick={() => setRepeatMode('single')}
                        className={`py-2 px-1 text-xs rounded-xl border transition-all ${repeatMode === 'single' ? 'bg-primary text-white border-primary shadow-md' : 'border-gray-100 hover:bg-gray-50 text-gray-600'}`}
                      >
                        Current
                      </button>
                      <button
                        onClick={() => setRepeatMode('range')}
                        className={`py-2 px-1 text-xs rounded-xl border transition-all ${repeatMode === 'range' ? 'bg-primary text-white border-primary shadow-md' : 'border-gray-100 hover:bg-gray-50 text-gray-600'}`}
                      >
                        Range
                      </button>
                    </div>
                  </div>

                  {repeatMode !== 'none' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-3">Ayah Repetitions</span>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                        {[1, 2, 3, 5, 10, 0].map((c) => (
                          <button
                            key={c}
                            onClick={() => setRepeatCount(c)}
                            className={`py-2 text-xs rounded-lg border transition-all ${repeatCount === c ? 'bg-primary/10 text-primary border-primary/20 font-bold' : 'border-gray-100 hover:bg-gray-50 text-gray-500'}`}
                          >
                            {c === 0 ? '∞' : `${c}x`}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {repeatMode === 'range' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-3">Range Repetitions</span>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                        {[1, 2, 3, 5, 10, 0].map((c) => (
                          <button
                            key={c}
                            onClick={() => setRangeRepeatCount(c)}
                            className={`py-2 text-xs rounded-lg border transition-all ${rangeRepeatCount === c ? 'bg-primary/10 text-primary border-primary/20 font-bold' : 'border-gray-100 hover:bg-gray-50 text-gray-500'}`}
                          >
                            {c === 0 ? '∞' : `${c}x`}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {repeatMode === 'range' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-col gap-3 pt-2 border-t border-gray-50">
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-muted uppercase tracking-wider block">Select Range</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <span className="text-[10px] text-gray-400 block mb-1">From Ayah</span>
                            <select 
                              value={repeatRange.start?.ayah || ""}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                // Update the range start in context, but don't jump yet
                                setRepeatRange({ 
                                  ...repeatRange, 
                                  start: { surah: currentAyah.surah, ayah: val } 
                                });
                              }}
                              className="w-full bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary/20 outline-none"
                            >
                              <option value="" disabled>Start...</option>
                              {Array.from({ length: chaptersData.chapters.find(c => c.id === currentAyah.surah)?.verses_count || 0 }, (_, i) => i + 1).map(n => (
                                <option key={n} value={n}>{n}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1">
                            <span className="text-[10px] text-gray-400 block mb-1">To Ayah</span>
                            <select 
                              value={repeatRange.end?.ayah || ""}
                              onChange={(e) => {
                                const val = e.target.value ? parseInt(e.target.value) : null;
                                setRepeatRange({ 
                                  ...repeatRange, 
                                  end: val ? { surah: currentAyah.surah, ayah: val } : null 
                                });
                              }}
                              className="w-full bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5 text-xs focus:ring-1 focus:ring-primary/20 outline-none"
                            >
                              <option value="">End...</option>
                              {Array.from(
                                { length: chaptersData.chapters.find(c => c.id === currentAyah.surah)?.verses_count || 0 }, 
                                (_, i) => i + 1
                              )
                              .filter(n => n >= (repeatRange.start?.ayah || currentAyah.ayah))
                              .map(n => (
                                <option key={n} value={n}>{n}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <button
                    onClick={() => {
                      // Apply the jump only when confirming
                      if (repeatMode === 'range' && repeatRange.start) {
                        playAyah(currentAyah.surah, repeatRange.start.ayah, true);
                      }
                      setIsRepeatMenuOpen(false);
                    }}
                    className="w-full bg-primary/90 hover:bg-primary text-white py-2.5 rounded-xl text-sm font-bold shadow-[0_8px_20px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_12px_25px_rgba(var(--primary-rgb),0.4)] hover:scale-[1.01] active:scale-95 transition-all mt-2 border border-white/20 backdrop-blur-sm"
                  >
                    Confirm Settings
                  </button>
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
          <AnimatePresence>
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

          {/* Controls Section - Glassy Finish */}
          <div className="flex items-center justify-between bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl p-2 shadow-inner">
            
            <div className="flex items-center gap-1">
              {/* Reciter Selector Button */}
              <button 
                onClick={() => {
                  setIsReciterMenuOpen(!isReciterMenuOpen);
                  setIsTranslationMenuOpen(false);
                  setIsRepeatMenuOpen(false);
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
                  setIsRepeatMenuOpen(false);
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
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${isAutoplay ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-black/5'}`}
              title={isAutoplay ? "Autoplay On" : "Autoplay Off"}
            >
              <RefreshCcw size={20} className={isAutoplay ? 'animate-spin-slow' : ''} />
            </button>

            {/* Repeat Toggle */}
            <button 
              onClick={() => {
                setIsRepeatMenuOpen(!isRepeatMenuOpen);
                setIsReciterMenuOpen(false);
                setIsTranslationMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${repeatMode !== 'none' ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-black/5'}`}
              title="Repeat Settings"
            >
              {repeatMode === 'single' ? <Repeat1 size={20} /> : <Repeat size={20} />}
            </button>

          </div>
        </div>
        </motion.div>
    </AnimatePresence>
  );
}
