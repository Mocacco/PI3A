require('dotenv').config();
const axios = require('axios');
require('dotenv').config();

console.log('MAPBOX_API_KEY:', process.env.MAPBOX_API_KEY);
const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;

async function testAutocomplete(input) {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(input)}.json`;
    const response = await axios.get(url, {
      params: {
        access_token: MAPBOX_API_KEY,
        limit: 5,
        language: 'pt',
      },
    });

    const data = response.data;
    console.log('Resposta da API Mapbox:', JSON.stringify(data, null, 2));

    if (!data.features || data.features.length === 0) {
      console.log('Nenhum resultado encontrado');
      return;
    }

    const suggestions = data.features.map(feature => ({
      place_id: feature.id,
      description: feature.place_name,
    }));

    console.log('Sugestões:', suggestions);

  } catch (error) {
    console.error('Erro ao chamar API:', error.message);
  }
}

const input = process.argv[2] || 'Rua das Flores';
testAutocomplete(input);
