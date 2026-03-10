import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import mysql2 from 'mysql2'; // Importação direta do driver

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '3306';
const DB_NAME = process.env.DB_NAME || 'preamar';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';

// Configuração SSL para bancos na nuvem (TiDB, PlanetScale, Azure, etc)
const dialectOptions = {};
if (DB_HOST !== 'localhost' && DB_HOST !== '127.0.0.1') {
  dialectOptions.ssl = {
    rejectUnauthorized: false // Aceita certificados auto-assinados (comum em tiers gratuitos)
  };
}

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql', // TiDB é compatível com MySQL
  // dialectModule: mysql2, // Deixar o Sequelize resolver
  logging: false,
  dialectOptions: dialectOptions,
  pool: {
    max: 5, // Limite de conexões para não estourar o plano free
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    return sequelize;
  } catch (error) {
    console.error('Não foi possível conectar ao banco de dados:', error);
    throw error;
  }
};

export default sequelize;
