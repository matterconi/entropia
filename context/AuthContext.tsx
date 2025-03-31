"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useMediaQuery } from "react-responsive";

// Tutti i possibili tipi di errore
export type ErrorType =
  | "GENERAL"
  | "INVALID_CREDENTIALS"
  | "EMAIL_EXISTS"
  | "USER_NOT_FOUND"
  | "GOOGLE_ACCOUNT"
  | "SERVER_ERROR"
  | "VERIFICATION_EXPIRED"
  | "VALIDATION_ERROR"
  | "UNVERIFIED_ACCOUNT"
  | "GOOGLE_ACCOUNT_EXISTS"
  | "EMAIL_ALREADY_EXISTS"
  | null;

// Interfaccia per l'oggetto errore
export interface AuthError {
  type: ErrorType;
  message: string;
  email?: string;
  shouldChangeSignType?: boolean;
}

// Alias per retrocompatibilità
export type AuthErrorInfo = AuthError;

// Tipo per il sign (case-sensitive)
export type SignType = "signIn" | "signUp";

// Tipo per il form (maiuscolo)
export type FormType = "SIGN_IN" | "SIGN_UP" | "RESET_PASS";

// Interfaccia combinata per il context unificato
interface AuthContextType {
  // Proprietà e metodi del SignModal
  isOpen: boolean;
  signType: SignType | null;
  setSignType: (type: SignType | "SIGN_IN" | "SIGN_UP" | null) => void;
  openModal: (type: SignType | "SIGN_IN" | "SIGN_UP") => void;
  closeModal: () => void;

  // Proprietà e metodi dell'AuthError
  error: AuthError | null;
  setError: (error: AuthError | null) => void;
  clearError: () => void;

  message: string | null;
  setMessage: (message: string | null) => void;
  clearMessage: () => void;

  // Helpers per conversione formato
  convertFormTypeToSignType: (formType: FormType) => SignType;
  convertSignTypeToFormType: (signType: SignType) => FormType;
}

// Creazione del context unificato
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Stati dal SignModalContext
  const [isOpen, setIsOpen] = useState(false);
  const [signType, setSignTypeState] = useState<SignType | null>(null);

  // Stati dal AuthErrorContext
  const [error, setErrorState] = useState<AuthError | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  // Hooks di Next.js
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Custom logic: Check if the screen is large (1024px or more)
  const isLargeScreen = useMediaQuery({ query: "(min-width: 1024px)" });

  // Helper per conversione formato
  const convertFormTypeToSignType = (formType: FormType): SignType => {
    if (formType === "SIGN_IN") return "signIn";
    if (formType === "SIGN_UP") return "signUp";
    return "signIn"; // Default fallback
  };

  const convertSignTypeToFormType = (signType: SignType): FormType => {
    if (signType === "signIn") return "SIGN_IN";
    if (signType === "signUp") return "SIGN_UP";
    return "SIGN_IN"; // Default fallback
  };

  // Wrapper per setSignType che gestisce casi maiuscoli/minuscoli e routing
  const setSignType = (type: SignType | "SIGN_IN" | "SIGN_UP" | null) => {
    if (type === null) {
      setSignTypeState(null);
      return;
    }

    // Normalizza il tipo per gestire sia camelCase che UPPERCASE
    let normalizedType: SignType;
    if (type === "SIGN_IN") {
      normalizedType = "signIn";
    } else if (type === "SIGN_UP") {
      normalizedType = "signUp";
    } else {
      normalizedType = type;
    }

    // Imposta il nuovo tipo di sign
    setSignTypeState(normalizedType);

    // Se non siamo su schermo largo, cambia la route
    if (!isLargeScreen) {
      const newRoute = normalizedType === "signIn" ? "/sign-in" : "/sign-up";

      // Cambia route solo se non siamo già sulla route corretta
      if (pathname !== newRoute) {
        router.push(newRoute);
      }
    }
  };

  useEffect(() => {
    // Se esiste un messaggio e cambia la route, puliscilo
    if (message) {
      console.log(
        `Route changed to: ${pathname}, clearing message: "${message}"`,
      );
      clearError();
      clearMessage();
    }
  }, [message, pathname]);

  // Gestione del body overflow
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto"; // Ripristina lo scroll quando il componente si smonta
    };
  }, [isOpen]);

  // Log dei cambiamenti di signType
  useEffect(() => {
    if (signType) {
      console.log(`Sign type changed to: ${signType}`);
    }
  }, [signType]);

  // FUNZIONI DEL SIGN MODAL
  const openModal = (type: SignType | "SIGN_IN" | "SIGN_UP") => {
    // Pulisci eventuali errori precedenti quando apri il modal
    clearError();

    // Normalizza il tipo per gestire sia camelCase che UPPERCASE
    const normalizedType: SignType =
      type === "SIGN_IN"
        ? "signIn"
        : type === "SIGN_UP"
          ? "signUp"
          : (type as SignType);

    if (isLargeScreen) {
      // Per schermi grandi, apri il modal
      setSignType(normalizedType);
      setIsOpen(true);
    } else {
      // Per schermi piccoli, naviga verso la route dedicata
      router.push(`/${normalizedType === "signIn" ? "sign-in" : "sign-up"}`);
    }
  };

  const closeModal = () => {
    // Pulisci eventuali errori quando chiudi il modal
    clearError();
    clearMessage();
    setIsOpen(false);
    setSignType(null);
  };

  // FUNZIONI DELL'AUTH ERROR
  // Funzione per impostare un errore
  const setError = (newError: AuthError | null) => {
    console.log("Setting auth error:", newError);
    setErrorState(newError);
  };

  // Funzione per pulire gli errori
  const clearError = () => {
    console.log("Clearing auth error");
    setErrorState(null);
  };

  const clearMessage = () => {
    console.log("clearing message");
    setMessage(null);
  };

  // Valore del context unificato
  const contextValue: AuthContextType = {
    // Valori e funzioni del SignModal
    isOpen,
    signType,
    setSignType,
    openModal,
    closeModal,

    // Valori e funzioni dell'AuthError
    error,
    setError,
    clearError,
    message,
    setMessage,
    clearMessage,

    // Helpers di conversione formato
    convertFormTypeToSignType,
    convertSignTypeToFormType,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Hook unificato per utilizzare il context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Hook per retrocompatibilità con useSignModal
export const useSignModal = () => {
  const { isOpen, signType, setSignType, openModal, closeModal } = useAuth();
  return { isOpen, signType, setSignType, openModal, closeModal };
};

// Hook per retrocompatibilità con useAuthError
export const useAuthError = () => {
  const { error, setError, message, setMessage, clearMessage, clearError } =
    useAuth();
  return { error, setError, clearError, message, setMessage, clearMessage };
};
