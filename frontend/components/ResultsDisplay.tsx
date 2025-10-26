
import React from 'react';

interface ResultsDisplayProps {
  results: string;
  isLoading: boolean;
  error: string | null;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-msf-accent"></div>
      <p className="text-msf-secondary">Finding best counters...</p>
    </div>
);

// A more robust markdown-to-HTML renderer for neatly displaying results.
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const elements = text.split('\n').map((line, index) => {
    // Handle horizontal rule for separating counters
    if (line.trim() === '---') {
        return <hr key={index} className="my-6 border-msf-primary" />;
    }

    // Handle main headers like **Placeholder Counter 1**
    if (line.startsWith('**') && line.endsWith('**')) {
      return <h3 key={index} className="text-xl font-bold mt-4 mb-2 text-msf-accent">{line.substring(2, line.length - 2)}</h3>;
    }

    // Handle sub-sections like *Team:* ...
    if (line.startsWith('*') && line.includes('*:')) {
        const parts = line.split(/:(.*)/s); // Split on the first colon
        const boldPart = parts[0].substring(1); // remove the starting '*'
        const rest = parts[1];
        return (
            <p key={index} className="mb-2">
                <strong className="font-semibold text-msf-text">{boldPart}:</strong>
                <span className="text-msf-text-dark">{rest}</span>
            </p>
        );
    }
    
    // Handle empty lines for spacing
    if (line.trim() === '') {
      return null;
    }

    // Default paragraph for strategy and risks
    return <p key={index} className="mb-2 text-msf-text-dark">{line}</p>;
  });

  return <>{elements}</>;
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isLoading, error }) => {
  return (
    <div className="w-full mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center text-msf-text">Recommended Counters</h2>
      <div className="bg-msf-surface p-6 rounded-lg min-h-[200px] shadow-lg">
        {isLoading && <LoadingSpinner />}
        {error && <p className="text-red-400 text-center">{error}</p>}
        {!isLoading && !error && results && <SimpleMarkdown text={results} />}
        {!isLoading && !error && !results && <p className="text-msf-secondary text-center">Results will be displayed here.</p>}
      </div>
    </div>
  );
};
