export const initialState = {
    // ===== Informações iniciais =====
    codigoColeta: "",
    codigoFoto: "",
    municipio: "",
    localidade: "",

    // ===== Dados do pescador =====
    nome: "",
    apelido: "",
    cpf: "", // Garantido para persistência
    telefone: "",
    sexo: "",
    nascimento: "",
    naturalidade: "",
    estadoCivil: "",
    escolaridade: "",
    motivoParouEstudar: "",
    composicaoFamiliar: "",

    // ===== Perfil socioeconômico =====
    atividadePrincipal: "",
    atividadeSecundaria: "",
    tempoAtividade: "",
    horasDia: "",
    relacaoTrabalho: "",
    fontesRenda: "",
    observacaoBraca: "",
    petrechosProprios: "",
    petrechosDeQuem: "",
    conservacaoPescado: "",
    categoriaPesca: "",
    principalPescaria: "",
    entregaAtravessador: false,
    dividaComAtravessador: false,

    // ===== Moradia =====
    moradiaTipo: "",
    moradiaSedeMunicipal: "",
    moradiaOutro: "",
    tipoConstrucao: "",
    tipoConstrucaoOutro: "",

    // ===== Saúde =====
    saude: {
        vista: false,
        pele: false,
        coluna: false,
        ginecologico: false,
        outros: false
    },
    saudeOutros: "", // Mapeado para o texto descritivo

    // ===== Registros =====
    registroINSS: "",
    registroColonia: "",
    qualColonia: "",
    registroAssociacao: "",
    qualAssociacao: "",
    possuiCarteira: "",
    carteiraGrande: "",
    carteiraPequena: "",

    // ===== Trabalho =====
    tempoAtividade: "", // Garantido
    horasDia: "",       // Garantido
    relacaoTrabalho: "",
    fontesRenda: "",    // Garantido
    observacaoBraca: "",
    petrechosProprios: "",
    petrechosDeQuem: "",
    conservacaoPescado: "",

    // ===== Pescaria =====
    categoriaPesca: "",    // Garantido
    principalPescaria: "",  // Garantido
    petrechoPesca: "",
    tamanhoMetros: "",
    tamanhoBracas: "",
    unidades: "",
    materialPetrecho: "",
    tipoIscas: "",
    processoLancamento: "",

    // ===== MÓDULO 1: Embarcação (Sprint 1) =====
    embarcacao: {
        pescaEmbarcada: "",
        embarcacaoPropria: "",
        financiada: false,
        quitada: false,
        statusFinanceiro: "",
        nomeProprietario: "",
        apelidoProprietario: "",
        portoOrigem: "",
        portoDesembarque: "",
        nomeEmbarcacao: "",
        numeroRegistro: "",
        comprimento: "",
        largura: "",
        tonelagemBruta: "",
        capacidadeTripulacao: "",
        anoConstrucao: "",
        hpCilindros: "",
        materialCasco: "",
        registroCapitania: false,
        registroRGP: false,
        licenciamentoIBAMA: false,
        licenciamentoMPA: false,
        tipoEmbarcacao: ""
    },
    propulsoes: [], // Array de strings selecionadas para propulsão

    // ===== Quadrantes =====
    quadrantes: [
        "",
        "",
        "",
        "",
        ""
    ],

    // ===== Produção =====
    mediaDiasEmbarcado: "",
    producaoMedia: "",
    valorMedio: "",
    viagensPorMes: "",
    producaoMediaViagemKg: "",
    producaoMediaUnidades: "",
    valorPrimeiraQualidade: "",
    valorSegundaQualidade: "",
    valorTerceiraQualidade: "",
    rendaMensal: "",
    rendaPorPescaria: "",
    percepcaoPescaHojeVsPassado: "",
    percepcaoTamanhoVolumePescado: "",
    observacoes: "",
    coletor: "",
    dataColeta: "",
    digitador: "",
    dataDigitador: "",

    // ===== Espécies =====
    especies: [],
    novaEspecie: "",

    // ===== MÓDULO 2: Despesas da Atividade (Sprint 1) =====
    despesas: [] // Array dinâmico de despesas
};