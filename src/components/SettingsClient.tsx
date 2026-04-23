"use client";

import { useAudioContext } from "@/context/AudioContext";
import Link from "next/link";
import { useState } from "react";
import SearchIcon from "@/components/icons/SearchIcon";

export default function SettingsClient() {
  const { 
    reciterId, 
    setReciter, 
    reciters, 
    translationId, 
    setTranslationId, 
    translations 
  } = useAudioContext();

  const [reciterSearch, setReciterSearch] = useState("");
  const [translationSearch, setTranslationSearch] = useState("");

  const filteredReciters = reciters.filter(r => 
    r.name.toLowerCase().includes(reciterSearch.toLowerCase()) ||
    r.style?.toLowerCase().includes(reciterSearch.toLowerCase())
  );

  const filteredTranslations = translations.filter(t =>
    t.name.toLowerCase().includes(translationSearch.toLowerCase()) ||
    t.author.toLowerCase().includes(translationSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 font-sans tracking-tight">Settings</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        {/* Reciter Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Default Reciter</h2>
              <p className="text-sm text-gray-500">Choose the voice that leads your recitation</p>
            </div>
            <div className="relative w-64 hidden sm:block">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </div>
              <input 
                type="text"
                placeholder="Search reciters..."
                value={reciterSearch}
                onChange={(e) => setReciterSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredReciters.map((reciter) => (
              <button
                key={reciter.id}
                onClick={() => setReciter(reciter.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                  reciterId === reciter.id
                    ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                    : "border-white bg-white hover:border-gray-200 shadow-sm"
                }`}
              >
                <div>
                  <h3 className={`font-semibold ${reciterId === reciter.id ? "text-primary" : "text-gray-900"}`}>
                    {reciter.name}
                  </h3>
                  {reciter.style && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-dark/50">
                      {reciter.style}
                    </span>
                  )}
                </div>
                {reciterId === reciter.id && (
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Translation Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Default Translation</h2>
              <p className="text-sm text-gray-500">Select language & scholarly interpretation</p>
            </div>
            <div className="relative w-64 hidden sm:block">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </div>
              <input 
                type="text"
                placeholder="Search translations..."
                value={translationSearch}
                onChange={(e) => setTranslationSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredTranslations.map((t) => (
              <button
                key={t.id}
                onClick={() => setTranslationId(t.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                  translationId === t.id
                    ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                    : "border-white bg-white hover:border-gray-200 shadow-sm"
                }`}
              >
                <div className="min-w-0 pr-4">
                  <h3 className={`font-semibold truncate ${translationId === t.id ? "text-primary" : "text-gray-900"}`}>
                    {t.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">{t.author}</p>
                </div>
                {translationId === t.id && (
                  <div className="shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Script Section (Coming Soon) */}
        <section className="space-y-4 opacity-70">
          <div className="px-2">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Script & Rasm
              <span className="text-[10px] px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full font-bold uppercase tracking-widest">
                Coming Soon
              </span>
            </h2>
            <p className="text-sm text-gray-500">Choose between Uthmani, Indo-Pak, or other scripts</p>
          </div>

          <div className="p-8 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
              ✍️
            </div>
            <p className="text-sm text-gray-500 max-w-sm">
              We are working on integrating high-quality vectorized fonts for various scripts. Stay tuned!
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
