import React, { useEffect, useState } from "react";
import { FieldValues, Path } from "react-hook-form";

import { Input } from "@/components/auth/SignInput";

import { FormFieldProps } from "./types";

function FormField<T extends FieldValues>({
  fieldName,
  register,
  errors,
  showErrorMessage = false, // Nuovo prop con default a false
}: FormFieldProps<T> & { showErrorMessage?: boolean }) {
  // Stato per tenere traccia dell'errore con debounce
  const [debouncedError, setDebouncedError] = useState<string | null>(null);

  // Controlla se c'è un errore per questo campo
  const currentError = errors[fieldName as Path<T>]?.message as
    | string
    | undefined;

  useEffect(() => {
    // Se non c'è errore o l'errore è stato risolto, elimina immediatamente
    if (!currentError) {
      setDebouncedError(null);
      return;
    }

    // Se c'è un nuovo errore, applica debounce prima di mostrarlo
    const debounceTimer = setTimeout(() => {
      setDebouncedError(currentError);
    }, 800); // 800ms di debounce

    // Pulisci il timer se l'input cambia prima che scada il debounce
    return () => clearTimeout(debounceTimer);
  }, [currentError]);

  return (
    <div key={fieldName} className="flex flex-col gap-2 relative">
      <label className="absolute -top-3 left-4 bg-background px-2 text-sm font-semibold text-foreground">
        {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
      </label>
      <div className="w-full h-full border-gradient p-[1px] animated-gradient rounded-lg">
        <Input
          {...register(fieldName as Path<T>)}
          type={fieldName === "password" ? "password" : "text"}
          placeholder={
            fieldName === "password"
              ? "V3rs14!3xmpl"
              : fieldName === "email"
                ? "versia@example.com"
                : "Versia"
          }
          className={`bg-background w-full h-full p-2 rounded-lg transition ${
            debouncedError ? "border-red-500" : ""
          }`}
        />
      </div>
      {/* Mostra il messaggio di errore solo se showErrorMessage è true e abbiamo un errore dopo il debounce */}
      {showErrorMessage && debouncedError && (
        <p className="text-red-500 text-sm">{debouncedError}</p>
      )}
    </div>
  );
}

export default FormField;
