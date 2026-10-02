import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeSwitchProps {
  className?: string;
  variant?: 'toggle' | 'pill';
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ className = '', variant = 'pill' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'toggle') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
          isDark
            ? 'bg-slate-800 border-slate-700 focus-visible:ring-offset-slate-900'
            : 'bg-slate-200 border-slate-300 focus-visible:ring-offset-white'
        } ${className}`}
      >
        <span className="sr-only">Toggle theme</span>
        <span
          className={`pointer-events-none flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            isDark ? 'translate-x-6 bg-slate-900 text-amber-400' : 'translate-x-0.5 bg-white text-slate-700'
          }`}
        >
          {isDark ? (
            <Moon className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
          ) : (
            <Sun className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
          )}
        </span>
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-lg border transition-colors ${
        isDark
          ? 'bg-slate-950/70 border-slate-800 text-slate-400'
          : 'bg-slate-200/80 border-slate-300 text-slate-600'
      } ${className}`}
      role="group"
      aria-label="Theme mode switcher"
    >
      <button
        type="button"
        onClick={() => !isDark && toggleTheme()}
        aria-pressed={isDark}
        title="Switch to Dark mode"
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
          isDark
            ? 'bg-slate-800 text-slate-100 shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/60'
        }`}
      >
        <Moon className="w-3.5 h-3.5 text-blue-400" />
        <span className="hidden sm:inline">Dark</span>
      </button>

      <button
        type="button"
        onClick={() => isDark && toggleTheme()}
        aria-pressed={!isDark}
        title="Switch to Light mode"
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
          !isDark
            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
        }`}
      >
        <Sun className="w-3.5 h-3.5 text-amber-500" />
        <span className="hidden sm:inline">Light</span>
      </button>
    </div>
  );
};
