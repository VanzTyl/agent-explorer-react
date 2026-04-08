import { useTheme } from '../contexts/ThemeContext.tsx';

const THEME_OPTIONS = [
  { id: 'ocean', name: 'Ocean', color1: '#0ea5e9', color2: '#14b8a6' },
  { id: 'sunset', name: 'Sunset', color1: '#f97316', color2: '#a855f7' },
  { id: 'forest', name: 'Forest', color1: '#22c55e', color2: '#10b981' },
] as const;

export default function ThemeSwitcher() {
  const { theme, mode, setTheme, toggleMode } = useTheme();

  return (
    <div className="theme_switcher_container flex items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleMode}
        className="mode_toggle_btn flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle light/dark mode"
      >
        {mode === 'light' ? (
           <svg className="sun_icon w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
           </svg>
        ) : (
          <svg className="moon_icon w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      <div className="vertical_divider w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

      {/* Duotone Swatches */}
      <div className="swatch_group flex items-center gap-2">
        {THEME_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => setTheme(option.id)}
            className={`theme_swatch_btn p-0 relative overflow-hidden w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none flex items-center justify-center ${
              theme === option.id 
                ? 'border-gray-800 dark:border-white scale-110 shadow-md' 
                : 'border-transparent opacity-80 hover:opacity-100'
            }`}
            title={option.name}
            aria-label={`Select ${option.name} theme`}
          >
            {/* SVG Implementation to bypass CSS gradient bugs entirely */}
            <svg viewBox="0 0 100 100" className="w-full h-full rounded-full">
              <rect width="100" height="100" fill={option.color1} />
              <polygon points="100,0 100,100 0,100" fill={option.color2} />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}