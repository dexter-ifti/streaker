import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = 'streaker-theme';

const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    toggleTheme: () => { },
    setTheme: () => { },
});

const systemPrefersDark = (): boolean =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

const getStoredTheme = (): Theme | null => {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
};

const resolveInitialTheme = (): Theme => {
    // Mirrors the inline boot script in index.html so React's first paint matches.
    const stored = getStoredTheme();
    if (stored) return stored;
    return systemPrefersDark() ? 'dark' : 'light';
};

const applyTheme = (theme: Theme): void => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#161320' : '#feecf5');
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setThemeState] = useState<Theme>(resolveInitialTheme);

    // Keep the DOM in sync whenever the theme changes.
    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const setTheme = useCallback((next: Theme) => {
        localStorage.setItem(STORAGE_KEY, next);
        setThemeState(next);
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState((prev) => {
            const next = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem(STORAGE_KEY, next);
            return next;
        });
    }, []);

    // Track the OS preference for users who never made a manual choice.
    useEffect(() => {
        if (typeof window.matchMedia !== 'function') return;
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (event: MediaQueryListEvent) => {
            if (getStoredTheme() === null) {
                setThemeState(event.matches ? 'dark' : 'light');
            }
        };
        mql.addEventListener('change', handleChange);
        return () => mql.removeEventListener('change', handleChange);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => useContext(ThemeContext);
