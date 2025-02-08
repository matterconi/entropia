import React from "react";

export interface SecondaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode; // Icon component passed as a prop
  isDarkMode?: boolean; // Prop to determine dark or light mode
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  className,
  icon,
  isDarkMode = false,
  ...props
}) => {
  return (
    <button
      className={`h-11 px-8 py-2 focus-visible:ring-ring animated-gradient inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-gradient-to-r from-gray-700 to-gray-700 bg-clip-text font-sans text-lg font-medium text-transparent transition-all duration-300 hover:from-cyan-400 hover:via-pink-500 hover:to-yellow-400 focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 dark:from-gray-300 dark:to-gray-300 dark:hover:from-cyan-400 dark:hover:via-pink-500 dark:hover:to-yellow-400 ${className} ${
        isDarkMode ? "dark" : ""
      }`}
      {...props}
    >
      {children}
    </button>
  );
};
