import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      language?: 'en' | 'ur';
      preferred_qari?: number;
      preferred_translation?: number;
      last_opened_page?: {
        pageNumber: number;
        surahName: string;
        timestamp: number;
      };
    } & DefaultSession["user"];
  }

  interface User {
    language?: 'en' | 'ur';
    preferred_qari?: number;
    preferred_translation?: number;
    last_opened_page?: {
      pageNumber: number;
      surahName: string;
      timestamp: number;
    };
  }
}
