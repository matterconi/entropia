import { NextRequest, NextResponse } from "next/server";

import dbConnect from "@/lib/mongoose";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    return NextResponse.json({ message: "✅ MongoDB connection successful!" });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    return NextResponse.json(
      { error: "❌ MongoDB connection failed!" },
      { status: 500 },
    );
  }
}
