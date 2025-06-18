const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database");

const router = express.Router();

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  jwt.verify(token, process.env.JWT_SECRET || "secreto", (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = user;
    next();
  });
}

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

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  jwt.verify(token, process.env.JWT_SECRET || 'secreto', (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = user;
    next();
  });
}

// Rota para troca de senha
router.post("/change-password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Campos obrigatórios não preenchidos" });
  }

  db.get("SELECT * FROM users WHERE id = ?", [req.user.id], async (err, user) => {
    if (err) return res.status(500).json({ message: "Erro no banco de dados" });
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ message: "Senha atual incorreta" });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    db.run("UPDATE users SET password = ? WHERE id = ?", [hashedNewPassword, req.user.id], (err) => {
      if (err) return res.status(500).json({ message: "Erro ao atualizar a senha" });

      return res.status(200).json({ message: "Senha alterada com sucesso" });
    });
  });
});

module.exports = {
  router,
  authenticateToken
};