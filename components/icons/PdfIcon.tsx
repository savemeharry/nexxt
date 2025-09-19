
import React from 'react';

interface IconProps {
    className?: string;
}

export const PdfIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <path d="M10 12h1"></path>
        <path d="M13 12h1"></path>
        <path d="M10 15.5c.828 0 1.5.672 1.5 1.5v0c0 .828-.672 1.5-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5v-1A1.5 1.5 0 0 1 8.5 14h0"></path>
        <path d="M14 18.5c.828 0 1.5-.672 1.5-1.5v-4c0-.828-.672-1.5-1.5-1.5h-1"></path>
    </svg>
);
