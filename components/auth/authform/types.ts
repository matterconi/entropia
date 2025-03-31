import { ReactNode } from "react";
import {
  FieldErrors,
  FieldValues,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form";
import { ZodSchema } from "zod";

import { AuthError } from "@/context/AuthContext";

// Tipo per i dati di registrazione
export type RegistrationData = {
  email: string;
  registrationToken: string;
};

// Props per il componente AuthForm
export interface AuthFormProps<T extends FieldValues> {
  schema: ZodSchema<any>;
  defaultValues: T;
  formType: "SIGN_IN" | "SIGN_UP" | "RESET_PASS";
  setIsRegistered?: (value: boolean) => void;
  setIsResetting?: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
  children?: ReactNode;
  setRegistrationData?: (data: RegistrationData) => void; // Nuovo prop
}

export interface ErrorViewProps {
  error: AuthError;
}

export interface FormFieldProps<T extends FieldValues> {
  fieldName: string;
  register: any;
  errors: any;
  children?: React.ReactNode;
}

// Props per il componente GoogleAccountWarning
export interface GoogleAccountWarningProps<T extends FieldValues> {
  defaultValues: T;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  isSubmitting: boolean;
  onSubmit: (data: T) => Promise<void>;
  buttonText: string;
  formType: "SIGN_IN" | "SIGN_UP";
  onClose?: () => void;
  setSignType?: (type: "SIGN_IN" | "SIGN_UP") => void;
  children?: ReactNode;
}

// Props per il componente ResetPasswordForm
export interface ResetPasswordFormProps<T extends FieldValues> {
  defaultValues: T;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  handleSubmit: UseFormHandleSubmit<T>;
  onSubmitAction: (data: T) => Promise<void>;
  onClose?: () => void;
  resetMailSent: boolean;
  setResetMailSent: React.Dispatch<React.SetStateAction<boolean>>;
  setIsResetting?: React.Dispatch<React.SetStateAction<boolean>>;
  children?: ReactNode;
}
// Props per il componente StandardForm
export interface StandardFormProps<T extends FieldValues> {
  defaultValues: T;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  handleSubmit: UseFormHandleSubmit<T>;
  onSubmitAction: (data: T) => Promise<void>;
  isSubmitting: boolean;
  formType: "SIGN_IN" | "SIGN_UP";
  buttonText: string;
  handleToggleReset: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClose?: () => void;
  setSignType?: (type: "SIGN_IN" | "SIGN_UP") => void;
  children?: ReactNode;
  authError?: AuthError | null;
  clearAuthError?: () => void;
}
