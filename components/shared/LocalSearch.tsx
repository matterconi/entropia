"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";

interface LocalSearchProps {
  route: string;
  imgSrc: string;
  placeholder: string;
  otherClasses?: string;
}

const LocalSearch = ({
  route,
  imgSrc,
  placeholder,
  otherClasses,
}: LocalSearchProps) => {
  const { theme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("query", searchQuery);
        router.push(`${route}?${params.toString()}`, { scroll: false });
      } else if (pathname === route) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("query");
        router.push(`${route}?${params.toString()}`, { scroll: false });
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, router, route, searchParams, pathname]);

  return (
    <div
      className={`flex min-h-[56px] grow items-center gap-4 rounded-md bg-slate-100 px-4 dark:bg-slate-900 ${otherClasses}`}
    >
      <Image
        src={imgSrc}
        width={24}
        height={24}
        alt="Search"
        className="cursor-pointer"
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={`no-focus w-full rounded-md border-none shadow-none outline-none`}
      />
    </div>
  );
};

export default LocalSearch;
