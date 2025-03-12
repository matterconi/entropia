"use client";

import { Input } from "@/components/ui/input";
import { RainbowInput } from "@/components/ui/rainbow-input";
import React, { forwardRef } from "react";

interface LocalSearchProps {
  route?: string;
  imgSrc?: string;
  placeholder: string;
  otherClasses?: string;
  isSearch?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  required?: boolean;
}

const LocalSearch = forwardRef<HTMLInputElement, LocalSearchProps>(
  ({ placeholder, otherClasses = "", value, onChange, name, required = false, ...props }, ref) => {
    return (
      <div className="relative w-full max-w-3xl">
        <div className="relative z-40 border-gradient animated-gradient p-[1px] rounded-md">
          <RainbowInput className="w-full flex h-[54px] grow flex-1 items-center gap-4 rounded-md px-4 bg-background hover:!bg-background focus:!bg-background" type="button">
            <Input
              ref={ref}
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              name={name}
              required={required}
              className={`h-fit no-focus w-full rounded-md border-none shadow-none outline-none focus:outline-none focus-visible:outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${otherClasses}`}
              {...props}
            />
          </RainbowInput>
        </div>
      </div>
    );
  }
);

// Add display name for React DevTools
LocalSearch.displayName = "LocalSearch";

export default LocalSearch;