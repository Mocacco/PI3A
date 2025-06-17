const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database");

const router = express.Router();

// Rota de cadastro
router.post("/signup", async (req, res) => {
  const { email, password, phone } = req.body;

  if (!email || !password || !phone) {
    return res.status(400).json({ message: "Todos os campos são obrigatórios" });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
    if (err) return res.status(500).json({ message: "Erro no banco de dados" });
    if (row) return res.status(400).json({ message: "Email já cadastrado" });

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      db.run(
        "INSERT INTO users (email, password, phone) VALUES (?, ?, ?)",
        [email, hashedPassword, phone],
        function (err) {
          if (err) {
            return res.status(500).json({ message: "Erro ao cadastrar o usuário" });
          }
          res.status(201).json({ message: "Usuário criado com sucesso" });
        }
      );
    } catch (error) {
      return res.status(500).json({ message: "Erro interno ao criptografar a senha" });
    }
  });
});

// Rota de login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email e senha são obrigatórios" });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) return res.status(500).json({ message: "Erro no banco de dados" });
    if (!user) return res.status(401).json({ message: "Credenciais inválidas" });

    try {
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ message: "Credenciais inválidas" });

      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || "secreto", // ideal: usar variável de ambiente
        { expiresIn: "1d" }
      );

      res.status(200).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone
        }
      });
    } catch (error) {
      return res.status(500).json({ message: "Erro interno ao verificar a senha" });
    }
  });
});

module.exports = router;