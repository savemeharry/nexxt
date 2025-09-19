import React from 'react';

interface FormattedTextProps {
  text: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text }) => {
  const createMarkup = (inputText: string) => {
    // Split the input text into blocks based on one or more empty lines.
    const blocks = inputText.split(/\n\s*\n/).filter(block => block.trim() !== '');

    const html = blocks.map(block => {
      // Process bold markdown within the block.
      let processedBlock = block.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      const lines = processedBlock.split('\n');
      
      let blockHtml = '';
      let listHtml = '';
      let currentListType = ''; // 'ul' or 'ol'

      const flushList = () => {
        if (listHtml) {
          blockHtml += `<${currentListType}>${listHtml}</${currentListType}>`;
          listHtml = '';
          currentListType = '';
        }
      };

      for (const line of lines) {
        const trimmedLine = line.trim();
        const isOl = /^\d+\.\s/.test(trimmedLine);
        const isUl = trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ');

        if (isUl || isOl) {
          const listType = isUl ? 'ul' : 'ol';
          // If we are starting a new list of a different type, flush the old one
          if (currentListType && currentListType !== listType) {
            flushList();
          }
          currentListType = listType;

          const itemContent = isOl 
            ? trimmedLine.replace(/^\d+\.\s/, '') 
            : trimmedLine.substring(2);
          listHtml += `<li>${itemContent}</li>`;

        } else {
          // This is not a list item, so flush any existing list
          flushList();
          if (trimmedLine.length > 0) {
            // Treat non-list lines as paragraphs
            blockHtml += `<p>${line}</p>`;
          }
        }
      }

      // Flush any remaining list at the end of the block
      flushList();

      return blockHtml;
    }).join('');

    return { __html: html };
  };

  return <div dangerouslySetInnerHTML={createMarkup(text)} />;
};
