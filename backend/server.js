import dotenv from 'dotenv';
import express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;
import router from './router.js';

app.use(express.json());
app.use('/api', router);

app.get('/', (req, res) => {
    res.send('Servidor Express está funcionando!');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});