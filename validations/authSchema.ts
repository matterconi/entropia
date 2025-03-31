import { z } from "zod";

export const SignUpSchema = z
  .object({
    email: z.string().email("Indirizzo email non valido"),
    "conferma email": z.string().email("Indirizzo email non valido"),
    password: z
      .string()
      .min(6, "La password deve contenere almeno 6 caratteri")
      .regex(/[0-9]/, "La password deve contenere almeno un numero")
      .regex(/[A-Z]/, "La password deve contenere almeno una lettera maiuscola")
      .regex(
        /[^a-zA-Z0-9]/,
        "La password deve contenere almeno un carattere speciale",
      ),
  })
  .refine((data) => data.email === data["conferma email"], {
    message: "Gli indirizzi email non corrispondono",
    path: ["conferma email"],
  })
  .refine((data) => !data.password.includes(data.email), {
    message: "La password non può contenere l'indirizzo email",
    path: ["password"],
  });

export const SignInSchema = z.object({
  email: z.string().email("Indirizzo email non valido"),
  password: z.string().min(6, "La password deve contenere almeno 6 caratteri"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Indirizzo email non valido"),
});

// ✅ Esporta due tipi distinti
export type SignUpSchemaType = z.infer<typeof SignUpSchema>;
export type SignInSchemaType = z.infer<typeof SignInSchema>;
export type ForgotPasswordSchemaType = z.infer<typeof ForgotPasswordSchema>;
