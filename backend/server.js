import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import router from './router.js';
import { connectDB } from './db.js';
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
    } catch (err) {
        console.error('❌ Falha ao conectar com o banco de dados:', err.message || err);
        const skip = (process.env.SKIP_DB_ON_ERROR || 'false').toLowerCase();
        if (skip === 'true') {
            console.warn('⚠️  SKIP_DB_ON_ERROR=true — iniciando servidor mesmo com erro no DB.');
            app.listen(PORT, () => {
                console.log(`⚠️  Servidor rodando em http://localhost:${PORT} (SEM BANCO DE DADOS)`);
            });
        } else {
            console.error('💥 Encerrando processo. Para forçar inicialização mesmo com erro no DB, defina SKIP_DB_ON_ERROR=true no .env');
            process.exit(1);
        }
    }
};

start();