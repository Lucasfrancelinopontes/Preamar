import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { fileURLToPath } from 'url';
import router from './router.js';
import { connectDB } from './db.js';
import { defineAssociations, sequelize } from './models/index.js';
import { DataTypes } from 'sequelize';
import cors from 'cors';
import { errorHandler } from './middleware/validationMiddleware.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rotas
app.use('/api', router);

app.get('/', (req, res) => {
    res.json({
        message: 'API Preamar - Sistema de Monitoramento de Desembarque',
        version: '1.0.0',
        endpoints: {
            municipios: '/api/municipios',
            especies: '/api/especies',
            desembarques: '/api/desembarques',
            pescadores: '/api/pescadores',
            embarcacoes: '/api/embarcacoes'
        }
    });
});

// Middleware de erro (deve ser o último)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada'
    });
});

const start = async () => {
    try {
        await connectDB();
        
        // Definir associações entre os modelos
        defineAssociations();
        
        // Apenas inicia o servidor se não estiver rodando na Vercel (serverless)
        if (process.env.VERCEL !== '1') {
            app.listen(PORT, () => {
                console.log(`
╔════════════════════════════════════════════╗
║   Servidor Preamar rodando com sucesso!    ║
║                                            ║
║   URL: http://localhost:${PORT}              ║
║   Ambiente: ${process.env.NODE_ENV || 'development'}                  ║
║                                            ║
║   Banco: ${process.env.DB_NAME || 'preamar'}                        ║
╚════════════════════════════════════════════╝
                `);
            });
        }
    } catch (err) {
        console.error('❌ Falha ao conectar com o banco de dados:', err.message || err);
        const skip = (process.env.SKIP_DB_ON_ERROR || 'false').toLowerCase();
        if (skip === 'true' && process.env.VERCEL !== '1') {
            console.warn('⚠️  SKIP_DB_ON_ERROR=true — iniciando servidor mesmo com erro no DB.');
            app.listen(PORT, () => {
                console.log(`⚠️  Servidor rodando em http://localhost:${PORT} (SEM BANCO DE DADOS)`);
            });
        } else if (process.env.VERCEL !== '1') {
            console.error('💥 Encerrando processo. Para forçar inicialização mesmo com erro no DB, defina SKIP_DB_ON_ERROR=true no .env');
            process.exit(1);
        }
    }
};

// Inicia o servidor apenas se for o arquivo principal
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    start();
}

// --- Serverless support: exportar handler que garante DB inicializado por invocação ---
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
        console.warn('⚠️ Falha ao auto-migrar coluna desembarque_artes.nome:', err?.message || err);
    }
};

const ensurePescadorNomeNullable = async () => {
    const enabled = (process.env.AUTO_MIGRATE_PESCADOR_NOME_NULLABLE || 'false').toLowerCase() === 'true';
    if (!enabled) return;

    try {
        const qi = sequelize.getQueryInterface();
        const table = await qi.describeTable('pescadores');
        if (table?.nome?.allowNull) return;

        console.log('AUTO_MIGRATE_PESCADOR_NOME_NULLABLE=true — alterando pescadores.nome para aceitar NULL ...');
        await qi.changeColumn('pescadores', 'nome', {
            type: DataTypes.STRING(255),
            allowNull: true
        });
        console.log('✅ Coluna pescadores.nome agora aceita NULL.');
    } catch (err) {
        console.warn('⚠️ Falha ao auto-migrar pescadores.nome para nullable:', err?.message || err);
    }
};

const initDB = async () => {
    if (!dbConnected) {
        console.log('Iniciando conexão com banco de dados (Serverless)...');
        await connectDB();
        defineAssociations();
        await ensureArteNomeColumn();
        await ensurePescadorNomeNullable();
        dbConnected = true;
    }
};

// Handler principal para Serverless (compatível com Vercel)
const serverlessHandler = async (req, res) => {
    try {
        await initDB();
        app(req, res);
    } catch (error) {
        console.error('Erro na inicialização do banco (serverless):', error);
        res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
};

export { app };
export default serverlessHandler;