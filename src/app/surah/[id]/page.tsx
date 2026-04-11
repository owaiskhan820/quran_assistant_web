import Link from "next/link";
import QpcFontStyleRegistry from "@/components/QpcFontStyleRegistry";
import type { Chapter, VerseCodeV2 } from "@/types/quran";

async function getChapter(id: string): Promise<Chapter> {
  const response = await fetch(
    `https://api.quran.com/api/v4/chapters/${id}`,
    { next: { revalidate: 86400 } },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch chapter");
  }

  const data: { chapter: Chapter } = await response.json();
  return data.chapter;
}

async function getVerses(id: string): Promise<VerseCodeV2[]> {
  const response = await fetch(
    `https://api.quran.com/api/v4/quran/verses/code_v2?chapter_number=${id}`,
    { next: { revalidate: 86400 } },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch verses");
  }

  const data: { verses: VerseCodeV2[] } = await response.json();
  return data.verses;
}

function buildQpcFontFacesCss(verses: VerseCodeV2[]): string {
  const pages = [...new Set(verses.map((verse) => verse.v2_page))].sort(
    (a, b) => a - b,
  );

  return pages
    .map(
      (page) =>
        `@font-face{font-family:'p${page}';src:url('/fonts/qpc/p${page}.woff2') format('woff2'),url('/fonts/qcp/p${page}.woff2') format('woff2');font-display:swap;}`,
    )
    .join("\n");
}

export default async function SurahPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [chapter, verses] = await Promise.all([getChapter(id), getVerses(id)]);
  const qpcFontFacesCss = buildQpcFontFacesCss(verses);

  return (
    <main className="min-h-screen bg-[#fdfbf7] text-[#1f1f1f]">
      <QpcFontStyleRegistry cssText={qpcFontFacesCss} />
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-emerald-700 underline-offset-4 hover:underline"
        >
          ← Back to Home
        </Link>

        <header className="mt-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {chapter.name_simple}
          </h1>
          <p
            className="mt-4 text-4xl leading-relaxed sm:text-5xl lg:text-6xl"
            dir="rtl"
          >
            {chapter.name_arabic}
          </p>
        </header>

        <section className="mt-10" dir="rtl">
          <div
            className="text-[30px] leading-[2.25] tracking-normal"
            style={{ textAlign: "justify", textJustify: "inter-word" }}
          >
            {verses.map((verse) => (
              <span key={verse.id} style={{ fontFamily: `p${verse.v2_page}` }}>
                {verse.code_v2}{" "}
              </span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
