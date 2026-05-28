import XLSX from 'xlsx';
import { Op } from 'sequelize';
import { Embarcacao, Municipio } from '../models/index.js';

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
  nome_embarcacao: ['nome', 'nome embarcacao', 'nome da embarcacao', 'nome_da_embarcacao', 'embarcacao nome'],
  codigo_embarcacao: ['codigo', 'codigo embarcacao', 'codigo_embarcacao', 'código', 'código embarcação', 'cod embarcacao', 'numero_da_embarcacao'],
  proprietario: ['proprietario', 'proprietário', 'dono', 'responsavel', 'nome_do_dono'],
  apelido_propietario: ['apelido proprietario', 'apelido do proprietario', 'apelido', 'apelido proprietário', 'apelido_do_dono'],
  municipio: ['municipio', 'município', 'local_1'],
  localidade: ['localidade', 'comunidade'],
  tipo: ['tipo', 'tipo embarcacao', 'tipo embarcação', 'tipo_de_embarcacao'],
  tipo_outro: ['tipo outro', 'outro tipo', 'tipo alternativo'],
  comprimento: ['comprimento', 'comprimento m', 'comprimento (m)', 'comprimento metros', 'comprimento_m'],
  numero_tripulantes: ['numero tripulantes', 'número tripulantes', 'tripulantes', 'qtde tripulantes', 'quantidade tripulantes', 'tripulacao_mp'],
  capacidade: ['capacidade', 'capacidade estocagem', 'capacidade de estocagem', 'capacidade (kg)', 'capacidade kg', 'capacidade_estocagem_kg'],
  hp: ['hp', 'forca do motor', 'força do motor', 'motor hp', 'forca_do_motor_hp'],
  possui: ['possui', 'armazenamento', 'equipamento'],
  cpf_proprietario: ['cpf proprietario', 'cpf do proprietario', 'cpf proprietário', 'cpf'],
  rgp: ['rgp', 'numero_de_inscricao_no_rgp_ppp_ou_raep_mp']
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
  'numero_tripulantes',
  'capacidade',
  'hp',
  'possui',
  'cpf_proprietario',
  'rgp'
];

const HEADER_MAP = {
  nome_embarcacao: [
    'nome da embarcacao',
    'nome da embarcação',
    'nome embarcacao',
    'nome embarcação',
    'nome_da_embarcacao',
    'embarcação',
    'nome'
  ],
  codigo_embarcacao: [
    'codigo embarcacao',
    'codigo embarcação',
    'código embarcacao',
    'código embarcação',
    'codigo_embarcacao',
    'codigo',
    'código',
    'cod embarcacao',
    'cod embarcação',
    'numero_da_embarcacao'
  ],
  proprietario: ['proprietario', 'proprietário', 'dono', 'responsavel', 'responsável', 'nome_do_dono'],
  apelido_propietario: ['apelido proprietario', 'apelido do proprietario', 'apelido proprietário', 'apelido', 'nick', 'apelido_do_dono'],
  municipio: ['municipio', 'município', 'local_1'],
  localidade: ['localidade', 'comunidade', 'bairro'],
  tipo: ['tipo de embarcacao', 'tipo de embarcação', 'tipo embarcacao', 'tipo embarcação', 'tipo_de_embarcacao', 'embarcacao_tipo', 'embarcação_tipo', 'tipo'],
  tipo_outro: ['tipo outro', 'outro tipo', 'tipo alternativo'],
  comprimento: ['comprimento', 'comprimento m', 'comprimento (m)', 'comprimento metros', 'comprimento_m'],
  numero_tripulantes: ['numero tripulantes', 'número tripulantes', 'tripulantes', 'qtde tripulantes', 'quantidade tripulantes', 'tripulacao_mp'],
  capacidade: ['capacidade', 'capacidade estocagem', 'capacidade de estocagem', 'capacidade (kg)', 'capacidade kg', 'capacidade_estocagem_kg'],
  hp: ['hp', 'forca do motor', 'força do motor', 'motor hp', 'forca_do_motor_hp'],
  possui: ['possui', 'armazenamento', 'equipamento'],
  cpf_proprietario: ['cpf proprietario', 'cpf do proprietario', 'cpf proprietário', 'cpf'],
  rgp: ['rgp', 'numero_de_inscricao_no_rgp_ppp_ou_raep_mp']
};

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

const limparValor = (valor) => {
  if (valor === undefined || valor === null || String(valor).trim() === '') {
    return null;
  }

  return String(valor).trim();
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

const contarCelulasPreenchidas = (row) => valoresDaLinha(row).filter((value) => !valorVazio(value)).length;

const isMatchHeader = (normalizedHeader, normalizedAlias) => {
  if (!normalizedHeader || !normalizedAlias) return false;
  return normalizedHeader === normalizedAlias;
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

const normalizarTexto = (value) => limparValor(value);

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
  if (!tipo) return 'outro';

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

let municipiosIndexadosPromise = null;

const extrairLocalidades = (localidades) => {
  if (!Array.isArray(localidades)) return [];

  return localidades
    .map((item) => ({
      localidade: normalizarTextoParaComparacao(item?.localidade),
      localidadeCode: normalizarTextoParaComparacao(item?.localidadeCode)
    }))
    .filter((item) => item.localidade || item.localidadeCode);
};

const carregarMunicipiosIndexados = async () => {
  if (!municipiosIndexadosPromise) {
    municipiosIndexadosPromise = Municipio.findAll({
      attributes: ['ID_municipio', 'municipio', 'municipioCode', 'localidades'],
      raw: true
    }).then((municipios) => municipios.map((municipio) => ({
      ID_municipio: municipio.ID_municipio,
      municipio: municipio.municipio,
      municipioCode: municipio.municipioCode,
      municipioNorm: normalizarTextoParaComparacao(municipio.municipio),
      municipioCodeNorm: normalizarTextoParaComparacao(municipio.municipioCode),
      localidades: extrairLocalidades(municipio.localidades)
    })));
  }

  return municipiosIndexadosPromise;
};

const resolverMunicipioPlanilha = async (municipio, localidade) => {
  const municipioNormalizado = normalizarTextoParaComparacao(municipio);
  const localidadeNormalizada = normalizarTextoParaComparacao(localidade);

  if (!municipioNormalizado && !localidadeNormalizada) {
    return { ID_municipio: null, municipio: null, municipioCode: null, encontrado: false, metodo: null };
  }

  const municipios = await carregarMunicipiosIndexados();

  const municipioAliases = {
    acau: ['pitimbu'],
    pitimbu: ['pitimbu']
  };

  const municipioCandidatos = Array.from(new Set([
    municipioNormalizado,
    ...(municipioAliases[municipioNormalizado] || [])
  ].filter(Boolean)));

  const porNome = municipios.find((item) => item.municipioNorm && municipioCandidatos.includes(item.municipioNorm));

  if (porNome) {
    return {
      ID_municipio: porNome.ID_municipio,
      municipio: porNome.municipio,
      municipioCode: porNome.municipioCode,
      encontrado: true,
      metodo: 'nome'
    };
  }

  const porCodigo = municipios.find((item) => item.municipioCodeNorm && municipioCandidatos.includes(item.municipioCodeNorm));
  if (porCodigo) {
    return {
      ID_municipio: porCodigo.ID_municipio,
      municipio: porCodigo.municipio,
      municipioCode: porCodigo.municipioCode,
      encontrado: true,
      metodo: 'codigo'
    };
  }

  if (localidadeNormalizada) {
    const porLocalidade = municipios.find((item) => item.localidades.some((loc) => (loc.localidade && loc.localidade === localidadeNormalizada) || (loc.localidadeCode && loc.localidadeCode === localidadeNormalizada)));
    if (porLocalidade) {
      return {
        ID_municipio: porLocalidade.ID_municipio,
        municipio: porLocalidade.municipio,
        municipioCode: porLocalidade.municipioCode,
        encontrado: true,
        metodo: 'localidade'
      };
    }
  }

  return {
    ID_municipio: null,
    municipio: limparValor(municipio),
    municipioCode: null,
    encontrado: false,
    metodo: null
  };
};

const extrairObjetoLinha = (linhaOriginal = {}) => {
  const linha = {};

  for (const [chave, valor] of Object.entries(linhaOriginal)) {
    const campo = mapearHeaderParaCampo(chave) || mapearHeaderParaCampo(String(chave).replace(/[_-]/g, ' ')) || null;
    if (campo) {
      linha[campo] = valor;
    }
  }

  return linha;
};

const lerPrimeiroValor = (...valores) => {
  for (const valor of valores) {
    const normalizado = limparValor(valor);
    if (normalizado) return normalizado;
  }

  return null;
};

const ehValorPlaceholder = (value) => {
  const comparacao = normalizarComparacao(value);
  if (!comparacao) return true;

  // Treat common placeholders as empty, but do NOT treat "nn" as placeholder —
  // user wants "nn" preserved as a real name.
  return /^(0+|sem|s\/n|sn|na|n\/a|\.|\-+)$/i.test(comparacao);
};

const pareceCodigoEmbarcacao = (value) => {
  const comparacao = normalizarComparacao(value);
  if (!comparacao || ehValorPlaceholder(comparacao)) return false;

  const digitos = (comparacao.match(/[0-9]/g) || []).length;
  const letras = (comparacao.match(/[a-z]/g) || []).length;

  if (/^[0-9][0-9a-z\-\/]*$/.test(comparacao) && digitos >= 4) return true;
  if (/^[a-z]?-?[0-9]{4,}[0-9a-z\-\/]*$/.test(comparacao) && digitos >= letras) return true;
  return digitos >= 6 && digitos >= letras;
};

const normalizarNomeEmbarcacao = (nome) => {
  const texto = limparValor(nome);
  if (!texto || ehValorPlaceholder(texto)) return null;

  if (pareceCodigoEmbarcacao(texto)) {
    return null;
  }

  return texto;
};

const normalizarCodigoEmbarcacao = (codigo) => {
  const texto = limparValor(codigo);
  if (!texto || ehValorPlaceholder(texto)) return null;
  return texto;
};

const montarMensagemAjuste = (campo, original, normalizado) => {
  const rotulos = {
    tipo: 'Tipo normalizado',
    possui: 'Armazenamento normalizado',
    comprimento: 'Comprimento ajustado',
    capacidade: 'Capacidade ajustada',
    hp: 'HP ajustado',
    numero_tripulantes: 'Tripulantes ajustados',
    ID_municipio: 'Município resolvido',
    codigo_embarcacao: 'Código limpo',
    nome_embarcacao: 'Nome limpo',
    proprietario: 'Proprietário limpo'
  };

  const rotulo = rotulos[campo] || 'Campo ajustado';
  return `${rotulo}: "${original}" → "${normalizado}"`;
};

const avaliarLinha = async (linhaOriginal = {}, indice = 0) => {
  const dadosOriginais = extrairObjetoLinha(linhaOriginal);
  const avisos = [];
  const erros = [];
  const ajustes = [];

  const originalNome = lerPrimeiroValor(
    dadosOriginais.nome_embarcacao,
    linhaOriginal?.nome_embarcacao,
    linhaOriginal?.nome_da_embarcacao,
    linhaOriginal?.nome,
    linhaOriginal?.embarcacao
  );
  const originalCodigo = lerPrimeiroValor(
    dadosOriginais.codigo_embarcacao,
    linhaOriginal?.codigo_embarcacao,
    linhaOriginal?.numero_da_embarcacao,
    linhaOriginal?.codigo,
    linhaOriginal?.código,
    linhaOriginal?.cod_embarcacao
  );
  const originalProprietario = lerPrimeiroValor(
    dadosOriginais.proprietario,
    linhaOriginal?.proprietario,
    linhaOriginal?.nome_do_dono,
    linhaOriginal?.dono,
    linhaOriginal?.responsavel,
    linhaOriginal?.responsável
  );
  const originalApelido = lerPrimeiroValor(
    dadosOriginais.apelido_propietario,
    linhaOriginal?.apelido_propietario,
    linhaOriginal?.apelido_do_dono,
    linhaOriginal?.apelido
  );
  const originalMunicipio = lerPrimeiroValor(
    dadosOriginais.municipio,
    linhaOriginal?.municipio,
    linhaOriginal?.local_1
  );
  const originalLocalidade = lerPrimeiroValor(
    dadosOriginais.localidade,
    linhaOriginal?.localidade,
    linhaOriginal?.comunidade,
    linhaOriginal?.bairro
  );
  const originalTipo = limparValor(dadosOriginais.tipo);
  const originalTipoOutro = limparValor(dadosOriginais.tipo_outro);
  const originalPossui = limparValor(dadosOriginais.possui);
  const originalNumeroTripulantes = limparValor(dadosOriginais.numero_tripulantes);
  const originalCpf = limparValor(dadosOriginais.cpf_proprietario);
  const originalRgp = limparValor(dadosOriginais.rgp);

  const nomeNormalizado = normalizarNomeEmbarcacao(originalNome);
  const codigo_embarcacao = normalizarCodigoEmbarcacao(originalCodigo);

  // Preserve an explicitly empty original name as blank. If the original cell
  // was empty, leave the name empty (don't generate a placeholder name).
  const nome_embarcacao = originalNome === null
    ? ''
    : (nomeNormalizado || `Embarcação sem nome ${indice + 1}`);

  if (originalNome === null) {
    // keep blank, no automatic name generated
  } else if (!nomeNormalizado) {
    avisos.push('Nome da embarcação gerado automaticamente');
    ajustes.push({ campo: 'nome_embarcacao', original: '', normalizado: nome_embarcacao, motivo: 'Gerado automaticamente' });
  } else if (nome_embarcacao !== String(dadosOriginais.nome_embarcacao || '').trim()) {
    avisos.push(montarMensagemAjuste('nome_embarcacao', dadosOriginais.nome_embarcacao, nome_embarcacao));
    ajustes.push({ campo: 'nome_embarcacao', original: dadosOriginais.nome_embarcacao, normalizado: nome_embarcacao, motivo: 'Limpeza de espaços' });
  }

  if (originalCodigo && !codigo_embarcacao) {
    avisos.push(montarMensagemAjuste('codigo_embarcacao', originalCodigo, ''));
    ajustes.push({ campo: 'codigo_embarcacao', original: originalCodigo, normalizado: null, motivo: 'Código inválido ignorado' });
  } else if (codigo_embarcacao && codigo_embarcacao !== String(dadosOriginais.codigo_embarcacao || '').trim()) {
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

  const municipioResolvido = await resolverMunicipioPlanilha(originalMunicipio, originalLocalidade);
  if (municipioResolvido.encontrado) {
    avisos.push(`Município resolvido para ${municipioResolvido.municipio} (${municipioResolvido.metodo})`);
    ajustes.push({
      campo: 'ID_municipio',
      original: originalMunicipio,
      normalizado: municipioResolvido.ID_municipio,
      motivo: `Resolvido por ${municipioResolvido.metodo}`
    });
    if (municipioResolvido.municipio && municipioResolvido.municipio !== originalMunicipio) {
      avisos.push(montarMensagemAjuste('municipio', originalMunicipio, municipioResolvido.municipio));
      ajustes.push({
        campo: 'municipio',
        original: originalMunicipio,
        normalizado: municipioResolvido.municipio,
        motivo: 'Normalizado pela tabela municipios'
      });
    }
  } else if (originalMunicipio) {
    avisos.push(`Município não localizado na base: ${originalMunicipio}`);
  }

  const municipioFinal = municipioResolvido.encontrado && municipioResolvido.municipio
    ? municipioResolvido.municipio
    : originalMunicipio;

  const tipoNormalizado = normalizarTipo(originalTipo);
  if (!originalTipo) {
    avisos.push('Tipo da embarcação preenchido automaticamente como outro');
    ajustes.push({ campo: 'tipo', original: '', normalizado: tipoNormalizado, motivo: 'Gerado automaticamente' });
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
    avisos.push(montarMensagemAjuste('possui', originalPossui, ''));
    ajustes.push({ campo: 'possui', original: originalPossui, normalizado: null, motivo: 'Valor não reconhecido' });
  } else if (possuiNormalizado && normalizarComparacao(originalPossui) !== normalizarComparacao(possuiNormalizado)) {
    avisos.push(montarMensagemAjuste('possui', originalPossui, possuiNormalizado));
    ajustes.push({ campo: 'possui', original: originalPossui, normalizado: possuiNormalizado, motivo: 'Normalização por heurística' });
  } else if (possuiEhAliasNulo) {
    avisos.push(montarMensagemAjuste('possui', originalPossui, ''));
    ajustes.push({ campo: 'possui', original: originalPossui, normalizado: null, motivo: 'Removido por equivalência a vazio' });
  }

  const comprimento = parseNumeroDecimal(dadosOriginais.comprimento);
  if (limparValor(dadosOriginais.comprimento) !== null && comprimento === null) {
    avisos.push(montarMensagemAjuste('comprimento', dadosOriginais.comprimento, ''));
    ajustes.push({ campo: 'comprimento', original: dadosOriginais.comprimento, normalizado: null, motivo: 'Valor numérico inválido ignorado' });
  } else if (comprimento !== null && String(dadosOriginais.comprimento).trim() !== String(comprimento).replace('.', ',')) {
    avisos.push(montarMensagemAjuste('comprimento', dadosOriginais.comprimento, comprimento));
    ajustes.push({ campo: 'comprimento', original: dadosOriginais.comprimento, normalizado: comprimento, motivo: 'Número convertido' });
  }

  const capacidade = parseNumeroDecimal(dadosOriginais.capacidade);
  if (limparValor(dadosOriginais.capacidade) !== null && capacidade === null) {
    avisos.push(montarMensagemAjuste('capacidade', dadosOriginais.capacidade, ''));
    ajustes.push({ campo: 'capacidade', original: dadosOriginais.capacidade, normalizado: null, motivo: 'Valor numérico inválido ignorado' });
  } else if (capacidade !== null && String(dadosOriginais.capacidade).trim() !== String(capacidade).replace('.', ',')) {
    avisos.push(montarMensagemAjuste('capacidade', dadosOriginais.capacidade, capacidade));
    ajustes.push({ campo: 'capacidade', original: dadosOriginais.capacidade, normalizado: capacidade, motivo: 'Número convertido' });
  }

  const hp = parseNumeroDecimal(dadosOriginais.hp);
  if (limparValor(dadosOriginais.hp) !== null && hp === null) {
    avisos.push(montarMensagemAjuste('hp', dadosOriginais.hp, ''));
    ajustes.push({ campo: 'hp', original: dadosOriginais.hp, normalizado: null, motivo: 'Valor numérico inválido ignorado' });
  } else if (hp !== null && String(dadosOriginais.hp).trim() !== String(hp).replace('.', ',')) {
    avisos.push(montarMensagemAjuste('hp', dadosOriginais.hp, hp));
    ajustes.push({ campo: 'hp', original: dadosOriginais.hp, normalizado: hp, motivo: 'Número convertido' });
  }

  const numero_tripulantes = parseNumeroDecimal(originalNumeroTripulantes);
  if (limparValor(dadosOriginais.numero_tripulantes) !== null && numero_tripulantes === null) {
    avisos.push(montarMensagemAjuste('numero_tripulantes', dadosOriginais.numero_tripulantes, ''));
    ajustes.push({ campo: 'numero_tripulantes', original: dadosOriginais.numero_tripulantes, normalizado: null, motivo: 'Valor numérico inválido ignorado' });
  } else if (numero_tripulantes !== null && String(dadosOriginais.numero_tripulantes).trim() !== String(numero_tripulantes).replace('.', ',')) {
    avisos.push(montarMensagemAjuste('numero_tripulantes', dadosOriginais.numero_tripulantes, numero_tripulantes));
    ajustes.push({ campo: 'numero_tripulantes', original: dadosOriginais.numero_tripulantes, normalizado: numero_tripulantes, motivo: 'Número convertido' });
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

  const dadosNormalizados = {
    nome_embarcacao,
    codigo_embarcacao,
    proprietario,
    apelido_propietario,
    municipio: municipioFinal,
    localidade,
    ID_municipio: municipioResolvido.ID_municipio,
    tipo: tipoNormalizado,
    tipo_outro,
    comprimento,
    numero_tripulantes,
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
      numero_tripulantes: dadosOriginais.numero_tripulantes ?? '',
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

const lerPlanilhaComoLinhas = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true, raw: false });
  const primeiraAba = workbook.SheetNames[0];

  if (!primeiraAba) {
    throw new Error('Arquivo sem planilhas válidas');
  }

  const worksheet = workbook.Sheets[primeiraAba];
  return {
    workbook,
    worksheet,
    rows: XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false })
  };
};

const converterRowsEmRegistros = (rows = []) => {
  const headersBrutos = Array.isArray(rows[0]) ? rows[0] : [];
  const headersNormalizados = headersBrutos.map((header) => normalizarHeader(header));
  const headers = headersNormalizados.filter(Boolean);

  const linhasAposCabecalho = rows.slice(1);
  const linhasVaziasDescartadas = linhasAposCabecalho.filter((row) => !Array.isArray(row) || !row.some((cell) => String(cell || '').trim())).length;

  const registros = linhasAposCabecalho
    .filter((row) => Array.isArray(row) && row.some((cell) => String(cell || '').trim()))
    .map((row) => {
      const obj = {};

      headersNormalizados.forEach((header, index) => {
        if (!header) return;
        obj[header] = row[index] ?? '';
      });

      return obj;
    });

  return { headers, registros, linhasVaziasDescartadas };
};

export const processarArquivoImportacao = async (buffer, originalname = '') => {
  const extensao = originalname.split('.').pop()?.toLowerCase();
  if (!['xlsx', 'csv'].includes(extensao)) {
    throw new Error('Formato inválido. Envie um arquivo .xlsx ou .csv');
  }

  const { rows } = lerPlanilhaComoLinhas(buffer);

  if (!Array.isArray(rows) || !rows.length) {
    throw new Error('Arquivo sem dados válidos');
  }

  const { headers, registros, linhasVaziasDescartadas } = converterRowsEmRegistros(rows);

  if (!Array.isArray(registros) || !registros.length) {
    throw new Error('Arquivo sem dados válidos');
  }

  console.log('HEADERS', headers);
  console.log('PRIMEIRO REGISTRO', registros[0]);
  console.log('TOTAL LINHAS ORIGINAIS', rows.length);
  console.log('LINHAS VAZIAS DESCARTADAS', linhasVaziasDescartadas);
  console.log('TOTAL REGISTROS', registros.length);

  const linhas = [];

  for (const [indice, linha] of registros.entries()) {
    linhas.push(await avaliarLinha(linha, indice));
  }

  const colunas = headers.filter(Boolean);

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
        const mensagem = `Código duplicado no arquivo: ${codigo}`;
        if (!linha.avisos.includes(mensagem)) linha.avisos.push(mensagem);
        if (linha.status === 'valid') linha.status = 'warning';
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
          const mensagem = `Código já existente no banco: ${codigo}`;
          if (!linha.avisos.includes(mensagem)) linha.avisos.push(mensagem);
          if (linha.status === 'valid') linha.status = 'warning';
        }
      }
    }
  }

  return {
    arquivo: originalname,
    colunas,
    registros: linhas,
    linhas,
    resumo: {
      ...construirResumo(linhas),
      total: linhas.length,
      ignoradas: linhas.filter((linha) => linha.status === 'invalid').length,
      vaziasDescartadas: linhasVaziasDescartadas,
      linhasVaziasDescartadas
    },
    headersDetectados: headers,
    primeiraLinhaUtil: registros[0] || null,
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
    ]),
    debug: {
      headers,
      primeiraLinhaUtil: registros[0] || null,
      totalRegistros: registros.length,
      linhasVaziasDescartadas
    }
  };
};

export const confirmarImportacaoEmbarcacoes = async (linhasSelecionadas = []) => {
  const linhasValidas = [];
  const logs = [];

  for (const [index, linha] of linhasSelecionadas.entries()) {
    const normalizado = linha?.normalizado || linha?.dados_normalizados || linha?.data || linha || null;
    if (!normalizado) {
      logs.push({ linha: index + 1, nivel: 'error', mensagem: 'Linha sem dados normalizados' });
      continue;
    }

    const avaliacao = await avaliarLinha(normalizado, index);
    if (avaliacao.status === 'invalid') {
      logs.push({ linha: index + 1, nivel: 'error', mensagem: avaliacao.erros.join('; ') });
      continue;
    }

    linhasValidas.push(avaliacao.normalizado);
    logs.push({
      linha: index + 1,
      nivel: 'info',
      mensagem: `Linha preparada para importação: ${avaliacao.normalizado.nome_embarcacao || 'sem nome'}${avaliacao.normalizado.ID_municipio ? ` | municipioId=${avaliacao.normalizado.ID_municipio}` : ''}`
    });
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
      fields: [...CAMPOS_IMPORTACAO, 'ID_municipio']
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
