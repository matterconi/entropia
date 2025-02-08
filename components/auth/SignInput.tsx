import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, placeholder, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-full flex min-h-[46px] grow items-center gap-4 rounded-md bg-transparent appearance-none outline-none",
          "focus:outline-none focus:ring-0 focus-visible:ring-0",
          "transition-none",
          "autofill:!bg-transparent autofill:!text-foreground text-base", // Evita lo stile dell'autocomplete
          className,
        )}
        ref={ref}
        {...props}
        placeholder={placeholder}
        // Opzionale, disattiva suggerimenti del browser
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
