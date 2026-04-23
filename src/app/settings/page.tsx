import SettingsClient from "@/components/SettingsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Quran Kareem",
  description: "Customize your recitation and translation preferences",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
