export interface Chapter {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface ChaptersResponse {
  chapters: Chapter[];
}

export interface Verse {
  id: number;
  verse_key: string;
  text_uthmani: string;
}

export interface VerseCodeV2 {
  id: number;
  verse_key: string;
  code_v2: string;
  v2_page: number;
}
