import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Morphology from "@/models/Morphology";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const verseKey = searchParams.get("verse_key");

  if (!verseKey) {
    return NextResponse.json({ error: "Missing verse_key" }, { status: 400 });
  }

  try {
    await dbConnect();

    // Optimization: Use a global flag to avoid double seeding
    const isSeeding = (global as any)._isMorphologySeeding;
    
    const count = await Morphology.countDocuments();
    if (count === 0 && !isSeeding) {
      (global as any)._isMorphologySeeding = true;
      try {
        console.log("Seeding morphology data (this may take a moment)...");
        const filePath = path.join(process.cwd(), "data", "morphology.json");
        const jsonData = fs.readFileSync(filePath, "utf8");
        const data = JSON.parse(jsonData);
        
        // Use native driver for extremely fast bulk insert
        await Morphology.collection.insertMany(data);
        console.log(`Successfully seeded ${data.length} verses.`);
      } finally {
        (global as any)._isMorphologySeeding = false;
      }
    } else if (isSeeding) {
       return NextResponse.json({ message: "Seeding in progress. Please wait a few seconds and refresh." }, { status: 503 });
    }

    const data = await Morphology.findOne({ verse_key: verseKey });

    if (!data) {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
