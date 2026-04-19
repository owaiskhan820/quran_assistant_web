"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Chapter, Juz } from "@/types/quran";
import SearchIcon from "@/components/icons/SearchIcon";

interface SideNavMenuProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: Chapter[];
  juzs: Juz[];
}

type NavTab = "surah" | "juz" | "page";

const JUZ_START_PAGES = [1, 22, 42, 62, 82, 102, 122, 142, 162, 182, 202, 222, 242, 262, 282, 302, 322, 342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582];

export default function SideNavMenu({
  isOpen,
  onClose,
  chapters,
  juzs,
}: SideNavMenuProps) {
  const params = useParams();
  const currentPage = Number(params?.pageNumber) || 1;
  const [activeTab, setActiveTab] = useState<NavTab>("surah");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChapters = chapters.filter((surah) =>
    surah.name_simple.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.id.toString().includes(searchQuery)
  );

  const filteredJuzs = juzs.filter((juz) =>
    juz.juz.toString().includes(searchQuery) ||
    juz.name_arabic.includes(searchQuery)
  );

  const tabs: { id: NavTab; label: string }[] = [
    { id: "surah", label: "Surah" },
    { id: "juz", label: "Juz" },
    { id: "page", label: "Page" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 z-[110] w-full max-w-[340px] bg-white shadow-2xl flex flex-col"
          >
            {/* Header Area */}
            <div className="flex flex-col gap-6 px-6 py-8 border-b border-gray-100 bg-surface/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900 font-sans tracking-tight">Index</h2>
                  <Link
                    href="/settings"
                    onClick={onClose}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900 mt-1"
                    aria-label="Settings"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                  </Link>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
                  aria-label="Close menu"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Navigation Tabs */}
              <div className="flex p-1 bg-gray-100 rounded-xl">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSearchQuery("");
                    }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      activeTab === tab.id
                        ? "bg-white text-emerald-700 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto book-scrollbar py-6 px-3">
              {activeTab === "surah" ? (
                <div className="space-y-1">
                  {filteredChapters.map((surah) => {
                    const isActive = currentPage >= surah.pages[0] && currentPage <= surah.pages[1];
                    
                    return (
                      <Link
                        key={surah.id}
                        href={`/page/${surah.pages[0]}`}
                        onClick={onClose}
                        className={`group flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 ${
                          isActive 
                            ? "bg-emerald-500/10" 
                            : "hover:bg-emerald-500/5"
                        }`}
                      >
                        {/* Index Icon (The Rotated Square) */}
                        <div className="relative flex items-center justify-center w-11 h-11 shrink-0">
                          <div className={`w-9 h-9 border-2 rotate-45 transition-all duration-500 rounded-sm ${
                            isActive 
                              ? "border-emerald-500 bg-emerald-500/10 rotate-[135deg]" 
                               : "border-emerald-500/20 bg-transparent group-hover:border-emerald-500/40 group-hover:bg-emerald-500/5 group-hover:rotate-[135deg]"
                          }`} />
                          <span className={`absolute font-mono text-[11px] font-bold tracking-tight ${
                            isActive ? "text-emerald-700" : "text-gray-500"
                          }`}>
                            {surah.id.toString().padStart(3, "0")}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <div className="flex flex-col min-w-0 gap-0.5">
                            <span className={`text-sm font-semibold truncate ${
                              isActive ? "text-emerald-950" : "text-gray-900"
                            }`}>
                              {surah.name_simple}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-[0.15em] font-medium">
                              {surah.translated_name.name}
                            </span>
                          </div>
                          
                          <span className={`text-3xl leading-none text-right ${
                            isActive ? "text-emerald-800" : "text-primary"
                          }`}
                          style={{ fontFamily: 'surah-name-v2' }}
                          dir="ltr"
                          >
                            {`surah${surah.id.toString().padStart(3, "0")}`}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : activeTab === "juz" ? (
                <div className="space-y-1">
                  {filteredJuzs.map((juz) => {
                    const startPage = JUZ_START_PAGES[juz.juz - 1];
                    const nextJuzStartPage = JUZ_START_PAGES[juz.juz] || 605;
                    const isActive = currentPage >= startPage && currentPage < nextJuzStartPage;
                    
                    return (
                      <Link
                        key={juz.juz}
                        href={`/page/${startPage}`}
                        onClick={onClose}
                        className={`group flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 ${
                          isActive 
                            ? "bg-emerald-500/10" 
                            : "hover:bg-emerald-500/5"
                        }`}
                      >
                        {/* Index Icon (The Rotated Square) */}
                        <div className="relative flex items-center justify-center w-11 h-11 shrink-0">
                          <div className={`w-9 h-9 border-2 rotate-45 transition-all duration-500 rounded-sm ${
                            isActive 
                              ? "border-emerald-500 bg-emerald-500/10 rotate-[135deg]" 
                              : "border-emerald-500/20 bg-transparent group-hover:border-emerald-500/40 group-hover:bg-emerald-500/5 group-hover:rotate-[135deg]"
                          }`} />
                          <span className={`absolute font-mono text-[11px] font-bold tracking-tight ${
                            isActive ? "text-emerald-700" : "text-gray-500"
                          }`}>
                            {juz.juz.toString().padStart(3, "0")}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <div className="flex flex-col min-w-0 gap-0.5">
                            <span className={`text-sm font-semibold truncate ${
                              isActive ? "text-emerald-950" : "text-gray-900"
                            }`}>
                              Juz {juz.juz}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-[0.15em] font-medium">
                              Page {startPage}
                            </span>
                          </div>
                          
                          <span 
                            className={`text-3xl leading-none text-right ${
                              isActive ? "text-emerald-800" : "text-primary"
                            }`}
                            style={{ 
                              fontFamily: 'QuranCommon',
                              fontVariantLigatures: 'common-ligatures',
                              fontFeatureSettings: '"liga" on',
                              textRendering: 'optimizeLegibility'
                            }}
                            dir="ltr"
                          >
                            {`j${juz.juz.toString().padStart(3, "0")}`}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 text-center space-y-3">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    The {activeTab} view is coming soon.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
