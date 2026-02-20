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

const normalizeCpf = (value) => {
  if (value === undefined || value === null) return null;
  const digits = String(value).replace(/\D/g, '');
  return digits || null;
};

const buildPescadorPayload = (pescador) => {
  if (!pescador) return null;
  return {
    nome: pescador.nome,
    apelido: pescador.apelido ?? null,
    cpf: normalizeCpf(pescador.cpf),
    nascimento: pescador.nascimento ?? null,
    municipio: pescador.municipio ?? null
  };
};

const upsertPescador = async (pescador, transaction) => {
  if (!pescador) return null;

  const payload = buildPescadorPayload(pescador);
  if (!payload?.nome) return null;

  if (payload.cpf) {
    const [pescadorDb] = await Pescador.findOrCreate({
      where: { cpf: payload.cpf },
      defaults: payload,
      transaction
    });

    // Atualiza com os dados mais recentes (sem criar duplicado)
    await pescadorDb.update(payload, { transaction });
    return pescadorDb;
  }

  // Sem CPF: permite nomes repetidos; cria novo registro
  const pescadorDb = await Pescador.create(payload, { transaction });
  return pescadorDb;
};

const normalizeDestinoPescado = (value) => {
  if (value == null) return null;
  if (Array.isArray(value)) {
    const normalized = value
      .map(v => String(v).trim())
      .filter(Boolean)
      .map(v => v.toLowerCase());
    return normalized.length ? normalized.join(',') : null;
  }
  const str = String(value).trim();
  return str ? str.toLowerCase() : null;
};

const normalizeDestinoApelido = (value) => {
  if (value == null) return null;
  if (typeof value === 'object' && !Array.isArray(value)) {
    const parts = Object.entries(value)
      .map(([dest, apelido]) => [String(dest).trim(), String(apelido ?? '').trim()])
      .filter(([dest, apelido]) => dest && apelido)
      .map(([dest, apelido]) => `${dest.toLowerCase()}:${apelido}`);
    return parts.length ? parts.join(',') : null;
  }
  const str = String(value).trim();
  return str || null;
};

const toNullableDecimal = (value) => {
  if (value === undefined || value === null || value === '') return null;
  return value;
};

const toFloatOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

// Helper para gerar cod_desembarque a partir de município/localidade/data/consecutivo
const gerarCodigoDesembarque = (municipio, localidade, data_coleta, consecutivo) => {
  if (!municipio || !localidade || !data_coleta || !consecutivo) return null;
  const dataObj = new Date(data_coleta);
  if (isNaN(dataObj)) return null;
  const dia = String(dataObj.getDate()).padStart(2, '0');
  const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
  const ano = String(dataObj.getFullYear()).slice(-2);
  const consec = String(consecutivo).padStart(2, '0');
  return `${municipio}-${localidade}-${dia}-${mes}-${ano}-${consec}`;
};

// Criar novo desembarque completo com transação
export const criarDesembarque = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { 
      pescador, 
      embarcacao, 
      desembarque, 
      artes, 
      capturas,
      individuos
    } = req.body;

    console.log('📦 Criando desembarque:', {
      pescador: pescador?.nome,
      embarcacao: embarcacao?.nome_embarcacao,
      cod_desembarque: desembarque?.cod_desembarque,
      total_capturas: capturas?.length || 0,
      total_individuos: individuos?.length || 0
    });

    // Validar dados obrigatórios
    if (!desembarque) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Dados do desembarque são obrigatórios'
      });
    }

    // Pescador é obrigatório e deve ser persistido
    if (!pescador?.nome) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Dados do pescador (nome) são obrigatórios'
      });
    }

    // Validar CPF do pescador se fornecido
    const cpfNorm = normalizeCpf(pescador?.cpf);
    if (cpfNorm && !validarCPF(cpfNorm)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'CPF inválido'
      });
    }

    // 1. Criar ou encontrar pescador (sempre)
    let pescadorDb = await upsertPescador({ ...pescador, cpf: cpfNorm }, t);
    console.log('✅ Pescador:', pescadorDb?.nome, `(ID: ${pescadorDb?.ID_pescador})`);

    // 2. Criar ou encontrar embarcação (somente se dados mínimos existirem)
    let embarcacaoDb = null;
    const codigoEmbarcacao = embarcacao?.codigo_embarcacao ? String(embarcacao.codigo_embarcacao).trim() : null;
    const nomeEmbarcacao = embarcacao?.nome_embarcacao ? String(embarcacao.nome_embarcacao).trim() : null;
    const tipoEmbarcacao = embarcacao?.tipo ? String(embarcacao.tipo).trim() : null;

    if (codigoEmbarcacao && nomeEmbarcacao && tipoEmbarcacao) {
      [embarcacaoDb] = await Embarcacao.findOrCreate({
        where: { codigo_embarcacao: codigoEmbarcacao },
        defaults: { ...embarcacao, codigo_embarcacao: codigoEmbarcacao, nome_embarcacao: nomeEmbarcacao, tipo: tipoEmbarcacao },
        transaction: t
      });
      console.log('✅ Embarcação:', embarcacaoDb.nome_embarcacao, `(ID: ${embarcacaoDb.ID_embarcacao})`);
    }

    // 3. Gerar cod_desembarque se não enviado
    if (!desembarque.cod_desembarque) {
      const generated = gerarCodigoDesembarque(desembarque.municipio, desembarque.localidade, desembarque.data_coleta || desembarque.data_saida || null, desembarque.consecutivo || 1);
      if (generated) desembarque.cod_desembarque = generated;
    }

    // Normalizar campos que agora suportam múltiplos valores
    if (desembarque) {
      desembarque.destino_pescado = normalizeDestinoPescado(desembarque.destino_pescado);
      desembarque.destino_apelido = normalizeDestinoApelido(desembarque.destino_apelido);
    }

    // 4. Criar desembarque (com ID do pescador e embarcação)
    const desembarqueDb = await Desembarque.create({
      ...desembarque,
      ID_pescador: pescadorDb?.ID_pescador || null,
      ID_embarcacao: embarcacaoDb?.ID_embarcacao || null
    }, { transaction: t });

    console.log('✅ Desembarque criado:', desembarqueDb.cod_desembarque, `(ID: ${desembarqueDb.ID_desembarque})`);

    // 4. Criar artes de pesca
    if (artes && artes.length > 0) {
      const artesData = artes
        .filter(a => a && a.arte)
        .map(a => {
          const arteValue = String(a.arte).trim();
          const rawNome = (Object.prototype.hasOwnProperty.call(a, 'nome') ? a.nome : a.arte_outro);
          const nomeValue = (arteValue === 'outras' && rawNome != null && String(rawNome).trim())
            ? String(rawNome).trim()
            : null;

          return {
            ID_desembarque: desembarqueDb.ID_desembarque,
            arte: arteValue,
            nome: nomeValue,
            tamanho: a.tamanho != null && String(a.tamanho).trim() ? String(a.tamanho).trim() : null,
            unidade: a.unidade != null && String(a.unidade).trim() ? String(a.unidade).trim() : null
          };
        });

      await DesembarqueArte.bulkCreate(artesData, { transaction: t });
      console.log(`✅ ${artes.length} arte(s) de pesca salva(s)`);
    }

    // 5. Processar capturas e indivíduos
    let totalDesembarque = 0;
    let totalCapturas = 0;
    let totalIndividuos = 0;

    // 5.1 Criar capturas
    if (capturas && capturas.length > 0) {
      for (const captura of capturas) {
        if (!captura?.ID_especie) continue;

        const pesoVal = toNullableDecimal(captura.peso_kg);
        const precoVal = toNullableDecimal(captura.preco_kg);
        const pesoF = toFloatOrNull(pesoVal);
        const precoF = toFloatOrNull(precoVal);
        const precoTotal = (pesoF != null && precoF != null) ? (pesoF * precoF) : null;

        const capturaDb = await Captura.create({
          ID_desembarque: desembarqueDb.ID_desembarque,
          ID_especie: captura.ID_especie,
          peso_kg: pesoVal,
          preco_kg: precoVal,
          preco_total: precoTotal,
          com_tripa: captura.com_tripa
        }, { transaction: t });

        totalDesembarque += (parseFloat(capturaDb.preco_total) || 0);
        totalCapturas++;
      }
      console.log(`✅ ${totalCapturas} captura(s) salva(s)`);
    }

    // 5.2 Criar indivíduos (biometria)
    if (individuos && individuos.length > 0) {
      const individuosData = individuos.map(ind => ({
        ID_desembarque: desembarqueDb.ID_desembarque,
        ID_especie: ind.ID_especie,
        numero_individuo: ind.numero_individuo || null,
        comprimento_padrao_cm: ind.comprimento_cm || ind.comprimento || null,
        comprimento_total_cm: ind.comprimento_total_cm || ind.comprimento_total || null,
        comprimento_forquilha_cm: ind.comprimento_forquilha_cm || ind.comprimento_forquilha || null,
        peso_g: ind.peso_g || ind.peso || null,
        sexo: ind.sexo || null,
        estadio_gonadal: ind.estadio_gonadal || null
      }));

      await Individuo.bulkCreate(individuosData, { transaction: t });
      totalIndividuos = individuos.length;
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
          attributes: ['ID_captura', 'ID_especie', 'peso_kg', 'preco_kg', 'preco_total', 'com_tripa'],
          include: [{
            model: Especie,
            as: 'especie',
            attributes: ['nome_popular', 'nome_cientifico']
          }]
        },
        { 
          model: DesembarqueArte, 
          as: 'artes',
          attributes: ['arte', 'nome', 'tamanho', 'unidade']
        },
        {
          model: Individuo,
          as: 'individuos',
          attributes: ['ID_especie', 'comprimento_total_cm', 'peso_g']
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
      message: `Erro ao listar desembarques: ${error.message}`,
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
            'cpf_proprietario',
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
            'nome',
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
            'preco_total',
            'com_tripa'
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
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      pescador,
      embarcacao,
      desembarque: desembarqueDados,
      artes,
      capturas,
      individuos
    } = req.body;

    const desembarqueDb = await Desembarque.findByPk(id, { transaction: t });
    if (!desembarqueDb) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Desembarque não encontrado' });
    }

    // Validar CPF do pescador se fornecido
    const cpfNorm = normalizeCpf(pescador?.cpf);
    if (cpfNorm && !validarCPF(cpfNorm)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'CPF inválido' });
    }

    // Atualizar ou criar pescador
    let pescadorDb = null;
    if (pescador?.nome) {
      pescadorDb = await upsertPescador({ ...pescador, cpf: cpfNorm }, t);
    } else if (pescador?.ID_pescador) {
      pescadorDb = await Pescador.findByPk(pescador.ID_pescador, { transaction: t });
      if (pescadorDb) await pescadorDb.update(buildPescadorPayload(pescador), { transaction: t });
    }

    // Atualizar ou criar embarcação (somente se dados mínimos existirem)
    let embarcacaoDb = null;
    if (embarcacao) {
      if (embarcacao.codigo_embarcacao) {
        const codigoEmbarcacao = String(embarcacao.codigo_embarcacao).trim();
        const nomeEmbarcacao = embarcacao.nome_embarcacao ? String(embarcacao.nome_embarcacao).trim() : null;
        const tipoEmbarcacao = embarcacao.tipo ? String(embarcacao.tipo).trim() : null;
        if (codigoEmbarcacao && nomeEmbarcacao && tipoEmbarcacao) {
          [embarcacaoDb] = await Embarcacao.findOrCreate({
            where: { codigo_embarcacao: codigoEmbarcacao },
            defaults: { ...embarcacao, codigo_embarcacao: codigoEmbarcacao, nome_embarcacao: nomeEmbarcacao, tipo: tipoEmbarcacao },
            transaction: t
          });
          await embarcacaoDb.update({ ...embarcacao, codigo_embarcacao: codigoEmbarcacao, nome_embarcacao: nomeEmbarcacao, tipo: tipoEmbarcacao }, { transaction: t });
        }
      } else if (embarcacao.ID_embarcacao) {
        // Se for atualizar por ID, só atualiza quando tipo e nome existirem (colunas NOT NULL)
        const nomeEmbarcacao = embarcacao.nome_embarcacao ? String(embarcacao.nome_embarcacao).trim() : null;
        const tipoEmbarcacao = embarcacao.tipo ? String(embarcacao.tipo).trim() : null;
        if (nomeEmbarcacao && tipoEmbarcacao) {
          embarcacaoDb = await Embarcacao.findByPk(embarcacao.ID_embarcacao, { transaction: t });
          if (embarcacaoDb) await embarcacaoDb.update({ ...embarcacao, nome_embarcacao: nomeEmbarcacao, tipo: tipoEmbarcacao }, { transaction: t });
        }
      }
    }

    // Atualizar dados do desembarque
    const updatePayload = {
      ...(desembarqueDados || {}),
      ID_pescador: pescadorDb?.ID_pescador ?? desembarqueDb.ID_pescador,
      ID_embarcacao: embarcacaoDb?.ID_embarcacao ?? desembarqueDb.ID_embarcacao
    };

    // Normalizar campos que agora suportam múltiplos valores
    if ('destino_pescado' in updatePayload) {
      updatePayload.destino_pescado = normalizeDestinoPescado(updatePayload.destino_pescado);
    }
    if ('destino_apelido' in updatePayload) {
      updatePayload.destino_apelido = normalizeDestinoApelido(updatePayload.destino_apelido);
    }

    // Gerar cod_desembarque se não fornecido, usando valores novos ou existentes
    if (!updatePayload.cod_desembarque) {
      const municipio = updatePayload.municipio || desembarqueDb.municipio;
      const localidade = updatePayload.localidade || desembarqueDb.localidade;
      const data_coleta = updatePayload.data_coleta || updatePayload.data_saida || desembarqueDb.data_coleta || desembarqueDb.data_saida;
      const consecutivo = updatePayload.consecutivo || desembarqueDb.consecutivo || 1;
      const generated = gerarCodigoDesembarque(municipio, localidade, data_coleta, consecutivo);
      if (generated) {
        // garantir unicidade (incremental simples se necessário)
        let candidate = generated;
        let suffix = 1;
        while (true) {
          const exists = await Desembarque.findOne({ where: { cod_desembarque: candidate } , transaction: t});
          if (!exists || exists.ID_desembarque === desembarqueDb.ID_desembarque) break;
          suffix += 1;
          candidate = `${generated}-v${suffix}`;
        }
        updatePayload.cod_desembarque = candidate;
      }
    }

    await desembarqueDb.update(updatePayload, { transaction: t });

    // Sincronizar artes (incremental): atualizar existentes, criar novos, apagar removidos
    const existingArtes = await DesembarqueArte.findAll({ where: { ID_desembarque: id }, transaction: t });
    const incomingArteIds = [];
    if (Array.isArray(artes)) {
      for (const arte of artes) {
        const arteId = arte.ID || arte.id || null;

        const arteValue = arte?.arte != null ? String(arte.arte).trim() : null;
        if (!arteValue) continue;

        const rawNome = (Object.prototype.hasOwnProperty.call(arte, 'nome') ? arte.nome : arte.arte_outro);
        const nomeValue = (arteValue === 'outras' && rawNome != null && String(rawNome).trim())
          ? String(rawNome).trim()
          : null;

        const artePayload = {
          arte: arteValue,
          nome: nomeValue,
          tamanho: arte.tamanho != null && String(arte.tamanho).trim() ? String(arte.tamanho).trim() : null,
          unidade: arte.unidade != null && String(arte.unidade).trim() ? String(arte.unidade).trim() : null
        };

        if (arteId) {
          const arteDb = existingArtes.find(a => a.ID === arteId);
          if (arteDb) {
            await arteDb.update(artePayload, { transaction: t });
            incomingArteIds.push(arteDb.ID);
          } else {
            const newA = await DesembarqueArte.create({ ...artePayload, ID_desembarque: id }, { transaction: t });
            incomingArteIds.push(newA.ID);
          }
        } else {
          const newA = await DesembarqueArte.create({ ...artePayload, ID_desembarque: id }, { transaction: t });
          incomingArteIds.push(newA.ID);
        }
      }
    }
    // Apagar artes removidas
    await DesembarqueArte.destroy({ where: { ID_desembarque: id, ID: { [Op.notIn]: incomingArteIds.length ? incomingArteIds : [0] } }, transaction: t });

    // Sincronizar capturas (incremental)
    const existingCapturas = await Captura.findAll({ where: { ID_desembarque: id }, transaction: t });
    const incomingCapturaIds = [];
    if (Array.isArray(capturas)) {
      for (const captura of capturas) {
        const capId = captura.ID_captura || captura.id || null;
        if (capId) {
          const capDb = existingCapturas.find(c => c.ID_captura === capId);
          if (capDb) {
            const precoKg = Object.prototype.hasOwnProperty.call(captura, 'preco_kg')
              ? toNullableDecimal(captura.preco_kg)
              : capDb.preco_kg;
            const pesoKg = Object.prototype.hasOwnProperty.call(captura, 'peso_kg')
              ? toNullableDecimal(captura.peso_kg)
              : capDb.peso_kg;

            const pesoF = toFloatOrNull(pesoKg);
            const precoF = toFloatOrNull(precoKg);
            const precoTotal = (pesoF != null && precoF != null) ? (pesoF * precoF) : null;

            await capDb.update(
              { ID_especie: captura.ID_especie, peso_kg: pesoKg, preco_kg: precoKg, preco_total: precoTotal, com_tripa: captura.com_tripa },
              { transaction: t }
            );
            incomingCapturaIds.push(capDb.ID_captura);
          } else {
            const pesoKg = toNullableDecimal(captura.peso_kg);
            const precoKg = toNullableDecimal(captura.preco_kg);
            const pesoF = toFloatOrNull(pesoKg);
            const precoF = toFloatOrNull(precoKg);
            const precoTotal = (pesoF != null && precoF != null) ? (pesoF * precoF) : null;

            const created = await Captura.create(
              { ID_desembarque: id, ID_especie: captura.ID_especie, peso_kg: pesoKg, preco_kg: precoKg, preco_total: precoTotal, com_tripa: captura.com_tripa },
              { transaction: t }
            );
            incomingCapturaIds.push(created.ID_captura);
          }
        } else {
          const pesoKg = toNullableDecimal(captura.peso_kg);
          const precoKg = toNullableDecimal(captura.preco_kg);
          const pesoF = toFloatOrNull(pesoKg);
          const precoF = toFloatOrNull(precoKg);
          const precoTotal = (pesoF != null && precoF != null) ? (pesoF * precoF) : null;

          const created = await Captura.create(
            { ID_desembarque: id, ID_especie: captura.ID_especie, peso_kg: pesoKg, preco_kg: precoKg, preco_total: precoTotal, com_tripa: captura.com_tripa },
            { transaction: t }
          );
          incomingCapturaIds.push(created.ID_captura);
        }
      }
    }
    // Apagar capturas removidas
    await Captura.destroy({ where: { ID_desembarque: id, ID_captura: { [Op.notIn]: incomingCapturaIds.length ? incomingCapturaIds : [0] } }, transaction: t });

    // Sincronizar indivíduos (incremental)
    const existingIndividuos = await Individuo.findAll({ where: { ID_desembarque: id }, transaction: t });
    const incomingIndividuoIds = [];
    if (Array.isArray(individuos)) {
      for (const ind of individuos) {
        const indId = ind.ID_individuo || ind.id || null;
        if (indId) {
          const indDb = existingIndividuos.find(x => x.ID_individuo === indId);
          if (indDb) {
            await indDb.update({ ID_especie: ind.ID_especie, numero_individuo: ind.numero_individuo || null, comprimento_padrao_cm: ind.comprimento_cm || ind.comprimento || null, comprimento_total_cm: ind.comprimento_total_cm || ind.comprimento_total || null, comprimento_forquilha_cm: ind.comprimento_forquilha_cm || ind.comprimento_forquilha || null, peso_g: ind.peso_g || ind.peso || null, sexo: ind.sexo || null, estadio_gonadal: ind.estadio_gonadal || null }, { transaction: t });
            incomingIndividuoIds.push(indDb.ID_individuo);
          } else {
            const created = await Individuo.create({ ID_desembarque: id, ID_especie: ind.ID_especie, numero_individuo: ind.numero_individuo || null, comprimento_padrao_cm: ind.comprimento_cm || ind.comprimento || null, comprimento_total_cm: ind.comprimento_total_cm || ind.comprimento_total || null, comprimento_forquilha_cm: ind.comprimento_forquilha_cm || ind.comprimento_forquilha || null, peso_g: ind.peso_g || ind.peso || null, sexo: ind.sexo || null, estadio_gonadal: ind.estadio_gonadal || null }, { transaction: t });
            incomingIndividuoIds.push(created.ID_individuo);
          }
        } else {
          const created = await Individuo.create({ ID_desembarque: id, ID_especie: ind.ID_especie, numero_individuo: ind.numero_individuo || null, comprimento_padrao_cm: ind.comprimento_cm || ind.comprimento || null, comprimento_total_cm: ind.comprimento_total_cm || ind.comprimento_total || null, comprimento_forquilha_cm: ind.comprimento_forquilha_cm || ind.comprimento_forquilha || null, peso_g: ind.peso_g || ind.peso || null, sexo: ind.sexo || null, estadio_gonadal: ind.estadio_gonadal || null }, { transaction: t });
          incomingIndividuoIds.push(created.ID_individuo);
        }
      }
    }
    // Apagar indivíduos removidos
    await Individuo.destroy({ where: { ID_desembarque: id, ID_individuo: { [Op.notIn]: incomingIndividuoIds.length ? incomingIndividuoIds : [0] } }, transaction: t });

    // Recalcular total do desembarque a partir das capturas atuais
    const capturasAfter = await Captura.findAll({ where: { ID_desembarque: id }, transaction: t });
    let totalDesembarque = capturasAfter.reduce((sum, c) => sum + (parseFloat(c.preco_total) || 0), 0);
    const totalCapturas = capturasAfter.length;
    const totalIndividuos = await Individuo.count({ where: { ID_desembarque: id }, transaction: t });

    await desembarqueDb.update({ total_desembarque: totalDesembarque }, { transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: 'Desembarque atualizado com sucesso',
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
    try {
      await t.rollback();
    } catch (rbErr) {
      console.error('Erro ao dar rollback na transação:', rbErr);
    }

    console.error('❌ Erro ao atualizar desembarque:', error);

    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar desembarque',
      error: error.message,
      details: error.original?.message || (error.errors ? error.errors.map(e => e.message).join(', ') : undefined)
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
      message: `Erro ao gerar estatísticas: ${error.message}`,
      error: error.message
    });
  }
};