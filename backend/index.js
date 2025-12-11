import app from "./server.js";
import { connectDB } from "./db.js";
import { defineAssociations } from "./models/index.js";

// Cache da conexão para reutilização em ambiente Serverless (Vercel)
let dbConnected = false;

const initDB = async () => {
  if (!dbConnected) {
    console.log('Iniciando conexão com banco de dados (Serverless)...');
    await connectDB();
    defineAssociations();
    dbConnected = true;
  }
};

// Handler principal para Vercel
export default async (req, res) => {
  try {
    await initDB();
    // Repassa a requisição para o app Express
    app(req, res);
  } catch (error) {
    console.error("Erro na inicialização do banco:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor", 
      details: error.message 
    });
  }
};
