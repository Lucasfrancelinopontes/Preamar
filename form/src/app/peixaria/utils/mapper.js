const toText = (value) => {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text === '' ? null : text;
};

const toNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const normalized = String(value).replace(',', '.').trim();
  if (normalized === '') return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const toBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === null || value === '') return null;
  const normalized = String(value).trim().toLowerCase();
  if (['sim', 's', 'true', '1', 'yes', 'y'].includes(normalized)) return true;
  if (['nao', 'não', 'n', 'false', '0', 'no'].includes(normalized)) return false;
  return null;
};

const isPopulated = (record) => {
  if (!record || typeof record !== 'object') return false;
  return Object.values(record).some((value) => value !== undefined && value !== null && String(value).trim() !== '');
};

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

const mapMarketSection = (market = {}) => {
  const linhas = normalizeArray(market.linhas)
    .map((item) => ({
      especie: toText(item.especie),
      forma_comercializacao: toText(item.formaComercializacao),
      destino: toText(item.destino),
      volume_medio: toNumber(item.volumeMedio),
      preco_venda: toNumber(item.precoVenda)
    }))
    .filter(isPopulated);

  return {
    volume: toNumber(market.volume),
    valor: toNumber(market.valor),
    observacoes: toText(market.observacoes),
    linhas
  };
};

const mapPescadorFornecedorRows = (rows = [], tipo) =>
  normalizeArray(rows)
    .map((item) => ({
      tipo,
      nome: toText(item.nome),
      apelido: toText(item.apelido),
      comunidade: toText(item.comunidade),
      tipo_barco: toText(item.tipoBarco),
      numero_pescadores: toNumber(item.numeroPescadores),
      volume: toNumber(item.volume),
      volume_medio: toNumber(item.volumeMedio),
      regularidade: toText(item.regularidade)
    }))
    .filter(isPopulated);

const mapEspeciesComerciais = (especies = []) =>
  normalizeArray(especies)
    .map((item) => ({
      ID_especie: toNumber(item.ID_especie ?? item.id_especie ?? item.id ?? item.ID),
      especie: toText(item.especie),
      quantidade_fresco: toNumber(item.quantidadeFresco ?? item.quantidade),
      quantidade_congelado: toNumber(item.quantidadeCongelado),
      preco_compra: toNumber(item.precoCompra),
      preco_venda: toNumber(item.precoVenda ?? item.preco)
    }))
    .filter(isPopulated);

const mapPerdasPorEspecie = (items = []) =>
  normalizeArray(items).flatMap((item) => {
    const titulo = toText(item.titulo);
    return normalizeArray(item.linhas)
      .map((linha) => ({
        titulo,
        causa: toText(linha.causa),
        estimativa: toNumber(linha.estimativa),
        destino: toText(linha.destino)
      }))
      .filter(isPopulated);
  });

export const mapFormDataToPayload = (formData = {}) => {
  return {
    ID_municipio: toNumber(formData.municipioId ?? formData.ID_municipio ?? formData.municipio_id),
    responsavel: toText(formData.responsavel),
    contato: toText(formData.contato),
    municipio: toText(formData.municipio),
    localidade: toText(formData.localidade),
    nome: toText(formData.nome),
    apelido: toText(formData.apelido),
    naturalidade: toText(formData.naturalidade),
    sexo: toText(formData.sexo),
    idade: toNumber(formData.idade),
    atividade_principal: toText(formData.atividadePrincipal),
    atividade_secundaria: toText(formData.atividadeSecundaria),
    total_peixarias: toNumber(formData.totalPeixariasBoxes),
    quantos_possui: toNumber(formData.quantosPossui),
    estado_civil: toText(formData.estadoCivil),
    numero_familiares: toNumber(formData.numeroFamiliares),
    escolaridade: toText(formData.escolaridade),
    local_moradia: toText(formData.localMoradia),
    possui_registro_inss: toBoolean(formData.possuiRegistroINSS),
    filiado_colonia: toBoolean(formData.filiadoColonia),
    qual_colonia: toText(formData.qualColonia),
    participa_associacao: toBoolean(formData.participaAssociacao),
    qual_associacao: toText(formData.qualAssociacao),
    possui_carteira_pescador: toBoolean(formData.possuiCarteiraPescador),
    orgao_emissor_carteira: toText(formData.orgaoEmissorCarteira),
    possui_plano_saude: toBoolean(formData.possuiPlanoSaude),
    plano_saude_especificar: toText(formData.planoSaudeEspecificar),
    atividades_renda_familia: toText(formData.atividadesRendaFamilia),
    quem_trabalha_familia: toText(formData.quemTrabalhaFamilia),
    tempo_atividade: toNumber(formData.tempoAtividade),
    atividade_comercial: toText(formData.atividadeComercial),
    periodo_comercializacao: toText(formData.periodoComercializacao),
    forma_venda: toText(formData.formaVenda),
    transporte: toText(formData.transporte),
    despesas: normalizeArray(formData.despesas)
      .map((item) => ({
        id: item.id ?? item.ID_despesa ?? null,
        descricao: toText(item.descricao),
        quantidade: toNumber(item.quantidade),
        custo: toNumber(item.custo),
        frequencia: toText(item.frequencia)
      }))
      .filter(isPopulated),
    fornecedores: normalizeArray(formData.fornecedores)
      .map((item) => ({
        id: item.id ?? item.ID_fornecedor ?? null,
        nome: toText(item.nome),
        tipo: toText(item.tipo),
        telefone: toText(item.telefone)
      }))
      .filter(isPopulated),
    pescadores_locais: mapPescadorFornecedorRows((formData.pescadoresLocais || []).map((it) => ({ id: it.id ?? it.ID_pescador_fornecedor ?? null, ...it })), 'LOCAL'),
    pescadores_entregam: mapPescadorFornecedorRows((formData.pescadoresEntregam || []).map((it) => ({ id: it.id ?? it.ID_pescador_fornecedor ?? null, ...it })), 'ENTREGA'),
    especies_comerciais: [
      ...mapEspeciesComerciais(formData.especiesComerciais).map((it, idx) => ({ id: (formData.especiesComerciais && formData.especiesComerciais[idx] && (formData.especiesComerciais[idx].id ?? formData.especiesComerciais[idx].ID_especie_comercial)) || null, ...it })),
      ...mapEspeciesComerciais(formData.especies).map((it, idx) => ({ id: (formData.especies && formData.especies[idx] && (formData.especies[idx].id ?? formData.especies[idx].ID_especie_comercial)) || null, ...it }))
    ].filter(isPopulated),
    // payload key accepts both singular and plural to be tolerant with API
    origens_pescado: normalizeArray(formData.origemPescado).map((item) => ({
      tipo: toText(item.tipo),
      pescadores_locais: toText(item.pescadoresLocais),
      outras_localidades_pb: toText(item.outrasLocalidadesPB),
      outros_estados: toText(item.outrosEstados),
      outro: toText(item.outro)
    })).filter(isPopulated),
    perdas: normalizeArray(formData.perdas)
      .map((item) => ({
        id: item.id ?? item.ID_perda ?? null,
        descricao: toText(item.descricao),
        quantidade: toNumber(item.quantidade),
        causa: toText(item.causa)
      }))
      .filter(isPopulated),
    perdas_por_especie: mapPerdasPorEspecie(formData.perdasPorEspecie),
    origem_pescado: normalizeArray(formData.origemPescado)
      .map((item) => ({
        id: item.id ?? item.ID_origem_pescado ?? null,
        tipo: toText(item.tipo),
        pescadores_locais: toText(item.pescadoresLocais),
        outras_localidades_pb: toText(item.outrasLocalidadesPB),
        outros_estados: toText(item.outrosEstados),
        outro: toText(item.outro)
      }))
      .filter(isPopulated),
    relacoes_trabalho: normalizeArray(formData.relacoesTrabalho)
      .filter((item) => item !== undefined && item !== null && String(item).trim() !== '')
      .map((item) => (typeof item === 'string' ? item : { id: item.id ?? item.ID_relacao_trabalho ?? null, tipo: toText(item.tipo) })),

    mercado_local: mapMarketSection(formData.mercadoLocal),
    mercado_estadual: mapMarketSection(formData.mercadoEstadual),
    mercado_nacional: mapMarketSection(formData.mercadoNacional),
    mercado_internacional: mapMarketSection(formData.mercadoInternacional)
  };
};

const normalizeApiRecord = (data) => {
  if (!data || typeof data !== 'object') return {};
  return data.dataValues && typeof data.dataValues === 'object' ? { ...data.dataValues, ...data } : data;
};

const mapMarketRecords = (mercados = [], tipoEsperado) =>
  normalizeArray(mercados)
    .filter((item) => String(item.tipo_mercado || item.tipo || '').trim().toUpperCase() === tipoEsperado)
    .map((item) => ({
      volume: toText(item.volume),
      valor: toText(item.valor),
      observacoes: toText(item.observacoes),
      linhas: normalizeArray(item.linhas)
        .map((linha) => ({
          id: linha.id || linha.ID_mercado_linha || Date.now(),
          especie: toText(linha.especie),
          formaComercializacao: toText(linha.forma_comercializacao ?? linha.formaComercializacao),
          destino: toText(linha.destino),
          volumeMedio: toText(linha.volume_medio ?? linha.volumeMedio),
          precoVenda: toText(linha.preco_venda ?? linha.precoVenda)
        }))
        .filter(isPopulated)
    }));

export const mapApiToFormData = (apiData = {}) => {
  const data = normalizeApiRecord(apiData);

  const pescadoresFornecedores = normalizeArray(data.pescadores_fornecedores || data.pescadores_fornecedores || []);
  const locais = pescadoresFornecedores.filter((item) => String(item.tipo || '').toUpperCase() === 'LOCAL');
  const entregas = pescadoresFornecedores.filter((item) => String(item.tipo || '').toUpperCase() === 'ENTREGA');

  const booleanToSimNao = (val) => {
    if (val === true || String(val).toLowerCase() === 'true' || String(val).toLowerCase() === 'sim') return 'Sim';
    if (val === false || String(val).toLowerCase() === 'false' || String(val).toLowerCase() === 'nao' || String(val).toLowerCase() === 'não') return 'Não';
    return toText(val);
  };

  return {
    ID_municipio: data.ID_municipio ?? data.ID_municipio,
    responsavel: toText(data.responsavel),
    contato: toText(data.contato),
    municipio: toText(data.municipio),
    localidade: toText(data.localidade),
    nome: toText(data.nome),
    apelido: toText(data.apelido),
    naturalidade: toText(data.naturalidade),
    sexo: toText(data.sexo),
    idade: toText(data.idade),
    atividadePrincipal: toText(data.atividade_principal),
    atividadeSecundaria: toText(data.atividade_secundaria),
    totalPeixariasBoxes: toText(data.total_peixarias),
    quantosPossui: toText(data.quantos_possui),
    estadoCivil: toText(data.estado_civil),
    numeroFamiliares: toText(data.numero_familiares),
    escolaridade: toText(data.escolaridade),
    localMoradia: toText(data.local_moradia),
    possuiRegistroINSS: booleanToSimNao(data.possui_registro_inss),
    filiadoColonia: booleanToSimNao(data.filiado_colonia),
    qualColonia: toText(data.qual_colonia),
    participaAssociacao: booleanToSimNao(data.participa_associacao),
    qualAssociacao: toText(data.qual_associacao),
    possuiCarteiraPescador: booleanToSimNao(data.possui_carteira_pescador),
    orgaoEmissorCarteira: toText(data.orgao_emissor_carteira),
    possuiPlanoSaude: booleanToSimNao(data.possui_plano_saude),
    planoSaudeEspecificar: toText(data.plano_saude_especificar),
    atividadesRendaFamilia: toText(data.atividades_renda_familia),
    quemTrabalhaFamilia: toText(data.quem_trabalha_familia),
    tempoAtividade: toText(data.tempo_atividade),
    atividadeComercial: toText(data.atividade_comercial),
    periodoComercializacao: toText(data.periodo_comercializacao),
    formaVenda: toText(data.forma_venda),
    transporte: toText(data.transporte),
    despesas: normalizeArray(data.despesas)
      .map((item) => ({
        id: item.id || item.ID_despesa || Date.now(),
        descricao: toText(item.descricao),
        quantidade: toText(item.quantidade),
        custo: toText(item.custo),
        frequencia: toText(item.frequencia)
      })),
    fornecedores: normalizeArray(data.fornecedores)
      .map((item) => ({
        id: item.id || item.ID_fornecedor || Date.now(),
        nome: toText(item.nome),
        tipo: toText(item.tipo),
        telefone: toText(item.telefone)
      })),
    pescadoresLocais: locais.map((item) => ({
      id: item.id || item.ID_pescador_fornecedor || Date.now(),
      nome: toText(item.nome),
      apelido: toText(item.apelido),
      comunidade: toText(item.comunidade),
      tipoBarco: toText(item.tipo_barco),
      numeroPescadores: toText(item.numero_pescadores),
      volume: toText(item.volume),
      volumeMedio: toText(item.volume_medio),
      regularidade: toText(item.regularidade)
    })),
    pescadoresEntregam: entregas.map((item) => ({
      id: item.id || item.ID_pescador_fornecedor || Date.now(),
      nome: toText(item.nome),
      apelido: toText(item.apelido),
      comunidade: toText(item.comunidade),
      tipoBarco: toText(item.tipo_barco),
      numeroPescadores: toText(item.numero_pescadores),
      volume: toText(item.volume),
      volumeMedio: toText(item.volume_medio),
      regularidade: toText(item.regularidade)
    })),
    especiesComerciais: normalizeArray(data.especies_comerciais)
      .map((item) => ({
        id: item.id || item.ID_especie_comercial || Date.now(),
        especie: toText(item.especie),
        quantidadeFresco: toText(item.quantidade_fresco),
        quantidadeCongelado: toText(item.quantidade_congelado),
        precoCompra: toText(item.preco_compra),
        precoVenda: toText(item.preco_venda)
      })),
    perdas: normalizeArray(data.perdas)
      .map((item) => ({
        id: item.id || item.ID_perda || Date.now(),
        descricao: toText(item.descricao),
        quantidade: toText(item.quantidade),
        causa: toText(item.causa)
      })),
    perdasPorEspecie: normalizeArray(data.perdas_por_especie)
      .map((item) => ({
        id: item.id || item.ID_perda_por_especie || Date.now(),
        titulo: toText(item.titulo),
        linhas: normalizeArray(item.linhas)
          .map((linha) => ({
            id: linha.id || linha.ID_perda_por_especie_linha || Date.now(),
            causa: toText(linha.causa),
            estimativa: toText(linha.estimativa),
            destino: toText(linha.destino)
          }))
      })),
    origemPescado: normalizeArray(data.origens_pescado)
      .map((item) => ({
        id: item.id || item.ID_origem_pescado || Date.now(),
        tipo: toText(item.tipo),
        pescadoresLocais: toText(item.pescadores_locais),
        outrasLocalidadesPB: toText(item.outras_localidades_pb),
        outrosEstados: toText(item.outros_estados),
        outro: toText(item.outro)
      })),
    relacoesTrabalho: normalizeArray(data.relacoes_trabalho || data.relacoes)
      .map((item) => (typeof item === 'string' ? toText(item) : toText(item.tipo))).filter(Boolean),
    mercadoLocal: mapMarketRecords(data.mercados, 'LOCAL')[0] || { volume: '', valor: '', observacoes: '', linhas: [] },
    mercadoEstadual: mapMarketRecords(data.mercados, 'ESTADUAL')[0] || { volume: '', valor: '', observacoes: '', linhas: [] },
    mercadoNacional: mapMarketRecords(data.mercados, 'NACIONAL')[0] || { volume: '', valor: '', observacoes: '', linhas: [] },
    mercadoInternacional: mapMarketRecords(data.mercados, 'INTERNACIONAL')[0] || { volume: '', valor: '', observacoes: '', linhas: [] }
  };
};
