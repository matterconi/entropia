"use client";

import React, { useRef, useState } from "react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { categories, genres, MenuItem } from "@/data/data";

// Reusable Menu Component
export default function Menu() {
  return (
    <NavigationMenu className="w-full bg-background rounded-md h-full z-50 px-8">
      <NavigationMenuList>
        {/* Chi Siamo */}
        <NavigationMenuItem>
          <NavigationMenuLink className="py-2 font-typo-menu text-single-gradient text-single-gradient-hover cursor-pointer">
            Chi Siamo
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Categorie Dropdown */}
        <DropdownMenu title="Categorie" items={categories} />

        {/* Generi Dropdown */}
        <DropdownMenu title="Generi" items={genres} />

        {/* Contatti */}
        <NavigationMenuItem>
          <NavigationMenuLink className="py-2 font-typo-menu text-single-gradient text-single-gradient-hover cursor-pointer">
            Contatti
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

// DropdownMenu Component

function DropdownMenu({ title, items }: { title: string; items: MenuItem[] }) {
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Store the timer reference

  const handleMouseEnter = (menuTitle: string) => {
    // Clear any existing timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    console.log("Mouse entered:", menuTitle);
    setHoveredMenu(menuTitle); // Set the hovered menu
  };

  const handleMouseLeave = () => {
    // Set a timer to revoke hover state after 200ms
    timerRef.current = setTimeout(() => {
      console.log("Mouse left, clearing hover state");
      setHoveredMenu(null);
      timerRef.current = null; // Reset timer reference
    }, 200);
  };

  const isHovered = (menuTitle: string) => hoveredMenu === menuTitle;

  return (
    <NavigationMenuItem>
      <div
        className="w-full h-full"
        onMouseEnter={() => handleMouseEnter(title)}
        onMouseLeave={handleMouseLeave}
      >
        <NavigationMenuTrigger className="font-typo-menu">
          <p
            className={`py-2 cursor-pointer ${
              isHovered(title)
                ? "text-single-gradient-dropdown"
                : "text-single-gradient"
            }`}
          >
            {title}
          </p>
        </NavigationMenuTrigger>
      </div>
      <NavigationMenuContent>
        <div
          className="border-gradient animated-gradient rounded-md p-[1px]"
          onMouseEnter={() => handleMouseEnter(title)} // Cancel timer if content is hovered
          onMouseLeave={handleMouseLeave} // Set timer if leaving content
        >
          <ul className="grid gap-3 p-4 md:grid-cols-2 w-[598px] bg-background rounded-md ">
            {items.map((item) => (
              <ListItem key={item.title} title={item.title} href={item.href}>
                {item.description}
              </ListItem>
            ))}
          </ul>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

// ListItem Component
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className}`}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
