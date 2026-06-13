import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../utils/theme';

interface ThemeToggleProps {
    /** Show a text label next to the icon (used in the mobile menu list). */
    withLabel?: boolean;
    className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ withLabel = false, className = '' }) => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`streaker-btn-ghost ${withLabel ? '' : 'p-2'} ${className}`}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-pressed={isDark}
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
            {isDark ? (
                <Sun className="h-5 w-5" aria-hidden="true" />
            ) : (
                <Moon className="h-5 w-5" aria-hidden="true" />
            )}
            {withLabel && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
        </button>
    );
};

export default ThemeToggle;
