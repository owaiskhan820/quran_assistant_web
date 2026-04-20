import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans, Noto_Serif } from "next/font/google";
import Navbar from "@/components/Navbar";
import { AudioProvider } from "@/context/AudioContext";
import MediaPlayer from "@/components/MediaPlayer";
import "./globals.css";
import chaptersData from "../../public/data/chapters/chapters.json";
import juzsData from "../../public/data/juzs.json";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Quran Kareem",
  description: "Browse and read the Quran",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${plusJakarta.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <head>
        <link rel="preload" href="/fonts/common/surah-name-v2.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/common/quran-common.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-surface" suppressHydrationWarning>
        <AudioProvider>
          <Navbar chapters={chaptersData.chapters} juzs={juzsData.juzs} />
          {children}
          <MediaPlayer />
        </AudioProvider>
      </body>
    </html>
  );
}

