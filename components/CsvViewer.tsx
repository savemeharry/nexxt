
import React from 'react';

interface CsvViewerProps {
    content: string; // Base64 encoded CSV data URL
}

const b64_to_utf8 = (str: string): string => {
    try {
        const binary_string = atob(str);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        const decoder = new TextDecoder();
        return decoder.decode(bytes);
    } catch (e) {
        console.error("Error decoding base64 content:", e);
        return "Error: Could not decode content.";
    }
};

const parseCsv = (csvText: string): string[][] => {
    // A simple CSV parser. Doesn't handle complex cases like quotes within fields.
    return csvText.split('\n').map(row => row.split(','));
};

export const CsvViewer: React.FC<CsvViewerProps> = ({ content }) => {
    const base64 = content.split(',')[1] || '';
    const decodedContent = b64_to_utf8(base64);
    const data = parseCsv(decodedContent);

    if (!data || data.length === 0 || data[0].join('').trim() === '') {
        return <p className="text-neutral-500 p-4">Could not display CSV file or file is empty.</p>;
    }

    const headers = data[0];
    const rows = data.slice(1);

    return (
        <div className="p-4 overflow-auto h-full w-full">
            <table className="w-full text-left table-auto min-w-max">
                <thead className="bg-neutral-800/50 sticky top-0">
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index} className="p-3 px-4 font-semibold text-neutral-200 text-sm tracking-wider border-b border-neutral-700">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-neutral-800/40 transition-colors">
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="p-3 px-4 text-neutral-300 align-top text-sm">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
