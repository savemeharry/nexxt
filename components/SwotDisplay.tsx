import React from 'react';
import { FormattedText } from './FormattedText';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { MinusCircleIcon } from './icons/MinusCircleIcon';
import { SunIcon } from './icons/SunIcon';
import { ZapIcon } from './icons/ZapIcon';

interface SwotDisplayProps {
    swotAnalysis: string;
}

const SwotCard: React.FC<{ title: string; content: string; icon: React.ReactNode; borderColor: string }> = ({ title, content, icon, borderColor }) => {
    return (
        <div className={`bg-neutral-50 dark:bg-neutral-800/50 rockstar:bg-neutral-800/50 p-6 rounded-lg border-l-4 ${borderColor}`}>
            <div className="flex items-center text-neutral-800 dark:text-neutral-200 mb-3">
                {icon}
                <h4 className="font-bold text-lg ml-3">{title}</h4>
            </div>
            <div className="prose dark:prose-invert rockstar:prose-rockstar prose-sm max-w-none">
                <FormattedText text={content} />
            </div>
        </div>
    );
};

export const SwotDisplay: React.FC<SwotDisplayProps> = ({ swotAnalysis }) => {
    const parseSwot = (text: string) => {
        const sections = {
            Strengths: '',
            Weaknesses: '',
            Opportunities: '',
            Threats: '',
        } as const;

        const result: Record<keyof typeof sections, string> = {
            Strengths: '',
            Weaknesses: '',
            Opportunities: '',
            Threats: '',
        };

        // Поддержка заголовков с маркдауном: "**Strengths:**", "Strengths -", и т.п.
        const headingRegexes: Record<keyof typeof sections, RegExp> = {
            Strengths: /^\s*[\*_\-]*\s*strengths\s*[:\-–]?\s*/i,
            Weaknesses: /^\s*[\*_\-]*\s*weaknesses\s*[:\-–]?\s*/i,
            Opportunities: /^\s*[\*_\-]*\s*opportunities\s*[:\-–]?\s*/i,
            Threats: /^\s*[\*_\-]*\s*threats\s*[:\-–]?\s*/i,
        };

        const lines = text.split('\n');
        let currentSection: keyof typeof sections | null = null;

        for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line) continue;

            // Проверяем заголовок секции
            let matchedHeading: keyof typeof sections | null = null;
            for (const key of Object.keys(sections) as (keyof typeof sections)[]) {
                if (headingRegexes[key].test(line)) {
                    matchedHeading = key;
                    break;
                }
            }

            if (matchedHeading) {
                currentSection = matchedHeading;
                // Добавим остаток строки после заголовка (если есть)
                const remainder = line.replace(headingRegexes[matchedHeading], '').trim();
                if (remainder) {
                    result[matchedHeading] += remainder + '\n';
                }
                continue;
            }

            if (currentSection) {
                result[currentSection] += line + '\n';
            }
        }

        return result;
    };

    const swot = parseSwot(swotAnalysis);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SwotCard title="Strengths" content={swot.Strengths} icon={<PlusCircleIcon />} borderColor="border-green-500 rockstar:border-green-400" />
            <SwotCard title="Weaknesses" content={swot.Weaknesses} icon={<MinusCircleIcon />} borderColor="border-orange-500 rockstar:border-orange-400" />
            <SwotCard title="Opportunities" content={swot.Opportunities} icon={<SunIcon />} borderColor="border-sky-500 rockstar:border-sky-400" />
            <SwotCard title="Threats" content={swot.Threats} icon={<ZapIcon />} borderColor="border-red-500 rockstar:border-red-400" />
        </div>
    );
};