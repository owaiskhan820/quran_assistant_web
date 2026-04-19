"use client";

import { useState } from "react";
import Link from "next/link";
import { Chapter, Juz } from "@/types/quran";
import SideNavMenu from "./SideNavMenu";

interface NavbarProps {
  chapters: Chapter[];
  juzs: Juz[];
}

export default function Navbar({ chapters, juzs }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="hidden md:block sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 -ml-2 hover:bg-emerald-500/5 rounded-full transition-colors group"
              aria-label="Open menu"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-600 group-hover:text-emerald-600 transition-colors"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-primary font-sans"
            >
              The Sacred Library
            </Link>
          </div>

          <nav className="hidden sm:flex gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition"
            >
              Browse
            </Link>
            <Link
              href="/search"
              className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition"
            >
              Search
            </Link>
          </nav>
        </div>
      </header>

      <SideNavMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        chapters={chapters}
        juzs={juzs}
      />
    </>
  );
}
