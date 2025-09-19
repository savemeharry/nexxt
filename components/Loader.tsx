
import React, { useState, useEffect } from 'react';

const messages = [
  "Analyzing market signals...",
  "Consulting industry experts...",
  "Aggregating competitive data...",
  "Synthesizing growth strategies...",
  "Identifying key opportunities...",
  "Compiling strategic insights...",
];

interface LoaderProps {
    message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message: initialMessage }) => {
  const [message, setMessage] = useState(initialMessage || messages[0]);

  useEffect(() => {
    if (initialMessage) {
        setMessage(initialMessage);
        return;
    }

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setMessage(messages[index]);
    }, 2500);
    return () => clearInterval(interval);
  }, [initialMessage]);

  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-neutral-950/80 rockstar:bg-black/80 backdrop-blur-sm z-40 flex flex-col items-center justify-center overflow-hidden animate-fade-scale-in">
       <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.05),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))] rockstar:bg-transparent"></div>

      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
            {/* Central Core */}
            <div className="absolute w-5 h-5 bg-brand-400 rockstar:bg-rockstar-400 rounded-full animate-pulse-fast shadow-[0_0_25px_5px] shadow-brand-500/50 dark:shadow-brand-500/80 rockstar:shadow-rockstar-500/80 opacity-90"></div>

            {/* Orbit 1 */}
            <div className="absolute w-24 h-24 rounded-full border border-brand-500/20 dark:border-brand-500/20 rockstar:border-rockstar-500/20 animate-spin-slow">
                <div className="absolute top-[-3px] left-1/2 -ml-[3px] w-1.5 h-1.5 bg-brand-300 rockstar:bg-rockstar-300 rounded-full shadow-[0_0_10px] shadow-brand-300 rockstar:shadow-rockstar-300"></div>
            </div>

            {/* Orbit 2 */}
            <div className="absolute w-36 h-36 rounded-full border border-brand-600/20 dark:border-brand-600/20 rockstar:border-rockstar-600/20 animate-spin-medium">
                <div className="absolute bottom-[-5px] left-1/2 -ml-[5px] w-2.5 h-2.5 bg-brand-400 rockstar:bg-rockstar-400 rounded-full shadow-[0_0_12px] shadow-brand-400 rockstar:shadow-rockstar-400"></div>
            </div>
            
            {/* Orbit 3 */}
            <div className="absolute w-48 h-48 rounded-full border border-brand-700/20 dark:border-brand-700/20 rockstar:border-rockstar-700/20 animate-spin-slower">
                <div className="absolute top-1/2 -mt-[4px] right-[-4px] w-2 h-2 bg-brand-500 rockstar:bg-rockstar-500 rounded-full shadow-[0_0_15px] shadow-brand-500 rockstar:shadow-rockstar-500"></div>
            </div>
        </div>

        <div key={message} className="animate-fade-scale-in">
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{message}</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">This may take a moment while the AI thinks.</p>
        </div>
      </div>
    </div>
  );
};

export default Loader;