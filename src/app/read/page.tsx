import MushafSpreadViewer from "@/components/MushafSpreadViewer";

export default async function ReadPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentFromUrl = Number.parseInt(resolvedParams.p ?? "1", 10);
  const safeCurrent = Number.isInteger(currentFromUrl) ? currentFromUrl : 1;
  const boundedCurrent = Math.min(604, Math.max(1, safeCurrent));

  return (
    <MushafSpreadViewer initialPage={boundedCurrent} />
  );
}
