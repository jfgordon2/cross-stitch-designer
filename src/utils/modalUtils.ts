import { CSSProperties, useState, useEffect } from 'react';

export const useModalPosition = (isOpen: boolean, buttonRef: React.RefObject<HTMLElement>) => {
    const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
    const [isMobile, setIsMobile] = useState(window.matchMedia('(max-width: 768px)').matches);

    useEffect(() => {
        const updateButtonRect = () => {
            if (buttonRef.current) {
                setButtonRect(buttonRef.current.getBoundingClientRect());
            }
        };

        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const updateIsMobile = (e: MediaQueryListEvent) => setIsMobile(e.matches);

        if (isOpen) {
            updateButtonRect();
            window.addEventListener('scroll', updateButtonRect);
            window.addEventListener('resize', updateButtonRect);
            mediaQuery.addEventListener('change', updateIsMobile);
        }

        return () => {
            window.removeEventListener('scroll', updateButtonRect);
            window.removeEventListener('resize', updateButtonRect);
            mediaQuery.removeEventListener('change', updateIsMobile);
        };
    }, [isOpen, buttonRef]);

    return { buttonRect, isMobile };
};

export const getModalStyle = (
    isMobile: boolean,
    buttonRect: DOMRect | null,
    baseStyle: CSSProperties = {}
): CSSProperties => {
    const defaultBaseStyle: CSSProperties = {
        position: 'fixed',
        zIndex: 9999,
        pointerEvents: 'auto',
    };

    const style = {
        ...defaultBaseStyle,
        ...baseStyle,
    };

    if (isMobile) {
        return {
            ...style,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        };
    }

    if (!buttonRect) return style;

    return {
        ...style,
        top: buttonRect.bottom + window.scrollY + 4,
        left: buttonRect.left + window.scrollX
    };
};