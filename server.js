// Load secret keys from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios'); // We'll use axios to make API requests
const qs = require('qs');     // We'll use qs to format our request body

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 3001; // Your frontend is on 3001, so let's use 8000
// Note: Your frontend App.tsx/geminiService.ts is calling localhost:3001. 
// You should run your frontend and backend on DIFFERENT ports.
// I'll set this to 8000. Please update your frontend files to call:
// const API_URL = 'http://localhost:8000/api/getCounter';

// --- Constants for MSF API ---
const MSF_TOKEN_URL = 'https://hydra-public.prod.m3.scopelypv.com/oauth2/token';
const MSF_STATIC_KEY = '17wMKJLRxy3pYDCKG5ciP7VSU45OVumB2biCzzgw';

// Get your personal secrets from the .env file
const MY_CLIENT_ID = process.env.MSF_CLIENT_ID;
const MY_CLIENT_SECRET = process.env.MSF_API_KEY; // You named this MSF_API_KEY in the .env

// --- Middleware ---
app.use(cors()); // Allows our frontend to talk to this server
app.use(express.json()); // Allows the server to understand JSON

// --- Helper Function: Get MSF Access Token ---
/**
 * This function performs the OAuth 2.0 Client Credentials flow
 * to get a temporary Bearer Token from the MSF API.
 */
async function getMsfToken() {
  console.log('Attempting to get MSF token...');

  // 1. Create the Basic Auth header
  // This is a Base64 encoding of "YOUR_CLIENT_ID:YOUR_CLIENT_SECRET"
  const authString = Buffer.from(`${MY_CLIENT_ID}:${MY_CLIENT_SECRET}`).toString('base64');
  
  // 2. Define the request body
  const requestBody = {
    grant_type: 'client_credentials'
  };

  // 3. Define the request headers
  const headers = {
    'Authorization': `Basic ${authString}`,
    'x-api-key': MSF_STATIC_KEY,
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  try {
    // 4. Make the POST request
    const response = await axios.post(
      MSF_TOKEN_URL,
      qs.stringify(requestBody), // Use qs to format the body correctly
      { headers: headers }
    );

    // 5. Success! Return the access token.
    const token = response.data.access_token;
    console.log('Successfully fetched MSF token!');
    return token;

  } catch (error) {
    // 6. Handle errors
    console.error('Error fetching MSF token:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Data:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error Message:', error.message);
    }
    return null;
  }
}

// --- API Endpoints ---

/**
 * GET /api/test
 * We'll use this to manually test our token function.
 */
app.get('/api/test', async (req, res) => {
  console.log('Test endpoint was hit! Trying to get token...');
  const token = await getMsfToken();

  if (token) {
    res.json({ 
      message: 'SUCCESS! We got a token from the MSF API.',
      // We'll just show the first few chars for security
      token_preview: token.substring(0, 15) + '...' 
    });
  } else {
    res.status(500).json({ 
      message: 'FAILED. Could not get a token. Check your backend console logs for errors.' 
    });
  }
});

/**
 * POST /api/getCounter
 * This is the main endpoint our frontend will call.
 */
app.post('/api/getCounter', (req, res) => {
  console.log('Received request on /api/getCounter');
  console.log('Request Body:', JSON.stringify(req.body, null, 2));

  // TODO in Phase 4:
  // 1. const token = await getMsfToken();
  // 2. Use this token to call the *actual* MSF data API (e.g., /api/player/v1/characters)
  // 3. Pass that data to the Gemini API
  // 4. Return the Gemini response

  // For now, we still return the placeholder.
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
  res.status(200).json(placeholderResponse);
});

// --- Server Initialization ---
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});