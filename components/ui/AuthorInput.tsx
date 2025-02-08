import Image from "next/image";
import * as React from "react";

import { cn } from "@/lib/utils";

const AuthorInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type = "text", ...props }, ref) => {
  return (
    <div
      className={cn(
        "relative w-full flex items-center rounded-lg border-gradient p-[1px] mb-4",
        className,
      )}
    >
      {/* Icona di ricerca */}
      <div className="absolute left-3 flex items-center">
        <Image src="/icons/search.svg" alt="Search" width={18} height={18} />
      </div>

      {/* Input */}
      <input
        type={type}
        className="w-full min-h-[36px] pl-10 pr-4 bg-background appearance-none outline-none focus:ring-0 focus-visible:ring-0 text-foreground text-sm rounded-lg"
        ref={ref}
        {...props}
      />
    </div>
  );
});

AuthorInput.displayName = "AuthorInput";

export { AuthorInput };
