import { 
  Desembarque, 
  Pescador, 
  Embarcacao, 
  DesembarqueArte,
  Captura,
  Individuo,
  Especie,
  sequelize
} from '../models/index.js';
import { Op } from 'sequelize';
import { validarCPF } from '../utils/validators.js';

// Criar novo desembarque completo
export const criarDesembarque = async (req, res) => {
  try {
    const { 
      pescador, 
      embarcacao, 
      desembarque, 
      artes, 
      capturas, 
      individuos 
    } = req.body;

    // Validar dados obrigatórios
    if (!desembarque) {
      return res.status(400).json({
        success: false,
        message: 'Dados do desembarque são obrigatórios'
      });
    }

    // Validar CPF do pescador se fornecido
    if (pescador?.cpf && !validarCPF(pescador.cpf)) {
      return res.status(400).json({
        success: false,
        message: 'CPF inválido'
      });
    }

    // 1. Criar ou encontrar pescador
    let pescadorDb;
    if (pescador.cpf) {
      [pescadorDb] = await Pescador.findOrCreate({
        where: { cpf: pescador.cpf },
        defaults: pescador
      });
    }

    // 2. Criar ou encontrar embarcação
    let embarcacaoDb;
    if (embarcacao.codigo_embarcacao) {
      try {
        [embarcacaoDb] = await Embarcacao.findOrCreate({
          where: { codigo_embarcacao: embarcacao.codigo_embarcacao },
          defaults: embarcacao
        });
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          // Se código já existe, buscar a embarcação existente
          embarcacaoDb = await Embarcacao.findOne({
            where: { codigo_embarcacao: embarcacao.codigo_embarcacao }
          });
        } else {
          throw error;
        }
      }
    }

    // 3. Criar desembarque
    let desembarqueDb;
    try {
      desembarqueDb = await Desembarque.create({
        ...desembarque,
        ID_pescador: pescadorDb?.ID_pescador,
        ID_embarcacao: embarcacaoDb?.ID_embarcacao
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        // Se código de desembarque já existe, gerar um novo
        const timestamp = Date.now();
        const novoCodigo = `${desembarque.cod_desembarque}-${timestamp}`;
        desembarqueDb = await Desembarque.create({
          ...desembarque,
          cod_desembarque: novoCodigo,
          ID_pescador: pescadorDb?.ID_pescador,
          ID_embarcacao: embarcacaoDb?.ID_embarcacao
        });
      } else {
        throw error;
      }
    }

    // 4. Criar artes de pesca
    if (artes && artes.length > 0) {
      const artesData = artes.map(arte => ({
        ...arte,
        ID_desembarque: desembarqueDb.ID_desembarque
      }));
      await DesembarqueArte.bulkCreate(artesData);
    }

    // 5. Criar capturas
    if (capturas && capturas.length > 0) {
      const capturasData = capturas.map(captura => ({
        ...captura,
        ID_desembarque: desembarqueDb.ID_desembarque,
        preco_total: captura.peso_kg * captura.preco_kg
      }));
      await Captura.bulkCreate(capturasData);
    }

    // 6. Criar indivíduos
    if (individuos && individuos.length > 0) {
      const individuosData = individuos.map(ind => ({
        ...ind,
        ID_desembarque: desembarqueDb.ID_desembarque
      }));
      await Individuo.bulkCreate(individuosData);
    }

    // 7. Calcular total do desembarque
    const totalDesembarque = capturas?.reduce(
      (sum, cap) => sum + (cap.peso_kg * cap.preco_kg), 
      0
    ) || 0;
    
    await desembarqueDb.update({ total_desembarque: totalDesembarque });

    res.status(201).json({
      success: true,
      message: 'Desembarque criado com sucesso',
      data: {
        ID_desembarque: desembarqueDb.ID_desembarque,
        cod_desembarque: desembarqueDb.cod_desembarque
      }
    });

  } catch (error) {
    console.error('❌ Erro detalhado ao criar desembarque:', {
      message: error.message,
      name: error.name,
      sql: error.sql,
      original: error.original,
      errors: error.errors
    });
    res.status(500).json({
      success: false,
      message: 'Erro ao criar desembarque',
      error: error.message,
      details: error.original?.message || error.errors
    });
  }
};

// Listar desembarques com filtros
export const listarDesembarques = async (req, res) => {
  try {
    const { 
      municipio, 
      localidade, 
      data_inicio, 
      data_fim,
      pescador_id,
      page = 1,
      limit = 50
    } = req.query;

    const where = {};
    
    if (municipio) where.municipio = municipio;
    if (localidade) where.localidade = localidade;
    if (pescador_id) where.ID_pescador = pescador_id;
    
    if (data_inicio && data_fim) {
      where.data_coleta = {
        [Op.between]: [data_inicio, data_fim]
      };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Desembarque.findAndCountAll({
      where,
      include: [
        { 
          model: Pescador, 
          as: 'pescador',
          attributes: ['nome', 'apelido', 'cpf']
        },
        { 
          model: Embarcacao, 
          as: 'embarcacao',
          attributes: ['nome_embarcacao', 'tipo']
        },
        {
          model: Captura,
          as: 'capturas',
          include: [{
            model: Especie,
            as: 'especie',
            attributes: ['nome_popular', 'nome_cientifico']
          }]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['data_coleta', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar desembarques:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar desembarques',
      error: error.message
    });
  }
};

// Buscar desembarque por ID
export const buscarDesembarque = async (req, res) => {
  try {
    const { id } = req.params;

    const desembarque = await Desembarque.findByPk(id, {
      include: [
        { model: Pescador, as: 'pescador' },
        { model: Embarcacao, as: 'embarcacao' },
        { model: DesembarqueArte, as: 'artes' },
        {
          model: Captura,
          as: 'capturas',
          include: [{ model: Especie, as: 'especie' }]
        },
        {
          model: Individuo,
          as: 'individuos',
          include: [{ model: Especie, as: 'especie' }]
        }
      ]
    });

    if (!desembarque) {
      return res.status(404).json({
        success: false,
        message: 'Desembarque não encontrado'
      });
    }

    res.json({
      success: true,
      data: desembarque
    });

  } catch (error) {
    console.error('Erro ao buscar desembarque:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar desembarque',
      error: error.message
    });
  }
};

// Atualizar desembarque
export const atualizarDesembarque = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const desembarque = await Desembarque.findByPk(id);
    
    if (!desembarque) {
      return res.status(404).json({
        success: false,
        message: 'Desembarque não encontrado'
      });
    }

    await desembarque.update(dados);

    res.json({
      success: true,
      message: 'Desembarque atualizado com sucesso',
      data: desembarque
    });

  } catch (error) {
    console.error('Erro ao atualizar desembarque:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar desembarque',
      error: error.message
    });
  }
};

// Deletar desembarque
export const deletarDesembarque = async (req, res) => {
  try {
    const { id } = req.params;

    const desembarque = await Desembarque.findByPk(id);
    
    if (!desembarque) {
      return res.status(404).json({
        success: false,
        message: 'Desembarque não encontrado'
      });
    }

    // Deletar registros relacionados em paralelo
    await Promise.all([
      DesembarqueArte.destroy({ where: { ID_desembarque: id } }),
      Captura.destroy({ where: { ID_desembarque: id } }),
      Individuo.destroy({ where: { ID_desembarque: id } })
    ]);
    
    // Deletar desembarque
    await desembarque.destroy();

    res.json({
      success: true,
      message: 'Desembarque deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar desembarque:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar desembarque',
      error: error.message
    });
  }
};

// Estatísticas de desembarques
export const estatisticasDesembarques = async (req, res) => {
  try {
    const { municipio, data_inicio, data_fim } = req.query;

    const where = {};
    if (municipio) where.municipio = municipio;
    if (data_inicio && data_fim) {
      where.data_coleta = {
        [Op.between]: [data_inicio, data_fim]
      };
    }

    // Total de desembarques
    const totalDesembarques = await Desembarque.count({ where });

    // Total de pescadores únicos
    const pescadoresUnicos = await Desembarque.count({
      where,
      distinct: true,
      col: 'ID_pescador'
    });

    // Total de capturas por espécie
    const capturasPorEspecie = await Captura.findAll({
      attributes: [
        'ID_especie',
        [sequelize.fn('SUM', sequelize.col('peso_kg')), 'peso_total'],
        [sequelize.fn('COUNT', sequelize.col('ID_captura')), 'total_registros']
      ],
      include: [{
        model: Desembarque,
        as: 'desembarque',
        where,
        attributes: []
      }, {
        model: Especie,
        as: 'especie',
        attributes: ['nome_popular', 'nome_cientifico']
      }],
      group: ['ID_especie', 'especie.ID_especie', 'especie.nome_popular', 'especie.nome_cientifico'],
      order: [[sequelize.fn('SUM', sequelize.col('peso_kg')), 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        total_desembarques: totalDesembarques,
        pescadores_unicos: pescadoresUnicos,
        capturas_por_especie: capturasPorEspecie
      }
    });

  } catch (error) {
    console.error('Erro ao gerar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar estatísticas',
      error: error.message
    });
  }
};