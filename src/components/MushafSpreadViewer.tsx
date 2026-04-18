"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import QpcFontStyleRegistry from "@/components/QpcFontStyleRegistry";
import type { MushafLine } from "@/types/mushaf";

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

function FifteenLineGrid({
  pageNumber,
  lines,
}: {
  pageNumber: number;
  lines: MushafLine[];
}) {
  function Basmalah() {
    return (
      <div className="flex w-full items-center justify-center py-6 text-black">
        <span
          className="text-[1.75em] leading-none"
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

  return (
    <div
      dir="rtl"
      className="grid h-full min-h-200 w-full grid-rows-15"
      style={{ fontFamily: `p${pageNumber}` }}
    >
      {lines.slice(0, 15).map((line) => (
        <div
          key={line.line}
          className="flex min-w-0 flex-row items-center px-4"
          style={{
            direction: "rtl",
            justifyContent: line.is_centered ? "center" : "space-between",
            fontFamily: `p${pageNumber}`,
          }}
        >
          {line.type === "surah_name" ? (
            <div className="relative flex w-full items-center justify-center py-3 text-[#54948F]">
              <span
                className="block w-full text-center text-6xl leading-none opacity-90"
                style={{ 
            fontFamily: "QuranCommon",
            fontVariantLigatures: "common-ligatures",
            fontFeatureSettings: '"liga" on'
          }}
              >
                header
              </span>
              <span
                className="absolute text-5xl leading-none"
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
                className="text-3xl leading-none"
                style={{
                  color: word.isStopSign ? "#54948F" : "inherit",
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
  rightPage: number;
  leftPage: number;
  rightLines: MushafLine[];
  leftLines: MushafLine[];
}

export default function MushafSpreadViewer({
  rightPage,
  leftPage,
  rightLines,
  leftLines,
}: MushafSpreadViewerProps) {
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
      className="min-h-screen bg-[#fdfbf7] text-[#1f1f1f] overflow-hidden"
      style={{ perspective: "2500px" }}
    >
      <QpcFontStyleRegistry cssText={fontCss} preloadPages={preloadPages} />

      <div className="mx-auto w-full max-w-290 px-4 py-8 sm:px-6 lg:px-8 relative">
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
            className="flex flex-col lg:flex-row gap-6 w-full origin-center relative"
          >
            {/* The Spine shadow */}
            <div className="pointer-events-none absolute inset-y-6 left-1/2 hidden w-2 -translate-x-1/2 rounded-full bg-zinc-600/10 shadow-[0_0_18px_10px_rgba(24,24,27,0.16)] lg:block z-10" />

            {pages.map((page) => (
              <article
                key={page.pageNumber}
                style={{ backfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
                className="relative mx-auto w-full max-w-137.5 rounded-sm bg-[#fdfbf7] shadow-sm flex-1"
              >
                <p className="mb-4 text-center text-xs font-medium text-zinc-500">
                  Page {page.pageNumber}
                </p>
                <div className="relative z-10 h-[calc(100dvh-200px)] min-h-200 w-full px-2 pb-4">
                  <FifteenLineGrid pageNumber={page.pageNumber} lines={page.lines} />
                </div>
              </article>
            ))}
          </motion.section>
        </AnimatePresence>
      </div>

      <div className="pointer-events-none fixed inset-0 z-50">
        <div className="relative mx-auto h-full w-full max-w-290">
          {nextPageHref ? (
            <Link
              href={nextPageHref}
              className="pointer-events-auto absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-300/80 bg-[#fdfbf7] px-4 py-2 text-3xl font-semibold text-zinc-800 shadow-lg hover:bg-[#f7f2e8] transition-transform active:scale-95"
              aria-label="Next spread"
            >
              ‹
            </Link>
          ) : null}
          {previousPageHref ? (
            <Link
              href={previousPageHref}
              className="pointer-events-auto absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-300/80 bg-[#fdfbf7] px-4 py-2 text-3xl font-semibold text-zinc-800 shadow-lg hover:bg-[#f7f2e8] transition-transform active:scale-95"
              aria-label="Previous spread"
            >
              ›
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}
