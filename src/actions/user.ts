"use server";

import clientPromise from "@/lib/db";
import { auth } from "@/../auth";
import { ObjectId } from "mongodb";

export async function updateUserPreferences(preferences: {
  language?: 'en' | 'ur';
  preferred_qari?: number;
  preferred_translation?: number;
  last_opened_page?: {
    pageNumber: number;
    surahName: string;
    timestamp: number;
  };
}) {
  const session = await auth();
  
  console.log("Server Action - Session User ID:", session?.user?.id);
  
  if (!session?.user?.id) {
    console.warn("Server Action - No session found, skipping update.");
    return { success: false, error: "Not authenticated" };
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    
    console.log("Server Action - Updating preferences for:", session.user.id, preferences);
    
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: preferences },
      { upsert: false }
    );

    console.log("Server Action - Update Result:", result.modifiedCount > 0 ? "Success" : "No changes or user not found");

    return { success: true };
  } catch (error) {
    console.error("Failed to update user preferences:", error);
    return { success: false, error: "Database error" };
  }
}
