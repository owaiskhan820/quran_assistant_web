"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { Chapter, Juz } from "@/types/quran";
import SideNavMenu from "./SideNavMenu";

interface NavbarProps {
  chapters: Chapter[];
  juzs: Juz[];
}

export default function Navbar({ chapters, juzs }: NavbarProps) {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isMushafPage = pathname?.startsWith("/page/");

  useEffect(() => {
    const handleOpenMenu = () => setIsMenuOpen(true);
    window.addEventListener("open-side-menu", handleOpenMenu);
    return () => window.removeEventListener("open-side-menu", handleOpenMenu);
  }, []);

  return (
    <>
      <header className={`${isMushafPage ? 'hidden md:block' : 'block'} sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-100`}>
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
              Quran Kareem
            </Link>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {/*
            <Link
              href="/breakdown"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-200/50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>Breakdown</span>
            </Link>
            */}

            <Link
              href="/settings"
              className="hidden md:block p-2 hover:bg-emerald-500/5 rounded-full transition-colors text-gray-600 hover:text-emerald-600"
              aria-label="Settings"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </Link>

            {session ? (
              <div className="hidden md:flex items-center gap-3 pl-2 border-l border-gray-100">
                <img 
                  src={session.user?.image || ''} 
                  alt={session.user?.name || 'User'} 
                  className="w-8 h-8 rounded-full border-2 border-primary/20"
                />
                <button 
                  onClick={() => signOut()}
                  className="hidden sm:block text-xs font-bold text-muted hover:text-red-500 transition-colors uppercase tracking-wider"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => signIn('google')}
                className="bg-primary text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Sign In
              </button>
            )}
          </div>
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
