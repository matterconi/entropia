import React, { useState } from "react";
import { FaImage } from "react-icons/fa";

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  isOptional?: boolean;
  label?: string;
}

export default function ImageUpload({
  onImageUpload,
  isOptional = false,
  label = "Immagine di copertina",
}: ImageUploadProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagePreview(URL.createObjectURL(file));
      onImageUpload(file);
    }
  };

  return (
    <div>
      <label className="block text-base font-semibold mb-2">
        {label}
        {isOptional ? " (opzionale)" : ""}
      </label>
      <label
        htmlFor="image-upload"
        className={`relative flex flex-col items-center justify-center w-full h-40 border rounded-lg cursor-pointer transition ${
          imagePreview
            ? "border-0 border-green-500 bg-green-50"
            : "border-dashed border-gray-300 hover:border-green-500"
        }`}
      >
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Image preview"
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="flex flex-col items-center">
            <FaImage className="text-gray-400 text-4xl" />
            <p className="text-gray-500 text-sm mt-2">
              Click o trascina per caricare
            </p>
          </div>
        )}

        <input
          type="file"
          id="image-upload"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}
