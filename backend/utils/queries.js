import { sequelize } from '../db.js';
import { Desembarque, Captura, Especie, Pescador, Embarcacao } from '../models/index.js';
import { Op } from 'sequelize';

// Relatório de capturas por período
export const relatorioCapturasPeriodo = async (dataInicio, dataFim, municipio = null) => {
  const where = {
    data_coleta: {
      [Op.between]: [dataInicio, dataFim]
    }
  };
  
  if (municipio) where.municipio = municipio;
  
  const resultado = await Captura.findAll({
    attributes: [
      'ID_especie',
      [sequelize.fn('SUM', sequelize.col('peso_kg')), 'peso_total'],
      [sequelize.fn('AVG', sequelize.col('preco_kg')), 'preco_medio'],
      [sequelize.fn('SUM', sequelize.col('preco_total')), 'valor_total'],
      [sequelize.fn('COUNT', sequelize.col('ID_captura')), 'num_registros']
    ],
    include: [
      {
        model: Desembarque,
        as: 'desembarque',
        where,
        attributes: []
      },
      {
        model: Especie,
        as: 'especie',
        attributes: ['nome_popular', 'nome_cientifico', 'familia']
      }
    ],
    group: ['ID_especie', 'especie.ID_especie', 'especie.nome_popular', 'especie.nome_cientifico', 'especie.familia'],
    order: [[sequelize.fn('SUM', sequelize.col('peso_kg')), 'DESC']],
    raw: false
  });
  
  return resultado;
};

// Relatório de pescadores mais ativos
export const relatorioPescadoresAtivos = async (dataInicio, dataFim, limite = 10) => {
  const resultado = await Pescador.findAll({
    attributes: [
      'ID_pescador',
      'nome',
      'apelido',
      [sequelize.fn('COUNT', sequelize.col('desembarques.ID_desembarque')), 'total_desembarques']
    ],
    include: [{
      model: Desembarque,
      as: 'desembarques',
      where: {
        data_coleta: {
          [Op.between]: [dataInicio, dataFim]
        }
      },
      attributes: []
    }],
    group: ['ID_pescador', 'nome', 'apelido'],
    order: [[sequelize.fn('COUNT', sequelize.col('desembarques.ID_desembarque')), 'DESC']],
    limit: limite,
    subQuery: false
  });
  
  return resultado;
};

// Relatório de embarcações
export const relatorioEmbarcacoes = async (dataInicio, dataFim) => {
  const resultado = await Embarcacao.findAll({
    attributes: [
      'ID_embarcacao',
      'nome_embarcacao',
      'tipo',
      [sequelize.fn('COUNT', sequelize.col('desembarques.ID_desembarque')), 'total_viagens'],
      [sequelize.fn('SUM', sequelize.col('desembarques.total_desembarque')), 'valor_total']
    ],
    include: [{
      model: Desembarque,
      as: 'desembarques',
      where: {
        data_coleta: {
          [Op.between]: [dataInicio, dataFim]
        }
      },
      attributes: []
    }],
    group: ['ID_embarcacao', 'nome_embarcacao', 'tipo'],
    order: [[sequelize.fn('COUNT', sequelize.col('desembarques.ID_desembarque')), 'DESC']],
    subQuery: false
  });
  
  return resultado;
};

export default {
  relatorioCapturasPeriodo,
  relatorioPescadoresAtivos,
  relatorioEmbarcacoes
};