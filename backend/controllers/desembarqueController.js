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

// Criar novo desembarque completo com transação
export const criarDesembarque = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { 
      pescador, 
      embarcacao, 
      desembarque, 
      artes, 
      especies // Array de espécies com capturas e indivíduos
    } = req.body;

    console.log('📦 Criando desembarque:', {
      pescador: pescador?.nome,
      embarcacao: embarcacao?.nome_embarcacao,
      cod_desembarque: desembarque?.cod_desembarque,
      total_especies: especies?.length || 0
    });

    // Validar dados obrigatórios
    if (!desembarque) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Dados do desembarque são obrigatórios'
      });
    }

    // Validar CPF do pescador se fornecido
    if (pescador?.cpf && !validarCPF(pescador.cpf)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'CPF inválido'
      });
    }

    // 1. Criar ou encontrar pescador
    let pescadorDb = null;
    if (pescador && pescador.cpf) {
      [pescadorDb] = await Pescador.findOrCreate({
        where: { cpf: pescador.cpf },
        defaults: pescador,
        transaction: t
      });
      console.log('✅ Pescador:', pescadorDb.nome, `(ID: ${pescadorDb.ID_pescador})`);
    }

    // 2. Criar ou encontrar embarcação
    let embarcacaoDb = null;
    if (embarcacao && embarcacao.codigo_embarcacao) {
      [embarcacaoDb] = await Embarcacao.findOrCreate({
        where: { codigo_embarcacao: embarcacao.codigo_embarcacao },
        defaults: embarcacao,
        transaction: t
      });
      console.log('✅ Embarcação:', embarcacaoDb.nome_embarcacao, `(ID: ${embarcacaoDb.ID_embarcacao})`);
    }

    // 3. Criar desembarque
    const desembarqueDb = await Desembarque.create({
      ...desembarque,
      ID_pescador: pescadorDb?.ID_pescador || null,
      ID_embarcacao: embarcacaoDb?.ID_embarcacao || null
    }, { transaction: t });

    console.log('✅ Desembarque criado:', desembarqueDb.cod_desembarque, `(ID: ${desembarqueDb.ID_desembarque})`);

    // 4. Criar artes de pesca
    if (artes && artes.length > 0) {
      const artesData = artes.map(arte => ({
        ...arte,
        ID_desembarque: desembarqueDb.ID_desembarque
      }));
      await DesembarqueArte.bulkCreate(artesData, { transaction: t });
      console.log(`✅ ${artes.length} arte(s) de pesca salva(s)`);
    }

    // 5. Processar espécies com capturas e indivíduos
    let totalDesembarque = 0;
    let totalCapturas = 0;
    let totalIndividuos = 0;

    if (especies && especies.length > 0) {
      for (const especieData of especies) {
        const { ID_especie, captura, individuos } = especieData;

        // 5.1 Criar captura
        if (captura && captura.peso_kg) {
          const capturaDb = await Captura.create({
            ID_desembarque: desembarqueDb.ID_desembarque,
            ID_especie: ID_especie,
            peso_kg: captura.peso_kg,
            preco_kg: captura.preco_kg || 0,
            preco_total: (captura.peso_kg || 0) * (captura.preco_kg || 0)
          }, { transaction: t });

          totalDesembarque += capturaDb.preco_total;
          totalCapturas++;
        }

        // 5.2 Criar indivíduos (biometria)
        if (individuos && individuos.length > 0) {
          const individuosData = individuos.map(ind => ({
            ID_desembarque: desembarqueDb.ID_desembarque,
            ID_especie: ID_especie,
            numero_individuo: ind.numero_individuo || null,
            comprimento_padrao_cm: ind.comprimento || null,
            comprimento_total_cm: ind.comprimento_total || null,
            comprimento_forquilha_cm: ind.comprimento_forquilha || null,
            peso_g: ind.peso || null,
            sexo: ind.sexo || null,
            estadio_gonadal: ind.estadio_gonadal || null
          }));

          await Individuo.bulkCreate(individuosData, { transaction: t });
          totalIndividuos += individuos.length;
        }
      }

      console.log(`✅ ${totalCapturas} captura(s) salva(s)`);
      console.log(`✅ ${totalIndividuos} indivíduo(s) salvo(s)`);
    }

    // 6. Atualizar total do desembarque
    await desembarqueDb.update(
      { total_desembarque: totalDesembarque },
      { transaction: t }
    );

    // Commit da transação
    await t.commit();

    console.log('✨ Transação concluída com sucesso!');
    console.log(`💰 Total do desembarque: R$ ${totalDesembarque.toFixed(2)}`);

    res.status(201).json({
      success: true,
      message: 'Desembarque criado com sucesso',
      data: {
        ID_desembarque: desembarqueDb.ID_desembarque,
        cod_desembarque: desembarqueDb.cod_desembarque,
        total_desembarque: totalDesembarque,
        resumo: {
          capturas: totalCapturas,
          individuos: totalIndividuos,
          artes: artes?.length || 0
        }
      }
    });

  } catch (error) {
    // Rollback em caso de erro
    await t.rollback();
    
    console.error('❌ Erro ao criar desembarque:', {
      message: error.message,
      name: error.name,
      sql: error.sql,
      original: error.original?.message,
      errors: error.errors?.map(e => ({ message: e.message, field: e.path }))
    });

    res.status(500).json({
      success: false,
      message: 'Erro ao criar desembarque',
      error: error.message,
      details: error.original?.message || error.errors?.map(e => e.message).join(', ')
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
          attributes: ['ID_captura', 'ID_especie', 'peso_kg', 'preco_kg', 'preco_total'],
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

// Buscar desembarque por ID com todos os relacionamentos (Eager Loading)
export const buscarDesembarque = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🔍 Buscando desembarque ID: ${id}`);

    const desembarque = await Desembarque.findOne({
      where: { ID_desembarque: id },
      include: [
        // Pescador
        { 
          model: Pescador, 
          as: 'pescador',
          attributes: [
            'ID_pescador',
            'nome',
            'apelido',
            'cpf',
            'nascimento',
            'municipio'
          ]
        },
        // Embarcação
        { 
          model: Embarcacao, 
          as: 'embarcacao',
          attributes: [
            'ID_embarcacao',
            'nome_embarcacao',
            'codigo_embarcacao',
            'tipo',
            'tipo_outro',
            'comprimento',
            'capacidade',
            'hp',
            'proprietario',
            'rgp',
            'possui',
            'localidade'
          ]
        },
        // Artes de Pesca
        { 
          model: DesembarqueArte, 
          as: 'artes',
          attributes: [
            'ID',
            'arte',
            'tamanho',
            'unidade'
          ]
        },
        // Capturas com Espécie
        {
          model: Captura,
          as: 'capturas',
          attributes: [
            'ID_captura',
            'ID_especie',
            'peso_kg',
            'preco_kg',
            'preco_total'
          ],
          include: [{
            model: Especie,
            as: 'especie',
            attributes: [
              'ID_especie',
              'nome_popular',
              'nome_cientifico',
              'familia'
            ]
          }]
        },
        // Indivíduos (Biometria) com Espécie
        {
          model: Individuo,
          as: 'individuos',
          attributes: [
            'ID_individuo',
            'ID_especie',
            'numero_individuo',
            'comprimento_padrao_cm',
            'comprimento_total_cm',
            'comprimento_forquilha_cm',
            'peso_g',
            'sexo',
            'estadio_gonadal'
          ],
          include: [{
            model: Especie,
            as: 'especie',
            attributes: [
              'ID_especie',
              'nome_popular',
              'nome_cientifico'
            ]
          }]
        }
      ],
      // Ordenar individuos por espécie e número
      order: [
        [{ model: Individuo, as: 'individuos' }, 'ID_especie', 'ASC'],
        [{ model: Individuo, as: 'individuos' }, 'numero_individuo', 'ASC']
      ]
    });

    if (!desembarque) {
      console.log('❌ Desembarque não encontrado');
      return res.status(404).json({
        success: false,
        message: 'Desembarque não encontrado'
      });
    }

    console.log('✅ Desembarque encontrado:', {
      cod_desembarque: desembarque.cod_desembarque,
      capturas: desembarque.capturas?.length || 0,
      individuos: desembarque.individuos?.length || 0,
      artes: desembarque.artes?.length || 0
    });

    // Enriquecer dados com estatísticas
    const estatisticas = {
      total_especies: desembarque.capturas?.length || 0,
      peso_total_kg: desembarque.capturas?.reduce((sum, c) => sum + (parseFloat(c.peso_kg) || 0), 0) || 0,
      valor_total: desembarque.total_desembarque || 0,
      total_individuos_medidos: desembarque.individuos?.length || 0,
      total_artes: desembarque.artes?.length || 0
    };

    res.json({
      success: true,
      data: {
        ...desembarque.toJSON(),
        estatisticas
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar desembarque:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
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