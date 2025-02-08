import cloudinary from "cloudinary";

// ✅ Configure Cloudinary (ensure you have the env variables set)
cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;

        // ✅ Upload to Cloudinary
        const response = await cloudinary.v2.uploader.upload(base64String, {
          folder: "articles", // Organize in a folder
          resource_type: "image",
        });

        resolve(response.secure_url); // Return the URL
      } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
  });
}
