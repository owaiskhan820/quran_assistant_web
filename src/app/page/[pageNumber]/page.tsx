"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import QpcFontStyleRegistry from "@/components/QpcFontStyleRegistry";
import type { MushafLine } from "@/types/mushaf";

async function getPageLines(pageNumber: number): Promise<MushafLine[]> {
  const response = await fetch(`/data/pages/${pageNumber}.json?v=${Date.now()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch page ${pageNumber}`);
  }

  return (await response.json()) as MushafLine[];
}

function buildPageFontCss(pageNumbers: number[]): string {
  const uniquePages = [...new Set(pageNumbers)].sort((a, b) => a - b);
  const specialFonts = [
    "@font-face{font-family:'surah-name-v2';src:url('https://static-cdn.tarteel.ai/qul/fonts/surah-names/v2/surah-name-v2.ttf') format('truetype');font-display:swap;}",
  ].join("\n");

  const pageFonts = uniquePages
    .map(
      (page) =>
        `@font-face{font-family:'p${page}';src:url('/fonts/qpc/p${page}.woff2') format('woff2');font-display:block;}`,
    )
    .join("\n");

  return `${specialFonts}\n${pageFonts}`;
}

function getRightPage(page: number) {
  if (page <= 1) {
    return 1;
  }
  return page % 2 === 1 ? page : page - 1;
}

function FifteenLineGrid({
  pageNumber,
  lines,
}: {
  pageNumber: number;
  lines: MushafLine[];
}) {
  function isAyahEndWord(line: MushafLine, wordIndex: number) {
    const current = line.words[wordIndex];
    const next = line.words[wordIndex + 1];
    return !next || current.a !== next.a;
  }

  function Basmalah() {
    return (
      <div className="flex w-full items-center justify-center py-6 text-black">
        <span
          className="text-[1.75em] leading-none"
          style={{ fontFamily: "quran-common" }}
        >
          ﷽
        </span>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="grid h-full min-h-[800px] w-full grid-rows-15"
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
            <div className="relative flex w-full items-center justify-center py-3 text-[#a88d53]">
              <span
                className="block w-full text-center text-6xl leading-none opacity-90"
                style={{ fontFamily: "quran-common" }}
              >
                header
              </span>
              <span
                className="absolute text-3xl leading-none"
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
                  color: isAyahEndWord(line, idx) ? "#5f8a5a" : "#1f1f1f",
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

export default function MushafPageView() {
  const router = useRouter();
  const params = useParams<{ pageNumber: string }>();
  const currentFromUrl = Number.parseInt(params.pageNumber ?? "1", 10);
  const safeCurrent = Number.isInteger(currentFromUrl) ? currentFromUrl : 1;
  const boundedCurrent = Math.min(604, Math.max(1, safeCurrent));
  const rightPage = getRightPage(boundedCurrent);
  const leftPage = rightPage + 1 <= 604 ? rightPage + 1 : rightPage;

  const [pagesData, setPagesData] = useState<Record<number, MushafLine[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (boundedCurrent !== rightPage) {
      router.replace(`/page/${rightPage}`);
      return;
    }

    let cancelled = false;

    async function loadSpread() {
      setIsLoading(true);
      try {
        const [rightLines, leftLines] = await Promise.all([
          getPageLines(rightPage),
          getPageLines(leftPage),
        ]);

        if (cancelled) {
          return;
        }

        setPagesData({
          [rightPage]: rightLines,
          [leftPage]: leftLines,
        });
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSpread();

    return () => {
      cancelled = true;
    };
  }, [boundedCurrent, leftPage, rightPage, router]);

  const pages = useMemo(
    () => [
      { pageNumber: rightPage, lines: pagesData[rightPage] ?? [] },
      { pageNumber: leftPage, lines: pagesData[leftPage] ?? [] },
    ],
    [leftPage, pagesData, rightPage],
  );

  const preloadPages = [rightPage, leftPage];
  const fontCss = buildPageFontCss(preloadPages);
  const previousPageHref = rightPage > 1 ? `/page/${Math.max(1, rightPage - 2)}` : null;
  const nextPageHref = rightPage + 2 <= 603 ? `/page/${rightPage + 2}` : null;

  return (
    <main
      key={rightPage}
      className="min-h-screen bg-[#fdfbf7] text-[#1f1f1f]"
    >
      <QpcFontStyleRegistry cssText={fontCss} preloadPages={preloadPages} />

      <div className="mx-auto w-full max-w-[1160px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold sm:text-2xl">Mushaf View</h1>
          <Link
            href="/"
            className="text-sm font-medium text-emerald-700 underline-offset-4 hover:underline"
          >
            Back to Home
          </Link>
        </header>

        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={`${rightPage}-${leftPage}`}
            dir="rtl"
            className="relative grid grid-cols-1 gap-6 lg:grid-cols-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="pointer-events-none absolute inset-y-6 left-1/2 hidden w-2 -translate-x-1/2 rounded-full bg-zinc-600/10 shadow-[0_0_18px_10px_rgba(24,24,27,0.16)] lg:block" />

            {pages.map((page) => (
              <article
                key={page.pageNumber}
                className="relative mx-auto w-full max-w-[550px] rounded-sm bg-[#fdfbf7] shadow-sm"
              >
                <p className="mb-4 text-center text-xs font-medium text-zinc-500">
                  Page {page.pageNumber}
                </p>
                <div className="relative z-10 h-[calc(100dvh-200px)] min-h-[800px] w-full px-2 pb-4">
                  <FifteenLineGrid pageNumber={page.pageNumber} lines={page.lines} />
                </div>
              </article>
            ))}
          </motion.section>
        </AnimatePresence>
        {isLoading ? (
          <p className="mt-4 text-center text-sm text-zinc-500">Loading spread...</p>
        ) : null}
      </div>

      <div className="pointer-events-none fixed inset-0 z-50">
        <div className="relative mx-auto h-full w-full max-w-[1160px]">
          {nextPageHref ? (
            <Link
              href={nextPageHref}
              className="pointer-events-auto absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-300/80 bg-[#fdfbf7] px-4 py-2 text-3xl font-semibold text-zinc-800 shadow-lg hover:bg-[#f7f2e8]"
              aria-label="Next spread"
            >
              ‹
            </Link>
          ) : null}
          {previousPageHref ? (
            <Link
              href={previousPageHref}
              className="pointer-events-auto absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-300/80 bg-[#fdfbf7] px-4 py-2 text-3xl font-semibold text-zinc-800 shadow-lg hover:bg-[#f7f2e8]"
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
