"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
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
  playAyah: (surah: number, ayah: number, shouldPlay?: boolean, overrideReciterId?: number) => void;
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
  currentRepeatIndex: number;
  rangeCycleIndex: number;
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
  const [currentAyah, setCurrentAyah] = useState<AyahId | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [reciterId, setReciterId] = useState(RECITERS[0].id);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [wordTranslations, setWordTranslations] = useState<Record<string, string>>({});
  const [translationId, setTranslationId] = useState(20);
  const [translationText, setTranslationText] = useState<string | null>(null);
  
  // Repeat System State
  const [repeatMode, setRepeatMode] = useState<'none' | 'single' | 'range'>('none');
  const [repeatCount, setRepeatCount] = useState(1); // 1 = play once (no repeat), but user logic says "Repeat X times"
  const [repeatRange, setRepeatRange] = useState<{ start: AyahId | null, end: AyahId | null }>({ start: null, end: null });
  const [currentRepeatIndex, setCurrentRepeatIndex] = useState(0);
  const [rangeCycleIndex, setRangeCycleIndex] = useState(0);

  const fetchedPages = useRef<Set<number>>(new Set());

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isAutoplayRef = useRef(isAutoplay);
  const currentAyahRef = useRef(currentAyah);
  const repeatModeRef = useRef(repeatMode);
  const repeatCountRef = useRef(repeatCount);
  const repeatRangeRef = useRef(repeatRange);
  const currentRepeatIndexRef = useRef(currentRepeatIndex);
  const rangeCycleIndexRef = useRef(rangeCycleIndex);

  useEffect(() => {
    isAutoplayRef.current = isAutoplay;
    currentAyahRef.current = currentAyah;
    repeatModeRef.current = repeatMode;
    repeatCountRef.current = repeatCount;
    repeatRangeRef.current = repeatRange;
    currentRepeatIndexRef.current = currentRepeatIndex;
    rangeCycleIndexRef.current = rangeCycleIndex;
  }, [isAutoplay, currentAyah, repeatMode, repeatCount, repeatRange, currentRepeatIndex, rangeCycleIndex]);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      
      const mode = repeatModeRef.current;
      const count = repeatCountRef.current;
      const range = repeatRangeRef.current;
      const currentIndex = currentRepeatIndexRef.current;
      const current = currentAyahRef.current;

      if (!current) return;

      // 1. REPEAT LOGIC (Takes precedence over Autoplay)
      if (mode === 'single') {
        // count 0 is infinity
        if (count === 0 || currentIndex < count) {
          setCurrentRepeatIndex(prev => prev + 1);
          playAyahRef.current?.(current.surah, current.ayah, true);
          return;
        } else {
          // Finished repeating current block
          setCurrentRepeatIndex(0);
          // In 'single' mode, we just stop here if autoplay is off, 
          // or continue to next if autoplay is on (handled below)
        }
      } else if (mode === 'range' && range.start && range.end) {
        // Nested Repetition: Repeat current ayah X times, then move to next
        if (count === 0 || currentIndex < count) {
          setCurrentRepeatIndex(prev => prev + 1);
          playAyahRef.current?.(current.surah, current.ayah, true);
          return;
        } else {
          // Finished this specific ayah's repeats, move to next
          setCurrentRepeatIndex(0);
          
          const isAtEnd = current.surah === range.end.surah && current.ayah === range.end.ayah;
          if (isAtEnd) {
            // Whole range completed, loop back and increment cycle
            setRangeCycleIndex(prev => prev + 1);
            playAyahRef.current?.(range.start.surah, range.start.ayah, true);
            return;
          } else {
            // Move to next ayah in range (restricted to current surah as per user request)
            const nextAyah = current.ayah + 1;
            
            // Check if nextAyah is still within the surah and doesn't exceed range.end
            const chapter = chaptersData.chapters.find(c => c.id === current.surah);
            if (chapter && nextAyah <= chapter.verses_count && nextAyah <= range.end.ayah) {
              playAyahRef.current?.(current.surah, nextAyah, true);
              return;
            } else {
              // This case shouldn't happen with proper range selection, 
              // but if it does, loop back to start
              setRangeCycleIndex(prev => prev + 1);
              playAyahRef.current?.(range.start.surah, range.start.ayah, true);
              return;
            }
          }
        }
      }

      // 2. AUTOPLAY LOGIC
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

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.src = "";
    };
  }, []); // Run only once

  const playPromiseRef = useRef<Promise<void> | null>(null);
  const playAyahRef = useRef<(surah: number, ayah: number, shouldPlay?: boolean, overrideReciterId?: number) => void>(null);

  const playAyah = useCallback(async (surah: number, ayah: number, shouldPlay = false, overrideReciterId?: number) => {
    if (!audioRef.current) return;

    const targetReciterId = overrideReciterId || reciterId;
    const ayahKey = `${surah}:${ayah}`;
    setCurrentAyah({ surah, ayah });
    setActiveId(ayahKey);
    
    // Reset repeat indices when a new ayah is played manually
    setCurrentRepeatIndex(0);
    setRangeCycleIndex(0);

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

      console.log(`Loading Ayah ${ayahKey} for Reciter ${targetReciterId}:`, url);

      // Force update src if reciter changed or src is different
      if (audioRef.current.src !== url) {
        audioRef.current.src = url;
        audioRef.current.load(); // Ensure new source is loaded
      }

      audioRef.current.currentTime = 0;

      if (shouldPlay) {
        const playPromise = audioRef.current.play();
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

  const playUrl = useCallback((url: string, id: string, surah?: number, ayah?: number) => {
    if (!audioRef.current) return;
    
    // Sync the current ayah state so the Media Player shows the correct translation
    if (surah && ayah) {
      setCurrentAyah({ surah, ayah });
    }

    if (audioRef.current.src !== url) {
      audioRef.current.src = url;
    }

    audioRef.current.currentTime = 0;
    setActiveId(id);

    const playPromise = audioRef.current.play();
    playPromiseRef.current = playPromise;
    playPromise.catch(err => {
      if (err.name !== "AbortError") {
        console.error("Playback failed:", err);
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
        // At the beginning of the Quran
        audioRef.current && (audioRef.current.currentTime = 0);
        return;
      }
      prevSurah -= 1;
      const prevChapter = chaptersData.chapters.find(c => c.id === prevSurah);
      prevAyah = prevChapter ? prevChapter.verses_count : 1;
    }

    playAyah(prevSurah, prevAyah, true);
  }, [currentAyah, playAyah]);

  const togglePlay = useCallback(async () => {
    if (!audioRef.current || !currentAyah) return;

    if (isPlaying) {
      if (playPromiseRef.current) {
        await playPromiseRef.current.catch(() => { });
      }
      audioRef.current.pause();
    } else {
      const playPromise = audioRef.current.play();
      playPromiseRef.current = playPromise;
      playPromise.catch(err => {
        if (err.name !== "AbortError") {
          console.error("Playback failed:", err);
        }
      });
    }
  }, [isPlaying, currentAyah]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentAyah(null);
    setActiveId(null);
    setIsPlaying(false);
    
    // Reset repeat settings when player is closed
    setRepeatMode('none');
    setRepeatCount(1);
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
  }, []);

  const setReciter = useCallback((id: number) => {
    setReciterId(id);
    // If playing, restart current ayah with new reciter immediately
    if (currentAyah) {
      playAyah(currentAyah.surah, currentAyah.ayah, true, id);
    }
  }, [currentAyah, playAyah]);

  const fetchWordTranslations = useCallback(async (pageNumber: number) => {
    if (fetchedPages.current.has(pageNumber)) return;

    try {
      const res = await fetch(
        `https://api.quran.com/api/v4/verses/by_page/${pageNumber}?words=true&word_fields=translation&translation_language=en`
      );
      const data = await res.json();

      if (data.verses) {
        const newTranslations: Record<string, string> = {};
        data.verses.forEach((verse: any) => {
          verse.words.forEach((word: any) => {
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
  }, []);

  const fetchAyahTranslation = useCallback(async (surah: number, ayah: number, tId: number) => {
    try {
      const res = await fetch(`https://api.quran.com/api/v4/quran/translations/${tId}?verse_key=${surah}:${ayah}`);
      const data = await res.json();
      if (data.translations && data.translations.length > 0) {
        // Remove HTML tags from translation if they exist
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
        setTranslationId,
        translationText,
        translations: TRANSLATIONS,
        repeatMode,
        setRepeatMode: handleSetRepeatMode,
        repeatCount,
        setRepeatCount,
        repeatRange,
        setRepeatRange,
        currentRepeatIndex,
        rangeCycleIndex,
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
