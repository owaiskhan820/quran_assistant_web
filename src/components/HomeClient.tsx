"use client";

import { useState } from "react";
import Link from "next/link";
import { Chapter, Juz } from "@/types/quran";
import SearchIcon from "@/components/icons/SearchIcon";
import FilterMenu from "@/components/FilterMenu";
import Footer from "@/components/Footer";
import JuzGrid from "@/components/JuzGrid";

interface HomeClientProps {
  chapters: Chapter[];
  alKahf: Chapter | undefined;
  juzs: Juz[];
}

// Fixed page mappings for Juz navigation
const JUZ_START_PAGES = [1, 22, 42, 62, 82, 102, 122, 142, 162, 182, 202, 222, 242, 262, 282, 302, 322, 342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582];

export default function HomeClient({ chapters, alKahf, juzs }: HomeClientProps) {
  const [showAll, setShowAll] = useState(false);
  const [activeTab, setActiveTab] = useState<"surah" | "juz">("surah");
  const displayedChapters = showAll ? chapters : chapters.slice(0, 9);

  return (
    <main 
      className="min-h-screen bg-surface flex flex-col relative"
      style={{
        backgroundImage: "url('/resources/background.png')",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Blurred overlay */}
      <div 
        className="fixed inset-0 pointer-events-none" 
        style={{
          backgroundImage: "url('/resources/background.png')",
          filter: "blur(2px)",
          opacity: 0.08,
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>
      
      <div className="relative z-10 flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-4 pt-8 pb-4 sm:px-6 lg:px-8">
          <div className="space-y-6 text-center">
            {/* Title */}
            <div className="space-y-4">
              <h1 className="font-serif text-5xl sm:text-6xl font-bold text-primary leading-tight">
                The Sacred Quran Library
              </h1>
              <p className="text-lg text-gray-600 mx-auto">
                Explore the beauty of the Quran with translations and detailed explanations
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto w-full">
              <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white border-2 border-primary/20 shadow-sm hover:border-primary/40 transition">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search by chapter name or number..."
                  className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filter Menu */}
        <section className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <FilterMenu activeTab={activeTab} onTabChange={setActiveTab} />
        </section>

        {/* Continue Reading Banner */}
        {alKahf && (
          <section className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
            <Link href={`/page/${alKahf.pages[0]}`}>
              <div 
                className="relative overflow-hidden rounded-2xl p-8 sm:p-12 shadow-lg hover:shadow-xl transition bg-cover bg-center"
                style={{
                  backgroundImage: "url('/resources/banner.png')",
                }}
              >
                {/* Green gradient overlay from left to right */}
                <div 
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: "linear-gradient(to right, rgba(0, 83, 84, 0.6), transparent)"
                  }}
                ></div>
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
                
                <div className="relative space-y-4 max-w-2xl">
                  <h2 className="text-4xl sm:text-5xl font-serif font-bold text-white leading-tight">
                    Continue Reading
                  </h2>
                  <p className="text-base sm:text-lg text-white/90 leading-relaxed">
                    Pick up where you left off
                  </p>
                  <button className="inline-block px-6 py-2 bg-white text-primary font-semibold rounded-full hover:bg-primary hover:text-white transition-colors duration-300">
                    Resume 
                  </button>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Surah Grid */}
        {activeTab === "surah" && (
        <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayedChapters.map((chapter) => (
              <Link 
                href={`/page/${chapter.pages[0]}`} 
                key={chapter.id}
                className="group"
              >
                <div className="flex items-center gap-6 p-6 rounded-xl bg-white border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all duration-300">
                  {/* Chapter Number Circle */}
                  <div className="shrink-0 w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                    <span className="text-2xl font-serif font-bold text-primary">
                      {chapter.id}
                    </span>
                  </div>

                  {/* Center Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                      {chapter.name_simple}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                      {chapter.translated_name.name}
                    </p>
                  </div>

                  {/* Right Side - Arabic Name and Ayahs */}
                  <div className="shrink-0 text-right flex flex-col justify-center items-end">
                    <div 
                      className="text-3xl leading-none text-primary" 
                      style={{ fontFamily: 'surah-name-v2' }}
                      dir="ltr"
                    >
                      {`surah${chapter.id.toString().padStart(3, "0")}`}
                    </div>
                    <div className="text-sm text-gray-500 font-medium uppercase tracking-wide mt-1">
                      {chapter.verses_count} AYAHS
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* View All Button */}
          {!showAll && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => setShowAll(true)}
                className="px-8 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-colors duration-300 shadow-md hover:shadow-lg"
              >
                View All Surahs
              </button>
            </div>
          )}
        </section>
        )}

        {/* Juz Grid */}
        {activeTab === "juz" && (
          <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <JuzGrid juzs={juzs} juzStartPages={JUZ_START_PAGES} />
          </section>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
