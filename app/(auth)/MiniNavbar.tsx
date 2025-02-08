"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

import ThemeSwitch from "@/components/navigation/ThemeSwitch";

export default function Navbar() {
  return (
    <nav
      className={`relative top-0 flex h-[105px] items-center justify-between w-full px-8 mt-6`}
    >
      {/* Left Section: Brand Name */}
      <div className="sm:px-2 flex items-center space-x-2">
        <Link href="/">
          <h1 className="text-2xl font-bold text-gradient font-title ">
            VERSIA
          </h1>
        </Link>
      </div>
      {/* Theme Toggle */}
      <ThemeSwitch />
    </nav>
  );
}
