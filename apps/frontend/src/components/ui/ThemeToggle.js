/**
 * @fileoverview Theme Toggle Button Component
 *
 * A modern, animated theme switcher with Sun/Moon icons
 * Features:
 * - Smooth icon transitions and rotations
 * - Tooltip showing current theme
 * - Simple toggle: Light ↔ Dark
 * - Keyboard accessible
 * - Uses Zustand for state management
 * - Respects localStorage persistence
 */

"use client";

import { useUIStore } from "../../stores/index";
import { Sun } from "lucide-react";
import { Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useUIStore();

  const getThemeLabel = () => {
    return theme === "dark" ? "Dark Mode" : "Light Mode";
  };

  return (
    <div className='relative group'>
      <button
        onClick={toggleTheme}
        className='inline-flex items-center justify-center p-2 text-slate-600 dark:text-slate-400 rounded-lg transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800'
        aria-label={getThemeLabel()}
        title={getThemeLabel()}>
        {theme === "dark" ? (
          /* Sun icon - Light mode */
          <Sun className='w-5 h-5 text-yellow-500 animate-spin-slow' />
        ) : (
          /* Moon icon - Dark mode */
          <Moon className='w-5 h-5 text-gray-800 animate-pulse' />
        )}
      </button>

      {/* Tooltip */}
      <div className='absolute bottom-full mb-2 right-0 px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap'>
        {getThemeLabel()}
        <div className='absolute top-full right-2 w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45' />
      </div>
    </div>
  );
}
