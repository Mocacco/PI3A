// my-app-backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Ainda usaremos axios para a API de Autocomplete
const { Client } = require("@googlemaps/google-maps-services-js"); // Se estiver usando para Directions
const app = express();
const PORT = process.env.PORT || 3000;

const Maps_API_KEY = process.env.Maps_API_KEY;

if (!Maps_API_KEY) {
    console.error('ERRO: A variável de ambiente Maps_API_KEY não está definida no arquivo .env');
    process.exit(1);
}

app.use(cors());
app.use(express.json());

// Rota para obter direções (rota entre dois pontos)
app.get('/api/directions', async (req, res) => {
    const origin = req.query.origin;       // Ex: "lat,lng"
    const destination = req.query.destination; // Ex: "lat,lng"

    if (!origin || !destination) {
        return res.status(400).json({ error: 'Parâmetros "origin" e "destination" são obrigatórios.' });
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${Maps_API_KEY}&mode=driving`;

        const response = await axios.get(url);
        const route = response.data.routes[0];

        if (!route || !route.legs || !route.overview_polyline) {
            return res.status(404).json({ error: 'Rota não encontrada.' });
        }

        // Decodifica o polyline (usado para desenhar a rota no mapa)
        const decodePolyline = (encoded) => {
            let points = [];
            let index = 0, len = encoded.length;
            let lat = 0, lng = 0;

            while (index < len) {
                let b, shift = 0, result = 0;
                do {
                    b = encoded.charCodeAt(index++) - 63;
                    result |= (b & 0x1f) << shift;
                    shift += 5;
                } while (b >= 0x20);
                const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
                lat += dlat;

                shift = 0;
                result = 0;
                do {
                    b = encoded.charCodeAt(index++) - 63;
                    result |= (b & 0x1f) << shift;
                    shift += 5;
                } while (b >= 0x20);
                const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
                lng += dlng;

                points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
            }

            return points;
        };

        const polyline = decodePolyline(route.overview_polyline.points);

        res.json({
            distance: route.legs[0].distance.text,
            duration: route.legs[0].duration.text,
            polyline, // Lista de coordenadas decodificadas
        });

    } catch (error) {
        console.error('Erro ao obter direções:', error.message);
        res.status(500).json({ error: 'Erro ao obter direções.', details: error.message });
    }
});


// ... (suas rotas existentes: /api/search-places, /api/directions)

app.get('/api/place-details', async (req, res) => {
    const placeId = req.query.place_id;
    const sessionToken = req.query.sessionToken;

    if (!placeId) {
        return res.status(400).json({ error: 'O parâmetro "place_id" é obrigatório.' });
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${Maps_API_KEY}&fields=name,geometry,formatted_address${sessionToken ? `&sessiontoken=${sessionToken}` : ''}`;

        const response = await axios.get(url);
        const result = response.data.result;

        if (!result || !result.geometry || !result.geometry.location) {
            return res.status(404).json({ error: 'Local não encontrado ou sem dados de localização.' });
        }

        res.json({
            name: result.name,
            address: result.formatted_address,
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
        });

    } catch (error) {
        console.error('Erro ao buscar detalhes do local:', error.message);
        res.status(500).json({ error: 'Erro ao buscar detalhes do local.', details: error.message });
    }
});

// Nova rota para autocomplete de locais
app.get('/api/autocomplete-places', async (req, res) => {
    const input = req.query.input; // O texto que o usuário está digitando
    const sessionToken = req.query.sessionToken; // Importante para otimização de custos e precisão
    const location = req.query.location; // Opcional: localização atual para enviesar os resultados

    if (!input) {
        return res.status(400).json({ error: 'O parâmetro "input" é obrigatório para o autocomplete.' });
    }

    try {
        let googleApiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${Maps_API_KEY}`;

        if (sessionToken) {
            googleApiUrl += `&sessiontoken=${sessionToken}`;
        }
        if (location) {
            // Se você quiser enviesar os resultados para uma área específica (latitude,longitude,raio)
            // Exemplo: `&location=${location.latitude},${location.longitude}&radius=50000` (50km)
            googleApiUrl += `&location=${location}&radius=50000`; // Ajuste o raio conforme necessário
        }
        // Você pode adicionar mais parâmetros como `components=country:br` para restringir ao Brasil

        const response = await axios.get(googleApiUrl);
        const autocompleteData = response.data;

        // Processa os resultados para enviar apenas o que você precisa
        const predictions = autocompleteData.predictions.map(prediction => ({
            description: prediction.description, // Ex: "Rua Augusta, Consolação, São Paulo - SP, Brasil"
            place_id: prediction.place_id, // ID único para usar na busca de detalhes do local
            matched_substrings: prediction.matched_substrings,
            types: prediction.types // Ex: ["street_address", "geocode"]
        }));

        res.json(predictions);

    } catch (error) {
        console.error('Erro ao chamar a API do Google Places Autocomplete:', error.message);
        res.status(500).json({ error: 'Erro ao buscar sugestões de locais.', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
});