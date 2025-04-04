import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, placeholder, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-full flex min-h-[56px] grow items-center gap-4 rounded-md bg-transparent appearance-none outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 font-typo-paragraph font-color-paragraph",
          className,
        )}
        ref={ref}
        {...props}
        placeholder={placeholder}
        disabled={props.disabled}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
