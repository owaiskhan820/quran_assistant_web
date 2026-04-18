import fs from "fs/promises";
import path from "path";
import { redirect } from "next/navigation";
import MushafSpreadViewer from "@/components/MushafSpreadViewer";
import type { MushafLine } from "@/types/mushaf";

export async function generateStaticParams() {
  // Option: Pre-generate all 604 pages for ultra-fast instant loads
  const pages = Array.from({ length: 604 }, (_, i) => ({
    pageNumber: String(i + 1),
  }));
  return pages;
}

async function getPageLines(pageNumber: number): Promise<MushafLine[]> {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      "pages",
      `${pageNumber}.json`
    );
    const fileContent = await fs.readFile(filePath, "utf-8");
    return JSON.parse(fileContent) as MushafLine[];
  } catch (error) {
    console.error(`Failed to read page ${pageNumber}:`, error);
    return [];
  }
}

export default async function MushafPage({
  params,
}: {
  params: Promise<{ pageNumber: string }>;
}) {
  const resolvedParams = await params;
  const currentFromUrl = Number.parseInt(resolvedParams.pageNumber ?? "1", 10);
  const safeCurrent = Number.isInteger(currentFromUrl) ? currentFromUrl : 1;
  const boundedCurrent = Math.min(604, Math.max(1, safeCurrent));

  function getRightPage(page: number) {
    if (page <= 1) return 1;
    return page % 2 === 1 ? page : page - 1;
  }

  const rightPage = getRightPage(boundedCurrent);

  // If the user navigates directly to a left page, redirect them to the start of the spread (right page)
  if (boundedCurrent !== rightPage) {
    redirect(`/page/${rightPage}`);
  }

  const leftPage = rightPage + 1 <= 604 ? rightPage + 1 : rightPage;

  // Retrieve data natively on the server without any HTTP fetch delay
  const [rightLines, leftLines] = await Promise.all([
    getPageLines(rightPage),
    getPageLines(leftPage),
  ]);

  return (
    <MushafSpreadViewer
      rightPage={rightPage}
      leftPage={leftPage}
      rightLines={rightLines}
      leftLines={leftLines}
    />
  );
}
