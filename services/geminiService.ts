import type { Character, GameMode } from '../types';

// The URL of our new backend server.
const API_URL = 'http://localhost:3001/api/getCounter';

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

export async function findCounters(
  enemyTeam: (Character | null)[],
  gameMode: GameMode,
  useMyRoster: boolean
): Promise<string> {
  const filledTeam = enemyTeam.filter((c): c is Character => c !== null);

  if (filledTeam.length === 0) {
    throw new Error("Enemy team is empty. Please select at least one character.");
  }
  
  const payload = {
    enemyTeam: filledTeam,
    gameMode,
    useRoster: useMyRoster,
    userRoster: [], // Sending an empty array as requested for now
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
      // Handle HTTP errors like 404, 500, etc.
      throw new Error(`Backend server error! Status: ${response.status}`);
    }

    const data = await response.json();
    
    // Format the structured JSON response into a markdown string for the ResultsDisplay component
    return formatApiResponse(data);

  } catch (error) {
    console.error("Error calling backend API:", error);
    // Provide a more user-friendly error message
    throw new Error("Failed to connect to the backend server. Is it running? Please check the console for more details.");
  }
}
