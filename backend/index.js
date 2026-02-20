import app from "./server.js";
import { connectDB } from "./db.js";
import { defineAssociations, sequelize } from "./models/index.js";
import { DataTypes } from 'sequelize';

// Cache da conexão para reutilização em ambiente Serverless (Vercel)
let dbConnected = false;

const ensureArteNomeColumn = async () => {
  const enabled = (process.env.AUTO_MIGRATE_ARTES_NOME || 'false').toLowerCase() === 'true';
  if (!enabled) return;

  try {
    const qi = sequelize.getQueryInterface();
    const table = await qi.describeTable('desembarque_artes');
    if (table?.nome) return;

    console.log('AUTO_MIGRATE_ARTES_NOME=true — adicionando coluna desembarque_artes.nome ...');
    await qi.addColumn('desembarque_artes', 'nome', {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Nome da arte quando arte=outras'
    });
    console.log('✅ Coluna desembarque_artes.nome adicionada.');
  } catch (err) {
    // Não derrubar a function por falha de ALTER (alguns provedores bloqueiam DDL)
    console.warn('⚠️ Falha ao auto-migrar coluna desembarque_artes.nome:', err?.message || err);
  }
};

const initDB = async () => {
  if (!dbConnected) {
    console.log('Iniciando conexão com banco de dados (Serverless)...');
    await connectDB();
    defineAssociations();
    await ensureArteNomeColumn();
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
