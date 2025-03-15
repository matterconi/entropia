// File: app/api/users/[id]/update-profile/route.ts

import { NextRequest, NextResponse } from "next/server";

import User from "@/database/User";
import dbConnect from "@/lib/mongoose";

// Function to upload an image to Cloudinary
async function uploadImageToCloudinary(
  imageFile: File,
  oldImageUrl?: string,
  userId?: string,
) {
  try {
    // 1. Get the signature from Cloudinary, passing the user ID
    const signatureResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/cloudinary/signature/user-profile-img`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      },
    );

    const signatureData = await signatureResponse.json();
    if (!signatureData.signature || !signatureData.timestamp) {
      throw new Error("Signature or timestamp is missing from API response.");
    }

    // 2. Upload the image to Cloudinary
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("timestamp", signatureData.timestamp);
    formData.append("signature", signatureData.signature);
    formData.append("api_key", signatureData.api_key);
    formData.append("cloud_name", signatureData.cloud_name);

    // Add the same parameters that were used to create the signature
    if (signatureData.folder) {
      formData.append("folder", signatureData.folder);
    }

    if (signatureData.tags) {
      formData.append("tags", signatureData.tags);
    }

    if (signatureData.public_id) {
      formData.append("public_id", signatureData.public_id);
    }

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    // Log the exact response
    const responseText = await uploadResponse.text();
    console.log("Cloudinary response (raw):", responseText);

    let uploadData;
    try {
      uploadData = JSON.parse(responseText);
      console.log("Cloudinary response details:", uploadData);
    } catch (e) {
      console.error("Failed to parse response as JSON:", e);
      throw new Error(
        `Invalid response from Cloudinary: ${responseText.substring(0, 200)}`,
      );
    }

    if (!uploadResponse.ok) {
      console.error("Cloudinary auth error:", {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        details: uploadData,
      });
      throw new Error(
        `Cloudinary upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`,
      );
    }

    if (!uploadData.secure_url) {
      console.error("Missing secure_url in response:", uploadData);
      throw new Error("No image URL received from Cloudinary!");
    }

    // 3. If there is an old image and it has not been overwritten, delete it
    if (
      oldImageUrl &&
      extractPublicIdFromUrl(oldImageUrl) !==
        extractPublicIdFromUrl(uploadData.secure_url)
    ) {
      // Verify that the previous image is a profile image before deleting it
      const oldPublicId = extractPublicIdFromUrl(oldImageUrl);
      if (
        oldPublicId &&
        (oldPublicId.includes("user_profiles") ||
          oldPublicId.includes("profile_"))
      ) {
        await deleteImageFromCloudinary(oldImageUrl);
      } else {
        console.log(
          "Skipping deletion as the old image is not a profile image",
        );
      }
    }

    return uploadData.secure_url;
  } catch (error: any) {
    console.error("❌ Error uploading image:", error.message);
    throw new Error(`Error during image upload: ${error.message}`);
  }
}

// Function to delete an image from Cloudinary
async function deleteImageFromCloudinary(imageUrl: string) {
  try {
    console.log("🔍 Starting image deletion process for:", imageUrl);

    const publicId = extractPublicIdFromUrl(imageUrl);
    if (!publicId) {
      console.error("❌ Could not extract public_id from URL:", imageUrl);
      return false;
    }

    console.log("📝 Extracted public_id:", publicId);

    // Security check: make sure to delete only profile images
    if (!publicId.includes("user_profiles") && !publicId.includes("profile_")) {
      console.warn(
        "⚠️ Attempted to delete a non-profile image, operation aborted:",
        publicId,
      );
      return false;
    }

    // Get the signature for the delete operation
    console.log("🔑 Requesting delete signature for public_id:", publicId);
    const deleteSignatureResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/cloudinary/signature/user-profile-img`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "delete", publicId }),
      },
    );

    if (!deleteSignatureResponse.ok) {
      const errorText = await deleteSignatureResponse.text();
      console.error("❌ Failed to get delete signature:", {
        status: deleteSignatureResponse.status,
        text: errorText,
      });
      return false;
    }

    const deleteSignatureData = await deleteSignatureResponse.json();
    console.log("📋 Signature data received:", {
      timestamp: deleteSignatureData.timestamp,
      signature: deleteSignatureData.signature ? "✓ Present" : "❌ Missing",
      api_key: deleteSignatureData.api_key ? "✓ Present" : "❌ Missing",
      cloud_name: deleteSignatureData.cloud_name,
    });

    if (!deleteSignatureData.signature || !deleteSignatureData.timestamp) {
      console.error(
        "❌ Delete signature or timestamp is missing from API response.",
      );
      return false;
    }

    // Prepare the data for deletion
    const deletePayload = {
      public_id: publicId,
      signature: deleteSignatureData.signature,
      api_key: deleteSignatureData.api_key,
      timestamp: deleteSignatureData.timestamp,
    };

    console.log("🔧 Delete payload:", deletePayload);

    // Call the Cloudinary API to delete the image
    console.log("🗑️ Sending delete request to Cloudinary");
    const deleteResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${deleteSignatureData.cloud_name}/image/destroy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deletePayload),
      },
    );

    // Log the complete response
    const responseText = await deleteResponse.text();
    console.log("📄 Raw delete response:", responseText);

    let deleteData;
    try {
      deleteData = JSON.parse(responseText);
      console.log("📊 Parsed delete response:", deleteData);
    } catch (e) {
      console.error("❌ Failed to parse delete response as JSON:", e);
      return false;
    }

    if (deleteData.result !== "ok") {
      console.warn(
        "⚠️ Warning: Failed to delete image from Cloudinary",
        deleteData,
      );
      return false;
    } else {
      console.log("✅ Successfully deleted profile image:", publicId);
      return true;
    }
  } catch (error) {
    console.error("❌ Error deleting image from Cloudinary:", error);
    return false;
  }
}

// Function to extract the public ID from a Cloudinary URL
function extractPublicIdFromUrl(url: string): string | null {
  if (!url || typeof url !== "string") return null;

  try {
    console.log("Extracting public_id from:", url);

    // Remove transformation parameters (everything after ?)
    const cleanUrl = url.split("?")[0];

    // Standard Cloudinary URL with version
    const versionRegex = /\/v\d+\/(.+?)(?:\.[^.]+)?$/;
    const versionMatch = cleanUrl.match(versionRegex);

    if (versionMatch && versionMatch[1]) {
      console.log("Extracted public_id (with version):", versionMatch[1]);
      return versionMatch[1];
    }

    // Standard Cloudinary URL without version
    const uploadRegex = /\/upload\/(.+?)(?:\.[^.]+)?$/;
    const uploadMatch = cleanUrl.match(uploadRegex);

    if (uploadMatch && uploadMatch[1]) {
      console.log("Extracted public_id (from upload):", uploadMatch[1]);
      return uploadMatch[1];
    }

    console.log("Could not extract public_id using regex patterns");
    return null;
  } catch (error) {
    console.error("Error extracting public_id:", error);
    return null;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = await params;
    const userId = id.id;

    // Connect to the database
    await dbConnect();

    // Verify that the user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return NextResponse.json({ error: "❌ User not found" }, { status: 404 });
    }

    // Parse the form data
    const formData = await req.formData();

    // Handle profile changes
    const updateFields: { [key: string]: any } = {};

    // Check username (if present)
    const username = formData.get("username") as string;
    if (username) {
      // Verify that the username is not already in use (if it is modified)
      if (username !== existingUser.username) {
        const usernameExists = await User.findOne({
          username,
          _id: { $ne: userId }, // exclude the current user from the search
        });

        if (usernameExists) {
          return NextResponse.json(
            { error: "❌ Username already in use" },
            { status: 400 },
          );
        }
      }
      updateFields.username = username;
    }

    // Handle the bio field (if present)
    const bio = formData.get("bio") as string;
    if (bio !== undefined) {
      updateFields.bio = bio;
    }

    // Handle the profile image (if present)
    const profileImage = formData.get("profileImage") as File;
    const oldProfileImg = formData.get("oldProfileImg") as string;

    if (profileImage) {
      try {
        // Upload the image to Cloudinary
        const imageUrl = await uploadImageToCloudinary(
          profileImage,
          oldProfileImg,
          userId,
        );
        updateFields.profileImg = imageUrl;
      } catch (error: any) {
        return NextResponse.json(
          {
            error: `❌ Error during image upload: ${error.message}`,
          },
          { status: 500 },
        );
      }
    }

    // Check if there are fields to update
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: "❌ No fields to update provided" },
        { status: 400 },
      );
    }

    // Perform the update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }, // Return the updated document
    );

    return NextResponse.json(
      {
        message: "✅ Profile updated successfully",
        user: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error during profile update:", error);
    return NextResponse.json(
      { error: "❌ Internal server error" },
      { status: 500 },
    );
  }
}
