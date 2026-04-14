import { Especie, Captura } from '../models/index.js';
import { Op } from 'sequelize';

const sanitizeEspeciePayload = (input = {}) => {
  const dados = { ...input };

  const decimalFields = ['nivel_trofico', 'comprimento_max_cm', 'inicio_maturacao_cm'];
  const intFields = ['idd', 'valor_comercial', 'mercado', 'pesca'];

  decimalFields.forEach((field) => {
    if (!(field in dados)) return;

    const raw = dados[field];
    if (raw === null || raw === undefined || (typeof raw === 'string' && raw.trim() === '')) {
      dados[field] = null;
      return;
    }

    const parsed = Number.parseFloat(raw);
    dados[field] = Number.isNaN(parsed) ? null : parsed;
  });

  intFields.forEach((field) => {
    if (!(field in dados)) return;

    const raw = dados[field];
    if (raw === null || raw === undefined || (typeof raw === 'string' && raw.trim() === '')) {
      dados[field] = null;
      return;
    }

    const parsed = Number.parseInt(raw, 10);
    dados[field] = Number.isNaN(parsed) ? null : parsed;
  });

  return dados;
};

export const listarEspecies = async (req, res) => {
  try {
    const { 
      nome_popular, 
      nome_cientifico,
      familia,
      habitat,
      page = 1, 
      limit = 100 
    } = req.query;

    const where = {};
    if (nome_popular) where.nome_popular = { [Op.like]: `%${nome_popular}%` };
    if (nome_cientifico) where.nome_cientifico = { [Op.like]: `%${nome_cientifico}%` };
    if (familia) where.familia = { [Op.like]: `%${familia}%` };
    if (habitat) where.habitat = habitat;

    const { count, rows } = await Especie.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['nome_popular', 'ASC']],
      attributes: [
        'ID_especie',
        'idd',
        'familia',
        'nome_cientifico',
        'nome_popular',
        'genero',
        'habitat',
        'grau_ameaca',
        'nivel_trofico',
        'valor_comercial',
        'mercado',
        'comprimento_max_cm',
        'inicio_maturacao_cm',
        'pesca'
      ]
    });

    // Transformar dados para compatibilidade com frontend
    const especiesFormatadas = rows.map(especie => ({
      ID: especie.ID_especie,
      IDD: especie.idd,
      Familia: especie.familia,
      Nome_cientifico: especie.nome_cientifico,
      Nome_popular: especie.nome_popular,
      Genero: especie.genero,
      Habitat: especie.habitat,
      Grau_de_ameaca: especie.grau_ameaca,
      Nivel_trofico: especie.nivel_trofico,
      Valor_comercial: especie.valor_comercial,
      Mercado: especie.mercado,
      Comprimento_max_cm: especie.comprimento_max_cm,
      Inicio_maturacao_cm: especie.inicio_maturacao_cm,
      Pesca: especie.pesca
    }));

    res.json({
      success: true,
      data: especiesFormatadas,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar espécies:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar espécies',
      error: error.message
    });
  }
};

export const criarEspecie = async (req, res) => {
  try {
    const dados = sanitizeEspeciePayload(req.body || {});

    // Validar dados obrigatórios
    if (!dados.nome_popular || !dados.nome_cientifico) {
      return res.status(400).json({
        success: false,
        message: 'Nome popular e nome científico são obrigatórios'
      });
    }

    // Verificar se já existe espécie com este nome científico
    const especieExistente = await Especie.findOne({
      where: { nome_cientifico: dados.nome_cientifico }
    });

    if (especieExistente) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma espécie cadastrada com este nome científico'
      });
    }

    if (dados.idd !== undefined && dados.idd !== null) {
      const iddExistente = await Especie.findOne({
        where: { idd: dados.idd }
      });

      if (iddExistente) {
        return res.status(400).json({
          success: false,
          message: 'Já existe uma espécie cadastrada com este IDD'
        });
      }
    }

    const especie = await Especie.create(dados);

    if (dados.idd === undefined || dados.idd === null) {
      await especie.update({ idd: especie.ID_especie });
    }
    
    res.status(201).json({
      success: true,
      message: 'Espécie criada com sucesso',
      data: especie
    });
  } catch (error) {
    console.error('Erro ao criar espécie:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar espécie',
      error: error.message
    });
  }
};

export const atualizarEspecie = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = sanitizeEspeciePayload(req.body || {});

    const especie = await Especie.findByPk(id);
    if (!especie) {
      return res.status(404).json({
        success: false,
        message: 'Espécie não encontrada'
      });
    }

    // Validar nome científico único se estiver sendo atualizado
    if (dados.nome_cientifico && dados.nome_cientifico !== especie.nome_cientifico) {
      const especieExistente = await Especie.findOne({
        where: { 
          nome_cientifico: dados.nome_cientifico,
          ID_especie: { [Op.ne]: id }
        }
      });

      if (especieExistente) {
        return res.status(400).json({
          success: false,
          message: 'Já existe uma espécie cadastrada com este nome científico'
        });
      }
    }

    if (dados.idd !== undefined && dados.idd !== null && dados.idd !== especie.idd) {
      const iddExistente = await Especie.findOne({
        where: {
          idd: dados.idd,
          ID_especie: { [Op.ne]: id }
        }
      });

      if (iddExistente) {
        return res.status(400).json({
          success: false,
          message: 'Já existe uma espécie cadastrada com este IDD'
        });
      }
    }

    await especie.update(dados);

    res.json({
      success: true,
      message: 'Espécie atualizada com sucesso',
      data: especie
    });

  } catch (error) {
    console.error('Erro ao atualizar espécie:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar espécie',
      error: error.message
    });
  }
};

export const deletarEspecie = async (req, res) => {
  try {
    const { id } = req.params;

    const especie = await Especie.findByPk(id);
    if (!especie) {
      return res.status(404).json({
        success: false,
        message: 'Espécie não encontrada'
      });
    }

    // Verificar se existem capturas vinculadas
    const capturasVinculadas = await Captura.count({
      where: { ID_especie: id }
    });

    if (capturasVinculadas > 0) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível excluir a espécie pois existem capturas vinculadas'
      });
    }

    await especie.destroy();

    res.json({
      success: true,
      message: 'Espécie deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar espécie:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar espécie',
      error: error.message
    });
  }
};

export const buscarEspecie = async (req, res) => {
  try {
    const { id } = req.params;
    
    const especie = await Especie.findByPk(id, {
      include: [{
        model: Captura,
        as: 'capturas',
        limit: 10,
        order: [['ID_captura', 'DESC']]
      }]
    });

    if (!especie) {
      return res.status(404).json({
        success: false,
        message: 'Espécie não encontrada'
      });
    }

    res.json({
      success: true,
      data: especie
    });
  } catch (error) {
    console.error('Erro ao buscar espécie:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar espécie',
      error: error.message
    });
  }
};