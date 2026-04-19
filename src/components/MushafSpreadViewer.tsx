"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QpcFontStyleRegistry from "@/components/QpcFontStyleRegistry";
import type { MushafLine } from "@/types/mushaf";
import { getJuzForPage, getJuzNameArabic } from "@/utils/juz";
import { getSurahNameArabic, getSurahForPage } from "@/utils/surah";

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

function FifteenLineGrid({
  pageNumber,
  lines,
}: {
  pageNumber: number;
  lines: MushafLine[];
}) {
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
    <div
      dir="rtl"
      className={isShortPage
        ? "flex flex-col justify-center h-full w-full gap-5 py-12"
        : "grid h-full w-full grid-rows-15"
      }
      style={{ fontFamily: `p${pageNumber}` }}
    >
      {linesToRender.map((line) => (
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
            line.words.map((word, idx) => (
              <span
                key={`${line.line}-${idx}`}
                className="leading-none font-normal
                          text-[clamp(1.35rem,5.5vw,1.75rem)]  /* Mobile-Default */
                          lg:text-[1.75rem]"                /* Desktop-Canonical */
                style={{
                  color: word.isStopSign ? "var(--primary)" : "inherit",
                }}
                title={word.l}
              >
                {word.c}
              </span>
            ))
          )}
        </div>
      ))}
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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isRightSwipe && requestedPage < 604) {
      router.push(`/page/${requestedPage + 1}`);
    } else if (isLeftSwipe && requestedPage > 1) {
      router.push(`/page/${requestedPage - 1}`);
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
                className={`relative mx-0 w-full max-w-137.5 lg:rounded-sm bg-surface shadow-[0_0_40px_rgba(var(--primary-rgb),0.16)] lg:border lg:border-primary/10 flex-col pt-3 pb-1 h-full 
                  ${page.pageNumber === requestedPage ? "flex flex-1" : "hidden lg:flex flex-1"}
                `}
              >
                {/* Header Slot (Upcoming Surah/Juz names) */}
                <div className="h-8 w-full flex items-center justify-between px-2 lg:px-8 text-xs font-medium text-muted">
                  {/* Juz Name on the Right - Reverted to calligraphic icons */}
                  <div
                    className="flex-1 text-right text-xl leading-none text-primary/80 select-none"
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
                    className="flex-1 text-left text-xl leading-none text-primary/80 select-none pb-1"
                    style={{
                      fontFamily: 'surah-name-v3',
                      textRendering: 'optimizeLegibility',
                    }}
                    dir="rtl"
                  >
                    سُورَةُ {getSurahNameArabic(getSurahForPage(page.lines))}
                  </div>
                </div>

                {/* Keyline Divider */}
                <div className="mx-2 lg:mx-8 mb-3 border-t border-divider" />

                <div className="relative z-10 flex-1 w-full px-2 lg:px-8 pb-2 overflow-hidden select-none">
                  <FifteenLineGrid pageNumber={page.pageNumber} lines={page.lines} />
                </div>

                {/* Arabic Page Number at Bottom */}
                <div className="mt-auto py-1 flex items-center justify-center text-xl font-medium text-primary opacity-70" style={{ fontFamily: "" }}>
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
            className="pointer-events-auto rounded-2xl border border-divider bg-surface/90 backdrop-blur-md px-4 py-12 text-4xl font-semibold text-muted-dark shadow-2xl hover:bg-primary hover:text-white hover:border-primary hover:scale-105 transition-all active:scale-95 flex items-center justify-center min-w-[64px]"
            aria-label="Next spread"
          >
            ‹
          </Link>
        ) : <div />}
        {previousPageHref ? (
          <Link
            href={previousPageHref}
            className="pointer-events-auto rounded-2xl border border-divider bg-surface/90 backdrop-blur-md px-4 py-12 text-4xl font-semibold text-muted-dark shadow-2xl hover:bg-primary hover:text-white hover:border-primary hover:scale-105 transition-all active:scale-95 flex items-center justify-center min-w-[64px]"
            aria-label="Previous spread"
          >
            ›
          </Link>
        ) : <div />}
      </div>

      {/* Mobile Navigation replaced by swiping logic directly on main tag */}
    </main>
  );
}
