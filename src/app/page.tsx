import { Chapter } from "@/types/quran";
import HomeClient from "@/components/HomeClient";

async function getChapters(): Promise<Chapter[]> {
  const response = await fetch(
    new URL("/data/chapters/chapters.json", process.env.ORIGIN || "http://localhost:3000"),
    {
      next: { revalidate: 86400 },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch chapters");
  }

  const data = await response.json();
  return data.chapters;
}

export default async function Home() {
  const chapters = await getChapters();
  const alKahf = chapters.find((c) => c.id === 18);

  return (
    <HomeClient chapters={chapters} alKahf={alKahf} />
  );
}

