import XLSX from 'xlsx';
import { Op } from 'sequelize';
import { Embarcacao } from '../models/index.js';

export const TIPOS_VALIDOS = ['catraia', 'caico', 'jangada', 'boteLancha', 'canoa', 'barco', 'outro'];
export const POSSUI_VALIDOS = ['urna', 'caixaTermica', 'pescadoInNatura'];

const TIPO_ALIASES = {
  bote: 'boteLancha',
  lancha: 'boteLancha',
  'lancha pequena': 'boteLancha',
  'lancha grande': 'boteLancha',
  janga: 'jangada',
  jangaa: 'jangada',
  outros: 'outro',
  traineira: 'outro',
  chalana: 'outro'
};

const POSSUI_ALIASES = {
  caixa: 'caixaTermica',
  'caixa termica': 'caixaTermica',
  'caixa térmica': 'caixaTermica',
  termica: 'caixaTermica',
  urna: 'urna',
  'pescado in natura': 'pescadoInNatura',
  in_natura: 'pescadoInNatura',
  'in natura': 'pescadoInNatura',
  pescado: 'pescadoInNatura',
  gelo: null,
  sem: null,
  nenhum: null,
  nada: null
};

const CABECALHOS = {
  nome_embarcacao: ['nome', 'nome embarcacao', 'nome da embarcacao', 'embarcacao', 'embarcacao nome'],
  codigo_embarcacao: ['codigo', 'codigo embarcacao', 'código', 'código embarcação', 'cod embarcacao'],
  proprietario: ['proprietario', 'proprietário', 'dono', 'responsavel'],
  apelido_propietario: ['apelido proprietario', 'apelido do proprietario', 'apelido', 'apelido proprietário'],
  municipio: ['municipio', 'município'],
  localidade: ['localidade', 'comunidade'],
  tipo: ['tipo', 'tipo embarcacao', 'tipo embarcação'],
  tipo_outro: ['tipo outro', 'outro tipo', 'tipo alternativo'],
  comprimento: ['comprimento', 'comprimento m', 'comprimento (m)', 'comprimento metros'],
  capacidade: ['capacidade', 'capacidade estocagem', 'capacidade de estocagem', 'capacidade (kg)', 'capacidade kg'],
  hp: ['hp', 'forca do motor', 'força do motor', 'motor hp'],
  possui: ['possui', 'armazenamento', 'equipamento'],
  cpf_proprietario: ['cpf proprietario', 'cpf do proprietario', 'cpf proprietário'],
  rgp: ['rgp']
};

const CAMPOS_IMPORTACAO = [
  'nome_embarcacao',
  'codigo_embarcacao',
  'proprietario',
  'apelido_propietario',
  'municipio',
  'localidade',
  'tipo',
  'tipo_outro',
  'comprimento',
  'capacidade',
  'hp',
  'possui',
  'cpf_proprietario',
  'rgp'
];

const normalizarComparacao = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s\-_./\\]+/g, ' ')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ');
};

const normalizarTexto = (value) => {
  if (value === null || value === undefined) return null;
  const texto = String(value).trim();
  return texto || null;
};

const normalizarTextoParaComparacao = (value) => normalizarComparacao(normalizarTexto(value));

const converterNumero = (value) => {
  if (value === null || value === undefined || value === '') return null;

  const bruto = String(value).trim();
  if (!bruto) return null;

  const temVirgula = bruto.includes(',');
  const temPonto = bruto.includes('.');
  let normalizado = bruto;

  if (temVirgula && temPonto) {
    const ultimoSeparador = Math.max(bruto.lastIndexOf('.'), bruto.lastIndexOf(','));
    const decimal = bruto.slice(ultimoSeparador + 1);
    const inteiro = bruto.slice(0, ultimoSeparador).replace(/[.,]/g, '');
    normalizado = `${inteiro}.${decimal}`;
  } else if (temVirgula) {
    normalizado = bruto.replace(/\./g, '').replace(',', '.');
  } else {
    normalizado = bruto.replace(/,/g, '.');
  }

  const numero = Number(normalizado);
  return Number.isNaN(numero) ? null : numero;
};

export const parseNumeroDecimal = (value) => converterNumero(value);

const normalizarTipoBase = (value) => {
  const tipo = normalizarTextoParaComparacao(value);
  if (!tipo) return null;

  const canonical = TIPOS_VALIDOS.find((item) => normalizarComparacao(item) === tipo);
  if (canonical) return canonical;

  if (Object.prototype.hasOwnProperty.call(TIPO_ALIASES, tipo)) {
    return TIPO_ALIASES[tipo];
  }

  const heuristicas = [
    { chave: 'boteLancha', termos: ['lancha', 'bote', 'lanche'] },
    { chave: 'jangada', termos: ['janga', 'jangad'] },
    { chave: 'caico', termos: ['caic'] },
    { chave: 'catraia', termos: ['catrai'] },
    { chave: 'canoa', termos: ['canoa'] },
    { chave: 'barco', termos: ['barco'] },
    { chave: 'outro', termos: ['outro', 'outros', 'traineira', 'chalana'] }
  ];

  for (const heuristica of heuristicas) {
    if (heuristica.termos.some((termo) => tipo.includes(termo))) {
      return heuristica.chave;
    }
  }

  return null;
};

const normalizarPossuiBase = (value) => {
  const possui = normalizarTextoParaComparacao(value);
  if (!possui) return null;

  const canonical = POSSUI_VALIDOS.find((item) => normalizarComparacao(item) === possui);
  if (canonical) return canonical;

  if (Object.prototype.hasOwnProperty.call(POSSUI_ALIASES, possui)) {
    return POSSUI_ALIASES[possui];
  }

  if (possui.includes('caixa') || possui.includes('termica')) return 'caixaTermica';
  if (possui.includes('urna')) return 'urna';
  if (possui.includes('pescado') || possui.includes('natura')) return 'pescadoInNatura';
  if (possui.includes('gelo') || possui.includes('sem')) return null;

  return null;
};

export const normalizarTipo = (value) => normalizarTipoBase(value);
export const normalizarPossui = (value) => normalizarPossuiBase(value);

const mapearCabecalho = (label) => {
  const chave = normalizarComparacao(label);
  if (!chave) return null;

  for (const [campo, variantes] of Object.entries(CABECALHOS)) {
    if (normalizarComparacao(campo) === chave) return campo;
    if (variantes.some((variante) => normalizarComparacao(variante) === chave || chave.includes(normalizarComparacao(variante)))) {
      return campo;
    }
  }

  return null;
};

const extrairObjetoLinha = (linhaOriginal = {}) => {
  const linha = {};

  for (const [chave, valor] of Object.entries(linhaOriginal)) {
    const campo = mapearCabecalho(chave) || mapearCabecalho(String(chave).replace(/[_-]/g, ' ')) || null;
    if (campo) {
      linha[campo] = valor;
    }
  }

  return linha;
};

const montarMensagemAjuste = (campo, original, normalizado) => {
  const rotulos = {
    tipo: 'Tipo normalizado',
    possui: 'Armazenamento normalizado',
    comprimento: 'Comprimento ajustado',
    capacidade: 'Capacidade ajustada',
    hp: 'HP ajustado',
    codigo_embarcacao: 'Código limpo',
    nome_embarcacao: 'Nome limpo',
    proprietario: 'Proprietário limpo'
  };

  const rotulo = rotulos[campo] || 'Campo ajustado';
  return `${rotulo}: "${original}" → "${normalizado}"`;
};

const avaliarLinha = (linhaOriginal = {}, indice = 0) => {
  const dadosOriginais = extrairObjetoLinha(linhaOriginal);
  const avisos = [];
  const erros = [];
  const ajustes = [];

  const originalNome = normalizarTexto(dadosOriginais.nome_embarcacao);
  const originalCodigo = normalizarTexto(dadosOriginais.codigo_embarcacao);
  const originalProprietario = normalizarTexto(dadosOriginais.proprietario);
  const originalApelido = normalizarTexto(dadosOriginais.apelido_propietario);
  const originalMunicipio = normalizarTexto(dadosOriginais.municipio);
  const originalLocalidade = normalizarTexto(dadosOriginais.localidade);
  const originalTipo = normalizarTexto(dadosOriginais.tipo);
  const originalTipoOutro = normalizarTexto(dadosOriginais.tipo_outro);
  const originalPossui = normalizarTexto(dadosOriginais.possui);
  const originalCpf = normalizarTexto(dadosOriginais.cpf_proprietario);
  const originalRgp = normalizarTexto(dadosOriginais.rgp);

  const nome_embarcacao = originalNome;
  if (!nome_embarcacao) {
    erros.push('Nome da embarcação é obrigatório');
  } else if (nome_embarcacao !== String(dadosOriginais.nome_embarcacao || '').trim()) {
    avisos.push(montarMensagemAjuste('nome_embarcacao', dadosOriginais.nome_embarcacao, nome_embarcacao));
    ajustes.push({ campo: 'nome_embarcacao', original: dadosOriginais.nome_embarcacao, normalizado: nome_embarcacao, motivo: 'Limpeza de espaços' });
  }

  const codigo_embarcacao = originalCodigo;
  if (codigo_embarcacao && codigo_embarcacao !== String(dadosOriginais.codigo_embarcacao || '').trim()) {
    avisos.push(montarMensagemAjuste('codigo_embarcacao', dadosOriginais.codigo_embarcacao, codigo_embarcacao));
    ajustes.push({ campo: 'codigo_embarcacao', original: dadosOriginais.codigo_embarcacao, normalizado: codigo_embarcacao, motivo: 'Limpeza de espaços' });
  }

  const proprietario = originalProprietario;
  if (proprietario && proprietario !== String(dadosOriginais.proprietario || '').trim()) {
    avisos.push(montarMensagemAjuste('proprietario', dadosOriginais.proprietario, proprietario));
    ajustes.push({ campo: 'proprietario', original: dadosOriginais.proprietario, normalizado: proprietario, motivo: 'Limpeza de espaços' });
  }

  const apelido_propietario = originalApelido;
  if (apelido_propietario && apelido_propietario !== String(dadosOriginais.apelido_propietario || '').trim()) {
    avisos.push(montarMensagemAjuste('apelido_propietario', dadosOriginais.apelido_propietario, apelido_propietario));
    ajustes.push({ campo: 'apelido_propietario', original: dadosOriginais.apelido_propietario, normalizado: apelido_propietario, motivo: 'Limpeza de espaços' });
  }

  const municipio = originalMunicipio;
  if (municipio && municipio !== String(dadosOriginais.municipio || '').trim()) {
    avisos.push(montarMensagemAjuste('municipio', dadosOriginais.municipio, municipio));
    ajustes.push({ campo: 'municipio', original: dadosOriginais.municipio, normalizado: municipio, motivo: 'Limpeza de espaços' });
  }

  const localidade = originalLocalidade;
  if (localidade && localidade !== String(dadosOriginais.localidade || '').trim()) {
    avisos.push(montarMensagemAjuste('localidade', dadosOriginais.localidade, localidade));
    ajustes.push({ campo: 'localidade', original: dadosOriginais.localidade, normalizado: localidade, motivo: 'Limpeza de espaços' });
  }

  const tipoNormalizado = normalizarTipo(originalTipo);
  if (!tipoNormalizado) {
    erros.push('Tipo não reconhecido');
  } else if (normalizarComparacao(originalTipo) !== normalizarComparacao(tipoNormalizado)) {
    avisos.push(montarMensagemAjuste('tipo', originalTipo, tipoNormalizado));
    ajustes.push({ campo: 'tipo', original: originalTipo, normalizado: tipoNormalizado, motivo: 'Normalização por heurística' });
  }

  const tipo_outro = originalTipoOutro;
  if (tipo_outro && tipo_outro !== String(dadosOriginais.tipo_outro || '').trim()) {
    avisos.push(montarMensagemAjuste('tipo_outro', dadosOriginais.tipo_outro, tipo_outro));
    ajustes.push({ campo: 'tipo_outro', original: dadosOriginais.tipo_outro, normalizado: tipo_outro, motivo: 'Limpeza de espaços' });
  }

  const possuiChave = normalizarComparacao(originalPossui);
  const possuiEhAliasNulo = Object.prototype.hasOwnProperty.call(POSSUI_ALIASES, possuiChave) && POSSUI_ALIASES[possuiChave] === null;
  const possuiNormalizado = normalizarPossui(originalPossui);
  if (originalPossui && !possuiNormalizado && !possuiEhAliasNulo) {
    erros.push('Armazenamento não reconhecido');
  } else if (possuiNormalizado && normalizarComparacao(originalPossui) !== normalizarComparacao(possuiNormalizado)) {
    avisos.push(montarMensagemAjuste('possui', originalPossui, possuiNormalizado));
    ajustes.push({ campo: 'possui', original: originalPossui, normalizado: possuiNormalizado, motivo: 'Normalização por heurística' });
  } else if (possuiEhAliasNulo) {
    avisos.push(montarMensagemAjuste('possui', originalPossui, ''));
    ajustes.push({ campo: 'possui', original: originalPossui, normalizado: null, motivo: 'Removido por equivalência a vazio' });
  }

  const comprimento = parseNumeroDecimal(dadosOriginais.comprimento);
  if (dadosOriginais.comprimento !== null && dadosOriginais.comprimento !== undefined && String(dadosOriginais.comprimento).trim() !== '' && comprimento === null) {
    erros.push('Comprimento inválido');
  } else if (comprimento !== null && String(dadosOriginais.comprimento).trim() !== String(comprimento).replace('.', ',')) {
    avisos.push(montarMensagemAjuste('comprimento', dadosOriginais.comprimento, comprimento));
    ajustes.push({ campo: 'comprimento', original: dadosOriginais.comprimento, normalizado: comprimento, motivo: 'Número convertido' });
  }

  const capacidade = parseNumeroDecimal(dadosOriginais.capacidade);
  if (dadosOriginais.capacidade !== null && dadosOriginais.capacidade !== undefined && String(dadosOriginais.capacidade).trim() !== '' && capacidade === null) {
    erros.push('Capacidade inválida');
  } else if (capacidade !== null && String(dadosOriginais.capacidade).trim() !== String(capacidade).replace('.', ',')) {
    avisos.push(montarMensagemAjuste('capacidade', dadosOriginais.capacidade, capacidade));
    ajustes.push({ campo: 'capacidade', original: dadosOriginais.capacidade, normalizado: capacidade, motivo: 'Número convertido' });
  }

  const hp = parseNumeroDecimal(dadosOriginais.hp);
  if (dadosOriginais.hp !== null && dadosOriginais.hp !== undefined && String(dadosOriginais.hp).trim() !== '' && hp === null) {
    erros.push('HP inválido');
  } else if (hp !== null && String(dadosOriginais.hp).trim() !== String(hp).replace('.', ',')) {
    avisos.push(montarMensagemAjuste('hp', dadosOriginais.hp, hp));
    ajustes.push({ campo: 'hp', original: dadosOriginais.hp, normalizado: hp, motivo: 'Número convertido' });
  }

  const cpf_proprietario = originalCpf;
  if (cpf_proprietario && cpf_proprietario !== String(dadosOriginais.cpf_proprietario || '').trim()) {
    avisos.push(montarMensagemAjuste('cpf_proprietario', dadosOriginais.cpf_proprietario, cpf_proprietario));
    ajustes.push({ campo: 'cpf_proprietario', original: dadosOriginais.cpf_proprietario, normalizado: cpf_proprietario, motivo: 'Limpeza de espaços' });
  }

  const rgp = originalRgp;
  if (rgp && rgp !== String(dadosOriginais.rgp || '').trim()) {
    avisos.push(montarMensagemAjuste('rgp', dadosOriginais.rgp, rgp));
    ajustes.push({ campo: 'rgp', original: dadosOriginais.rgp, normalizado: rgp, motivo: 'Limpeza de espaços' });
  }

  if (!tipoNormalizado) {
    erros.push('Tipo da embarcação é obrigatório');
  }

  const dadosNormalizados = {
    nome_embarcacao,
    codigo_embarcacao,
    proprietario,
    apelido_propietario,
    municipio,
    localidade,
    tipo: tipoNormalizado,
    tipo_outro,
    comprimento,
    capacidade,
    hp,
    possui: possuiNormalizado,
    cpf_proprietario,
    rgp
  };

  const status = erros.length > 0 ? 'invalid' : (avisos.length > 0 ? 'warning' : 'valid');

  return {
    linha: indice + 1,
    original: {
      nome_embarcacao: dadosOriginais.nome_embarcacao ?? '',
      codigo_embarcacao: dadosOriginais.codigo_embarcacao ?? '',
      proprietario: dadosOriginais.proprietario ?? '',
      apelido_propietario: dadosOriginais.apelido_propietario ?? '',
      municipio: dadosOriginais.municipio ?? '',
      localidade: dadosOriginais.localidade ?? '',
      tipo: dadosOriginais.tipo ?? '',
      tipo_outro: dadosOriginais.tipo_outro ?? '',
      comprimento: dadosOriginais.comprimento ?? '',
      capacidade: dadosOriginais.capacidade ?? '',
      hp: dadosOriginais.hp ?? '',
      possui: dadosOriginais.possui ?? '',
      cpf_proprietario: dadosOriginais.cpf_proprietario ?? '',
      rgp: dadosOriginais.rgp ?? ''
    },
    normalizado: dadosNormalizados,
    status,
    avisos,
    erros,
    ajustes,
    selecionado: status !== 'invalid'
  };
};

const determinarColunasDaPlanilha = (dadosBrutos = []) => {
  if (!Array.isArray(dadosBrutos) || dadosBrutos.length === 0) return [];
  const colunas = new Set();

  for (const linha of dadosBrutos) {
    if (!linha || typeof linha !== 'object') continue;
    for (const chave of Object.keys(linha)) {
      colunas.add(chave);
    }
  }

  return Array.from(colunas);
};

const lerArquivoPlanilha = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true, raw: false });
  const primeiraAba = workbook.SheetNames[0];

  if (!primeiraAba) {
    throw new Error('Arquivo sem planilhas válidas');
  }

  const worksheet = workbook.Sheets[primeiraAba];
  const linhas = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
  return linhas;
};

const construirResumo = (linhas) => {
  const total = linhas.length;
  const validos = linhas.filter((linha) => linha.status === 'valid').length;
  const corrigidos = linhas.filter((linha) => linha.status === 'warning').length;
  const invalidos = linhas.filter((linha) => linha.status === 'invalid').length;
  const selecionados = linhas.filter((linha) => linha.selecionado).length;

  return {
    total,
    validos,
    corrigidos,
    invalidos,
    selecionados
  };
};

export const processarArquivoImportacao = async (buffer, originalname = '') => {
  const extensao = originalname.split('.').pop()?.toLowerCase();
  if (!['xlsx', 'csv'].includes(extensao)) {
    throw new Error('Formato inválido. Envie um arquivo .xlsx ou .csv');
  }

  const linhasBrutas = lerArquivoPlanilha(buffer);
  const colunas = determinarColunasDaPlanilha(linhasBrutas);
  const linhas = linhasBrutas.map((linha, indice) => avaliarLinha(linha, indice));

  const codigos = linhas
    .map((linha) => linha.normalizado.codigo_embarcacao)
    .filter(Boolean);

  const contagemCodigos = new Map();
  for (const codigo of codigos) {
    contagemCodigos.set(codigo, (contagemCodigos.get(codigo) || 0) + 1);
  }

  const codigosDuplicadosNoArquivo = new Set(
    Array.from(contagemCodigos.entries())
      .filter(([, quantidade]) => quantidade > 1)
      .map(([codigo]) => codigo)
  );

  if (codigosDuplicadosNoArquivo.size > 0) {
    for (const linha of linhas) {
      const codigo = linha.normalizado.codigo_embarcacao;
      if (codigo && codigosDuplicadosNoArquivo.has(codigo)) {
        if (linha.status !== 'invalid') linha.status = 'invalid';
        const mensagem = `Código duplicado no arquivo: ${codigo}`;
        if (!linha.erros.includes(mensagem)) linha.erros.push(mensagem);
        linha.selecionado = false;
      }
    }
  }

  const codigosUnicos = Array.from(new Set(codigos.filter(Boolean)));
  if (codigosUnicos.length > 0) {
    const existentes = await Embarcacao.findAll({
      where: { codigo_embarcacao: { [Op.in]: codigosUnicos } },
      attributes: ['codigo_embarcacao'],
      raw: true
    });

    const existentesSet = new Set(existentes.map((item) => item.codigo_embarcacao));

    if (existentesSet.size > 0) {
      for (const linha of linhas) {
        const codigo = linha.normalizado.codigo_embarcacao;
        if (codigo && existentesSet.has(codigo)) {
          if (linha.status !== 'invalid') linha.status = 'invalid';
          const mensagem = `Código já existente no banco: ${codigo}`;
          if (!linha.erros.includes(mensagem)) linha.erros.push(mensagem);
          linha.selecionado = false;
        }
      }
    }
  }

  return {
    arquivo: originalname,
    colunas,
    linhas,
    resumo: construirResumo(linhas),
    logs: linhas.flatMap((linha) => [
      ...linha.ajustes.map((ajuste) => ({
        linha: linha.linha,
        nivel: 'info',
        mensagem: `${ajuste.campo}: ${ajuste.original ?? ''} -> ${ajuste.normalizado ?? ''}`
      })),
      ...linha.erros.map((erro) => ({
        linha: linha.linha,
        nivel: 'error',
        mensagem: erro
      }))
    ])
  };
};

export const confirmarImportacaoEmbarcacoes = async (linhasSelecionadas = []) => {
  const linhasValidas = [];
  const logs = [];

  for (const [index, linha] of linhasSelecionadas.entries()) {
    const normalizado = linha?.normalizado || linha?.dados_normalizados || linha?.data || null;
    if (!normalizado) {
      logs.push({ linha: index + 1, nivel: 'error', mensagem: 'Linha sem dados normalizados' });
      continue;
    }

    const avaliacao = avaliarLinha(normalizado, index);
    if (avaliacao.status === 'invalid') {
      logs.push({ linha: index + 1, nivel: 'error', mensagem: avaliacao.erros.join('; ') });
      continue;
    }

    linhasValidas.push(avaliacao.normalizado);
    logs.push({ linha: index + 1, nivel: 'info', mensagem: `Linha preparada para importação: ${avaliacao.normalizado.nome_embarcacao || 'sem nome'}` });
  }

  if (linhasValidas.length === 0) {
    return {
      inseridas: 0,
      ignoradas: 0,
      logs
    };
  }

  const codigos = linhasValidas.map((item) => item.codigo_embarcacao).filter(Boolean);
  let codigosExistentes = new Set();

  if (codigos.length > 0) {
    const existentes = await Embarcacao.findAll({
      where: { codigo_embarcacao: { [Op.in]: Array.from(new Set(codigos)) } },
      attributes: ['codigo_embarcacao'],
      raw: true
    });
    codigosExistentes = new Set(existentes.map((item) => item.codigo_embarcacao));
  }

  const payloadFinal = [];
  const ignoradas = [];
  const codigosNoLote = new Set();

  for (const linha of linhasValidas) {
    const codigo = linha.codigo_embarcacao;

    if (codigo && codigosExistentes.has(codigo)) {
      ignoradas.push({ nome_embarcacao: linha.nome_embarcacao, motivo: `Código já existente no banco: ${codigo}` });
      logs.push({ nivel: 'warning', mensagem: `Ignorada por duplicidade no banco: ${linha.nome_embarcacao || codigo}` });
      continue;
    }

    if (codigo && codigosNoLote.has(codigo)) {
      ignoradas.push({ nome_embarcacao: linha.nome_embarcacao, motivo: `Código duplicado no lote: ${codigo}` });
      logs.push({ nivel: 'warning', mensagem: `Ignorada por duplicidade no lote: ${linha.nome_embarcacao || codigo}` });
      continue;
    }

    if (codigo) codigosNoLote.add(codigo);
    payloadFinal.push(linha);
  }

  const criadas = payloadFinal.length > 0
    ? await Embarcacao.bulkCreate(payloadFinal, {
      ignoreDuplicates: true,
      validate: true,
      fields: CAMPOS_IMPORTACAO
    })
    : [];

  logs.push({ nivel: 'info', mensagem: `bulkCreate executado com ${payloadFinal.length} registro(s)` });

  return {
    inseridas: criadas.length,
    ignoradas: ignoradas.length + (linhasValidas.length - payloadFinal.length),
    criadas,
    ignoradasDetalhadas: ignoradas,
    logs
  };
};
