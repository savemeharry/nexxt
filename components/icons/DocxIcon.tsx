
import React from 'react';

interface IconProps {
    className?: string;
}

export const DocxIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
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
        <path d="M12 18v-7.5a2.5 2.5 0 0 1 2.5-2.5h0A2.5 2.5 0 0 1 17 10.5V18"></path>
        <path d="M17 15h-2.5"></path>
        <path d="M7 15h2"></path>
        <path d="M9 12h-1a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1"></path>
    </svg>
);
