import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import router from './router.js';
import { connectDB } from './db.js';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: 'http://localhost:3000', // URL do frontend Next.js
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use('/api', router);

app.get('/', (req, res) => {
    res.send('Servidor Express está funcionando!');
});

const start = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Falha ao conectar com o banco de dados:', err.message || err);
        const skip = (process.env.SKIP_DB_ON_ERROR || 'false').toLowerCase();
        if (skip === 'true') {
            console.warn('SKIP_DB_ON_ERROR=true — iniciando servidor mesmo com erro no DB.');
            app.listen(PORT, () => {
                console.log(`Servidor rodando em http://localhost:${PORT}`);
            });
        } else {
            console.error('Encerrando processo. Para forçar inicialização mesmo com erro no DB, defina SKIP_DB_ON_ERROR=true no .env');
            process.exit(1);
        }
    }
};

start();