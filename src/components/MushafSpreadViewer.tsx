"use client";

import { useMemo, useState, useEffect, useLayoutEffect, useRef, useTransition, useCallback, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QpcFontStyleRegistry from "@/components/QpcFontStyleRegistry";
import { useAudioContext } from "@/context/AudioContext";
import type { MushafLine } from "@/types/mushaf";
import { getJuzForPage } from "@/utils/juz";
import { getSurahNameArabic, getSurahForPage } from "@/utils/surah";
import MushafSkeleton from "@/components/MushafSkeleton";
import { useSession } from "next-auth/react";
import { updateUserPreferences } from "@/actions/user";
import chaptersData from "../../public/data/chapters/chapters.json";
import AyahActionPopup from "./quran/AyahActionPopup";
import AyahTafseerDrawer from "./quran/AyahTafseerDrawer";

function buildPageFontCss(pageNumbers: number[]): string {
  const uniquePages = [...new Set(pageNumbers)].sort((a, b) => a - b);
  const specialFonts = [
    "@font-face{font-family:'surah-name-v2';src:url('/fonts/common/surah-name-v2.woff2') format('woff2');font-display:block;}",
  ].join("\n");

  const pageFonts = uniquePages
    .map(
      (page) =>
        `@font-face{font-family:'p${page}';src:url('/fonts/qpc/p${page}.woff2') format('woff2');font-display:block;}`,
    )
    .join("\n");

  return `${specialFonts}\n${pageFonts}`;
}

const toArabicDigits = (num: number) => {
  return num.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
};

function getWordAudioUrl(location: string): string | null {
  if (!location) return null;
  const parts = location.split(":");
  if (parts.length !== 3) return null;
  const [s, a, w] = parts.map((n) => n.padStart(3, "0"));
  return `https://audio.qurancdn.com/wbw/${s}_${a}_${w}.mp3`;
}

const FifteenLineGrid = memo(function FifteenLineGrid({
  pageNumber,
  lines,
  onOpenTafseer,
}: {
  pageNumber: number;
  lines: MushafLine[];
  onOpenTafseer: (surah: number, ayah: number, arabicWords: string[], pageNumber: number) => void;
}) {
  const { playAyah, playUrl, activeId, wordTranslations, language } = useAudioContext();
  const [isFontLoaded, setIsFontLoaded] = useState(false);
  const [actionMenuWord, setActionMenuWord] = useState<any | null>(null);
  const [menuPosition, setMenuPosition] = useState<"top" | "bottom">("top");
  const [menuShift, setMenuShift] = useState(0);

  const menuContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (actionMenuWord && menuContainerRef.current) {
      const rect = menuContainerRef.current.getBoundingClientRect();
      const padding = 20;
      let newShift = 0;
      const menuWidth = 200; // Expected min-width of popup

      if (rect.left - menuWidth/2 < padding) {
        newShift = padding - (rect.left - menuWidth/2);
      } else if (rect.right + menuWidth/2 > window.innerWidth - padding) {
        newShift = window.innerWidth - padding - (rect.right + menuWidth/2);
      }
      setMenuShift(newShift);
    }
  }, [actionMenuWord]);

  useEffect(() => {
    setIsFontLoaded(false);
    const fontName = `p${pageNumber}`;
    const font = new FontFace(fontName, `url(/fonts/qpc/p${pageNumber}.woff2)`);
    
    // Safety check with document.fonts
    document.fonts.load(`1em ${fontName}`).then(() => {
      // Small delay to ensure browser layout engine settles
      setTimeout(() => setIsFontLoaded(true), 50);
    }).catch(() => {
      // Fallback for unexpected failures
      setTimeout(() => setIsFontLoaded(true), 2500);
    });
  }, [pageNumber]);

  function Basmalah() {
    return (
      <div className="flex w-full items-center justify-center py-2 text-black">
        <span
          className="leading-none
                    text-[clamp(1.4rem,6vw,1.75rem)]   /* Mobile-Default */
                    lg:text-[1.75em]"                 /* Desktop-Canonical */
          style={{
            fontFamily: "QuranCommon",
            fontVariantLigatures: "common-ligatures",
            fontFeatureSettings: '"liga" on'
          }}
        >
          ﷽
        </span>
      </div>
    );
  }

  const linesToRender = lines.slice(0, 15);
  const isShortPage = linesToRender.length < 15;

  return (
    <div className="relative w-full h-full">
      {/* 1. SKELETON UNDERLAY (Visible while loading) */}
      <AnimatePresence>
        {!isFontLoaded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0"
          >
            <MushafSkeleton />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. ACTUAL CONTENT (Hidden until fonts load) */}
      <div
        dir="rtl"
        className={`${isShortPage
          ? "flex flex-col justify-center h-full w-full gap-5 py-12"
          : "grid h-full w-full grid-rows-15"
          } transition-opacity duration-300 ${isFontLoaded ? "opacity-100" : "opacity-0"}`}
        style={{ fontFamily: `p${pageNumber}` }}
      >
      {linesToRender.map((line, lineIdx) => (
        <div
          key={line.line}
          className="flex min-w-0 flex-row items-center px-0 lg:px-4"
          style={{
            direction: "rtl",
            justifyContent: line.is_centered ? "center" : "space-between",
            fontFamily: `p${pageNumber}`,
          }}
        >
          {line.type === "surah_name" ? (
            <div className="relative flex w-full items-center justify-center py-1 text-secondary">
              <span
                className="block text-center leading-none opacity-90 
                          text-[clamp(1.8rem,10vw,2.9rem)]  /* Mobile-Default */
                          lg:text-[clamp(3rem,8vw,3rem)]"    /* Desktop-Canonical */
                style={{
                  fontFamily: "QuranCommon",
                  fontVariantLigatures: "common-ligatures",
                  fontFeatureSettings: '"liga" on'
                }}
              >
                header
              </span>
              <span
                className="absolute leading-none 
                          text-[clamp(1.2rem,8vw,2.4rem)]    /* Mobile-Default */
                          lg:text-[clamp(2.25rem,8.5vw,2.50rem)]" /* Desktop-Canonical */
                style={{ fontFamily: "surah-name-v2" }}
              >
                {`surah${String(Number(line.surah) || 0).padStart(3, "0")}`}
              </span>
            </div>
          ) : ["basmalah", "basmallah"].includes(line.type) ? (
            <Basmalah />
          ) : line.words.length === 0 ? (
            <div className="h-full w-full" />
          ) : (
            line.words.map((word, idx) => {
              const isWordActive = activeId === word.l;
              const isAyahActive = activeId === `${word.s}:${word.a}`;
              const isActive = isWordActive || (word.isStopSign && isAyahActive);

              const handlePlay = (e?: React.MouseEvent) => {
                if (word.isStopSign) {
                  // Ayah end sign clicked: show action menu
                  const lineIdxForMenu = lineIdx;
                  setMenuPosition(lineIdxForMenu === 0 ? "bottom" : "top");
                  setActionMenuWord(word);
                } else if (!word.isStopSign) {
                  const url = getWordAudioUrl(word.l);
                  if (url) playUrl(url, word.l, parseInt(word.s), parseInt(word.a));
                }
              };

               // Helper to find full Ayah Arabic text for Tafseer
              const getAyahArabicWords = (surah: string, ayah: string) => {
                const ayahWords: string[] = [];
                // Search in all lines of current page first
                lines.forEach(l => {
                  l.words.forEach(w => {
                    if (w.s === surah && w.a === ayah && !w.isStopSign) {
                      ayahWords.push(w.c);
                    }
                  });
                });
                return ayahWords;
              };

              const translation = wordTranslations[word.l];

              return (
                <WordTooltip key={`${line.line}-${idx}`} translation={translation} lineIdx={lineIdx} language={language}>
                  <div className="relative">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={handlePlay}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handlePlay();
                        }
                      }}
                      className={`
                        leading-none font-normal cursor-pointer transition-all duration-300
                        text-[clamp(1.15rem,5.2vw,1.65rem)]  /* Mobile-Default (Slightly Reduced) */
                        lg:text-[1.75rem]                /* Desktop-Canonical */
                        text-[#1a1a1a]
                        ${isActive
                          ? "bg-primary/15 shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)] scale-[1.03] z-20"
                          : "hover:bg-primary/5 hover:text-primary hover:scale-[1.02]"}
                      `}
                      style={{
                        color: isActive
                          ? "var(--primary)"
                          : (word.isStopSign ? "var(--primary)" : "#1a1a1a"),
                      }}
                    >
                      {word.c}
                    </div>

                    {word.isStopSign && (
                      <div 
                        ref={actionMenuWord?.l === word.l ? menuContainerRef : null} 
                        className={`absolute inset-x-0 bottom-0 z-[10000] ${actionMenuWord?.l === word.l ? 'pointer-events-auto' : 'pointer-events-none'}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <AyahActionPopup
                          isOpen={actionMenuWord?.l === word.l}
                          onClose={() => setActionMenuWord(null)}
                          onListen={() => {
                            playAyah(parseInt(word.s), parseInt(word.a));
                          }}
                          onTafseer={() => {
                            onOpenTafseer(
                              parseInt(word.s), 
                              parseInt(word.a), 
                              getAyahArabicWords(word.s, word.a), 
                              pageNumber
                            );
                          }}
                          language={language}
                          position={menuPosition}
                          shift={menuShift}
                        />
                      </div>
                    )}
                  </div>
                </WordTooltip>
              );
            })
          )}
        </div>
      ))}
      </div>
    </div>
  );
});

function WordTooltip({
  children,
  translation,
  lineIdx,
  language
}: {
  children: React.ReactNode;
  translation?: string;
  lineIdx: number;
  language: 'en' | 'ur';
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("top");
  const [shift, setShift] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleToggle = (visible: boolean) => {
    // The Rule: Only flip if it's the absolute first line (index 0)
    if (visible) {
      if (lineIdx === 0) {
        setPosition("bottom");
      } else {
        setPosition("top");
      }
    }
    setIsVisible(visible);
  };

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (isVisible && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const padding = 12;
      let newShift = 0;

      if (rect.left < padding) {
        newShift = padding - rect.left;
      } else if (rect.right > window.innerWidth - padding) {
        newShift = window.innerWidth - padding - rect.right;
      }

      setShift(newShift);
    } else {
      setShift(0);
    }
  }, [isVisible]);

  if (!translation) return <>{children}</>;

  const isTop = position === "top";

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center"
      onMouseEnter={() => handleToggle(true)}
      onMouseLeave={() => handleToggle(false)}
      onClick={() => handleToggle(!isVisible)}
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95, y: isTop ? -10 : 10, x: "-50%" }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              x: `calc(-50% + ${shift}px)` 
            }}
            exit={{ opacity: 0, scale: 0.95, y: isTop ? -10 : 10, x: "-50%" }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute ${isTop ? "bottom-full mb-3" : "top-full mt-3"} left-1/2 z-[9999] pointer-events-none`}
            style={{
              filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
              transformOrigin: isTop ? "bottom center" : "top center"
            }}
          >
            <div className={`bg-[#54948F] text-white px-3 py-1.5 rounded-md whitespace-nowrap relative font-medium shadow-lg
              ${language === 'ur' ? 'font-arabic text-lg pb-2' : 'text-sm'}`}>
              {translation}
              {/* Arrow */}
              <div
                className={`absolute ${isTop ? "top-full" : "bottom-full"} left-1/2 w-0 h-0 
                          border-l-[6px] border-l-transparent 
                          border-r-[6px] border-r-transparent 
                          ${isTop
                    ? "border-t-[6px] border-t-[#54948F]"
                    : "border-b-[6px] border-b-[#54948F]"}`}
                style={{ 
                  transform: `translateX(calc(-50% - ${shift}px))`,
                  left: '50%'
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}

export interface MushafSpreadViewerProps {
  requestedPage: number;
  rightPage: number;
  leftPage: number;
  rightLines: MushafLine[];
  leftLines: MushafLine[];
}

export default function MushafSpreadViewer({
  requestedPage,
  rightPage,
  leftPage,
  rightLines,
  leftLines,
}: MushafSpreadViewerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingDirection, setPendingDirection] = useState<'next' | 'prev' | null>(null);
  const [boundaryFlash, setBoundaryFlash] = useState<'start' | 'end' | null>(null);
  const { data: session, status } = useSession();
  const { playAyah, playUrl, activeId, wordTranslations, fetchWordTranslations, language, setLastRead } = useAudioContext();
  const [tafseerData, setTafseerData] = useState<{ 
    surah: number; 
    ayah: number; 
    arabicWords: string[]; 
    surahName: string;
    pageNumber: number;
  } | null>(null);

  const handleOpenTafseer = useCallback((surah: number, ayah: number, arabicWords: string[], pageNumber: number) => {
    // chapter.id can be number or string, be safe
    const chapter = chaptersData.chapters.find(c => Number(c.id) === Number(surah));
    setTafseerData({
      surah,
      ayah,
      arabicWords,
      pageNumber,
      surahName: chapter?.name_simple || `Surah ${surah}`,
    });
  }, []);

  useEffect(() => {
    if (rightPage) fetchWordTranslations(rightPage);
    if (leftPage && leftPage !== rightPage) fetchWordTranslations(leftPage);
  }, [rightPage, leftPage, fetchWordTranslations, language]);

  // Font Pre-activation (Zero Delay Optimization)
  useEffect(() => {
    const neighbors = [
      rightPage - 2, 
      rightPage - 1, 
      leftPage + 1, 
      leftPage + 2
    ].filter(p => p >= 1 && p <= 604);

    neighbors.forEach(p => {
      // Background load to "warm up" the font cache before the user swipes
      document.fonts.load(`1em p${p}`).catch(() => {});
    });
  }, [rightPage, leftPage]);

  // Tracking: Save last read position
  useEffect(() => {
    if (!requestedPage || !rightLines.length) return;
    
    try {
      const currentSurahId = getSurahForPage(rightLines);
      const chapter = chaptersData.chapters.find(c => c.id === currentSurahId);
      
      if (chapter) {
        setLastRead({
          pageNumber: requestedPage,
          surahName: chapter.name_simple,
        });
      }
    } catch (err) {
      console.error("Failed to save last read progress:", err);
    }
  }, [requestedPage, rightLines, setLastRead]);

  const navigateToPage = useCallback((pageTarget: number) => {
    if (isPending) return;
    if (pageTarget > 604) {
      setBoundaryFlash('end');
      setTimeout(() => setBoundaryFlash(null), 400);
      return;
    }
    if (pageTarget < 1) {
      setBoundaryFlash('start');
      setTimeout(() => setBoundaryFlash(null), 400);
      return;
    }
    setPendingDirection(pageTarget > requestedPage ? 'next' : 'prev');
    startTransition(() => {
      router.push(`/page/${pageTarget}`);
    });
  }, [isPending, requestedPage, router]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        navigateToPage(requestedPage + 1);
      } else if (e.key === "ArrowRight") {
        navigateToPage(requestedPage - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [requestedPage, navigateToPage]);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const isWheelLocked = useRef(false);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isPending) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPending) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || isPending) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isRightSwipe && requestedPage < 604) {
      navigateToPage(requestedPage + 1);
    } else if (isLeftSwipe && requestedPage > 1) {
      navigateToPage(requestedPage - 1);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    // If we're already loading the next page, or wheel is locked, ignore scroll.
    if (isWheelLocked.current || isPending) return;

    const threshold = 40; // Sensitivity threshold for deltaX
    const { deltaX, deltaY } = e;

    // Detect intentional horizontal movement (deltaX > deltaY)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      isWheelLocked.current = true;

      // RTL Trackpad Logic:
      // deltaX > 0: Swipe Left (Next Page)
      // deltaX < 0: Swipe Right (Prev Page)
      if (deltaX > 0 && requestedPage < 604) {
        navigateToPage(requestedPage + 1);
      } else if (deltaX < 0 && requestedPage > 1) {
        navigateToPage(requestedPage - 1);
      }

      // Lock navigation for 800ms to ensure animation completes and trackpad inertia dies down
      setTimeout(() => {
        isWheelLocked.current = false;
      }, 800);
    }
  };

  // Determine reading direction for animation based on rightPage changes
  const [direction, setDirection] = useState(0);
  const [prevRight, setPrevRight] = useState(rightPage);

  if (rightPage !== prevRight) {
    // Advancing (turning to the left physically, but page numbers increase) -> direction 1
    // Going back (turning to the right) -> direction -1
    setDirection(rightPage > prevRight ? 1 : -1);
    setPrevRight(rightPage);
  }

  const pages = [
    { pageNumber: rightPage, lines: rightLines },
    { pageNumber: leftPage, lines: leftLines },
  ];

  // Ideally, preload next pages too, but let's stick to current
  // In Next 13+, <Link href> already prefetches the Server Component JSON!

  const fontCss = useMemo(() => buildPageFontCss([rightPage, leftPage]), [rightPage, leftPage]);
  const preloadPages = [rightPage, leftPage];

  // Desktop navigation: move by 2 pages (spread)
  const previousPageHref = rightPage > 1 ? `/page/${Math.max(1, rightPage - 2)}` : null;
  const nextPageHref = rightPage + 2 <= 603 ? `/page/${rightPage + 2}` : null;

  // Book flipping variants matching an RTL book structure.
  const variants = {
    enter: (direction: number) => {
      return {
        rotateY: direction > 0 ? 90 : -90,
        opacity: 0,
        x: direction > 0 ? -50 : 50,
      };
    },
    center: {
      zIndex: 1,
      rotateY: 0,
      opacity: 1,
      x: 0,
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        rotateY: direction < 0 ? 90 : -90,
        opacity: 0,
        x: direction < 0 ? -50 : 50,
      };
    },
  };

  return (
    <main
      className="h-[100dvh] w-screen bg-background text-foreground overflow-hidden flex flex-col items-center justify-center p-0 lg:p-4"
      style={{ perspective: "2500px" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      <style jsx global>{`
        body {
          overflow: hidden !important;
          height: 100dvh !important;
          touch-action: none;
        }
      `}</style>
      <QpcFontStyleRegistry cssText={fontCss} preloadPages={preloadPages} />

      <div className="w-full max-w-[280dvh] flex-1 flex items-center justify-center relative">
        {/* THE MOMENTUM ARROWS (Moved to root stacking context for desktop visibility) */}
        <AnimatePresence>
          {isPending && pendingDirection === 'next' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute left-4 lg:left-10 top-1/2 -translate-y-1/2 z-[100] pointer-events-none animate-arrow-pulse-left lg:hidden"
            >
              <div className="bg-white/90 backdrop-blur-xl rounded-full w-16 h-16 flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)] text-primary">
                <span className="text-5xl leading-none -mr-1 mb-1 font-light">›</span>
              </div>
            </motion.div>
          )}
          {isPending && pendingDirection === 'prev' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-4 lg:right-10 top-1/2 -translate-y-1/2 z-[100] pointer-events-none animate-arrow-pulse-right lg:hidden"
            >
              <div className="bg-white/90 backdrop-blur-xl rounded-full w-16 h-16 flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)] text-primary">
                <span className="text-5xl leading-none -ml-1 mb-1 font-light">‹</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* THE BOUNDARY FEEDBACK */}
        <AnimatePresence>
          {boundaryFlash && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[101] pointer-events-none rounded-sm border-8 border-red-500/20 bg-red-500/5 mix-blend-multiply"
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.section
            key={`${rightPage}-${leftPage}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              rotateY: { type: "tween", duration: 0.6, ease: [0.32, 0.72, 0, 1] },
              opacity: { duration: 0.3 },
              x: { type: "tween", duration: 0.6, ease: [0.32, 0.72, 0, 1] }
            }}
            style={{ transformStyle: "preserve-3d" }}
            dir="rtl"
            className="flex flex-col lg:flex-row gap-0 w-full h-[100dvh] max-h-[100dvh] lg:h-[85dvh] lg:max-h-[85dvh] origin-center relative items-center justify-center"
          >
            {/* The Spine shadow */}
            <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-[1px] -translate-x-1/2 bg-divider/50 shadow-[0_0_20px_10px_rgba(var(--primary-rgb),0.08)] lg:block z-20" />



            {pages.map((page) => (
              <article
                key={page.pageNumber}
                style={{ backfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
                className={`relative mx-0 w-full max-w-137.5 lg:rounded-sm bg-surface shadow-[0_0_40px_rgba(var(--primary-rgb),0.16)] lg:border lg:border-primary/10 flex-col pt-3 pb-1 h-full transition-all duration-300
                  ${page.pageNumber === requestedPage ? "flex flex-1" : "hidden lg:flex flex-1"}
                  ${isPending ? "opacity-70 blur-[1px] scale-[0.99]" : "opacity-100 scale-100"}
                `}
              >
                {/* Celestial Header Slot - with backdrop blur and transparency */}
                <div className="h-10 w-full flex items-center justify-between px-2 lg:px-8 text-xs font-medium text-muted sticky top-0 bg-white/80 backdrop-blur-md z-30 transition-all border-b border-divider/5">
                  {/* Juz Name on the Right - Reverted to calligraphic icons */}
                  <div
                    className="flex-1 text-right text-lg leading-none text-primary/80 select-none pr-2"
                    style={{
                      fontFamily: 'QuranCommon',
                      fontVariantLigatures: 'common-ligatures',
                      fontFeatureSettings: '"liga" on',
                      textRendering: 'optimizeLegibility',
                    }}
                    dir="ltr"
                  >
                    {`j${getJuzForPage(page.lines).toString().padStart(3, "0")}`}
                  </div>

                  {/* Surah Name on the Left */}
                  <div
                    className="flex-1 flex justify-end items-center gap-2 text-xl leading-none text-primary/80 select-none pb-1"
                    dir="rtl"
                  >
                    <div style={{ fontFamily: 'surah-name-v3', textRendering: 'optimizeLegibility' }}>
                      سُورَةُ {getSurahNameArabic(getSurahForPage(page.lines))}
                    </div>
                    <button
                      className="lg:hidden p-1 text-muted hover:text-primary transition-colors cursor-pointer"
                      onClick={() => window.dispatchEvent(new CustomEvent('open-side-menu'))}
                      aria-label="Open side menu"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Keyline Divider */}
                <div className="mx-2 lg:mx-8 mb-3 border-t border-divider" />

                <div className="relative z-10 flex-1 w-full pt-2 px-5 lg:px-8 pb-2 overflow-hidden select-none">
                  <FifteenLineGrid
                    pageNumber={page.pageNumber}
                    lines={page.lines}
                    onOpenTafseer={handleOpenTafseer}
                  />
                </div>

                {/* Arabic Page Number at Bottom */}
                <div className="mt-auto py-1 flex items-center justify-center text-xl font-medium text-primary opacity-70">
                  {toArabicDigits(page.pageNumber)}
                </div>
              </article>
            ))}
          </motion.section>
        </AnimatePresence>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex pointer-events-none fixed inset-x-0 top-1/2 -translate-y-1/2 z-50 items-center justify-between w-full max-w-[1400px] mx-auto px-6 sx:px-12">
        {nextPageHref ? (
          <Link
            href={nextPageHref}
            prefetch={true}
            onClick={(e) => {
              e.preventDefault();
              navigateToPage(rightPage + 2);
            }}
            className={`pointer-events-auto rounded-2xl border backdrop-blur-md px-4 py-12 text-4xl font-semibold shadow-2xl transition-all active:scale-95 flex items-center justify-center min-w-[64px]
              ${isPending && pendingDirection === 'next'
                ? "bg-primary text-white border-primary scale-105 animate-pulse"
                : "border-divider bg-surface/90 text-muted-dark hover:bg-primary hover:text-white hover:border-primary hover:scale-105"
              }`}
            aria-label="Next spread"
          >
            ‹
          </Link>
        ) : <div />}
        {previousPageHref ? (
          <Link
            href={previousPageHref}
            prefetch={true}
            onClick={(e) => {
              e.preventDefault();
              navigateToPage(rightPage - 2);
            }}
            className={`pointer-events-auto rounded-2xl border backdrop-blur-md px-4 py-12 text-4xl font-semibold shadow-2xl transition-all active:scale-95 flex items-center justify-center min-w-[64px]
              ${isPending && pendingDirection === 'prev'
                ? "bg-primary text-white border-primary scale-105 animate-pulse"
                : "border-divider bg-surface/90 text-muted-dark hover:bg-primary hover:text-white hover:border-primary hover:scale-105"
              }`}
            aria-label="Previous spread"
          >
            ›
          </Link>
        ) : <div />}
      </div>

      {/* Hidden Mobile Prefetch Links */}
      <div className="hidden">
        {requestedPage < 604 && <Link href={`/page/${requestedPage + 1}`} prefetch={true}>Next</Link>}
        {requestedPage > 1 && <Link href={`/page/${requestedPage - 1}`} prefetch={true}>Prev</Link>}
      </div>

      {/* Mobile Navigation replaced by swiping logic directly on main tag */}
      {/* Tafseer Drawer */}
      <AyahTafseerDrawer
        isOpen={!!tafseerData}
        onClose={() => setTafseerData(null)}
        surahId={tafseerData?.surah || 0}
        surahName={tafseerData?.surahName || ""}
        ayahNumber={tafseerData?.ayah || 0}
        arabicWords={tafseerData?.arabicWords}
        pageNumber={tafseerData?.pageNumber}
        language={language}
      />
    </main>
  );
}
