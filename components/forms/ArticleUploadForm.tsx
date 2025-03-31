"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import NonAuthorScreen from "@/components/feedback-screens/NonAuthorScreen";
import UserNotFoundScreen from "@/components/feedback-screens/UserNotFoundScreen";
import FormTags from "@/components/forms/FormTags";
import ImageUpload from "@/components/forms/ImageUpload";
import MarkdownUpload from "@/components/forms/MarkdownUpload";
import SerieSelector from "@/components/forms/SerieSelector";
// Importo i componenti modulari
import { Input } from "@/components/ui/input";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { useUser } from "@/context/UserContext";
// Importo le funzioni di upload
import {
  submitFormData,
  uploadImageToCloudinary,
  uploadMarkdownToSupabase,
} from "@/lib/upload/uploadHelpers";
// Importo gli schemi di validazione
import {
  getDefaultValues,
  getSchema,
} from "@/schemas/articleUploadValidationSchema";

interface ArticleUploadFormProps {
  tipo: "post" | "serie" | "capitolo";
}

export default function ArticleUploadForm({ tipo }: ArticleUploadFormProps) {
  const [uploading, setUploading] = useState(false);
  const { user } = useUser();
  const userId = user?.id;

  type FormType = z.infer<ReturnType<typeof getSchema>>;

  const formMethods = useForm<FormType>({
    resolver: zodResolver(getSchema(tipo)),
    defaultValues: getDefaultValues(tipo) as any, // Cast temporaneo
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = formMethods;

  // Funzione per gestire l'upload markdown
  const handleMarkdownUpload = async (file: File) => {
    await uploadMarkdownToSupabase(file, userId!, setUploading, (filePath) =>
      setValue("markdownPath", filePath, { shouldValidate: true }),
    );
  };

  // Funzione per gestire l'upload immagine
  const handleImageUpload = async (file: File) => {
    await uploadImageToCloudinary(file, setUploading, (imageUrl) =>
      setValue("coverImage", imageUrl, { shouldValidate: true }),
    );
  };

  // Submit del form
  const onSubmit = async (data: any) => {
    await submitFormData(tipo, data, userId!, setUploading);
  };

  // Verifica delle autorizzazioni
  if (!userId) {
    return <UserNotFoundScreen />;
  }

  if (user.role === "user") {
    return <NonAuthorScreen />;
  }

  // Ottieni titolo appropriato
  const getFormTitle = () => {
    switch (tipo) {
      case "post":
        return "Carica un nuovo articolo";
      case "serie":
        return "Crea una nuova serie";
      case "capitolo":
        return "Aggiungi un nuovo capitolo";
      default:
        return "Carica contenuto";
    }
  };

  // Ottieni testo del pulsante
  const getButtonText = () => {
    if (uploading) return "Caricamento...";

    switch (tipo) {
      case "post":
        return "Pubblica articolo";
      case "serie":
        return "Crea serie e primo capitolo";
      case "capitolo":
        return "Aggiungi capitolo";
      default:
        return "Pubblica";
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div className="border-gradient w-full h-full mt-12 p-[1px] animated-gradient rounded-lg">
        <div className="mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg">
          <h2 className="text-2xl font-bold text-center mb-6 font-title text-gradient animated-gradient">
            {getFormTitle()}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8">
            <div className="lg:flex items-start justify-center gap-8">
              {/* Colonna sinistra - dettagli principali */}
              <div className="lg:w-1/2 space-y-6">
                {/* Serie selector (solo per capitoli) */}
                {tipo === "capitolo" && (
                  <SerieSelector
                    onSerieSelect={(id) =>
                      setValue("serieId", id, { shouldValidate: true })
                    }
                    user={user}
                  />
                )}

                {/* Titolo (non per capitoli) */}
                {tipo !== "capitolo" && (
                  <div>
                    <label className="block text-base font-semibold mb-2">
                      Titolo{tipo === "serie" ? " della serie" : ""}{" "}
                      <span className="text-xs font-light">
                        (Max 39 caratteri)
                      </span>
                    </label>
                    <Input
                      type="text"
                      placeholder={`Inserisci il titolo ${tipo === "serie" ? "della serie" : "dell'articolo"}`}
                      className="w-full p-3 border rounded-md transition border-gray-300 focus:border-green-500 hover:border-green-500"
                      {...register("title")}
                    />
                    {(tipo === "post" || tipo === "serie") &&
                      (errors as any).title && (
                        <p className="text-red-500">
                          {(errors as any).title?.message}
                        </p>
                      )}
                  </div>
                )}

                {/* Titolo del capitolo (per serie e capitoli) */}
                {(tipo === "serie" || tipo === "capitolo") && (
                  <div>
                    <label className="block text-base font-semibold mb-2">
                      Titolo del capitolo{" "}
                      <span className="text-xs font-light">
                        (Max 39 caratteri)
                      </span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Inserisci il titolo del capitolo"
                      className="w-full p-3 border rounded-md transition border-gray-300 focus:border-green-500 hover:border-green-500"
                      {...register("chapterTitle")}
                    />
                    {(tipo === "serie" || tipo === "capitolo") &&
                      (errors as any).chapterTitle && (
                        <p className="text-red-500">
                          {(errors as any).chapterTitle?.message}
                        </p>
                      )}
                  </div>
                )}

                {/* Markdown File Upload */}
                <MarkdownUpload
                  onMarkdownUpload={handleMarkdownUpload}
                  label={
                    tipo === "capitolo"
                      ? "Contenuto del capitolo"
                      : "Contenuto dell'articolo"
                  }
                />

                {/* Image Upload (opzionale per capitoli) */}
                <ImageUpload
                  onImageUpload={handleImageUpload}
                  isOptional={tipo === "capitolo"}
                />
              </div>

              {/* Colonna destra - tags e categorie */}
              {tipo !== "capitolo" && (
                <div className="lg:w-1/2 mt-6 lg:mt-0">
                  <FormTags setValue={setValue as any} watch={watch as any} />
                </div>
              )}
            </div>

            {/* Submit button */}
            <div className="flex justify-center">
              <RainbowButton
                type="submit"
                className="mt-8 mb-4 lg:max-w-[300px]"
                disabled={uploading}
              >
                {getButtonText()}
              </RainbowButton>
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
}
