"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { FormProvider, useForm } from "react-hook-form";
import { FaFileAlt, FaImage } from "react-icons/fa";
import * as z from "zod";

import FormTags from "./FormTags";
import { Input } from "../ui/input";
import { RainbowButton } from "../ui/rainbow-button";
import { ShinyButton } from "../ui/shiny-button";

// ✅ Zod validation schema
const articleSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  markdownPath: z.string().min(1, "Markdown file is required"), // Percorso su Supabase
  coverImage: z.string().url("Invalid image URL"),
  categories: z.array(z.string()).nonempty("Select at least one category"),
  genres: z.array(z.string()),
  topics: z.array(z.string()),
});

type ArticleFormData = z.infer<typeof articleSchema>;

function MarkdownUpload({
  onMarkdownUpload,
}: {
  onMarkdownUpload: (file: File) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);

  const mdDropzone = useDropzone({
    accept: { "text/markdown": [".md"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFileName(file.name); // Mostra il nome del file
        onMarkdownUpload(file); // Passa il file al form principale
      }
    },
  });

  return (
    <div>
      <label className="block text-base font-semibold mb-2">
        Contenuto dell&apos;Articolo{" "}
        <span className="text-xs font-light">(Formato Markdown .md)</span>
      </label>

      {/* Upload Box */}
      <div
        {...mdDropzone.getRootProps()}
        className={`relative flex flex-col items-center justify-center w-full h-36 border rounded-lg cursor-pointer transition ${
          fileName
            ? "border-solid border-green-500 bg-green-50"
            : "border-dashed border-gray-300 hover:border-green-500"
        }`}
      >
        <input {...mdDropzone.getInputProps()} className="hidden" />

        {/* Icona o nome del file */}
        {fileName ? (
          <p className="text-green-600 font-semibold">{fileName}</p>
        ) : (
          <div className="flex flex-col items-center">
            <FaFileAlt className="text-gray-400 text-4xl" />
            <p className="text-gray-500 text-sm mt-3">
              Premi qui per caricare il file .md, oppure trascinalo
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ImageUpload({
  onImageUpload,
}: {
  onImageUpload: (file: File) => void;
}) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagePreview(URL.createObjectURL(file)); // Mostra anteprima
      onImageUpload(file); // Passa il file al form principale
    }
  };

  return (
    <div>
      <label className="block text-base font-semibold mb-2">
        Immagine di copertina{" "}
      </label>
      <label
        htmlFor="image-upload"
        className={`relative flex flex-col items-center justify-center w-full h-40 border rounded-lg cursor-pointer transition ${
          imagePreview
            ? "border-0 border-green-500 bg-green-50"
            : "border-dashed border-gray-300 hover:border-green-500"
        }`}
      >
        {/* Mostra l'icona o l'anteprima dell'immagine */}
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
              Click or Drag to Upload
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

export default function ArticleUploadForm({ userId }: { userId: string }) {
  const [uploading, setUploading] = useState(false);
  const formMethods = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      markdownPath: "",
      coverImage: "",
      categories: [],
      genres: [], // 👈 Assicura che non sia undefined
      topics: [], // 👈 Assicura che non sia undefined
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = formMethods;

  const coverImage = watch("coverImage");
  const markdownPath = watch("markdownPath");

  // ✅ Markdown file dropzone con upload via API
  const mdDropzone = useDropzone({
    accept: { "text/markdown": [".md"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        console.log("📄 Markdown file selected:", file);
        await uploadMarkdownToSupabase(file);
      }
    },
  });

  // 🔼 Upload del file Markdown tramite API di Supabase
  const uploadMarkdownToSupabase = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("articleId", `${userId}-${Date.now()}`); // Nome univoco

      const response = await fetch("/api/supabase/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload Markdown file.");

      const data = await response.json();
      console.log("✅ Markdown uploaded:", data.filePath);
      setValue("markdownPath", data.filePath, { shouldValidate: true });
    } catch (error: any) {
      console.error("❌ Error uploading Markdown:", error.message);
      alert("Failed to upload Markdown file.");
    } finally {
      setUploading(false);
    }
  };

  // 🔼 Upload immagine su Cloudinary
  const handleImageUpload = async (imageFile: File) => {
    try {
      setUploading(true);

      // 🔍 Get Cloudinary signature
      const signatureResponse = await fetch("/api/cloudinary/signature", {
        method: "POST",
      });

      const signatureData = await signatureResponse.json();
      if (!signatureData.signature || !signatureData.timestamp) {
        throw new Error("Signature or timestamp is missing from API response.");
      }

      // 🔍 Upload Image to Cloudinary
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("timestamp", signatureData.timestamp);
      formData.append("signature", signatureData.signature);
      formData.append("api_key", signatureData.api_key);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const uploadData = await uploadResponse.json();
      if (!uploadData.secure_url) {
        throw new Error("No image URL received from Cloudinary!");
      }

      setValue("coverImage", uploadData.secure_url, { shouldValidate: true });
    } catch (error: any) {
      console.error("❌ Error uploading image:", error.message);
    } finally {
      setUploading(false);
    }
  };

  // 📝 Gestione della sottomissione dell'articolo
  const onSubmit = async (data: ArticleFormData) => {
    console.log("📤 Dati del form inviati:", data);
    setUploading(true);

    const formData = {
      title: data.title,
      coverImage: data.coverImage,
      markdownPath: data.markdownPath,
      categories: data.categories,
      genres: data.genres,
      topics: data.topics,
      author: userId,
    };

    console.log("📝 FormData preparato per il backend:", formData);

    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Errore nella risposta:", errorText);
        throw new Error("Errore nel caricamento dell’articolo");
      }

      window.location.reload();
    } catch (error) {
      console.error("❌ Errore nell'invio:", error);
      alert("Errore nel caricamento dell’articolo.");
    }

    setUploading(false);
  };

  return (
    <FormProvider {...formMethods}>
      <div className="border-gradient w-full h-full mt-12 p-[1px] animated-gradient rounded-lg">
        <div className="mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg">
          <h2 className="text-2xl font-bold text-center mb-6 font-title text-gradient animated-gradient">
            Carica un nuovo articolo
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8">
            {/* Title Input */}
            <div className="lg:flex items-center justify-center space-y-6">
              <div className="lg:w-1/2 lg:px-12 space-y-6">
                <div>
                  <label className="block text-base font-semibold mb-2">
                    Titolo{" "}
                    <span className="text-xs font-light">
                      (Max 39 caratteri)
                    </span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Inserisci il titolo dell'articolo"
                    className="w-full p-3 border rounded-md transition border-gray-300 focus:border-green-500 hover:border-green-500"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-red-500">{errors.title.message}</p>
                  )}
                </div>

                {/* Markdown File Upload */}
                <MarkdownUpload
                  onMarkdownUpload={(file) => uploadMarkdownToSupabase(file)}
                />

                {/* Image Upload */}
                <ImageUpload
                  onImageUpload={(file) => handleImageUpload(file)}
                />
              </div>
              <FormTags setValue={setValue} watch={watch} />
            </div>
            {/* Submit button */}
            <div className="flex justify-center">
              <RainbowButton
                type="submit"
                className="mt-8 mb-4 lg:max-w-[300px]"
                onClick={() => console.log("🚀 Invio dati...")}
              >
                {uploading ? "Caricamento..." : "Carica Articolo"}
              </RainbowButton>
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
}
