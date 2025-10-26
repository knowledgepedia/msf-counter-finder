
import React, { useState, useCallback } from 'react';
import { CharacterSlot } from './components/CharacterSlot';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { ResultsDisplay } from './components/ResultsDisplay';
import type { Character, GameMode } from './types';
import { GAME_MODES, MAX_TEAM_SIZE } from './constants';

// The URL of our backend server.
const API_URL = 'http://localhost:8000/api/getCounter';

// Helper function to format the structured JSON response from the server into a Markdown string
const formatApiResponse = (data: any): string => {
  if (!data.counters || data.counters.length === 0) {
    return "No counter recommendations available at the moment.";
  }

  return data.counters.map((counter: any) => {
    return `
**${counter.teamName || 'Recommended Counter'}**
*Team:* ${counter.team.join(', ')}

**Strategy:**
${counter.why}

**Risks:**
${counter.risk}
    `.trim();
  }).join('\n\n---\n\n');
};


const App: React.FC = () => {
  const [enemyTeam, setEnemyTeam] = useState<(Character | null)[]>(Array(MAX_TEAM_SIZE).fill(null));
  const [gameMode, setGameMode] = useState<GameMode>('War');
  const [useMyRoster, setUseMyRoster] = useState<boolean>(false);
  
  const [results, setResults] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectingSlot, setSelectingSlot] = useState<number | null>(null);

  const handleOpenModal = (index: number) => {
    setSelectingSlot(index);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectingSlot(null);
  };

  const handleSelectCharacter = (name: string) => {
    if (selectingSlot !== null) {
      const newTeam = [...enemyTeam];
      newTeam[selectingSlot] = { id: Date.now(), name, power: '', t4s: '', iso: '' };
      setEnemyTeam(newTeam);
    }
    handleCloseModal();
  };

  const handleRemoveCharacter = (index: number) => {
    const newTeam = [...enemyTeam];
    newTeam[index] = null;
    setEnemyTeam(newTeam);
  };

  const handleUpdateCharacter = useCallback((index: number, field: keyof Character, value: string) => {
    setEnemyTeam(prevTeam => {
      const newTeam = [...prevTeam];
      const char = newTeam[index];
      if (char) {
        newTeam[index] = { ...char, [field]: value };
      }
      return newTeam;
    });
  }, []);

  const handleSubmit = async () => {
    setError(null);
    setResults('');
    setIsLoading(true);

    const filledTeam = enemyTeam.filter((c): c is Character => c !== null);

    if (filledTeam.length === 0) {
      setError("Enemy team is empty. Please select at least one character.");
      setIsLoading(false);
      return;
    }
  
    const payload = {
      enemyTeam: filledTeam,
      gameMode,
      useRoster: useMyRoster,
      userRoster: [], // Not implemented yet
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Backend server error! Status: ${response.status}`);
      }

      const data = await response.json();
      const formattedResults = formatApiResponse(data);
      setResults(formattedResults);

    } catch (e: any) {
      console.error("Error calling backend API:", e);
      setError(e.message || "Failed to connect to the backend server. Is it running? Please check the console for more details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-msf-bg text-msf-text p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-msf-accent">MSF Counter Finder</h1>
          <p className="text-msf-secondary mt-2">Get AI-powered counter recommendations for any team.</p>
        </header>

        <main>
          <div className="bg-msf-surface p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-msf-text">Enemy Team</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {enemyTeam.map((char, index) => (
                <CharacterSlot
                  key={index}
                  character={char}
                  onSelect={() => handleOpenModal(index)}
                  onRemove={() => handleRemoveCharacter(index)}
                  onUpdate={(field: keyof Character, value: string) => handleUpdateCharacter(index, field, value)}
                />
              ))}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-msf-surface p-6 rounded-lg shadow-xl">
              <h2 className="text-xl font-bold mb-3 text-msf-text">Game Mode</h2>
              <div className="flex flex-wrap gap-2">
                {GAME_MODES.map(mode => (
                  <button
                    key={mode}
                    onClick={() => setGameMode(mode)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                      gameMode === mode
                        ? 'bg-msf-accent text-white'
                        : 'bg-msf-primary text-msf-text-dark hover:bg-msf-secondary'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-msf-surface p-6 rounded-lg shadow-xl flex items-center justify-between">
              <h2 className="text-xl font-bold text-msf-text">Use My Roster?</h2>
              <label htmlFor="roster-toggle" className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="roster-toggle" 
                  className="sr-only peer" 
                  checked={useMyRoster}
                  onChange={() => setUseMyRoster(!useMyRoster)}
                />
                <div className="w-11 h-6 bg-msf-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-msf-accent"></div>
              </label>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full md:w-auto bg-msf-accent hover:bg-msf-accent-hover text-white font-bold py-3 px-12 rounded-lg text-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {isLoading ? 'Analyzing...' : 'Find Counters'}
            </button>
          </div>

          <ResultsDisplay results={results} isLoading={isLoading} error={error} />
        </main>

        <footer className="text-center mt-12 text-msf-secondary text-sm">
            <p>MSF Counter Finder &copy; 2024. All game assets are trademarks of Scopely.</p>
        </footer>
      </div>

      <CharacterSelectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelectCharacter={handleSelectCharacter}
      />
    </div>
  );
};

export default App;
