const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.listen(3001, "0.0.0.0", () => {
  console.log("Servidor rodando em http://0.0.0.0:3000");
});