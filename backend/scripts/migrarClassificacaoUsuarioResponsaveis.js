import { connectDB } from '../db.js';
import { sequelize } from '../models/index.js';
import { QueryTypes } from 'sequelize';

const FUNCOES_PERMITIDAS = ['Administrador', 'Coletor', 'Revisor', 'Digitador'];

const quoteEnumValues = (values) => values.map((value) => `'${value}'`).join(', ');

const hasColumn = async (tableName, columnName) => {
  const qi = sequelize.getQueryInterface();
  const table = await qi.describeTable(tableName);
  return Boolean(table?.[columnName]);
};

const hasForeignKey = async (tableName, columnName, referencedTable) => {
  const fkRows = await sequelize.query(
    `
      SELECT CONSTRAINT_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = :tableName
        AND COLUMN_NAME = :columnName
        AND REFERENCED_TABLE_NAME = :referencedTable
    `,
    {
      replacements: { tableName, columnName, referencedTable },
      type: QueryTypes.SELECT
    }
  );

  return fkRows.length > 0;
};

const hasIndex = async (tableName, indexName) => {
  const qi = sequelize.getQueryInterface();
  const indexes = await qi.showIndex(tableName);
  return indexes.some((index) => index.name === indexName);
};

const adicionarColunaSeNaoExistir = async (tableName, columnName, sql) => {
  if (await hasColumn(tableName, columnName)) {
    console.log(`SKIP  Coluna ${tableName}.${columnName} ja existe.`);
    return;
  }

  console.log(`ADD   Adicionando coluna ${tableName}.${columnName}...`);
  await sequelize.query(sql);
};

const adicionarForeignKeySeNaoExistir = async (
  tableName,
  columnName,
  referencedTable,
  constraintName,
  sql
) => {
  if (await hasForeignKey(tableName, columnName, referencedTable)) {
    console.log(`SKIP  Foreign key para ${tableName}.${columnName} ja existe.`);
    return;
  }

  console.log(`LINK  Adicionando constraint ${constraintName}...`);
  await sequelize.query(sql);
};

const adicionarIndiceSeNaoExistir = async (tableName, indexName, sql) => {
  if (await hasIndex(tableName, indexName)) {
    console.log(`SKIP  Indice ${indexName} ja existe.`);
    return;
  }

  console.log(`INDX  Criando indice ${indexName}...`);
  await sequelize.query(sql);
};

const executarBackfillResponsaveis = async () => {
  if (!(await hasColumn('desembarques', 'ID_usuario'))) {
    console.log('SKIP  Coluna desembarques.ID_usuario nao existe. Backfill ignorado.');
    return;
  }

  const atualizacoes = [
    {
      funcao: 'Coletor',
      idCampo: 'ID_coletor',
      nomeCampo: 'coletor',
      dataCampo: 'data_coletor'
    },
    {
      funcao: 'Revisor',
      idCampo: 'ID_revisor',
      nomeCampo: 'revisor',
      dataCampo: 'data_revisor'
    },
    {
      funcao: 'Digitador',
      idCampo: 'ID_digitador',
      nomeCampo: 'digitador',
      dataCampo: 'data_digitador'
    }
  ];

  for (const atualizacao of atualizacoes) {
    console.log(`DATA  Backfill de ${atualizacao.idCampo} para usuarios com funcao ${atualizacao.funcao}...`);

    await sequelize.query(
      `
        UPDATE desembarques d
        INNER JOIN usuarios u ON u.ID_usuario = d.ID_usuario
        SET
          d.${atualizacao.idCampo} = u.ID_usuario,
          d.${atualizacao.nomeCampo} = COALESCE(NULLIF(TRIM(d.${atualizacao.nomeCampo}), ''), u.nome),
          d.${atualizacao.dataCampo} = COALESCE(d.${atualizacao.dataCampo}, DATE(d.createdAt))
        WHERE u.funcao = :funcao
          AND d.${atualizacao.idCampo} IS NULL
      `,
      {
        replacements: { funcao: atualizacao.funcao }
      }
    );
  }
};

const migrar = async () => {
  try {
    console.log('MIGR  Conectando ao banco de dados...');
    await connectDB();

    console.log('MIGR  Garantindo valores de classificacao em usuarios.funcao...');
    await sequelize.query(`
      ALTER TABLE usuarios
      MODIFY COLUMN funcao
      ENUM(${quoteEnumValues(FUNCOES_PERMITIDAS)})
      NOT NULL DEFAULT 'Coletor'
    `);

    await adicionarColunaSeNaoExistir(
      'desembarques',
      'ID_coletor',
      'ALTER TABLE desembarques ADD COLUMN ID_coletor INT NULL'
    );
    await adicionarColunaSeNaoExistir(
      'desembarques',
      'ID_revisor',
      'ALTER TABLE desembarques ADD COLUMN ID_revisor INT NULL'
    );
    await adicionarColunaSeNaoExistir(
      'desembarques',
      'ID_digitador',
      'ALTER TABLE desembarques ADD COLUMN ID_digitador INT NULL'
    );

    await adicionarForeignKeySeNaoExistir(
      'desembarques',
      'ID_coletor',
      'usuarios',
      'fk_desembarques_coletor',
      `
        ALTER TABLE desembarques
        ADD CONSTRAINT fk_desembarques_coletor
        FOREIGN KEY (ID_coletor) REFERENCES usuarios(ID_usuario)
      `
    );

    await adicionarForeignKeySeNaoExistir(
      'desembarques',
      'ID_revisor',
      'usuarios',
      'fk_desembarques_revisor',
      `
        ALTER TABLE desembarques
        ADD CONSTRAINT fk_desembarques_revisor
        FOREIGN KEY (ID_revisor) REFERENCES usuarios(ID_usuario)
      `
    );

    await adicionarForeignKeySeNaoExistir(
      'desembarques',
      'ID_digitador',
      'usuarios',
      'fk_desembarques_digitador',
      `
        ALTER TABLE desembarques
        ADD CONSTRAINT fk_desembarques_digitador
        FOREIGN KEY (ID_digitador) REFERENCES usuarios(ID_usuario)
      `
    );

    await adicionarIndiceSeNaoExistir(
      'desembarques',
      'idx_desembarques_id_coletor',
      'CREATE INDEX idx_desembarques_id_coletor ON desembarques (ID_coletor)'
    );

    await adicionarIndiceSeNaoExistir(
      'desembarques',
      'idx_desembarques_id_revisor',
      'CREATE INDEX idx_desembarques_id_revisor ON desembarques (ID_revisor)'
    );

    await adicionarIndiceSeNaoExistir(
      'desembarques',
      'idx_desembarques_id_digitador',
      'CREATE INDEX idx_desembarques_id_digitador ON desembarques (ID_digitador)'
    );

    await executarBackfillResponsaveis();

    console.log('OK    Migracao concluida com sucesso!');
    console.log('   - usuarios.funcao validado com Administrador/Coletor/Revisor/Digitador');
    console.log('   - desembarques.ID_coletor/ID_revisor/ID_digitador criados com FK');
    console.log('   - backfill executado com base em desembarques.ID_usuario');

    process.exit(0);
  } catch (error) {
    console.error('ERRO  Erro na migracao de classificacao de usuario e responsaveis:', error);
    process.exit(1);
  }
};

migrar();
