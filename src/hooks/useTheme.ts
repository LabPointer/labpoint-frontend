/*
import { useEffect, useState } from 'react';
import type { Theme } from '@types';

function getStoredTheme(): Theme {
    if (typeof window === 'undefined') return 'light';

    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
}

export default function useTheme() {
    const [theme, setTheme] = useState<Theme>(getStoredTheme);

    useEffect(function() {
        if (typeof window === 'undefined') return;

        const root = window.document.documentElement;
        root.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    function toggleTheme() {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    }

    return { theme, toggleTheme };
}
*/
