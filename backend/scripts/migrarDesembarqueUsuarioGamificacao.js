import { connectDB } from '../db.js';
import { sequelize } from '../models/index.js';
import { QueryTypes } from 'sequelize';

const migrar = async () => {
  try {
    console.log('Conectando ao banco de dados...');
    await connectDB();

    const qi = sequelize.getQueryInterface();
    const table = await qi.describeTable('desembarques');

    if (!table.ID_usuario) {
      console.log('Adicionando coluna desembarques.ID_usuario...');
      await sequelize.query(`
        ALTER TABLE desembarques
        ADD COLUMN ID_usuario INT NULL
      `);
    } else {
      console.log('Coluna desembarques.ID_usuario ja existe.');
    }

    const fkRows = await sequelize.query(
      `
        SELECT CONSTRAINT_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'desembarques'
          AND COLUMN_NAME = 'ID_usuario'
          AND REFERENCED_TABLE_NAME = 'usuarios'
      `,
      { type: QueryTypes.SELECT }
    );

    if (!fkRows.length) {
      console.log('Adicionando foreign key para usuarios...');
      await sequelize.query(`
        ALTER TABLE desembarques
        ADD CONSTRAINT fk_desembarques_usuario
        FOREIGN KEY (ID_usuario) REFERENCES usuarios(ID_usuario)
      `);
    } else {
      console.log('Foreign key de desembarques.ID_usuario ja existe.');
    }

    const indexes = await qi.showIndex('desembarques');
    const hasCompositeIndex = indexes.some((index) => index.name === 'idx_desembarques_usuario_createdAt');

    if (!hasCompositeIndex) {
      console.log('Criando indice composto (ID_usuario, createdAt)...');
      await sequelize.query(`
        CREATE INDEX idx_desembarques_usuario_createdAt
        ON desembarques (ID_usuario, createdAt)
      `);
    } else {
      console.log('Indice idx_desembarques_usuario_createdAt ja existe.');
    }

    console.log('Migracao de gamificacao concluida com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro na migracao de gamificacao:', error);
    process.exit(1);
  }
};

migrar();
