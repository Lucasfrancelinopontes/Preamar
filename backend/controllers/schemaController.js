
import mariadb from 'mariadb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar .env do diretório pai se não estiver carregado
dotenv.config({ path: path.join(__dirname, '../.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT) || 3306;
const DB_NAME = process.env.DB_NAME || 'preamar';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';

export const updateIndividuosSchema = async (req, res) => {
  let conn;
  const logs = [];
  
  const log = (msg) => {
    console.log(msg);
    logs.push(msg);
  };

  try {
    log('🔌 Conectando ao banco de dados...');
    conn = await mariadb.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASS,
      database: DB_NAME,
      ssl: {
        rejectUnauthorized: false
      }
    });
    log('✅ Conexão estabelecida!');

    const colunasParaAdicionar = [
      {
        nome: 'comprimento_total_cm',
        sql: "ALTER TABLE individuos ADD COLUMN comprimento_total_cm DECIMAL(10,2) NULL COMMENT 'Comprimento total em cm'",
        descricao: 'Comprimento Total'
      },
      {
        nome: 'comprimento_forquilha_cm',
        sql: "ALTER TABLE individuos ADD COLUMN comprimento_forquilha_cm DECIMAL(10,2) NULL COMMENT 'Comprimento furcal/forquilha em cm'",
        descricao: 'Comprimento Forquilha'
      },
      {
        nome: 'sexo',
        sql: "ALTER TABLE individuos ADD COLUMN sexo VARCHAR(20) NULL COMMENT 'Sexo do indivíduo'",
        descricao: 'Sexo'
      },
      {
        nome: 'estadio_gonadal',
        sql: "ALTER TABLE individuos ADD COLUMN estadio_gonadal VARCHAR(50) NULL COMMENT 'Estágio de maturação gonadal'",
        descricao: 'Estágio Gonadal'
      }
    ];

    // Verificar colunas existentes
    const colunasExistentes = await conn.query("SHOW COLUMNS FROM individuos");
    const nomesColunas = colunasExistentes.map(col => col.Field);
    
    // Verificar se existe a coluna antiga 'comprimento_cm' e renomear se necessário
    if (nomesColunas.includes('comprimento_cm') && !nomesColunas.includes('comprimento_total_cm')) {
        log('🔄 Renomeando coluna comprimento_cm para comprimento_total_cm...');
        try {
            await conn.query("ALTER TABLE individuos CHANGE COLUMN comprimento_cm comprimento_total_cm DECIMAL(10,2) NULL COMMENT 'Comprimento total em cm'");
            log('✅ Coluna renomeada com sucesso!');
            // Atualizar lista de colunas existentes
            nomesColunas.push('comprimento_total_cm');
            const index = nomesColunas.indexOf('comprimento_cm');
            if (index > -1) nomesColunas.splice(index, 1);
        } catch (err) {
            log(`❌ Erro ao renomear coluna: ${err.message}`);
        }
    }

    let adicionadas = 0;
    
    for (const coluna of colunasParaAdicionar) {
      if (nomesColunas.includes(coluna.nome)) {
        log(`⏭️  ${coluna.nome} - Já existe, pulando...`);
      } else {
        try {
          await conn.query(coluna.sql);
          log(`✅ ${coluna.nome} - Adicionada! (${coluna.descricao})`);
          adicionadas++;
        } catch (error) {
          log(`❌ ${coluna.nome} - Erro: ${error.message}`);
        }
      }
    }

    if (res) {
      res.json({
        success: true,
        message: 'Schema de indivíduos atualizado com sucesso',
        logs: logs,
        changes: adicionadas
      });
    }

  } catch (error) {
    log(`❌ Erro fatal: ${error.message}`);
    if (res) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar schema',
        error: error.message,
        logs: logs
      });
    }
  } finally {
    if (conn) conn.end();
  }
};
