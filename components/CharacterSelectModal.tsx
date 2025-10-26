
import React, { useState, useMemo } from 'react';
import { ALL_CHARACTERS } from '../constants';

interface CharacterSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCharacter: (name: string) => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({ isOpen, onClose, onSelectCharacter }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCharacters = useMemo(() => {
    if (!searchTerm) {
      return ALL_CHARACTERS;
    }
    return ALL_CHARACTERS.filter(char =>
      char.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-msf-surface rounded-lg shadow-xl w-11/12 max-w-md max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-msf-primary">
          <h2 className="text-xl font-bold text-msf-text">Select a Character</h2>
          <input
            type="text"
            placeholder="Search characters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mt-2 bg-msf-bg border border-msf-primary rounded-md p-2 text-msf-text focus:ring-2 focus:ring-msf-accent focus:border-msf-accent outline-none"
            autoFocus
          />
        </div>
        <ul className="overflow-y-auto p-2">
          {filteredCharacters.map(char => (
            <li key={char}>
              <button
                onClick={() => onSelectCharacter(char)}
                className="w-full text-left p-2 rounded-md hover:bg-msf-primary text-msf-text-dark hover:text-msf-text transition-colors"
              >
                {char}
              </button>
            </li>
          ))}
          {filteredCharacters.length === 0 && (
              <li className="p-4 text-center text-msf-secondary">No characters found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};
