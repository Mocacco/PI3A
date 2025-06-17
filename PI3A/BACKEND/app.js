// P13A/BACKEND/index.js
require('dotenv').config(); // Carrega as variáveis de ambiente do .env
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY; // Usada para Directions
const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY; // Usada para Autocomplete

// Verifica se as chaves de API necessárias estão definidas
if (!MAPBOX_API_KEY) {
    console.error('ERRO: MAPBOX_API_KEY não está definida no arquivo .env do BACKEND.');
    process.exit(1);
}
if (!OPENCAGE_API_KEY) {
    console.error('ERRO: OPENCAGE_API_KEY não está definida no arquivo .env do BACKEND.');
    process.exit(1);
}

// Configuração do CORS para permitir requisições do seu frontend Expo
app.use(cors({
    origin: [
        'http://localhost:3000', // Para testes diretos no navegador do backend
        'http://10.0.2.2:3000', // Para emuladores Android
        'http://192.168.1.6:3000', // <--- AJUSTE AQUI SE SEU IP FOR DIFERENTE
        /\.exp\.host$/, // Para apps Expo Go usando túnel
        /\.exp\.direct$/, // Para apps Expo Go em desenvolvimento local (LAN)
    ],
    methods: ['GET', 'POST'],
}));

// Teste de conexão simples para depuração
app.get('/test-connection', (req, res) => {
    res.send('Server backend connected successfully!');
});

// Rota para Autocomplete de Locais (AGORA USANDO OPENCAGE GEOCoding API)
app.get('/api/autocomplete-places', async (req, res) => {
    try {
        const { input, proximity } = req.query; // 'proximity' vem do frontend no formato "long,lat"

        console.log("Backend - Recebido autocomplete request. Input:", input, "Proximity (do Frontend):", proximity);

        if (!input) {
            return res.status(400).json({ error: 'O parâmetro "input" é obrigatório para o autocomplete.' });
        }

        const url = `https://api.opencagedata.com/geocode/v1/json`;

        const params = {
            q: input,
            key: OPENCAGE_API_KEY,
            language: 'pt',
            limit: 5, // Número de sugestões
            // OpenCage espera proximity no formato "latitude,longitude"
            // O frontend envia "longitude,latitude", então precisamos inverter aqui.
            ...(proximity && { proximity: `${proximity.split(',')[1]},${proximity.split(',')[0]}` }),
            countrycode: 'br', // Restringe a resultados do Brasil
            no_annotations: 1, // Remove dados extras que não usaremos
            min_confidence: 1, // Nível de confiança mínimo para resultados
            // bounds: '-48.15,-16.05,-47.60,-15.50', // Exemplo de BBOX para Brasília (descomente e ajuste se quiser um filtro mais forte)
        };

        const response = await axios.get(url, { params });
        const data = response.data;

        console.log('Resposta bruta da API OpenCage Autocomplete:', JSON.stringify(data, null, 2)); // Mantenha este log temporariamente para depuração

        if (!data.results || data.results.length === 0) {
            console.log('Nenhum resultado encontrado para input:', input);
            return res.json([]);
        }

        const suggestions = data.results.map(feature => ({
            // OpenCage não tem um `place_id` universal. Usamos um ID combinando elementos.
            place_id: feature.annotations?.geohash || feature.osm_id || feature.formatted,
            description: feature.formatted, // O endereço formatado completo
            latitude: feature.geometry.lat, // Latitude (já está aqui!)
            longitude: feature.geometry.lng, // Longitude (já está aqui!)
        }));

        res.json(suggestions);

    } catch (error) {
        console.error('Erro ao chamar a API do OpenCage Autocomplete:', error.message);
        const statusCode = error.response ? error.response.status : 500;
        const errorMessage = error.response ? error.response.data || error.message : error.message;
        res.status(statusCode).json({ error: 'Erro ao buscar sugestões.', details: errorMessage });
    }
});

// Rota para Detalhes do Local (REMOVIDA - OpenCage retorna tudo no autocomplete)
// A OpenCage não tem um endpoint de "detalhes por ID" separado.
// As informações de latitude, longitude e endereço já vêm nas sugestões do autocomplete.
// O Frontend não fará mais uma chamada para /api/place-details.

// Rota para Direções (USANDO MAPBOX Directions API)
app.get('/api/directions', async (req, res) => {
    try {
        // --- CORREÇÃO AQUI: DESTRUTURAR req.query PRIMEIRA COISA ---
        const { origin, destination } = req.query; // <<< MOVIDO PARA CÁ
        // ---------------------------------------------------------

        // --- NOVOS LOGS QUE CAUSAVAM O ERRO AGORA PODEM VIR AQUI ---
        console.log("Backend - Recebido pedido de direções:");
        console.log("  Frontend Origin String:", origin); // AGORA 'origin' está definido
        console.log("  Frontend Destination String:", destination);
        // --- FIM DOS NOVOS LOGS ---

        if (!origin || !destination) {
            return res.status(400).json({ error: 'Os parâmetros de origem e destino são obrigatórios.' });
        }

        const [originLat, originLng] = origin.split(',');
        const [destLat, destLng] = destination.split(',');

        if (isNaN(parseFloat(originLat)) || isNaN(parseFloat(originLng)) ||
            isNaN(parseFloat(destLat)) || isNaN(parseFloat(destLng))) {
            console.error("Backend - Coordenadas inválidas detectadas:", { origin, destination });
            return res.status(400).json({ error: 'Formato de coordenadas inválido. Use "latitude,longitude".' });
        }

        const coordinates = `${originLng},${originLat};${destLng},${destLat}`;

        console.log("Backend - Coordenadas Mapbox formatadas:", coordinates);

        const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates}`;

        const response = await axios.get(url, {
            params: {
                access_token: MAPBOX_API_KEY,
                geometries: 'geojson',
                overview: 'full',
                steps: false,
                alternatives: false,
                language: 'pt',
            },
        });

        const data = response.data;

        if (!data.routes || data.routes.length === 0) {
            return res.status(404).json({ error: 'Nenhuma rota encontrada.' });
        }

        const route = data.routes[0];

        const polyline = route.geometry.coordinates.map(coord => ({
            latitude: coord[1],
            longitude: coord[0],
        }));

        res.json({
            routes: data.routes,
            polyline,
            distance: formatDistance(route.distance),
            duration: formatDuration(route.duration),
            bounds: route.bounds ? {
                northeast: {
                    latitude: route.bounds.northeast[1],
                    longitude: route.bounds.northeast[0],
                },
                southwest: {
                    latitude: route.bounds.southwest[1],
                    longitude: route.bounds.southwest[0],
                },
            } : null,
        });

    } catch (error) {
        console.error('Erro ao chamar a API do Mapbox Directions:', error.message);
        const statusCode = error.response ? error.response.status : 500;
        const errorMessage = error.response ? error.response.data : error.message;
        res.status(statusCode).json({ error: 'Erro ao buscar rota.', details: errorMessage });
    }
});

// Funções utilitárias para formatar distância e duração
function formatDistance(distanceInMeters) {
    if (distanceInMeters < 1000) {
        return `${distanceInMeters.toFixed(0)} m`;
    } else {
        return `${(distanceInMeters / 1000).toFixed(1)} km`;
    }
}

function formatDuration(durationInSeconds) {
    const minutes = Math.round(durationInSeconds / 60);
    if (minutes < 60) {
        return `${minutes} min`;
    } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (remainingMinutes > 0) {
            return `${hours} h ${remainingMinutes} min`;
        } else {
            return `${hours} h`;
        }
    }
}

app.listen(PORT, () => {
    console.log(`Server backend running on port ${PORT}`);
    console.log(`Mapbox API Key: ${MAPBOX_API_KEY ? '******' : 'undefined'}`);
    console.log(`OpenCage API Key: ${OPENCAGE_API_KEY ? '******' : 'undefined'}`);
    console.log(`CORS configured for Expo development`);
});