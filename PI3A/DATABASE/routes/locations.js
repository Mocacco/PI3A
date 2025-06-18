const express = require("express");
const db = require("../database");
const authenticateToken = require("./auth").authenticateToken;

const router = express.Router();

//Get /locations - lista locais do usuário
router.get("/lista", authenticateToken, (req, res) => {
    const userId = req.user.id;
    
    db.all("SELECT * FROM user_locations WHERE user_id = ?", [userId], (err, rows) => {
        if (err) return res.status(500).json({ message: "Erro de buscar locais" });
        return res.json({ locations: rows });
    });
});

// POST /locations - salva novo local
router.post("/salvar", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { location } = req.body;

    console.log("BODY RECEBIDO:", req.body);

    if (!location || !location.name) {
        return res.status(400).json({ message: "Local Inválido" });
    }

    const { name, latitude, longitude } = location;

    db.run(
        "INSERT INTO user_locations (user_id, name, latitude, longitude) VALUES (?, ?, ?, ?)",
        [userId, name, latitude || null, longitude || null],
        function (err) {
            if (err) {
                console.error("Erro no INSERT:", err);
                return res.status(500).json({ message: "Erro ao salvar local" });
            }
            return res.status(201).json({ message: "Local salvo com sucesso", id: this.lastID });
        }
    );
});

// DELETE /locations/:id - remove local do usuário
router.delete("/remove/:id", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const locationId = req.params.id;

    db.run(
        "DELETE FROM user_locations WHERE id = ? AND user_id = ?",
        [locationId, userId],
        function(err) {
            if (err) return res.status(500).json({ message: "Erro ao remover local" });
            return res.json({ message: "Local removido com sucesso" });
        }
    );
});

module.exports = router;