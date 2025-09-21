import React from 'react';
import { ImageSuggestion } from '../types';

interface ImageGalleryProps {
    suggestions: ImageSuggestion[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ suggestions }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {suggestions.map((suggestion, index) => (
                <div 
                    key={index} 
                    className="relative aspect-video bg-neutral-800 rounded-lg overflow-hidden group"
                >
                    <img 
                        src={`https://picsum.photos/seed/${encodeURIComponent(suggestion.query)}/800/600?grayscale&blur=1`} 
                        alt={suggestion.caption}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute inset-0 flex items-end p-4">
                        <p className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                            {suggestion.caption}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};