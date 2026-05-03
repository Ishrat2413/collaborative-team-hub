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
          <svg
            className='w-5 h-5 text-amber-500 animate-spin-slow'
            fill='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'>
            <path d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' />
          </svg>
        ) : (
          /* Moon icon - Dark mode */
          <svg
            className='w-5 h-5 text-blue-500 animate-spin-slow'
            fill='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'>
            <path d='M20.354 15.354A9 9 0 008.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' />
          </svg>
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
