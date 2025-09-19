import React, { useState } from 'react';
import { Flashcard } from '../types';

interface FlashcardComponentProps {
  card: Flashcard;
  delay: number;
}

const FlashcardComponent: React.FC<FlashcardComponentProps> = ({ card, delay }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="group perspective-1000 opacity-0 animate-fade-scale-in"
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative w-full aspect-[3/2] rounded-xl shadow-lg cursor-pointer transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front */}
        <div className="absolute w-full h-full bg-neutral-800/80 border border-neutral-700/50 rounded-xl p-6 flex flex-col justify-center items-center text-center backface-hidden">
          <p className="text-lg font-semibold text-neutral-100">{card.question}</p>
        </div>
        {/* Back */}
        <div className="absolute w-full h-full bg-brand-800/60 border border-brand-700/50 rounded-xl p-6 flex flex-col justify-center items-center text-center rotate-y-180 backface-hidden overflow-y-auto">
          <p className="text-neutral-100">{card.answer}</p>
        </div>
      </div>
    </div>
  );
};


export const FlashcardsView: React.FC<{ flashcards: Flashcard[] }> = ({ flashcards }) => {
  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="text-center py-10 text-neutral-500 animate-fade-scale-in">
        No flashcards were generated for this topic.
      </div>
    );
  }

  // CSS for 3D transform utilities
  const transformStyles = `
    .perspective-1000 { perspective: 1000px; }
    .preserve-3d { transform-style: preserve-3d; }
    .rotate-y-180 { transform: rotateY(180deg); }
    .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
  `;

  return (
    <div className="animate-fade-scale-in">
        <style>{transformStyles}</style>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcards.map((card, index) => (
                <FlashcardComponent key={index} card={card} delay={index * 50} />
            ))}
        </div>
    </div>
  );
};