"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { updateUserPreferences } from "@/actions/user";
import chaptersData from "../../public/data/chapters/chapters.json";

interface AyahId {
  surah: number;
  ayah: number;
}

interface Reciter {
  id: number;
  name: string;
  style?: string;
  slug: string;
}

interface Translation {
  id: number;
  name: string;
  author: string;
  slug: string;
}

interface AudioContextType {
  currentAyah: AyahId | null;
  isPlaying: boolean;
  isAutoplay: boolean;
  reciterId: number;
  reciters: Reciter[];
  playAyah: (surah: number, ayah: number, shouldPlay?: boolean, overrideReciterId?: number, isInternal?: boolean) => void;
  playUrl: (url: string, id: string, surah?: number, ayah?: number) => void;
  togglePlay: () => void;
  toggleAutoplay: () => void;
  playNextAyah: () => void;
  playPreviousAyah: () => void;
  setReciter: (id: number) => void;
  stopAudio: () => void;
  activeId: string | null; // For highlighting in mushaf (e.g. "1:1")
  wordTranslations: Record<string, string>;
  fetchWordTranslations: (pageNumber: number) => Promise<void>;
  translationId: number;
  setTranslationId: (id: number) => void;
  translationText: string | null;
  translations: Translation[];

  // Repeat Feature
  repeatMode: 'none' | 'single' | 'range';
  setRepeatMode: (mode: 'none' | 'single' | 'range') => void;
  repeatCount: number;
  setRepeatCount: (count: number) => void;
  repeatRange: { start: AyahId | null, end: AyahId | null };
  setRepeatRange: (range: { start: AyahId | null, end: AyahId | null }) => void;
  rangeRepeatCount: number;
  setRangeRepeatCount: (count: number) => void;
  currentRepeatIndex: number;
  rangeCycleIndex: number;
  language: 'en' | 'ur';
  setLanguage: (lang: 'en' | 'ur') => void;
  lastRead: { pageNumber: number, surahName: string } | null;
  setLastRead: (data: { pageNumber: number, surahName: string }) => void;
  isTafseerVisible: boolean;
  setIsTafseerVisible: (visible: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const RECITERS: Reciter[] = [
  { id: 9, name: "Mohamed Siddiq al-Minshawi", style: "Murattal", slug: "minshawi-murattal" },
  { id: 8, name: "Mohamed Siddiq al-Minshawi", style: "Mujawwad", slug: "minshawi-mujawwad" },
  { id: 2, name: "AbdulBaset AbdulSamad", style: "Murattal", slug: "abdulbaset-murattal" },
  { id: 1, name: "AbdulBaset AbdulSamad", style: "Mujawwad", slug: "abdulbaset-mujawwad" },
  { id: 12, name: "Mahmoud Khalil Al-Husary", style: "Muallim", slug: "husary-muallim" },
  { id: 6, name: "Mahmoud Khalil Al-Husary", style: "Murattal", slug: "husary" },
  { id: 3, name: "Abdur-Rahman as-Sudais", style: "Murattal", slug: "sudais" },
  { id: 10, name: "Sa`ud ash-Shuraym", style: "Murattal", slug: "shuraym" },
  { id: 4, name: "Abu Bakr al-Shatri", style: "Murattal", slug: "shatri" },
  { id: 5, name: "Hani ar-Rifai", style: "Murattal", slug: "rifai" },
  { id: 11, name: "Mohamed al-Tablawi", style: "Murattal", slug: "tablawi" },
];

export const TRANSLATIONS: Translation[] = [
  // English
  { id: 20, name: "Sahih International", author: "Sahih International", slug: "en-sahih" },
  { id: 131, name: "The Clear Quran", author: "Dr. Mustafa Khattab", slug: "clear-quran" },
  { id: 171, name: "Abdul Haleem", author: "M.A.S. Abdel Haleem", slug: "en-abdul-haleem" },
  { id: 22, name: "Yusuf Ali", author: "Abdullah Yusuf Ali", slug: "en-yusuf-ali" },
  { id: 167, name: "Maarif-ul-Quran", author: "Mufti Muhammad Shafi", slug: "en-maarif-ul-quran" },
  
  // Urdu
  { id: 158, name: "Bayan-ul-Quran (Urdu)", author: "Dr. Israr Ahmad", slug: "bayan-ul-quran" },
  { id: 97, name: "Tafheem-e-Qur'an (Urdu)", author: "Syed Abu Ali Maududi", slug: "ur-al-maududi" },
  { id: 234, name: "Fatah Muhammad Jalandhari (Urdu)", author: "Fatah Muhammad Jalandhari", slug: "ur-fatah-muhammad-jalandhari" },
  { id: 54, name: "Maulana Muhammad Junagarhi (Urdu)", author: "Maulana Muhammad Junagarhi", slug: "ur-junagarri" },
  { id: 151, name: "Tafsir-e-Usmani (Urdu)", author: "Shaykh al-Hind Mahmud al-Hasan", slug: "tafsir-e-usmani" },
  { id: 819, name: "Maulana Wahiduddin Khan (Urdu)", author: "Maulana Wahiduddin Khan", slug: "maulana-wahid-uddin-khan-urdu" },
  { id: 831, name: "Maududi (Roman Urdu)", author: "Abul Ala Maududi", slug: "maududi-roman-urdu" },
];

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [currentAyah, setCurrentAyah] = useState<AyahId | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(false);

  // Persistent Settings
  const [reciterId, setReciterId] = useState(RECITERS[0].id);
  const [translationId, setTranslationId] = useState(20);

  // Hydration-safe persistent settings initialization
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedReciter = localStorage.getItem("defaultReciterId");
      const savedTranslation = localStorage.getItem("defaultTranslationId");
      
      if (savedReciter) setReciterId(parseInt(savedReciter));
      if (savedTranslation) setTranslationId(parseInt(savedTranslation));
    }
  }, []);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [wordTranslations, setWordTranslations] = useState<Record<string, string>>({});
  const [translationText, setTranslationText] = useState<string | null>(null);
  const [language, setLanguageState] = useState<'en' | 'ur'>('en');
  const [lastRead, setLastReadState] = useState<{ pageNumber: number, surahName: string } | null>(null);
  
  // System State
  const [repeatMode, setRepeatMode] = useState<'none' | 'single' | 'range'>('none');
  const [repeatCount, setRepeatCount] = useState(1);
  const [repeatRange, setRepeatRange] = useState<{ start: AyahId | null, end: AyahId | null }>({ start: null, end: null });
  const [rangeRepeatCount, setRangeRepeatCount] = useState(1);
  const [currentRepeatIndex, setCurrentRepeatIndex] = useState(0);
  const [rangeCycleIndex, setRangeCycleIndex] = useState(0);
  const [isTafseerVisible, setIsTafseerVisible] = useState(false);

  const fetchedPages = useRef<Set<number>>(new Set());

  // Initial Load Logic
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (session.user.language) setLanguageState(session.user.language as 'en' | 'ur');
      if (session.user.preferred_qari) setReciterId(session.user.preferred_qari);
      if (session.user.preferred_translation) setTranslationId(session.user.preferred_translation);
      if (session.user.last_opened_page) {
        setLastReadState({
          pageNumber: session.user.last_opened_page.pageNumber,
          surahName: session.user.last_opened_page.surahName
        });
      }
    } else if (status === "unauthenticated") {
      const savedLang = localStorage.getItem('language') || localStorage.getItem('app_language');
      const savedReciter = localStorage.getItem('preferred_qari');
      const savedTranslation = localStorage.getItem('preferred_translation');
      const savedRead = localStorage.getItem('quran_assistant_last_read');
      
      if (savedLang === 'ur' || savedLang === 'en') setLanguageState(savedLang);
      if (savedReciter) setReciterId(Number(savedReciter));
      if (savedTranslation) setTranslationId(Number(savedTranslation));
      if (savedRead) {
        try {
          const parsed = JSON.parse(savedRead);
          setLastReadState({ pageNumber: parsed.pageNumber, surahName: parsed.surahName });
        } catch { }
      }
    }
  }, [status, session]);

  // Unified Syncing Logic
  const syncPreferences = useCallback((updates: Record<string, unknown>) => {
    if (status === "authenticated") {
      updateUserPreferences(updates);
    } else {
      Object.entries(updates).forEach(([key, value]) => {
        if (typeof value === 'object') {
          localStorage.setItem(key, JSON.stringify(value));
        } else {
          localStorage.setItem(key, String(value));
        }
      });
    }
  }, [status]);

  const ayahAudioRef = useRef<HTMLAudioElement | null>(null);
  const wordAudioRef = useRef<HTMLAudioElement | null>(null);
  const isAutoplayRef = useRef(isAutoplay);
  const currentAyahRef = useRef(currentAyah);
  const repeatModeRef = useRef(repeatMode);
  const repeatCountRef = useRef(repeatCount);
  const repeatRangeRef = useRef(repeatRange);
  const rangeRepeatCountRef = useRef(rangeRepeatCount);
  const currentRepeatIndexRef = useRef(currentRepeatIndex);
  const rangeCycleIndexRef = useRef(rangeCycleIndex);

  useEffect(() => {
    isAutoplayRef.current = isAutoplay;
    currentAyahRef.current = currentAyah;
    repeatModeRef.current = repeatMode;
    repeatCountRef.current = repeatCount;
    repeatRangeRef.current = repeatRange;
    rangeRepeatCountRef.current = rangeRepeatCount;
    currentRepeatIndexRef.current = currentRepeatIndex;
    rangeCycleIndexRef.current = rangeCycleIndex;
  }, [isAutoplay, currentAyah, repeatMode, repeatCount, repeatRange, rangeRepeatCount, currentRepeatIndex, rangeCycleIndex]);

  useEffect(() => {
    // 1. Initialize Ayah Audio (Main Player)
    const ayahAudio = new Audio();
    ayahAudioRef.current = ayahAudio;

    // Hot Font Optimization: Pre-activate Urdu font immediately on mount
    if (typeof window !== "undefined" && document.fonts) {
      document.fonts.load('1em UrduNastaleeq')
        .then(() => console.log("Urdu font (Al Qalam) pre-activated successfully."))
        .catch(err => console.warn("Urdu font pre-activation failed:", err));
    }

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      
      const mode = repeatModeRef.current;
      const count = repeatCountRef.current;
      const range = repeatRangeRef.current;
      const current = currentAyahRef.current;

      if (!current) return;

      if (mode === 'single') {
        if (count === 0 || (currentRepeatIndexRef.current + 1) < count) {
          setCurrentRepeatIndex(prev => prev + 1);
          playAyahRef.current?.(current.surah, current.ayah, true, undefined, true);
          return;
        } else {
          setCurrentRepeatIndex(0);
        }
      } else if (mode === 'range' && range.start && range.end) {
        if (count === 0 || (currentRepeatIndexRef.current + 1) < count) {
          setCurrentRepeatIndex(prev => prev + 1);
          playAyahRef.current?.(current.surah, current.ayah, true, undefined, true);
          return;
        } else {
          setCurrentRepeatIndex(0);
          
          const isAtEnd = current.surah === range.end.surah && current.ayah === range.end.ayah;
          if (isAtEnd) {
            const rCount = rangeRepeatCountRef.current;
            const cycleIndex = rangeCycleIndexRef.current;
            
            if (rCount === 0 || (cycleIndex + 1) < rCount) {
              setRangeCycleIndex(prev => prev + 1);
              playAyahRef.current?.(range.start.surah, range.start.ayah, true, undefined, true);
              return;
            } else {
              setRangeCycleIndex(0);
            }
          } else {
            const nextAyah = current.ayah + 1;
            const chapter = chaptersData.chapters.find(c => c.id === current.surah);
            if (chapter && nextAyah <= chapter.verses_count && nextAyah <= range.end.ayah) {
              playAyahRef.current?.(current.surah, nextAyah, true, undefined, true);
              return;
            } else {
              // Out of range fallback: Pause if not infinity
              if (count === 0) {
                setRangeCycleIndex(prev => prev + 1);
                playAyahRef.current?.(range.start.surah, range.start.ayah, true, undefined, true);
                return;
              } else {
                if (ayahAudioRef.current) {
                  ayahAudioRef.current.pause();
                  ayahAudioRef.current.currentTime = 0;
                }
                setIsPlaying(false);
                setCurrentRepeatIndex(0);
                setRangeCycleIndex(0);
                return;
              }
            }
          }
        }
      }

      if (isAutoplayRef.current) {
        const chapter = chaptersData.chapters.find(c => c.id === current.surah);
        if (chapter) {
          let nextSurah = current.surah;
          let nextAyah = current.ayah + 1;
          if (nextAyah > chapter.verses_count) {
             nextSurah += 1;
             nextAyah = 1;
          }
          if (nextSurah <= 114) {
            playAyahRef.current?.(nextSurah, nextAyah, true);
          }
        }
      }
    };

    ayahAudio.addEventListener("play", handlePlay);
    ayahAudio.addEventListener("pause", handlePause);
    ayahAudio.addEventListener("ended", handleEnded);

    // 2. Initialize Word Audio
    const wordAudio = new Audio();
    wordAudioRef.current = wordAudio;

    const handleWordEnded = () => {
      // Restore ayah highlighting if it exists
      if (currentAyahRef.current) {
        setActiveId(`${currentAyahRef.current.surah}:${currentAyahRef.current.ayah}`);
      } else {
        setActiveId(null);
      }
    };

    wordAudio.addEventListener("ended", handleWordEnded);

    return () => {
      ayahAudio.removeEventListener("play", handlePlay);
      ayahAudio.removeEventListener("pause", handlePause);
      ayahAudio.removeEventListener("ended", handleEnded);
      ayahAudio.pause();
      ayahAudio.src = "";

      wordAudio.removeEventListener("ended", handleWordEnded);
      wordAudio.pause();
      wordAudio.src = "";
    };
  }, []);

  const playPromiseRef = useRef<Promise<void> | null>(null);
  const playAyahRef = useRef<(surah: number, ayah: number, shouldPlay?: boolean, overrideReciterId?: number, isInternal?: boolean) => void>(null);

  const playAyah = useCallback(async (surah: number, ayah: number, shouldPlay = false, overrideReciterId?: number, isInternal = false) => {
    if (!ayahAudioRef.current) return;

    const targetReciterId = overrideReciterId || reciterId;
    const ayahKey = `${surah}:${ayah}`;
    setCurrentAyah({ surah, ayah });
    setActiveId(ayahKey);
    setIsTafseerVisible(false);
    
    if (!isInternal) {
      setCurrentRepeatIndex(0);
      setRangeCycleIndex(0);
    }

    try {
      const res = await fetch(`https://api.quran.com/api/v4/verses/by_key/${ayahKey}?audio=${targetReciterId}`);
      const data = await res.json();
      const relativeUrl = data.verse?.audio?.url;

      if (!relativeUrl) throw new Error("Audio URL not found");

      const url = relativeUrl.startsWith("http")
        ? relativeUrl
        : relativeUrl.startsWith("//")
          ? `https:${relativeUrl}`
          : `https://audio.qurancdn.com/${relativeUrl}`;

      if (ayahAudioRef.current.src !== url) {
        ayahAudioRef.current.src = url;
        ayahAudioRef.current.load();
      }

      ayahAudioRef.current.currentTime = 0;

      if (shouldPlay) {
        const playPromise = ayahAudioRef.current.play();
        playPromiseRef.current = playPromise;

        playPromise.catch(err => {
          if (err.name !== "AbortError") {
            console.error("Playback failed:", err);
          }
        });
      } else {
        setIsPlaying(false);
      }
    } catch (err) {
      console.error("Failed to fetch ayah audio:", err);
      setIsPlaying(false);
    }
  }, [reciterId]);

  useEffect(() => {
    playAyahRef.current = playAyah;
  }, [playAyah]);

  const playUrl = useCallback((url: string, id: string) => {
    if (!wordAudioRef.current) return;
    
    // Decoupled from currentAyah to prevent triggering the main MediaPlayer
    // if (surah && ayah) {
    //   setCurrentAyah({ surah, ayah });
    // }

    if (wordAudioRef.current.src !== url) {
      wordAudioRef.current.src = url;
    }

    wordAudioRef.current.currentTime = 0;
    setActiveId(id);

    const playPromise = wordAudioRef.current.play();
    playPromise.catch(err => {
      if (err.name !== "AbortError") {
        console.error("Word playback failed:", err);
      }
    });
  }, []);

  const playNextAyah = useCallback(() => {
    if (!currentAyah) return;
    const chapter = chaptersData.chapters.find(c => c.id === currentAyah.surah);
    if (!chapter) return;
    let nextSurah = currentAyah.surah;
    let nextAyah = currentAyah.ayah + 1;
    if (nextAyah > chapter.verses_count) {
      nextSurah += 1;
      nextAyah = 1;
    }
    if (nextSurah > 114) {
      setCurrentAyah(null);
      setActiveId(null);
      return;
    }
    playAyah(nextSurah, nextAyah, true);
  }, [currentAyah, playAyah]);

  const playPreviousAyah = useCallback(() => {
    if (!currentAyah) return;
    let prevSurah = currentAyah.surah;
    let prevAyah = currentAyah.ayah - 1;
    if (prevAyah < 1) {
      if (prevSurah <= 1) {
         if (ayahAudioRef.current) ayahAudioRef.current.currentTime = 0;
         return;
      }
      prevSurah -= 1;
      const prevChapter = chaptersData.chapters.find(c => c.id === prevSurah);
      prevAyah = prevChapter ? prevChapter.verses_count : 1;
    }
    playAyah(prevSurah, prevAyah, true);
  }, [currentAyah, playAyah]);

  const togglePlay = useCallback(async () => {
    if (!ayahAudioRef.current || !currentAyah) return;
    if (isPlaying) {
      if (playPromiseRef.current) {
        await playPromiseRef.current.catch(() => { });
      }
      ayahAudioRef.current.pause();
    } else {
      const playPromise = ayahAudioRef.current.play();
      playPromiseRef.current = playPromise;
      playPromise.catch(err => {
        if (err.name !== "AbortError") {
          console.error("Playback failed:", err);
        }
      });
    }
  }, [isPlaying, currentAyah]);

  const stopAudio = useCallback(() => {
    if (ayahAudioRef.current) {
      ayahAudioRef.current.pause();
      ayahAudioRef.current.currentTime = 0;
    }
    if (wordAudioRef.current) {
      wordAudioRef.current.pause();
      wordAudioRef.current.currentTime = 0;
    }
    setCurrentAyah(null);
    setActiveId(null);
    setIsPlaying(false);
    
    setRepeatMode('none');
    setRepeatCount(1);
    setRangeRepeatCount(1);
    setRepeatRange({ start: null, end: null });
    setCurrentRepeatIndex(0);
    setRangeCycleIndex(0);
  }, []);

  const toggleAutoplay = useCallback(() => {
    setIsAutoplay(prev => {
      const newVal = !prev;
      if (newVal) setRepeatMode('none');
      return newVal;
    });
  }, []);

  const handleSetRepeatMode = useCallback((mode: 'none' | 'single' | 'range') => {
    setRepeatMode(mode);
    if (mode !== 'none') setIsAutoplay(false);
    setCurrentRepeatIndex(0);
    setRangeCycleIndex(0);
    if (mode === 'none') {
      setRepeatCount(1);
      setRangeRepeatCount(1);
    }
  }, []);

  const setLanguage = useCallback((lang: 'en' | 'ur') => {
    setLanguageState(lang);
    syncPreferences({ language: lang });
    
    const defaultTranslationId = lang === 'ur' ? 158 : 20;
    setTranslationId(defaultTranslationId);
    syncPreferences({ preferred_translation: defaultTranslationId });
    
    setWordTranslations({});
    fetchedPages.current.clear();
  }, [syncPreferences]);

  const setReciter = useCallback((id: number) => {
    setReciterId(id);
    syncPreferences({ preferred_qari: id });
    if (currentAyah) {
      playAyah(currentAyah.surah, currentAyah.ayah, true, id);
    }
  }, [currentAyah, playAyah, syncPreferences]);

  const handleSetTranslationId = useCallback((id: number) => {
    setTranslationId(id);
    syncPreferences({ preferred_translation: id });
  }, [syncPreferences]);


  const fetchWordTranslations = useCallback(async (pageNumber: number) => {
    if (fetchedPages.current.has(pageNumber)) return;
    try {
      const res = await fetch(`https://api.quran.com/api/v4/verses/by_page/${pageNumber}?words=true&word_fields=translation&language=${language}`);
      const data = await res.json();
        if (data.verses) {
          const newTranslations: Record<string, string> = {};
          data.verses.forEach((verse: { verse_key: string; words: { position: number; translation?: { text: string } }[] }) => {
            verse.words.forEach((word: { position: number; translation?: { text: string } }) => {
              if (word.translation && word.translation.text) {
              const location = `${verse.verse_key}:${word.position}`;
              newTranslations[location] = word.translation.text;
            }
          });
        });
        setWordTranslations((prev) => ({ ...prev, ...newTranslations }));
        fetchedPages.current.add(pageNumber);
      }
    } catch (err) {
      console.error(`Failed to fetch word translations for page ${pageNumber}:`, err);
    }
  }, [language]);

  const fetchAyahTranslation = useCallback(async (surah: number, ayah: number, tId: number) => {
    try {
      const res = await fetch(`https://api.quran.com/api/v4/quran/translations/${tId}?verse_key=${surah}:${ayah}`);
      const data = await res.json();
      if (data.translations && data.translations.length > 0) {
        const text = data.translations[0].text.replace(/<[^>]*>?/gm, '');
        setTranslationText(text);
      }
    } catch (err) {
      console.error("Failed to fetch ayah translation:", err);
      setTranslationText(null);
    }
  }, []);

  useEffect(() => {
    if (currentAyah && translationId !== 0) {
      fetchAyahTranslation(currentAyah.surah, currentAyah.ayah, translationId);
    } else {
      setTranslationText(null);
    }
  }, [currentAyah, translationId, fetchAyahTranslation]);

  const handleSetLastRead = useCallback((data: { pageNumber: number, surahName: string }) => {
    setLastReadState(data);
    const lastReadData = {
      ...data,
      timestamp: Date.now()
    };
    syncPreferences({ last_opened_page: lastReadData });
  }, [syncPreferences]);

  return (
    <AudioContext.Provider
      value={{
        currentAyah,
        isPlaying,
        isAutoplay,
        reciterId,
        reciters: RECITERS,
        playAyah,
        playUrl,
        togglePlay,
        toggleAutoplay,
        playNextAyah,
        playPreviousAyah,
        setReciter,
        stopAudio,
        activeId,
        wordTranslations,
        fetchWordTranslations,
        translationId,
        setTranslationId: handleSetTranslationId,
        translationText,
        translations: TRANSLATIONS,
        repeatMode,
        setRepeatMode: handleSetRepeatMode,
        repeatCount,
        setRepeatCount,
        repeatRange,
        setRepeatRange,
        rangeRepeatCount,
        setRangeRepeatCount,
        currentRepeatIndex,
        rangeCycleIndex,
        language,
        setLanguage,
        lastRead,
        setLastRead: handleSetLastRead,
        isTafseerVisible,
        setIsTafseerVisible,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudioContext must be used within an AudioProvider");
  }
  return context;
};
