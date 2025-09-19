import React from 'react';

// FIX: Add props to allow className to be passed to the component.
interface ChevronRightIconProps {
    className?: string;
}

export const ChevronRightIcon: React.FC<ChevronRightIconProps> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className ?? "h-5 w-5 text-neutral-600 group-hover:text-neutral-200 transition-colors ml-4 shrink-0"}
    >
        <path d="m9 18 6-6-6-6"></path>
    </svg>
);
