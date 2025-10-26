// Load secret keys from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios'); // We'll use axios to make API requests
const qs = require('qs');     // We'll use qs to format our request body

// Initialize the Express app
const app = express();
const PORT = 8000; // Keep backend on 8000

// --- Constants for MSF API ---
const MSF_TOKEN_URL = 'https://hydra-public.prod.m3.scopelypv.com/oauth2/token';
const MSF_API_BASE_URL = 'https://api.marvelstrikeforce.com'; // Base URL for API calls
const MSF_STATIC_KEY = '17wMKJLRxy3pYDCKG5ciP7VSU45OVumB2biCzzgw';

// Get your personal secrets from the .env file
const MY_CLIENT_ID = process.env.MSF_CLIENT_ID;
const MY_CLIENT_SECRET = process.env.MSF_API_KEY;

// --- Middleware ---
app.use(cors()); // Allows our frontend to talk to this server
app.use(express.json()); // Allows the server to understand JSON

// --- Helper Function: Get MSF Access Token ---
// (This function is unchanged from Phase 3)
async function getMsfToken() {
  console.log('Attempting to get MSF token...');
  const authString = Buffer.from(`${MY_CLIENT_ID}:${MY_CLIENT_SECRET}`).toString('base64');
  const requestBody = { grant_type: 'client_credentials' };
  const headers = {
    'Authorization': `Basic ${authString}`,
    'x-api-key': MSF_STATIC_KEY,
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  try {
    const response = await axios.post(
      MSF_TOKEN_URL,
      qs.stringify(requestBody),
      { headers: headers }
    );
    const token = response.data.access_token;
    console.log('Successfully fetched MSF token!');
    return token;

  } catch (error) {
    console.error('Error fetching MSF token:');
    if (error.response) {
      console.error('Data:', error.response.data);
      console.error('Status:', error.response.status);
    } else {
      console.error('Error Message:', error.message);
    }
    return null;
  }
}

// --- API Endpoints ---

/**
 * GET /api/test
 * (This is unchanged, you can keep it for testing your token)
 */
app.get('/api/test', async (req, res) => {
  console.log('Test endpoint was hit! Trying to get token...');
  const token = await getMsfToken();
  if (token) {
    res.json({ 
      message: 'SUCCESS! We got a token from the MSF API.',
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
 * THIS IS THE PART WE ARE UPDATING.
 */
app.post('/api/getCounter', async (req, res) => {
  console.log('Received request on /api/getCounter');
  console.log('Request Body:', JSON.stringify(req.body, null, 2));

  // --- NEW LOGIC FOR PHASE 4 ---
  try {
    // 1. Get a fresh MSF token
    const token = await getMsfToken();
    if (!token) {
      // If we failed to get a token, send a 500 error
      throw new Error('Failed to authenticate with MSF API.');
    }

    // 2. Prepare to call a real MSF endpoint
    // We'll use our new token in the Authorization header
    const apiHeaders = {
      'Authorization': `Bearer ${token}`,
      'x-api-key': MSF_STATIC_KEY,
      'User-Agent': 'APIClient/1.0 (Server)' // Recommended by docs
    };

    // 3. Make the API Call
    // We'll try the /player/v1/recruiting/recruits endpoint as a test
    // We'll pass the enemyTeam data just to see what happens
    const testEndpoint = '/player/v1/recruiting/recruits';
    
    console.log(`Making authenticated call to: ${MSF_API_BASE_URL}${testEndpoint}`);
    
    const msfResponse = await axios.get(
      `${MSF_API_BASE_URL}${testEndpoint}`,
      {
        headers: apiHeaders,
        // We can try passing the enemy team as params
        params: {
          enemyTeam: req.body.enemyTeam
        }
      }
    );

    // 4. SUCCESS! Send the *real* MSF API data back to the frontend.
    console.log('SUCCESS! Got a real response from MSF API.');
    res.status(200).json(msfResponse.data);

  } catch (error) {
    // 5. If *anything* fails (getting token, or the API call)...
    console.error('Error in /api/getCounter:');
    if (error.response) {
      // The API call itself failed
      console.error('Data:', error.response.data);
      console.error('Status:', error.response.status);
      // Send the API's error message back to the frontend
      res.status(error.response.status).json({
        message: "Failed to get data from MSF API.",
        error: error.response.data
      });
    } else {
      // Something else failed (like getting our token)
      console.error('Error Message:', error.message);
      res.status(500).json({
        message: "An internal server error occurred.",
        error: error.message
      });
    }
  }
});

// --- Server Initialization ---
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});