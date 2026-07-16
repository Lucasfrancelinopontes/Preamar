/**
 * mapper.js
 * Transforma o formData do CadastroPescador no payload esperado pelo backend.
 */
export function mapFormDataToPayload(formData) {
  // ── coleta ────────────────────────────────────────────────────────────────
  const coleta = {
    codigoColeta:  formData.codigoColeta  || null,
    codigoFoto:    formData.codigoFoto    || null,
    ID_municipio:  formData.municipio ? Number(formData.municipio) : null,
    localidade:    formData.localidade    || null,
    coletor:       formData.coletor       || null,
    digitador:     formData.digitador     || null,
    dataColeta:    formData.dataColeta    || null,
    dataDigitacao: formData.dataDigitador || null,
    observacoes:   formData.observacoes   || null
  };

  // ── pescador ──────────────────────────────────────────────────────────────
  const pescador = {
    nome:                  formData.nome               || null,
    apelido:               formData.apelido            || null,
    cpf:                   formData.cpf                || null, // Adicionado CPF
    telefone:              formData.telefone           || null,
    sexo:                  formData.sexo               || null,
    dataNascimento:        formData.nascimento         || null,
    naturalidade:          formData.naturalidade       || null,
    estadoCivil:           formData.estadoCivil        || null,
    escolaridade:          formData.escolaridade       || null,
    atividadePrincipal:    formData.atividadePrincipal || null,
    atividadeSecundaria:   formData.atividadeSecundaria|| null,
    composicaoFamiliar:    formData.composicaoFamiliar || null,
    localMoradia:          formData.moradiaTipo        || null,
    localMoradiaSedeMunicipal: formData.moradiaSedeMunicipal || null,
    localMoradiaOutro:     formData.moradiaOutro       || null,
    tipoConstrucao:        formData.tipoConstrucao     || null,
    tipoConstrucaoOutro:   formData.tipoConstrucaoOutro|| null,
    
    // Relação de Trabalho / Tempo Atividade
    tempoAtividade:        formData.tempoAtividade !== '' ? Number(formData.tempoAtividade) : null, // Adicionado
    horasDia:              formData.horasDia !== '' ? Number(formData.horasDia) : null,             // Adicionado
    fontesRenda:           formData.fontesRenda        || null, // Adicionado
    observacaoBraca:       formData.observacaoBraca    || null,
    petrechosProprios:     formData.petrechosProprios  || null,
    petrechosDeQuem:       formData.petrechosDeQuem    || null,
    conservacaoPescado:    formData.conservacaoPescado || null,
    entregaAtravessador:   !!formData.entregaAtravessador,
    dividaComAtravessador: !!formData.dividaComAtravessador,
    categoriaPesca:        formData.categoriaPesca     || null, // Adicionado
    principalPescaria:     formData.principalPescaria  || null  // Adicionado
  };

  // ── saude ─────────────────────────────────────────────────────────────────
  const saude = {
    vista:        !!formData.saude?.vista,
    pele:         !!formData.saude?.pele,
    coluna:       !!formData.saude?.coluna,
    ginecologico: !!formData.saude?.ginecologico,
    outros:       !!formData.saude?.outros,
    outrosTexto:  formData.saude?.outros ? (formData.saudeOutros || null) : null // Mapeando o texto descritivo
  };

  // ── registro ──────────────────────────────────────────────────────────────
  const registro = {
    registroINSS:        formData.registroINSS         || null,
    registroColonia:     formData.registroColonia      || null,
    nomeColonia:         formData.qualColonia          || null,
    registroAssociacao:  formData.registroAssociacao   || null,
    nomeAssociacao:      formData.qualAssociacao       || null,
    possuiCarteira:      formData.possuiCarteira       || null,
    carteiraGrande:      formData.carteiraGrande       || null,
    carteiraPequena:     formData.carteiraPequena      || null
  };

  // ── embarcacao ────────────────────────────────────────────────────────────
  const emb = formData.embarcacao || {};
  const embarcacao = {
    pescaEmbarcada:       emb.pescaEmbarcada       || null,
    embarcacaoPropria:    emb.embarcacaoPropria    || null,
    financiada:           !!emb.financiada,
    quitada:              !!emb.quitada,
    statusFinanceiro:     emb.statusFinanceiro     || null,
    nomeProprietario:     emb.nomeProprietario     || null,
    apelidoProprietario:  emb.apelidoProprietario  || null,
    portoOrigem:          emb.portoOrigem          || null,
    portoDesembarque:     emb.portoDesembarque     || null,
    nomeEmbarcacao:       emb.nomeEmbarcacao       || null,
    numeroRegistro:       emb.numeroRegistro       || null,
    comprimentoM:         emb.comprimento !== '' ? Number(emb.comprimento) : null,
    largura:              emb.largura !== '' ? Number(emb.largura) : null,
    tonelagemBruta:       emb.tonelagemBruta !== '' ? Number(emb.tonelagemBruta) : null,
    capacidadeTripulacao: emb.capacidadeTripulacao !== '' ? Number(emb.capacidadeTripulacao) : null,
    anoConstrucao:        emb.anoConstrucao !== '' ? Number(emb.anoConstrucao) : null,
    hp:                   emb.hpCilindros          || null,
    materialCasco:        emb.materialCasco        || null,
    tipoEmbarcacao:       emb.tipoEmbarcacao       || null,
    // Documentações estruturadas
    registroCapitania:    !!emb.registroCapitania,
    registroRGP:          !!emb.registroRGP,
    licenciamentoIBAMA:   !!emb.licenciamentoIBAMA,
    licenciamentoMPA:     !!emb.licenciamentoMPA,
    // Lista de propulsões mapeada para payload
    propulsoes:           formData.propulsoes      || []
  };

  // ── petrechos (array) ─────────────────────────────────────────────────────
  const temPetrecho =
    formData.petrechoPesca    ||
    formData.materialPetrecho ||
    formData.tamanhoMetros    ||
    formData.tamanhoBracas    ||
    formData.unidades         ||
    formData.tipoIscas        ||
    formData.processoLancamento;

  const petrechos = temPetrecho
    ? [
        {
          nome:          formData.petrechoPesca        || null,
          material:      formData.materialPetrecho     || null,
          tamanhoM:      formData.tamanhoMetros !== '' ? Number(formData.tamanhoMetros) : null,
          tamanhoBracas: formData.tamanhoBracas !== '' ? Number(formData.tamanhoBracas) : null,
          unidades:      formData.unidades !== ''      ? Number(formData.unidades)      : null,
          tipoIsca:      formData.tipoIscas            || null,
          processo:      formData.processoLancamento   || null
        }
      ]
    : [];

  // ── relacoes (array) ──────────────────────────────────────────────────────
  const relacoes = formData.relacaoTrabalho
    ? [{ tipo: formData.relacaoTrabalho }]
    : [];

  // ── producao ──────────────────────────────────────────────────────────────
  const producao = {
    mediaDiasEmbarcado:    formData.mediaDiasEmbarcado !== '' ? Number(formData.mediaDiasEmbarcado) : null,
    viagensMes:            formData.viagensPorMes !== '' ? Number(formData.viagensPorMes) : null,
    producaoMediaKg:       formData.producaoMedia !== ''      ? Number(formData.producaoMedia)      : null,
    producaoMediaUnidades: formData.producaoMediaUnidades !== '' ? Number(formData.producaoMediaUnidades) : null,
    valorPrimeira:         formData.valorPrimeiraQualidade !== '' ? Number(formData.valorPrimeiraQualidade) : null,
    valorSegunda:          formData.valorSegundaQualidade !== '' ? Number(formData.valorSegundaQualidade) : null,
    valorTerceira:         formData.valorTerceiraQualidade !== '' ? Number(formData.valorTerceiraQualidade) : null,
    rendaMediaMensal:      formData.rendaMensal !== '' ? Number(formData.rendaMensal) : null,
    rendaMediaPescaria:    formData.rendaPorPescaria !== '' ? Number(formData.rendaPorPescaria) : null
  };

  // ── despesas ──────────────────────────────────────────────────────────────
  const despesas = (formData.despesas || []).map((d) => ({
    item:       d.item || null,
    tipo:       d.tipo || null,
    quantidade: d.quantidade !== '' ? Number(d.quantidade) : null,
    unidade:    d.unidade || null,
    valor:      d.valor !== '' ? Number(d.valor) : null,
    outros:     d.outros || null,
    frequencia: d.frequencia || null
  }));

  // ── quadrantes (array) ────────────────────────────────────────────────────
  const quadrantes = (formData.quadrantes || [])
    .filter((q) => typeof q === 'string' && q.trim() !== '')
    .map((q) => ({ quadrante: q.trim() }));

  // ── especies (array) ──────────────────────────────────────────────────────
  const especies = (formData.especies || [])
    .filter((e) => e.id_especie)
    .map((e) => ({
      id_especie:  e.id_especie,
      inicioSafra: e.inicioSafra || null,
      fimSafra:    e.fimSafra    || null
    }));

  return {
    coleta,
    pescador,
    saude,
    registro,
    embarcacao,
    petrechos,
    relacoes,
    producao,
    despesas,
    quadrantes,
    especies
  };
}