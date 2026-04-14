"use client";

import Link from "next/link";

interface JuzData {
  id: number;
  juz: number;
  name_english: string;
  name_arabic: string;
  verses_count: number;
  verse_mapping: {
    start_surah: number;
    start_verse: number;
    end_surah: number;
    end_verse: number;
  };
}

interface JuzGridProps {
  juzs: JuzData[];
  juzStartPages: number[];
}

export default function JuzGrid({ juzs, juzStartPages }: JuzGridProps) {

  // Filter duplicates - keep only unique Juz numbers (1-30)
  const uniqueJuzs = Array.from(
    new Map(juzs.map((juz) => [juz.juz, juz])).values()
  ).sort((a, b) => a.juz - b.juz);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {uniqueJuzs.map((juz, index) => {
        const startPage = juzStartPages[index];

        return (
          <Link
            href={`/page/${startPage}`}
            key={juz.juz}
            className="group"
          >
            <div className="flex items-center gap-6 p-6 rounded-xl bg-white border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all duration-300">
              {/* Juz Number Circle */}
              <div className="shrink-0 w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                <span className="text-2xl font-serif font-bold text-primary">
                  {juz.juz}
                </span>
              </div>

              {/* Center Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                  Juz {juz.juz}
                </h3>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                  {juz.verses_count} Verses
                </p>
              </div>

              {/* Right Side - Arabic Name and Page */}
              <div className="shrink-0 text-right">
                <div className="text-lg font-serif font-bold text-primary mb-1" dir="rtl">
                  {juz.name_arabic}
                </div>
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                  Page {startPage}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
