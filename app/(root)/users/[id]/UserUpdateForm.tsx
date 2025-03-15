"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  BookOpen,
  Camera,
  Pen,
  Save,
  User,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import LocalSearch from "@/app/(root)/users/[id]/Input";
import UserNotVerifiedModal from "@/components/auth/UserNotVerifiedModal";
import TipTap from "@/components/editor/TipTap";
import { Button } from "@/components/ui/button";
import { Form, FormLabel, FormMessage } from "@/components/ui/form";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { ShinyButton } from "@/components/ui/shiny-button";
import { useUser } from "@/context/UserContext";
import useAuthModal from "@/hooks/useAuthModal";

// Definire lo schema del form
const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username deve essere almeno di 3 caratteri",
  }),
  bio: z
    .string()
    .max(200, {
      message: "La bio non può superare i 200 caratteri",
    })
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileForm({ onClose }: { onClose: () => void }) {
  const { user, loading, setUser } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Utilizziamo useAuthModal con true per mostrare il modale immediatamente
  // se l'utente non è autenticato o verificato
  const {
    isModalOpen,
    setIsModalOpen,
    closeModal,
    checkUserCanPerformAction,
    isUserLoggedIn,
    isUserVerified,
    user: modalUser,
  } = useAuthModal();

  // Genera l'avatar attuale se esiste l'utente
  const emailSeed = user?.email?.split("@")[0] || "";
  const currentAvatarUrl = `https://api.dicebear.com/5.x/adventurer/svg?seed=${emailSeed}`;

  // State per il titolo della pagina
  const [pageTitle, setPageTitle] = useState<React.ReactNode>(
    <h2 className="text-2xl font-semibold mb-12 flex items-center gap-2 text-center justify-center md:text-right md:justify-end">
      <Pen size={20} />
      Modifica Profilo
    </h2>,
  );

  // Aggiorna il titolo della pagina quando lo stato di verifica cambia
  useEffect(() => {
    if (!isUserVerified) {
      setPageTitle(
        <h2 className="text-2xl font-semibold mb-12 flex items-center gap-2 text-center justify-center">
          <AlertTriangle size={20} className="text-red-500" />
          Modifica Profilo
        </h2>,
      );
    } else {
      setPageTitle(
        <h2 className="text-2xl font-semibold mb-12 flex items-center gap-2 text-center justify-center md:text-right md:justify-end">
          <Pen size={20} />
          Modifica Profilo
        </h2>,
      );
    }
  }, [isUserVerified]);

  // Initialize react-hook-form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      bio: user?.bio || "",
    },
    mode: "onChange",
  });

  // Configura React Dropzone
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Prima verifichiamo se l'utente può eseguire questa azione
      if (!checkUserCanPerformAction()) {
        return;
      }

      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        // Crea un'anteprima dell'immagine
        const objectUrl = URL.createObjectURL(file);
        setPreviewImage(objectUrl);
        setProfileImage(file);
        setFormChanged(true);

        // Cleanup function per l'URL dell'oggetto
        return () => URL.revokeObjectURL(objectUrl);
      }
    },
    [checkUserCanPerformAction],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/gif": [],
      "image/svg+xml": [],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB max
  });

  // Aggiorna i valori predefiniti del form quando i dati dell'utente vengono caricati
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username || "",
        bio: user.bio || "",
      });
    }
  }, [user, form]);

  // Rileva i cambiamenti del form e verifica l'autenticazione
  useEffect(() => {
    const subscription = form.watch((values, { name, type }) => {
      // Verifica l'autenticazione quando l'utente modifica il form
      if (type === "change" && !checkUserCanPerformAction()) {
        // Se l'utente non è autenticato o verificato, il modale verrà mostrato
        // tramite checkUserCanPerformAction
        return;
      }

      if (!loading && user) {
        const formValues = form.getValues();
        const hasChanged =
          formValues.username !== user.username ||
          formValues.bio !== user.bio ||
          profileImage !== null;

        setFormChanged(hasChanged);
      }
    });

    return () => subscription.unsubscribe();
  }, [
    form,
    form.watch,
    user,
    loading,
    profileImage,
    checkUserCanPerformAction,
  ]);

  // Gestisce l'invio del form
  const onSubmit = async (values: ProfileFormValues) => {
    // Verifica se l'utente può eseguire questa azione
    if (!checkUserCanPerformAction() || !user) return;

    setIsSaving(true);

    try {
      // Preparazione dei dati per il form
      const formData = new FormData();

      // Aggiungi i campi modificati
      if (values.username !== user.username) {
        formData.append("username", values.username);
      }

      if (values.bio !== user.bio) {
        formData.append("bio", values.bio || "");
      }

      // Aggiungi l'immagine se presente
      if (profileImage) {
        formData.append("profileImage", profileImage);

        // Se l'utente aveva già un'immagine del profilo, aggiungi il suo URL per permettere
        // al backend di eliminarla da Cloudinary
        if (user.profileImg) {
          formData.append("oldProfileImg", user.profileImg);
        }
      }

      // Se non ci sono modifiche, esci
      if ([...formData.entries()].length === 0) {
        setIsSaving(false);
        return;
      }

      // Chiamata API per aggiornare il profilo
      const res = await fetch(`/api/users/${user.id}/update-profile`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Impossibile aggiornare il profilo");
      }

      const { user: updatedUser } = await res.json();

      // Aggiorna l'utente nel contesto
      setUser((prevUser) => {
        if (!prevUser) return null;

        return {
          ...prevUser,
          username: updatedUser.username || prevUser.username,
          bio: updatedUser.bio || prevUser.bio,
          profileImg: updatedUser.profileImg || prevUser.profileImg,
        };
      });

      setFormChanged(false);
      setProfileImage(null);
      alert("Profilo aggiornato con successo!");

      // Torna alla visualizzazione del profilo
      if (onClose) onClose();
    } catch (error: any) {
      console.error("Errore durante l'aggiornamento del profilo:", error);
      alert(error.message || "Impossibile aggiornare il profilo");
    } finally {
      setIsSaving(false);
    }
  };

  // Modifica sicura di un campo che verifica l'autenticazione prima
  const handleFieldChange = (onChange: any) => (event: any) => {
    if (checkUserCanPerformAction()) {
      onChange(event);
    }
  };

  if (loading) return <p className="text-center">Caricamento form...</p>;
  if (!user) return null;

  return (
    <>
      {/* Titolo dinamico */}
      {pageTitle}

      {/* Modale di autenticazione */}
      {isModalOpen && (
        <UserNotVerifiedModal
          isOpen={isModalOpen}
          onClose={closeModal}
          isLogged={isUserLoggedIn}
          user={modalUser}
        />
      )}

      {/* Avviso di verifica necessaria */}
      {!isUserVerified && (
        <div className="w-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 flex items-center gap-3 min-h-0">
          <div className="rounded-full bg-red-100 dark:bg-red-900/50 p-2 flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              Devi essere verificato per modificare il profilo
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Per verificare il tuo account, controlla la tua email e segui le
              istruzioni inviate.
            </p>
          </div>
        </div>
      )}

      {/* Form Principale con tutti i campi */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-full"
        >
          <div className="flex flex-col md:flex-row gap-6 mt-6 items-center justify-center h-full">
            {/* Sezione Avatar (ora dentro il form) */}
            <div className="md:w-1/3 w-full self-stretch bg-background rounded-lg">
              <div className="bg-background rounded-lg shadow-md flex flex-col items-center justify-center p-4 h-full">
                <h3 className="text-lg font-semibold mb-4 text-center">
                  Immagine Profilo
                </h3>

                <div
                  {...getRootProps()}
                  className="relative cursor-pointer group flex flex-col items-center"
                >
                  <input {...getInputProps()} disabled={!isUserVerified} />
                  <div
                    className="relative"
                    onClick={
                      !isUserVerified ? () => setIsModalOpen(true) : undefined
                    }
                  >
                    <div className="rounded-full size-40 overflow-hidden border-4 border-primary/20 shadow-xl mx-auto">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Avatar anteprima"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={user.profileImg || currentAvatarUrl}
                          alt={`${user.username} avatar`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera size={24} className="text-white" />
                    </div>
                  </div>
                  <p
                    className="mt-3 text-sm text-muted-foreground text-center"
                    onClick={
                      !isUserVerified ? () => setIsModalOpen(true) : undefined
                    }
                  >
                    {isDragActive
                      ? "Rilascia l'immagine qui"
                      : "Clicca o trascina un'immagine qui"}
                  </p>
                  <p
                    className="text-xs text-muted-foreground text-center mt-1"
                    onClick={
                      !isUserVerified ? () => setIsModalOpen(true) : undefined
                    }
                  >
                    Formati supportati: JPG, PNG, GIF, SVG (max 5MB)
                  </p>
                  {profileImage && (
                    <p className="text-xs text-green-600 mt-2">
                      ✓ Immagine selezionata
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sezione Campi testo (username e bio) */}
            <div className="md:w-2/3 w-full">
              {/* Username Field */}
              <div className="bg-slate-100 dark:bg-slate-900 mb-12">
                <FormLabel className="text-lg font-semibold flex items-center gap-2 mb-2">
                  <User size={18} />
                  Username
                </FormLabel>
                <Controller
                  name="username"
                  control={form.control}
                  defaultValue={user?.username || ""}
                  render={({ field }) => (
                    <div>
                      <div className="relative">
                        <LocalSearch
                          placeholder="Inserisci username..."
                          value={field.value}
                          onChange={handleFieldChange(field.onChange)}
                          name={field.name}
                          required
                          disabled={!isUserVerified}
                        />
                        {/* Overlay per bloccare input se l'utente non è verificato */}
                        {!isUserVerified && (
                          <div
                            className="absolute inset-0 bg-background/50 cursor-not-allowed z-10"
                            onClick={() => {
                              // Invece di preventDefault, chiama direttamente il modale
                              setIsModalOpen(true);
                            }}
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <FormMessage />
                    </div>
                  )}
                />
              </div>

              {/* Bio Field */}
              <div className="bg-slate-100 dark:bg-slate-900">
                <FormLabel className="text-lg font-semibold flex items-center gap-2 mb-2">
                  <BookOpen size={18} />
                  {user.bio ? "Bio" : "Aggiungi Bio"}
                </FormLabel>
                <div>
                  <Controller
                    name="bio"
                    control={form.control}
                    defaultValue={user?.bio || ""}
                    render={({ field }) => (
                      <div className="w-full h-full border-gradient p-[1px] rounded-lg relative">
                        <div className="bg-background rounded-lg">
                          <div className="">
                            <TipTap
                              value={field.value}
                              onChange={(value: string) => {
                                if (checkUserCanPerformAction()) {
                                  field.onChange(value);
                                }
                              }}
                              defaultValue={user?.bio || ""}
                              editorType="bio"
                              readOnly={!isUserVerified}
                              isClear={false}
                            />
                            {/* Overlay per bloccare input se l'utente non è verificato */}
                            {!isUserVerified && (
                              <div
                                className="absolute inset-0 bg-background/50 cursor-not-allowed z-10 rounded-lg"
                                onClick={() => {
                                  // Usa direttamente setIsModalOpen invece di checkUserCanPerformAction
                                  setIsModalOpen(true);
                                }}
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 p-2">
                            {field.value?.length || 0}/200 caratteri
                          </p>
                          <FormMessage />
                        </div>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="pb-12">
            <div className="flex flex-col sm:flex-row gap-4 mt-16 h-12 items-center justify-center">
              <RainbowButton
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg flex items-center justify-center gap-2 w-fit h-full min-w-[250px]"
              >
                <X size={18} className="text-red-500" />
                Annulla
              </RainbowButton>

              <div className="h-full border-gradient rounded-lg p-[1px] animated-gradient">
                <div className="h-full bg-background rounded-lg">
                  <ShinyButton
                    className="p-0 bg-background flex items-center justify-center gap-2 w-fit rounded-lg font-semibold h-full min-w-[250px]"
                    disabled={isSaving || !formChanged}
                  >
                    <Save size={18} className="mr-2 text-green-500" />
                    {isSaving ? "Salvando..." : "Salva Modifiche"}
                  </ShinyButton>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
}
