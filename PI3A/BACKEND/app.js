require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const Maps_API_KEY = process.env.Maps_API_KEY;

// Configuração de CORS para Expo
app.use(cors({
  origin: [
    'http://localhost:19006', // Expo Web
    /\.exp\.host$/, // Todos subdomínios Expo
    /\.exp\.direct$/, // Tunnel Expo
    'http://10.0.2.2' // Android emulador
  ],
  methods: ['GET']
}));

// Endpoint de teste
app.get('/test-connection', (req, res) => {
  res.send('Server connected successfully!');
});

// Endpoint de autocomplete
app.get('/api/autocomplete-places', async (req, res) => {
  try {
    const { input, sessionToken } = req.query;
    
    if (!input) {
      return res.status(400).json({ error: 'Input parameter is required' });
    }

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/autocomplete/json',
      {
        params: {
          input,
          key: Maps_API_KEY,
          sessiontoken: sessionToken,
          types: 'address'
        }
      }
    );

    res.json(response.data.predictions || []);
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch suggestions',
      details: error.message
    });
  }
});

// ... (outros endpoints)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS configured for Expo development`);
});