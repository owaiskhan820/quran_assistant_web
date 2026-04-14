import { Chapter, Juz } from "@/types/quran";
import HomeClient from "@/components/HomeClient";
import chaptersData from "../../public/data/chapters/chapters.json";
import juzsData from "../../public/data/juzs.json";

export default async function Home() {
  const chapters = chaptersData.chapters as Chapter[];
  const juzs = juzsData.juzs as Juz[];
  const alKahf = chapters.find((c) => c.id === 18);

  return (
    <HomeClient chapters={chapters} alKahf={alKahf} juzs={juzs} />
  );
}

