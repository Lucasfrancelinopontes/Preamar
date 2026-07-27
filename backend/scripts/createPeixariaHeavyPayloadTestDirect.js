import { criarPeixaria } from '../controllers/peixariaController.js';
import {
  Municipio,
  Especie,
  PeixariaDespesa,
  PeixariaFornecedor,
  PeixariaPescadorFornecedor,
  PeixariaEspecieComercial,
  PeixariaPerda,
  PeixariaPerdaPorEspecie,
  PeixariaOrigemPescado,
  PeixariaRelacaoTrabalho,
  PeixariaMercado,
  PeixariaMercadoLinha
} from '../models/index.js';

const COUNT = Math.max(1, Number.parseInt(process.env.PEIXARIA_TEST_COUNT || '1000', 10) || 1000);

function makeSeries(count, factory) {
  return Array.from({ length: count }, (_, index) => factory(index + 1));
}

function pickSpecies(catalog, index) {
  if (!catalog.length) {
    throw new Error('Nenhuma especie foi retornada pelo banco.');
  }

  return catalog[(index - 1) % catalog.length];
}

async function main() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);

  const municipios = await Municipio.findAll({ order: [['municipio', 'ASC']], raw: true });
  if (!municipios.length) {
    throw new Error('Nenhum municipio disponivel para o teste pesado.');
  }

  const municipio = municipios[0];
  const localidade = Array.isArray(municipio.localidades) ? municipio.localidades[0] || {} : {};

  const especies = await Especie.findAll({ order: [['nome_popular', 'ASC']], raw: true });
  const especiesCatalogo = especies
    .map((item) => ({
      id: Number(item.ID_especie ?? item.ID ?? item.id ?? item.id_especie),
      nome: String(item.nome_popular ?? item.Nome_popular ?? item.nome_cientifico ?? item.Nome_cientifico ?? 'Especie')
    }))
    .filter((item) => Number.isFinite(item.id) && item.id > 0);

  if (!especiesCatalogo.length) {
    throw new Error('Nao foi possivel identificar especies validas no banco.');
  }

  const codigo = `PEIXARIA-HEAVY-${stamp}`;

  const despesas = makeSeries(COUNT, (index) => ({
    descricao: `Despesa Operacional ${index}`,
    quantidade: index,
    custo: Number((index * 3.75).toFixed(2)),
    frequencia: index % 3 === 0 ? 'Mensal' : index % 3 === 1 ? 'Semanal' : 'Diaria'
  }));

  const fornecedores = makeSeries(COUNT, (index) => ({
    nome: `Fornecedor ${index}`,
    tipo: index % 2 === 0 ? 'LOCAL' : 'ENTREGA',
    telefone: `8399${String(index).padStart(6, '0')}`
  }));

  const pescadoresLocais = makeSeries(COUNT, (index) => ({
    nome: `Pescador Local ${index}`,
    apelido: `Local ${index}`,
    comunidade: `Comunidade ${index}`,
    tipo_barco: `Barco ${((index - 1) % 5) + 1}`,
    numero_pescadores: ((index - 1) % 7) + 1,
    volume: Number((index * 2.1).toFixed(2)),
    volume_medio: Number((index * 1.7).toFixed(2)),
    regularidade: index % 2 === 0 ? 'Semanal' : 'Diaria'
  }));

  const pescadoresEntregam = makeSeries(COUNT, (index) => ({
    nome: `Pescador Entrega ${index}`,
    apelido: `Entrega ${index}`,
    comunidade: `Bairro ${index}`,
    tipo_barco: `Lancha ${((index - 1) % 4) + 1}`,
    numero_pescadores: ((index - 1) % 6) + 1,
    volume: Number((index * 1.9).toFixed(2)),
    volume_medio: Number((index * 1.3).toFixed(2)),
    regularidade: index % 2 === 0 ? 'Quinzenal' : 'Mensal'
  }));

  const especiesComerciais = makeSeries(COUNT, (index) => {
    const especie = pickSpecies(especiesCatalogo, index);
    return {
      ID_especie: especie.id,
      especie: especie.nome,
      quantidade_fresco: Number((index * 1.5).toFixed(2)),
      quantidade_congelado: Number((index * 0.85).toFixed(2)),
      preco_compra: Number((10 + index * 0.12).toFixed(2)),
      preco_venda: Number((14 + index * 0.15).toFixed(2))
    };
  });

  const perdas = makeSeries(COUNT, (index) => ({
    descricao: `Perda operacional ${index}`,
    quantidade: Number((index * 0.45).toFixed(2)),
    causa: index % 2 === 0 ? 'Atraso na entrega' : 'Deterioracao'
  }));

  const perdasPorEspecie = makeSeries(COUNT, (index) => ({
    titulo: `Especie de perda ${index}`,
    linhas: [
      { causa: 'Deterioracao', estimativa: Number((index * 0.25).toFixed(2)), destino: `Destino A ${index}` },
      { causa: 'Falta de mercado', estimativa: Number((index * 0.2).toFixed(2)), destino: `Destino B ${index}` },
      { causa: 'Transporte', estimativa: Number((index * 0.15).toFixed(2)), destino: `Destino C ${index}` }
    ]
  }));

  const origemPescado = makeSeries(COUNT, (index) => ({
    tipo: `Origem ${index}`,
    pescadores_locais: String((index * 7) % 101),
    outras_localidades_pb: String((index * 5) % 101),
    outros_estados: String((index * 3) % 101),
    outro: String((index * 2) % 101)
  }));

  const relacoesTrabalho = makeSeries(COUNT, (index) => `Relacao ${index} - ${index % 2 === 0 ? 'Familiar' : 'Armador'}`);

  const buildMarketSection = (tipo) => ({
    volume: Number((COUNT * 10).toFixed(2)),
    valor: Number((COUNT * 18.5).toFixed(2)),
    observacoes: `Teste pesado de ${tipo.toLowerCase()}`,
    linhas: makeSeries(COUNT, (index) => {
      const especie = pickSpecies(especiesCatalogo, index);
      return {
        especie: especie.nome,
        formaComercializacao: index % 2 === 0 ? 'Fresco' : 'Congelado',
        destino: `${tipo} ${index}`,
        volumeMedio: Number((index * 0.9).toFixed(2)),
        precoVenda: Number((index * 1.35).toFixed(2))
      };
    })
  });

  const payload = {
    cod_peixaria: codigo,
    tipo_estabelecimento: 'PEIXARIA',
    ID_municipio: municipio.ID_municipio || null,
    responsavel: 'Responsavel Heavy Teste',
    contato: '83999991111',
    municipio: municipio.municipio || 'Joao Pessoa',
    localidade: localidade.localidade || 'Centro',
    nome: 'Peixaria Heavy Teste Copilot',
    apelido: 'Peixaria Stress Test',
    naturalidade: 'Paraiba',
    sexo: 'Masculino',
    idade: 42,
    atividade_principal: 'Comercio de pescado',
    atividade_secundaria: 'Distribuicao e revenda',
    total_peixarias: 2,
    quantos_possui: 1,
    estado_civil: 'Casado',
    numero_familiares: 4,
    escolaridade: 'Ensino Medio Completo',
    local_moradia: 'Zona urbana',
    possui_registro_inss: true,
    filiado_colonia: true,
    qual_colonia: 'Colonia Z-99',
    participa_associacao: true,
    qual_associacao: 'Associacao Central',
    possui_carteira_pescador: true,
    orgao_emissor_carteira: 'MPA',
    possui_plano_saude: true,
    plano_saude_especificar: 'Plano Particular Familiar',
    atividades_renda_familia: 'Pesca, comercio e transporte',
    quem_trabalha_familia: 'Casal e dois filhos',
    tempo_atividade: 18,
    atividade_comercial: 'Atacado, varejo e entrega',
    periodo_comercializacao: 'Anual',
    forma_venda: 'Balcao e entrega',
    transporte: 'Caminhonete refrigerada',
    despesas,
    fornecedores,
    pescadores_locais: pescadoresLocais,
    pescadores_entregam: pescadoresEntregam,
    especies_comerciais: especiesComerciais,
    perdas,
    perdas_por_especie: perdasPorEspecie,
    origem_pescado: origemPescado,
    relacoes_trabalho: relacoesTrabalho,
    mercado_local: buildMarketSection('LOCAL'),
    mercado_estadual: buildMarketSection('ESTADUAL'),
    mercado_nacional: buildMarketSection('NACIONAL'),
    mercado_internacional: buildMarketSection('INTERNACIONAL')
  };

  let createResponse = null;
  const req = { body: payload, usuario: { ID_usuario: null } };
  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      createResponse = data;
      return data;
    }
  };

  let createdId = null;
  const originalLog = console.log;
  console.log = (...args) => {
    const text = args.map((arg) => String(arg)).join(' ');
    const match = text.match(/ID:\s*(\d+)\)/);
    if (match) {
      createdId = Number(match[1]);
    }
    originalLog(...args);
  };

  try {
    await criarPeixaria(req, res);
  } catch (error) {
    if (!createdId) {
      throw error;
    }
    console.warn('Controller retornou erro apos o commit, mas a peixaria foi criada e sera validada pelos contadores.');
  } finally {
    console.log = originalLog;
  }

  createdId = createdId || createResponse?.data?.ID_peixaria;
  if (!createdId) {
    throw new Error('Nao foi possivel obter o ID da peixaria criada.');
  }

  const mercados = await PeixariaMercado.findAll({
    where: { ID_peixaria: createdId },
    attributes: ['ID_mercado', 'tipo_mercado'],
    raw: true
  });

  const mercadoLineCounts = await Promise.all(
    mercados.map(async (mercado) => ({
      tipo: String(mercado.tipo_mercado || '').toUpperCase(),
      count: await PeixariaMercadoLinha.count({ where: { ID_mercado: mercado.ID_mercado } })
    }))
  );

  const despesasCount = await PeixariaDespesa.count({ where: { ID_peixaria: createdId } });
  const fornecedoresCount = await PeixariaFornecedor.count({ where: { ID_peixaria: createdId } });
  const pescadoresLocalCount = await PeixariaPescadorFornecedor.count({ where: { ID_peixaria: createdId, tipo: 'LOCAL' } });
  const pescadoresEntregaCount = await PeixariaPescadorFornecedor.count({ where: { ID_peixaria: createdId, tipo: 'ENTREGA' } });
  const especiesCadastradasCount = await PeixariaEspecieComercial.count({ where: { ID_peixaria: createdId } });
  const perdasCount = await PeixariaPerda.count({ where: { ID_peixaria: createdId } });
  const perdasPorEspecieCount = await PeixariaPerdaPorEspecie.count({ where: { ID_peixaria: createdId } });
  const origemPescadoCount = await PeixariaOrigemPescado.count({ where: { ID_peixaria: createdId } });
  const relacoesCount = await PeixariaRelacaoTrabalho.count({ where: { ID_peixaria: createdId } });

  const mercadoLinesCount = mercadoLineCounts.reduce((total, item) => total + item.count, 0);

  const checks = {
    despesas: despesasCount === COUNT,
    fornecedores: fornecedoresCount === COUNT,
    pescadores_local: pescadoresLocalCount === COUNT,
    pescadores_entrega: pescadoresEntregaCount === COUNT,
    especies_comerciais: especiesCadastradasCount === COUNT,
    perdas: perdasCount === COUNT,
    perdas_por_especie: perdasPorEspecieCount === COUNT * 3,
    origem_pescado: origemPescadoCount === COUNT,
    relacoes_trabalho: relacoesCount === COUNT,
    mercados: mercados.length === 4,
    mercado_lines: mercadoLinesCount === COUNT * 4,
    mercado_lines_por_tipo: mercadoLineCounts.length === 4 && mercadoLineCounts.every((item) => item.count === COUNT),
    pescadores_total: pescadoresLocalCount + pescadoresEntregaCount === COUNT * 2
  };

  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
  if (failed.length) {
    throw new Error(`Validacao falhou nos campos: ${failed.join(', ')}`);
  }

  console.log(JSON.stringify({
    success: true,
    codigo,
    idPeixaria: createdId,
    counts: {
      despesas: despesasCount,
      fornecedores: fornecedoresCount,
      pescadores_local: pescadoresLocalCount,
      pescadores_entrega: pescadoresEntregaCount,
      especies_comerciais: especiesCadastradasCount,
      perdas: perdasCount,
      perdas_por_especie: perdasPorEspecieCount,
      origem_pescado: origemPescadoCount,
      relacoes_trabalho: relacoesCount,
      mercados: mercados.length,
      mercado_lines: mercadoLinesCount
    }
  }, null, 2));
}

main().catch((error) => {
  console.error('ERRO_CREATE_PEIXARIA_HEAVY:', error.message);
  process.exit(1);
});
