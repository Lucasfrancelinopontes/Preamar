import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Contract:
// - connectDB(): connects and authenticates with the DB, runs sync()
// - exports sequelize instance for defining models elsewhere

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '3306';
const DB_NAME = process.env.DB_NAME || 'preamar';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mariadb',
  logging: false,
  dialectOptions: {
    // options if needed
  },
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    // use sync({ alter: true }) in development if you want automatic schema updates
    await sequelize.sync();
    return sequelize;
  } catch (error) {
    console.error('Não foi possível conectar ao banco de dados:', error);
    throw error;
  }
};

export default sequelize;
