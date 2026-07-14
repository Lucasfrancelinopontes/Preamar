export const initialState = {
    // ===== Informações iniciais =====
    codigoColeta: "",
    codigoFoto: "",
    municipio: "",
    localidade: "",

    // ===== Dados do pescador =====
    nome: "",
    apelido: "",
    cpf: "",
    telefone: "",
    sexo: "",
    nascimento: "",
    naturalidade: "",
    estadoCivil: "",
    escolaridade: "",

    // ===== Perfil socioeconômico =====
    atividadePrincipal: "",
    atividadeSecundaria: "",
    composicaoFamiliar: "",

    // ===== Moradia =====
    moradiaTipo: "",
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
    saudeOutros: "",

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
    tempoAtividade: "",
    horasDia: "",
    relacaoTrabalho: "",
    fontesRenda: "",

    // ===== Pescaria =====
    categoriaPesca: "",
    principalPescaria: "",
    petrechoPesca: "",
    tamanhoMetros: "",
    tamanhoBracas: "",
    unidades: "",
    materialPetrecho: "",
    tipoIscas: "",
    processoLancamento: "",

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
    observacoes: "",

    // ===== Espécies =====
    especies: [],

novaEspecie: "",
};