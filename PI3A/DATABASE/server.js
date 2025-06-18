const express = require("express");
const cors = require("cors");
const db = require("./database");
const authRoutes = require("./routes/auth").router;
const locationsRoutes = require("./routes/locations");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares globais
app.use(cors());
app.use(express.json());

// Criação automática da tabela user_locations
db.run(`
  CREATE TABLE IF NOT EXISTS user_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error("Erro ao criar/verificar tabela user_locations:", err.message);
  } else {
    console.log("Tabela de locais verificada/criada com sucesso.");
  }
});

// Rotas
app.use("/auth", authRoutes);
app.use("/locations", locationsRoutes);

// Rota básica de teste
app.get("/", (req, res) => {
  res.send("API está rodando corretamente!");
});

// Inicializa o servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});