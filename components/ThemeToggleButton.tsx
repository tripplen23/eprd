"use client";

import React from "react";
import useThemeSwitcher from "@/hooks/use-theme-switcher";
import { MoonIcon, SunIcon } from "@/components/ui/theme-icons";

export default function ThemeToggleButton(): JSX.Element {
  const [mode, setMode] = useThemeSwitcher();
  const next = mode === "light" ? "dark" : "light";

  return (
    <button
      aria-label={`Switch to ${next} mode`}
      onClick={() => setMode(next)}
      className="cursor-pointer fixed top-4 right-4 z-50 p-2 rounded-full bg-white text-black hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 shadow-md transition ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
    >
      {mode === "dark" ? (
        <SunIcon className="w-5 h-5 fill-current" />
      ) : (
        <MoonIcon className="w-5 h-5 fill-current" />
      )}
    </button>
  );
}