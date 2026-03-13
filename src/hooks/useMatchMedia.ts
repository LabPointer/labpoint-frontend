import { useEffect, useState } from 'react';

const DESKTOP_QUERY = '(min-width: 1024px)';

function getInitialIsDesktop(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(DESKTOP_QUERY).matches;
}

export default function useMatchMedia() {
    const [isDesktop, setIsDesktop] = useState<boolean>(getInitialIsDesktop);

    useEffect(function() {
        if (typeof window === 'undefined') return;

        const media = window.matchMedia(DESKTOP_QUERY);
        function listener() {
            setIsDesktop(media.matches)
        }

        media.addEventListener('change', listener);
        return function() { media.removeEventListener('change', listener) };
    }, []);

    return { isDesktop };
}
