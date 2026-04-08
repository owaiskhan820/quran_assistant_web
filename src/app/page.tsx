import { Chapter, ChaptersResponse } from "@/types/quran";

async function getSurahs(): Promise<Chapter[]> {
  const response = await fetch("https://api.quran.com/api/v4/chapters", {
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch chapters");
  }

  const data: ChaptersResponse = await response.json();
  return data.chapters;
}

export default async function Home() {
  const surahs = await getSurahs();

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Quran Assistant
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
          Browse all {surahs.length} Surahs
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {surahs.map((surah) => (
          <article
            key={surah.id}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {surah.id}. {surah.name_simple}
              </h2>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {surah.verses_count} ayahs
              </span>
            </div>

            <p className="mt-2 text-2xl leading-relaxed text-zinc-900 dark:text-zinc-100">
              {surah.name_arabic}
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md bg-emerald-100 px-2 py-1 font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                {surah.revelation_place}
              </span>
              <span className="rounded-md bg-blue-100 px-2 py-1 font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                {surah.translated_name.name}
              </span>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
