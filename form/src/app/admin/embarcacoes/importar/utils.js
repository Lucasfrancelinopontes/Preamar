import * as XLSX from 'xlsx';

export const TIPOS_VALIDOS = ['catraia', 'caico', 'jangada', 'boteLancha', 'canoa', 'barco', 'outro'];
export const POSSUI_VALIDOS = ['urna', 'caixaTermica', 'pescadoInNatura'];

const TIPO_ALIASES = {
  bote: 'boteLancha',
  lancha: 'boteLancha',
  'lancha pequena': 'boteLancha',
  'lancha grande': 'boteLancha',
  janga: 'jangada',
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
  nome_embarcacao: ['nome da embarcacao', 'nome da embarcação', 'nome embarcacao', 'nome embarcação', 'embarcacao', 'embarcação', 'nome'],
  codigo_embarcacao: ['codigo embarcacao', 'codigo embarcação', 'código embarcacao', 'código embarcação', 'codigo', 'código', 'cod embarcacao', 'cod embarcação'],
  proprietario: ['proprietario', 'proprietário', 'dono', 'responsavel', 'responsável'],
  apelido_propietario: ['apelido proprietario', 'apelido do proprietario', 'apelido proprietário', 'apelido', 'nick'],
  municipio: ['municipio', 'município'],
  localidade: ['localidade', 'comunidade', 'bairro'],
  tipo: ['tipo de embarcacao', 'tipo de embarcação', 'tipo embarcacao', 'tipo embarcação', 'embarcacao_tipo', 'embarcação_tipo', 'tipo'],
  tipo_outro: ['tipo outro', 'outro tipo', 'tipo alternativo'],
  comprimento: ['comprimento', 'comprimento m', 'comprimento (m)', 'comprimento metros'],
  capacidade: ['capacidade', 'capacidade estocagem', 'capacidade de estocagem', 'capacidade (kg)', 'capacidade kg'],
  hp: ['hp', 'forca do motor', 'força do motor', 'motor hp'],
  possui: ['possui', 'armazenamento', 'equipamento'],
  cpf_proprietario: ['cpf proprietario', 'cpf do proprietario', 'cpf proprietário', 'cpf'],
  rgp: ['rgp']
};

const HEADER_MAP = CABECALHOS;

const normalizarHeader = (value) => {
  if (value === null || value === undefined) return '';

  return String(value)
    .replace(/[\r\n]+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

const valorVazio = (value) => !String(value ?? '').trim();

const linhaVazia = (row) => {
  if (!row) return true;
  if (Array.isArray(row)) {
    return row.every((value) => valorVazio(value));
  }

  if (typeof row === 'object') {
    return Object.values(row).every((value) => valorVazio(value));
  }

  return valorVazio(row);
};

const valoresDaLinha = (row) => {
  if (Array.isArray(row)) return row;
  if (row && typeof row === 'object') return Object.values(row);
  return [];
};

const contarCelulasPreenchidas = (row) => {
  return valoresDaLinha(row).filter((value) => !valorVazio(value)).length;
};

const isMatchHeader = (normalizedHeader, normalizedAlias) => {
  if (!normalizedHeader || !normalizedAlias) return false;
  return normalizedHeader === normalizedAlias || normalizedHeader.includes(normalizedAlias) || normalizedAlias.includes(normalizedHeader);
};

const mapearHeaderParaCampo = (header) => {
  const normalized = normalizarHeader(header);
  if (!normalized) return null;

  for (const [campo, aliases] of Object.entries(HEADER_MAP)) {
    if (isMatchHeader(normalized, normalizarHeader(campo))) {
      return campo;
    }

    for (const alias of aliases) {
      if (isMatchHeader(normalized, normalizarHeader(alias))) {
        return campo;
      }
    }
  }

  return null;
};

const rowHasRecognizedField = (rowValues = []) => valoresDaLinha(rowValues).some((value) => mapearHeaderParaCampo(value));

const encontrarLinhaCabecalho = (rows = []) => {
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const preenchidas = contarCelulasPreenchidas(row);
    if (preenchidas < 2) continue;

    const valores = valoresDaLinha(row);
    const reconhecidas = valores.filter((value) => mapearHeaderParaCampo(value)).length;
    if (reconhecidas >= 1 || rowHasRecognizedField(valores)) {
      return index;
    }
  }

  return 0;
};

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

const normalizarTextoComparavel = (value) => normalizarComparacao(normalizarTexto(value));

export const parseNumeroDecimal = (value) => {
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

export const normalizarTipo = (value) => {
  const tipo = normalizarTextoComparavel(value);
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

export const normalizarPossui = (value) => {
  const possui = normalizarTextoComparavel(value);
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

const extrairLinha = (linha = {}) => {
  const resultado = {};

  for (const [chave, valor] of Object.entries(linha)) {
    const campo = mapearHeaderParaCampo(chave) || mapearHeaderParaCampo(String(chave).replace(/[_-]/g, ' ')) || null;
    if (campo) {
      resultado[campo] = valor;
    }
  }

  return resultado;
};

const mensagemAjuste = (campo, original, normalizado) => {
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

export const avaliarLinhaImportacao = (linhaOriginal = {}, indice = 0) => {
  const dadosOriginais = extrairLinha(linhaOriginal);
  const avisos = [];
  const erros = [];
  const ajustes = [];

  const nome_embarcacao = normalizarTexto(dadosOriginais.nome_embarcacao);
  if (!nome_embarcacao) {
    erros.push('Nome da embarcação é obrigatório');
  } else if (nome_embarcacao !== String(dadosOriginais.nome_embarcacao || '').trim()) {
    avisos.push(mensagemAjuste('nome_embarcacao', dadosOriginais.nome_embarcacao, nome_embarcacao));
    ajustes.push({ campo: 'nome_embarcacao', original: dadosOriginais.nome_embarcacao, normalizado: nome_embarcacao, motivo: 'Limpeza de espaços' });
  }

  const codigo_embarcacao = normalizarTexto(dadosOriginais.codigo_embarcacao);
  if (codigo_embarcacao && codigo_embarcacao !== String(dadosOriginais.codigo_embarcacao || '').trim()) {
    avisos.push(mensagemAjuste('codigo_embarcacao', dadosOriginais.codigo_embarcacao, codigo_embarcacao));
    ajustes.push({ campo: 'codigo_embarcacao', original: dadosOriginais.codigo_embarcacao, normalizado: codigo_embarcacao, motivo: 'Limpeza de espaços' });
  }

  const proprietario = normalizarTexto(dadosOriginais.proprietario);
  if (proprietario && proprietario !== String(dadosOriginais.proprietario || '').trim()) {
    avisos.push(mensagemAjuste('proprietario', dadosOriginais.proprietario, proprietario));
    ajustes.push({ campo: 'proprietario', original: dadosOriginais.proprietario, normalizado: proprietario, motivo: 'Limpeza de espaços' });
  }

  const apelido_propietario = normalizarTexto(dadosOriginais.apelido_propietario);
  if (apelido_propietario && apelido_propietario !== String(dadosOriginais.apelido_propietario || '').trim()) {
    avisos.push(mensagemAjuste('apelido_propietario', dadosOriginais.apelido_propietario, apelido_propietario));
    ajustes.push({ campo: 'apelido_propietario', original: dadosOriginais.apelido_propietario, normalizado: apelido_propietario, motivo: 'Limpeza de espaços' });
  }

  const municipio = normalizarTexto(dadosOriginais.municipio);
  if (municipio && municipio !== String(dadosOriginais.municipio || '').trim()) {
    avisos.push(mensagemAjuste('municipio', dadosOriginais.municipio, municipio));
    ajustes.push({ campo: 'municipio', original: dadosOriginais.municipio, normalizado: municipio, motivo: 'Limpeza de espaços' });
  }

  const localidade = normalizarTexto(dadosOriginais.localidade);
  if (localidade && localidade !== String(dadosOriginais.localidade || '').trim()) {
    avisos.push(mensagemAjuste('localidade', dadosOriginais.localidade, localidade));
    ajustes.push({ campo: 'localidade', original: dadosOriginais.localidade, normalizado: localidade, motivo: 'Limpeza de espaços' });
  }

  const tipo = normalizarTipo(dadosOriginais.tipo);
  if (!tipo) {
    erros.push('Tipo não reconhecido');
    erros.push('Tipo da embarcação é obrigatório');
  } else if (normalizarComparacao(dadosOriginais.tipo) !== normalizarComparacao(tipo)) {
    avisos.push(mensagemAjuste('tipo', dadosOriginais.tipo, tipo));
    ajustes.push({ campo: 'tipo', original: dadosOriginais.tipo, normalizado: tipo, motivo: 'Normalização por heurística' });
  }

  const tipo_outro = normalizarTexto(dadosOriginais.tipo_outro);
  if (tipo_outro && tipo_outro !== String(dadosOriginais.tipo_outro || '').trim()) {
    avisos.push(mensagemAjuste('tipo_outro', dadosOriginais.tipo_outro, tipo_outro));
    ajustes.push({ campo: 'tipo_outro', original: dadosOriginais.tipo_outro, normalizado: tipo_outro, motivo: 'Limpeza de espaços' });
  }

  const possuiChave = normalizarComparacao(dadosOriginais.possui);
  const possuiEhAliasNulo = Object.prototype.hasOwnProperty.call(POSSUI_ALIASES, possuiChave) && POSSUI_ALIASES[possuiChave] === null;
  const possui = normalizarPossui(dadosOriginais.possui);
  if (dadosOriginais.possui && !possui && !possuiEhAliasNulo) {
    erros.push('Armazenamento não reconhecido');
  } else if (possui && normalizarComparacao(dadosOriginais.possui) !== normalizarComparacao(possui)) {
    avisos.push(mensagemAjuste('possui', dadosOriginais.possui, possui));
    ajustes.push({ campo: 'possui', original: dadosOriginais.possui, normalizado: possui, motivo: 'Normalização por heurística' });
  } else if (possuiEhAliasNulo) {
    avisos.push(mensagemAjuste('possui', dadosOriginais.possui, ''));
    ajustes.push({ campo: 'possui', original: dadosOriginais.possui, normalizado: null, motivo: 'Removido por equivalência a vazio' });
  }

  const comprimento = parseNumeroDecimal(dadosOriginais.comprimento);
  if (dadosOriginais.comprimento !== null && dadosOriginais.comprimento !== undefined && String(dadosOriginais.comprimento).trim() !== '' && comprimento === null) {
    erros.push('Comprimento inválido');
  } else if (comprimento !== null && String(dadosOriginais.comprimento).trim() !== String(comprimento).replace('.', ',')) {
    avisos.push(mensagemAjuste('comprimento', dadosOriginais.comprimento, comprimento));
    ajustes.push({ campo: 'comprimento', original: dadosOriginais.comprimento, normalizado: comprimento, motivo: 'Número convertido' });
  }

  const capacidade = parseNumeroDecimal(dadosOriginais.capacidade);
  if (dadosOriginais.capacidade !== null && dadosOriginais.capacidade !== undefined && String(dadosOriginais.capacidade).trim() !== '' && capacidade === null) {
    erros.push('Capacidade inválida');
  } else if (capacidade !== null && String(dadosOriginais.capacidade).trim() !== String(capacidade).replace('.', ',')) {
    avisos.push(mensagemAjuste('capacidade', dadosOriginais.capacidade, capacidade));
    ajustes.push({ campo: 'capacidade', original: dadosOriginais.capacidade, normalizado: capacidade, motivo: 'Número convertido' });
  }

  const hp = parseNumeroDecimal(dadosOriginais.hp);
  if (dadosOriginais.hp !== null && dadosOriginais.hp !== undefined && String(dadosOriginais.hp).trim() !== '' && hp === null) {
    erros.push('HP inválido');
  } else if (hp !== null && String(dadosOriginais.hp).trim() !== String(hp).replace('.', ',')) {
    avisos.push(mensagemAjuste('hp', dadosOriginais.hp, hp));
    ajustes.push({ campo: 'hp', original: dadosOriginais.hp, normalizado: hp, motivo: 'Número convertido' });
  }

  const cpf_proprietario = normalizarTexto(dadosOriginais.cpf_proprietario);
  if (cpf_proprietario && cpf_proprietario !== String(dadosOriginais.cpf_proprietario || '').trim()) {
    avisos.push(mensagemAjuste('cpf_proprietario', dadosOriginais.cpf_proprietario, cpf_proprietario));
    ajustes.push({ campo: 'cpf_proprietario', original: dadosOriginais.cpf_proprietario, normalizado: cpf_proprietario, motivo: 'Limpeza de espaços' });
  }

  const rgp = normalizarTexto(dadosOriginais.rgp);
  if (rgp && rgp !== String(dadosOriginais.rgp || '').trim()) {
    avisos.push(mensagemAjuste('rgp', dadosOriginais.rgp, rgp));
    ajustes.push({ campo: 'rgp', original: dadosOriginais.rgp, normalizado: rgp, motivo: 'Limpeza de espaços' });
  }

  const normalizado = {
    nome_embarcacao,
    codigo_embarcacao,
    proprietario,
    apelido_propietario,
    municipio,
    localidade,
    tipo,
    tipo_outro,
    comprimento,
    capacidade,
    hp,
    possui,
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
    normalizado,
    status,
    avisos,
    erros,
    ajustes,
    selecionado: status !== 'invalid'
  };
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

const coletarCabecalhos = (linhasBrutas = []) => {
  const colunas = new Set();
  for (const linha of linhasBrutas) {
    if (!linha || typeof linha !== 'object') continue;
    Object.keys(linha).forEach((chave) => colunas.add(chave));
  }
  return Array.from(colunas);
};

const lerPlanilhaComoMatriz = async (file) => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true, raw: false });
  const planilha = workbook.SheetNames[0];

  if (!planilha) {
    throw new Error('Arquivo sem planilhas válidas');
  }

  const worksheet = workbook.Sheets[planilha];
  return {
    workbook,
    worksheet,
    linhasBrutas: XLSX.utils.sheet_to_json(worksheet, { header: 'A', defval: '', raw: false, blankrows: false })
  };
};

export const analisarArquivoImportacao = async (file) => {
  if (!file) {
    throw new Error('Selecione um arquivo .xlsx ou .csv');
  }

  const extensao = file.name.split('.').pop()?.toLowerCase();
  if (!['xlsx', 'csv'].includes(extensao)) {
    throw new Error('Formato inválido. Envie um arquivo .xlsx ou .csv');
  }

  const { workbook, worksheet, linhasBrutas } = await lerPlanilhaComoMatriz(file);

  if (!Array.isArray(linhasBrutas) || !linhasBrutas.length) {
    throw new Error('Arquivo sem dados válidos');
  }

  const primeiraLinha = linhasBrutas.find((linha) => !linhaVazia(linha)) || {};
  const headerRowIndex = encontrarLinhaCabecalho(linhasBrutas);
  const headersDetectados = valoresDaLinha(linhasBrutas[headerRowIndex] || {});

  console.log('headersDetectados', headersDetectados);
  console.log('primeiraLinha', primeiraLinha);

  const dados = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false, range: headerRowIndex });
  console.log(dados[0]);
  console.log(typeof dados[0]);

  if (!Array.isArray(dados) || !dados.length) {
    throw new Error('Arquivo sem dados válidos');
  }
  const linhas = [];
  let linhasVaziasDescartadas = 0;

  dados.forEach((linha, indice) => {
    if (linhaVazia(linha)) {
      linhasVaziasDescartadas += 1;
      return;
    }

    linhas.push(avaliarLinhaImportacao(linha, indice));
  });

  const colunas = headersDetectados.map((header) => normalizarHeader(header)).filter(Boolean);
  const linhasValidas = linhas.filter((linha) => linha.status !== 'invalid').length;
  const linhasInvalidas = linhas.filter((linha) => linha.status === 'invalid').length;

  return {
    arquivo: file.name,
    colunas,
    linhas,
    resumo: {
      ...construirResumo(linhas),
      total: linhas.length,
      validas: linhasValidas,
      ignoradas: linhasInvalidas,
      vaziasDescartadas: linhasVaziasDescartadas,
      linhasVaziasDescartadas
    },
    headersDetectados: headersDetectados.map((header) => normalizarHeader(header)),
    primeiraLinha: valoresDaLinha(primeiraLinha).map((valor) => String(valor ?? '').trim()),
    debug: {
      headersDetectados: headersDetectados.map((header) => normalizarHeader(header)),
      primeiraLinha: valoresDaLinha(primeiraLinha).map((valor) => String(valor ?? '').trim()),
      dadosPrimeiroRegistro: dados[0] || null,
      linhasVaziasDescartadas
    }
  };
};

export const gerarRelatorioErrosCsv = (linhas = []) => {
  const cabecalho = ['Linha', 'Nome original', 'Nome final', 'Tipo original', 'Tipo final', 'Status', 'Avisos', 'Erros'];
  const registros = linhas.map((linha) => [
    linha.linha,
    linha.original?.nome_embarcacao || '',
    linha.normalizado?.nome_embarcacao || '',
    linha.original?.tipo || '',
    linha.normalizado?.tipo || '',
    linha.status || '',
    (linha.avisos || []).join(' | '),
    (linha.erros || []).join(' | ')
  ]);

  const csv = [cabecalho, ...registros]
    .map((linha) => linha.map((valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`).join(';'))
    .join('\n');

  return `\uFEFF${csv}`;
};

export const gerarTemplateImportacaoXlsx = () => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['Nome', 'Código', 'Proprietário', 'Apelido Proprietário', 'Município', 'Tipo', 'Comprimento', 'Capacidade', 'HP', 'Possui'],
    ['Barca Azul', 'BA-001', 'João da Silva', 'Seu João', 'João Pessoa', 'Jangá', '8,5', '500', '6,5', 'Caixa térmica'],
    ['Barca XPTO', 'XP-002', 'Maria Costa', 'Dona Maria', 'Cabedelo', 'Lancha pequena', '9', '650', '12', 'Pescado in natura']
  ]);

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Embarcacoes');
  const arrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([arrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
};

export const baixarArquivo = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};