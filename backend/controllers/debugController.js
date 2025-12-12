import { Especie } from '../models/index.js';
import { sequelize } from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const populateSpecies = async (req, res) => {
  try {
    // Tentar localizar o arquivo JSON
    // Em desenvolvimento: ../api/especies.json
    // Em produção (Vercel): pode variar, mas geralmente está junto com os arquivos
    
    let jsonPath = path.join(__dirname, '../api/especies.json');
    
    if (!fs.existsSync(jsonPath)) {
      // Tentar caminho alternativo para Vercel
      jsonPath = path.join(process.cwd(), 'api', 'especies.json');
    }
    
    if (!fs.existsSync(jsonPath)) {
      // Tentar caminho alternativo 2
      jsonPath = path.join(process.cwd(), 'backend', 'api', 'especies.json');
    }

    if (!fs.existsSync(jsonPath)) {
      return res.status(404).json({
        success: false,
        message: 'Arquivo especies.json não encontrado',
        searchPaths: [
          path.join(__dirname, '../api/especies.json'),
          path.join(process.cwd(), 'api', 'especies.json'),
          path.join(process.cwd(), 'backend', 'api', 'especies.json')
        ]
      });
    }

    const especiesData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Converter dados
    const especiesFormatadas = especiesData.map(especie => ({
      ID_especie: especie.ID,
      familia: especie.Familia,
      nome_cientifico: especie.Nome_cientifico,
      nome_popular: especie.Nome_popular,
      genero: null,
      habitat: especie.Habitat,
      grau_ameaca: especie.Grau_de_ameaca,
      nivel_trofico: especie.Nivel_trofico,
      valor_comercial: especie.Valor_comercial,
      mercado: especie.Mercado,
      comprimento_max_cm: especie.Comprimento_max_cm,
      inicio_maturacao_cm: especie.Inicio_maturacao_cm,
      pesca: especie.Pesca
    }));

    // Limpar e inserir
    await Especie.destroy({ where: {} });
    await Especie.bulkCreate(especiesFormatadas);

    res.json({
      success: true,
      message: `Sucesso! ${especiesFormatadas.length} espécies inseridas.`,
      count: especiesFormatadas.length
    });

  } catch (error) {
    console.error('Erro ao popular espécies:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao popular espécies: ${error.message}`,
      error: error.message,
      stack: error.stack
    });
  }
};

export const checkDb = async (req, res) => {
  try {
    const tables = await sequelize.getQueryInterface().showAllTables();
    
    const counts = {};
    for (const table of tables) {
      try {
        const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`);
        counts[table] = results[0].count;
      } catch (e) {
        counts[table] = `Erro: ${e.message}`;
      }
    }

    res.json({
      success: true,
      tables,
      counts,
      dialect: sequelize.getDialect(),
      database: sequelize.config.database,
      host: sequelize.config.host
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Erro ao verificar DB: ${error.message}`,
      error: error.message
    });
  }
};
