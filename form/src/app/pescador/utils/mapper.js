/**
 * mapper.js
 *
 * Transforma o formData do CadastroPescador no payload
 * esperado pelo endpoint POST /socio-pescadores.
 *
 * O formulário é preservado exatamente como está.
 * Somente este arquivo faz a conversão de nomes e tipos.
 *
 * Nota sobre municipio:
 *   O SelectGroup usa optionValue="ID_municipio", portanto
 *   formData.municipio já contém o ID numérico — não precisa
 *   de lookup na lista de municípios.
 */

/**
 * @param {object} formData - estado do usePescadorForm
 * @returns {object} payload pronto para enviar ao backend
 */
export function mapFormDataToPayload(formData) {
  // ── coleta ────────────────────────────────────────────────────────────────
  const coleta = {
    codigoColeta:  formData.codigoColeta  || null,
    codigoFoto:    formData.codigoFoto    || null,
    // formData.municipio já é o ID_municipio (optionValue="ID_municipio")
    ID_municipio:  formData.municipio ? Number(formData.municipio) : null,
    localidade:    formData.localidade    || null,
    coletor:       null,
    digitador:     null,
    dataColeta:    null,
    dataDigitacao: null,
    observacoes:   formData.observacoes   || null
  };

  // ── pescador ──────────────────────────────────────────────────────────────
  const pescador = {
    nome:                  formData.nome               || null,
    apelido:               formData.apelido            || null,
    telefone:              formData.telefone           || null,
    sexo:                  formData.sexo               || null,
    // form usa "nascimento"; controller espera "dataNascimento"
    dataNascimento:        formData.nascimento         || null,
    naturalidade:          formData.naturalidade       || null,
    estadoCivil:           formData.estadoCivil        || null,
    escolaridade:          formData.escolaridade       || null,
    atividadePrincipal:    formData.atividadePrincipal || null,
    atividadeSecundaria:   formData.atividadeSecundaria|| null,
    composicaoFamiliar:    formData.composicaoFamiliar || null,
    // form usa "moradiaTipo"; controller espera "localMoradia"
    localMoradia:          formData.moradiaTipo        || null,
    localMoradiaOutro:     formData.moradiaOutro       || null,
    tipoConstrucao:        formData.tipoConstrucao     || null,
    tipoConstrucaoOutro:   formData.tipoConstrucaoOutro|| null
  };

  // ── saude ─────────────────────────────────────────────────────────────────
  const saude = {
    vista:        !!formData.saude?.vista,
    pele:         !!formData.saude?.pele,
    coluna:       !!formData.saude?.coluna,
    ginecologico: !!formData.saude?.ginecologico,
    outros:       !!formData.saude?.outros
  };

  // ── registro ──────────────────────────────────────────────────────────────
  const registro = {
    registroINSS:        formData.registroINSS         || null,
    registroColonia:     formData.registroColonia      || null,
    // form usa "qualColonia"; controller espera "nomeColonia"
    nomeColonia:         formData.qualColonia          || null,
    registroAssociacao:  formData.registroAssociacao   || null,
    // form usa "qualAssociacao"; controller espera "nomeAssociacao"
    nomeAssociacao:      formData.qualAssociacao       || null,
    possuiCarteira:      formData.possuiCarteira       || null,
    carteiraGrande:      formData.carteiraGrande       || null,
    carteiraPequena:     formData.carteiraPequena      || null
  };

  // ── embarcacao ────────────────────────────────────────────────────────────
  const embarcacao = {
    pescaEmbarcada:       null,
    embarcacaoPropria:    null,
    statusFinanceiro:     null,
    nomeProprietario:     null,
    apelidoProprietario:  null,
    portoOrigem:          null,
    portoDesembarque:     null,
    nomeEmbarcacao:       null,
    comprimentoM:         null,
    hp:                   null,
    capacidadeTripulacao: null,
    tipoEmbarcacao:       null
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
          // form usa "tamanhoMetros"; controller espera "tamanhoM"
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
    viagensMes:            null,
    // form usa "producaoMedia"; controller espera "producaoMediaKg"
    producaoMediaKg:       formData.producaoMedia !== ''      ? Number(formData.producaoMedia)      : null,
    producaoMediaUnidades: null,
    // form usa "valorMedio"; controller espera "valorPrimeira"
    valorPrimeira:         formData.valorMedio !== ''         ? Number(formData.valorMedio)         : null,
    valorSegunda:          null,
    valorTerceira:         null,
    rendaMediaMensal:      null,
    rendaMediaPescaria:    null
  };

  // ── despesas ──────────────────────────────────────────────────────────────
  const despesas = [];

  // ── quadrantes (array) ────────────────────────────────────────────────────
  const quadrantes = (formData.quadrantes || [])
    .filter((q) => typeof q === 'string' && q.trim() !== '')
    .map((q) => ({ quadrante: q.trim() }));

  // ── especies (array) ──────────────────────────────────────────────────────
  // Cada linha: { rowId, id_especie, buscaTexto, nome_popular, inicioSafra, fimSafra }
  // Só envia linhas que têm id_especie resolvido
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