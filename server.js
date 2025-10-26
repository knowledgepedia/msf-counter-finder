// A simple Node.js Express server for the MSF Counter Finder backend.
// To run:
// 1. npm install
// 2. node server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---

// Enable CORS (Cross-Origin Resource Sharing) to allow requests from the frontend.
// The frontend will be running on a different origin, so this is necessary.
app.use(cors());

// Enable the express.json() middleware to parse JSON request bodies.
app.use(express.json());


// --- API Endpoints ---

/**
 * POST /api/getCounter
 * Receives the enemy team composition and other parameters from the frontend.
 *
 * Request Body Structure:
 * {
 *   "enemyTeam": [ ...character objects ],
 *   "gameMode": "string (e.g., 'War')",
 *   "useRoster": boolean,
 *   "userRoster": [ ...character objects ]
 * }
 */
app.post('/api/getCounter', (req, res) => {
  // Log the data received from the frontend to the console for debugging.
  console.log('Received request on /api/getCounter');
  console.log('Request Body:', JSON.stringify(req.body, null, 2));

  // For now, we are not calling the AI API.
  // We'll return a hardcoded, placeholder response as requested.
  const placeholderResponse = {
    message: "Data received successfully. AI call is not yet implemented.",
    counters: [
      {
        teamName: "Placeholder Counter 1",
        team: ["Black Knight", "Apocalypse", "Ms. Marvel (Hard Light)", "Doctor Doom", "Kang the Conqueror"],
        why: "This team provides a mix of high damage, survivability, and turn meter control that can overwhelm many meta defenses. Black Knight's taunt and damage immunity is key to survival.",
        risk: "This is a powerful but expensive team. It may be susceptible to ability block or trauma from specific enemy compositions."
      }
    ]
  };

  // Send the placeholder response back to the frontend.
  res.status(200).json(placeholderResponse);
});


// --- Server Initialization ---

// Start the server and listen for incoming connections on the specified port.
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Waiting for requests from the frontend...');
});
