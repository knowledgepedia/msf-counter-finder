
import React from 'react';
import type { Character } from '../types';

interface CharacterSlotProps {
  character: Character | null;
  onSelect: () => void;
  onRemove: () => void;
  onUpdate: (field: keyof Character, value: string) => void;
}

const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string }> = ({ label, value, onChange, placeholder }) => (
    <div className="mt-2">
        <label className="block text-xs font-medium text-msf-text-dark">{label}</label>
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-msf-bg border border-msf-primary rounded-md p-1.5 text-sm text-msf-text focus:ring-2 focus:ring-msf-accent focus:border-msf-accent outline-none"
        />
    </div>
);


export const CharacterSlot: React.FC<CharacterSlotProps> = ({ character, onSelect, onRemove, onUpdate }) => {
  if (!character) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-msf-surface border-2 border-dashed border-msf-primary rounded-lg p-4 transition-colors hover:border-msf-accent">
        <button
          onClick={onSelect}
          className="w-full h-full text-msf-text-dark font-semibold py-2 px-4 rounded-lg hover:text-msf-accent"
        >
          + Select Character
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-msf-surface border border-msf-primary rounded-lg p-3 text-center relative shadow-lg">
      <button 
        onClick={onRemove} 
        className="absolute top-1 right-1 text-msf-secondary hover:text-red-400 font-bold text-lg leading-none"
        aria-label="Remove Character"
      >
        &times;
      </button>
      <div className="w-16 h-16 bg-msf-primary rounded-full mx-auto mb-2 flex items-center justify-center">
        <span className="text-3xl font-bold text-msf-accent">{character.name.charAt(0)}</span>
      </div>
      <h3 className="font-bold text-msf-text truncate">{character.name}</h3>
      
      <InputField 
        label="Power Level"
        placeholder="e.g., 350k"
        value={character.power}
        onChange={(e) => onUpdate('power', e.target.value)}
      />
      <InputField 
        label="T4s"
        placeholder="e.g., Ult, Special"
        value={character.t4s}
        onChange={(e) => onUpdate('t4s', e.target.value)}
      />
      <InputField 
        label="ISO-8"
        placeholder="e.g., Striker 5"
        value={character.iso}
        onChange={(e) => onUpdate('iso', e.target.value)}
      />
    </div>
  );
};
