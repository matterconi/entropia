import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // Ensure this runs in Node.js runtime

export async function POST(req: NextRequest) {
  try {
    const timestamp = Math.floor(Date.now() / 1000); // Current time in seconds

    // Check if environment variables are correctly loaded
    if (!process.env.CLOUDINARY_API_SECRET) {
      throw new Error("CLOUDINARY_API_SECRET is not defined.");
    }

    if (!process.env.CLOUDINARY_API_KEY) {
      throw new Error("CLOUDINARY_API_KEY is not defined.");
    }

    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not defined.");
    }

    // Generate a secure SHA-1 hash signature
    const signatureString = `timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
    const signature = crypto
      .createHash("sha1")
      .update(signatureString)
      .digest("hex");

    return NextResponse.json({
      signature,
      timestamp: timestamp.toString(),
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    });
  } catch (error: any) {
    console.error("❌ Cloudinary Signature Error:", error.message);
    return NextResponse.json(
      { error: "Failed to generate Cloudinary signature." },
      { status: 500 },
    );
  }
}
