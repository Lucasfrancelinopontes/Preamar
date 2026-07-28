"use client";

import { useEffect, useState } from "react";
import { initialState } from "../utils/initialState";
import { mapFormDataToPayload } from "../utils/mapper";
import api from "@/services/api";

const createDespesaItem = () => ({
    rowId: Date.now(),
    item: "",
    tipo: "",
    quantidade: "",
    unidade: "",
    valor: "",
    outros: "",
    frequencia: ""
});

const createEspecieItem = () => ({
    rowId: Date.now(),
    id_especie: null,
    buscaTexto: "",
    nome_popular: "",
    inicioSafra: "",
    fimSafra: "",
    sugestoesvisiveis: false
});

const createProducaoEspecieItem = () => ({
    rowId: Date.now(),
    especie: "",
    producao: ""
});

const parsePropulsoes = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item)).filter(Boolean);
    }

    if (typeof value !== "string" || !value.trim()) {
        return [];
    }

    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
            return parsed.map((item) => String(item)).filter(Boolean);
        }
    } catch {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
};

const toText = (value) => (value === undefined || value === null ? "" : String(value));

const toNumberText = (value) => (value === undefined || value === null || value === "" ? "" : String(value));

const extractConsecutivo = (codigoColeta) => {
    if (typeof codigoColeta !== "string") return "1";
    const codigo = codigoColeta.trim();
    if (!codigo) return "1";

    const partes = codigo.split(/\s+/).filter(Boolean);
    const ultimo = partes[partes.length - 1] || "";
    const numero = Number(ultimo);

    if (Number.isInteger(numero) && numero > 0) {
        return String(numero);
    }

    return "1";
};

const unwrapRecord = (value) => {
    if (!value || typeof value !== "object") return value;
    if (value.dataValues && typeof value.dataValues === "object") {
        return { ...value.dataValues, ...value };
    }
    return value;
};

const normalizeApiData = (data) => {
    if (!data || typeof data !== "object") return {};

    const base = data.dataValues && typeof data.dataValues === "object" ? data.dataValues : data;

    return {
        ...base,
        coleta: unwrapRecord(base.coleta || base.coletaPescador || data.coleta || data.coletaPescador),
        saude: unwrapRecord(base.saude || base.saudePescador || data.saude || data.saudePescador),
        registro: unwrapRecord(base.registro || base.registroPescador || data.registro || data.registroPescador),
        embarcacao: unwrapRecord(base.embarcacao || base.embarcacaoPescador || data.embarcacao || data.embarcacaoPescador),
        producao: unwrapRecord(base.producao || base.producaoPescador || data.producao || data.producaoPescador),
        relacoes_trabalho: Array.isArray(base.relacoes_trabalho || data.relacoes_trabalho)
            ? (base.relacoes_trabalho || data.relacoes_trabalho)
            : Array.isArray(base.relacoes || data.relacoes)
                ? (base.relacoes || data.relacoes)
                : Array.isArray(base.relacoesTrabalho || data.relacoesTrabalho)
                    ? (base.relacoesTrabalho || data.relacoesTrabalho)
                    : [],
        petrechos: Array.isArray(base.petrechos || data.petrechos)
            ? (base.petrechos || data.petrechos)
            : Array.isArray(base.petrecho || data.petrecho)
                ? (base.petrecho || data.petrecho)
                : [],
        despesas: Array.isArray(base.despesas || data.despesas)
            ? (base.despesas || data.despesas)
            : Array.isArray(base.despesa || data.despesa)
                ? (base.despesa || data.despesa)
                : [],
        pescador_especies: Array.isArray(base.pescador_especies || data.pescador_especies)
            ? (base.pescador_especies || data.pescador_especies)
            : Array.isArray(base.especies || data.especies)
                ? (base.especies || data.especies)
                : []
    };
};

const getValue = (source, ...paths) => {
    for (const path of paths) {
        const value = path.split('.').reduce((acc, key) => {
            if (acc === undefined || acc === null) return undefined;
            return acc[key];
        }, source);

        if (value !== undefined && value !== null && value !== "") {
            return value;
        }
    }

    return undefined;
};

const getTextValue = (source, ...paths) => {
    const value = getValue(source, ...paths);
    return value === undefined || value === null ? "" : String(value);
};

const getNumberTextValue = (source, ...paths) => {
    const value = getValue(source, ...paths);
    return value === undefined || value === null || value === "" ? "" : String(value);
};

const getEspecieBuscaTexto = (item) => {
    const idd = getTextValue(item, 'especie.IDD', 'especie.idd', 'IDD', 'idd');
    return idd || getTextValue(item, 'id_especie', 'id', 'especie.ID', 'especie.id');
};

const getBooleanValue = (source, ...paths) => {
    const value = getValue(source, ...paths);

    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (["sim", "s", "true", "1", "yes", "y"].includes(normalized)) return true;
        if (["nao", "não", "n", "false", "0", "no"].includes(normalized)) return false;
    }

    return Boolean(value);
};

const mapApiToFormData = (data) => {
    const normalized = normalizeApiData(data);
    const coleta = normalized?.coleta || {};
    const saude = normalized?.saude || {};
    const registro = normalized?.registro || {};
    const embarcacao = normalized?.embarcacao || {};
    const producao = normalized?.producao || {};
    const relacoes = Array.isArray(normalized?.relacoes_trabalho)
        ? normalized.relacoes_trabalho
        : Array.isArray(normalized?.relacoes)
            ? normalized.relacoes
            : Array.isArray(normalized?.relacoesTrabalho)
                ? normalized.relacoesTrabalho
                : [];
    const relacao = relacoes[0] || null;
    const petrechos = Array.isArray(normalized?.petrechos)
        ? normalized.petrechos
        : Array.isArray(normalized?.petrecho)
            ? normalized.petrecho
            : [];
    const petrecho = petrechos[0] || null;
    const despesas = Array.isArray(normalized?.despesas)
        ? normalized.despesas
        : Array.isArray(normalized?.despesa)
            ? normalized.despesa
            : [];
    const especies = Array.isArray(normalized?.pescador_especies)
        ? normalized.pescador_especies
        : Array.isArray(normalized?.especies)
            ? normalized.especies
            : [];
    const producaoMediaPorEspecieRaw = Array.isArray(producao?.producaoMediaPorEspecie)
        ? producao.producaoMediaPorEspecie
        : Array.isArray(producao?.producao_media_por_especie)
            ? producao.producao_media_por_especie
            : [];

    return {
        ...initialState,
        codigoColeta: getTextValue(coleta, 'codigo_coleta', 'codigoColeta'),
        numConsecutivo: extractConsecutivo(getTextValue(coleta, 'codigo_coleta', 'codigoColeta')),
        codigoFoto: getTextValue(coleta, 'codigo_foto', 'codigoFoto'),
        municipio: getTextValue(coleta, 'ID_municipio', 'id_municipio', 'municipio') || "",
        localidade: getTextValue(coleta, 'localidade', 'localidadeInfo.localidade'),
        nome: getTextValue(data, 'nome', 'pescador.nome', 'nomePescador'),
        apelido: getTextValue(data, 'apelido', 'pescador.apelido', 'apelidoPescador'),
        cpf: getTextValue(data, 'cpf', 'pescador.cpf'),
        telefone: getTextValue(data, 'telefone', 'pescador.telefone'),
        sexo: getTextValue(data, 'sexo', 'pescador.sexo'),
        nascimento: getTextValue(data, 'data_nascimento', 'nascimento', 'pescador.dataNascimento'),
        naturalidade: getTextValue(data, 'naturalidade', 'pescador.naturalidade'),
        estadoCivil: getTextValue(data, 'estado_civil', 'estadoCivil', 'pescador.estadoCivil'),
        escolaridade: getTextValue(data, 'escolaridade', 'pescador.escolaridade'),
        motivoParouEstudar: getTextValue(data, 'motivo_parou_estudar', 'motivoParouEstudar', 'pescador.motivoParouEstudar'),
        composicaoFamiliar: getTextValue(data, 'composicao_familiar', 'composicaoFamiliar'),
        moradiaTipo: getTextValue(data, 'local_moradia', 'moradiaTipo', 'pescador.localMoradia'),
        moradiaSedeMunicipal: getTextValue(data, 'local_moradia_sede_municipal', 'moradiaSedeMunicipal', 'pescador.localMoradiaSedeMunicipal'),
        moradiaQualidade: getTextValue(data, 'moradia_qualidade', 'moradiaQualidade', 'pescador.moradiaQualidade'),
        moradiaOutro: getTextValue(data, 'local_moradia_outro', 'moradiaOutro', 'pescador.localMoradiaOutro'),
        tipoConstrucao: getTextValue(data, 'tipo_construcao', 'tipoConstrucao', 'pescador.tipoConstrucao'),
        tipoConstrucaoOutro: getTextValue(data, 'tipo_construcao_outro', 'tipoConstrucaoOutro', 'pescador.tipoConstrucaoOutro'),
        atividadePrincipal: getTextValue(data, 'atividade_principal_renda', 'atividadePrincipal', 'pescador.atividadePrincipal'),
        atividadeSecundaria: getTextValue(data, 'atividade_secundaria_renda', 'atividadeSecundaria', 'pescador.atividadeSecundaria'),
        tempoAtividade: getNumberTextValue(data, 'tempo_atividade', 'tempoAtividade', 'pescador.tempoAtividade'),
        horasDia: getNumberTextValue(data, 'horas_dia', 'horasDia', 'pescador.horasDia'),
        relacaoTrabalho: getTextValue(relacao, 'tipo', 'relacaoTrabalho'),
        fontesRenda: getTextValue(data, 'fontes_renda', 'fontesRenda', 'pescador.fontesRenda'),
        observacaoBraca: getTextValue(data, 'observacao_braca', 'observacaoBraca', 'pescador.observacaoBraca'),
        petrechosProprios: getTextValue(data, 'petrechos_proprios', 'petrechosProprios', 'pescador.petrechosProprios'),
        petrechosDeQuem: getTextValue(data, 'petrechos_de_quem', 'petrechosDeQuem', 'pescador.petrechosDeQuem'),
        conservacaoPescado: getTextValue(data, 'conservacao_pescado', 'conservacaoPescado', 'pescador.conservacaoPescado'),
        categoriaPesca: getTextValue(data, 'categoria_pesca', 'categoriaPesca', 'pescador.categoriaPesca'),
        principalPescaria: getTextValue(data, 'principal_pescaria', 'principalPescaria', 'pescador.principalPescaria'),
        entregaAtravessador: getBooleanValue(data, 'entrega_atravessador', 'entregaAtravessador'),
        dividaComAtravessador: getBooleanValue(data, 'divida_com_atravessador', 'dividaComAtravessador'),
        saude: {
            vista: getBooleanValue(saude, 'vista'),
            pele: getBooleanValue(saude, 'pele'),
            coluna: getBooleanValue(saude, 'coluna'),
            ginecologico: getBooleanValue(saude, 'ginecologico'),
            outros: getBooleanValue(saude, 'outros')
        },
        saudeOutros: getTextValue(saude, 'outros_texto', 'outrosTexto', 'saudeOutros'),
        registroINSS: getTextValue(registro, 'registro_inss', 'registroINSS'),
        registroColonia: getTextValue(registro, 'registro_colonia', 'registroColonia'),
        qualColonia: getTextValue(registro, 'nome_colonia', 'qualColonia', 'nomeColonia'),
        registroAssociacao: getTextValue(registro, 'registro_associacao', 'registroAssociacao'),
        qualAssociacao: getTextValue(registro, 'nome_associacao', 'qualAssociacao', 'nomeAssociacao'),
        possuiCarteira: getTextValue(registro, 'possui_carteira', 'possuiCarteira'),
        carteiraGrande: getTextValue(registro, 'carteira_grande', 'carteiraGrande'),
        carteiraPequena: getTextValue(registro, 'carteira_pequena', 'carteiraPequena'),
        embarcacao: {
            ...initialState.embarcacao,
            pescaEmbarcada: getTextValue(embarcacao, 'pesca_embarcada', 'pescaEmbarcada'),
            embarcacaoPropria: getTextValue(embarcacao, 'embarcacao_propria', 'embarcacaoPropria'),
            financiada: getBooleanValue(embarcacao, 'financiada'),
            quitada: getBooleanValue(embarcacao, 'quitada'),
            statusFinanceiro: getTextValue(embarcacao, 'status_financeiro', 'statusFinanceiro'),
            nomeProprietario: getTextValue(embarcacao, 'nome_proprietario', 'nomeProprietario'),
            apelidoProprietario: getTextValue(embarcacao, 'apelido_proprietario', 'apelidoProprietario'),
            portoOrigem: getTextValue(embarcacao, 'porto_origem', 'portoOrigem'),
            portoDesembarque: getTextValue(embarcacao, 'porto_desembarque', 'portoDesembarque'),
            nomeEmbarcacao: getTextValue(embarcacao, 'nome_embarcacao', 'nomeEmbarcacao'),
            numeroRegistro: getTextValue(embarcacao, 'numero_registro', 'numeroRegistro'),
            comprimento: getNumberTextValue(embarcacao, 'comprimento_m', 'comprimento', 'comprimentoM'),
            largura: getNumberTextValue(embarcacao, 'largura'),
            tonelagemBruta: getNumberTextValue(embarcacao, 'tonelagem_bruta', 'tonelagemBruta'),
            capacidadeTripulacao: getNumberTextValue(embarcacao, 'capacidade_tripulacao', 'capacidadeTripulacao'),
            anoConstrucao: getNumberTextValue(embarcacao, 'ano_construcao', 'anoConstrucao'),
            hpCilindros: getNumberTextValue(embarcacao, 'hp', 'hpCilindros'),
            materialCasco: getTextValue(embarcacao, 'material_casco', 'materialCasco'),
            registroCapitania: getBooleanValue(embarcacao, 'registro_capitania', 'registroCapitania'),
            registroRGP: getBooleanValue(embarcacao, 'registro_rgp', 'registroRGP'),
            licenciamentoIBAMA: getBooleanValue(embarcacao, 'licenciamento_ibama', 'licenciamentoIBAMA'),
            licenciamentoMPA: getBooleanValue(embarcacao, 'licenciamento_mpa', 'licenciamentoMPA'),
            tipoEmbarcacao: getTextValue(embarcacao, 'tipo_embarcacao', 'tipoEmbarcacao')
        },
        propulsoes: parsePropulsoes(getValue(embarcacao, 'propulsoes', 'propulsao', 'propulsaoList')),
        quadrantes: Array.isArray(normalized?.quadrantes)
            ? [0, 1, 2, 3, 4].map((index) => getTextValue(normalized?.quadrantes[index] || {}, 'quadrante'))
            : initialState.quadrantes,
        mediaDiasEmbarcado: getNumberTextValue(producao, 'media_dias_embarcado', 'mediaDiasEmbarcado'),
        producaoMedia: getNumberTextValue(producao, 'producao_media_kg', 'producaoMedia'),
        producaoMediaPorEspecie: producaoMediaPorEspecieRaw.length > 0
            ? producaoMediaPorEspecieRaw.map((item) => ({
                rowId: item?.rowId || Date.now(),
                especie: getTextValue(item, 'especie', 'nome', 'nomeEspecie'),
                producao: getNumberTextValue(item, 'producao', 'valor', 'quantidade')
            }))
            : [createProducaoEspecieItem()],
        viagensPorMes: getNumberTextValue(producao, 'viagens_mes', 'viagensMes', 'viagensPorMes'),
        valorPrimeiraQualidade: getNumberTextValue(producao, 'valor_primeira', 'valorPrimeiraQualidade'),
        valorSegundaQualidade: getNumberTextValue(producao, 'valor_segunda', 'valorSegundaQualidade'),
        valorTerceiraQualidade: getNumberTextValue(producao, 'valor_terceira', 'valorTerceiraQualidade'),
        valorMedio: getNumberTextValue(producao, 'valor_medio', 'valorMedio'),
        rendaMensal: getNumberTextValue(producao, 'renda_media_mensal', 'rendaMensal'),
        rendaPorPescaria: getNumberTextValue(producao, 'renda_media_pescaria', 'rendaPorPescaria'),
        percepcaoPescaHojeVsPassado: getTextValue(producao, 'percepcao_pesca_hoje_vs_passado', 'percepcaoPescaHojeVsPassado'),
        percepcaoTamanhoVolumePescado: getTextValue(producao, 'percepcao_tamanho_volume_pescado', 'percepcaoTamanhoVolumePescado'),
        observacoes: getTextValue(coleta, 'observacoes'),
        coletor: getTextValue(coleta, 'coletor'),
        dataColeta: getTextValue(coleta, 'data_coleta', 'dataColeta'),
        digitador: getTextValue(coleta, 'digitador'),
        dataDigitador: getTextValue(coleta, 'data_digitacao', 'dataDigitador'),
        petrechoPesca: getTextValue(petrecho, 'nome', 'petrechoPesca'),
        materialPetrecho: getTextValue(petrecho, 'material', 'materialPetrecho'),
        tamanhoMetros: getNumberTextValue(petrecho, 'tamanho_m', 'tamanhoMetros'),
        tamanhoBracas: getNumberTextValue(petrecho, 'tamanho_bracas', 'tamanhoBracas'),
        unidades: getNumberTextValue(petrecho, 'unidades'),
        tipoIscas: getTextValue(petrecho, 'tipo_isca', 'tipoIscas'),
        processoLancamento: getTextValue(petrecho, 'processo', 'processoLancamento'),
        despesas: despesas.length > 0
            ? despesas.map((item) => ({
                rowId: item?.id || Date.now(),
                item: getTextValue(item, 'item', 'categoria'),
                tipo: getTextValue(item, 'tipo'),
                quantidade: getNumberTextValue(item, 'quantidade'),
                unidade: getTextValue(item, 'unidade'),
                valor: getNumberTextValue(item, 'valor'),
                outros: getTextValue(item, 'outros'),
                frequencia: getTextValue(item, 'frequencia')
            }))
            : [createDespesaItem()],
        especies: especies.length > 0
            ? especies.map((item) => ({
                rowId: item?.id || Date.now(),
                id_especie: item?.id_especie || item?.id || null,
                buscaTexto: getEspecieBuscaTexto(item),
                nome_popular: getTextValue(item, 'especie.Nome_popular', 'especie.nome_popular', 'nome_popular', 'nomePopular'),
                inicioSafra: getTextValue(item, 'inicio_safra', 'inicioSafra'),
                fimSafra: getTextValue(item, 'fim_safra', 'fimSafra'),
                sugestoesvisiveis: false
            }))
            : []
    };
};

export default function usePescadorForm(editId = null) {
    const [formData, setFormData] = useState(initialState);
    const [salvando, setSalvando] = useState(false);
    const [erroSubmit, setErroSubmit] = useState("");
    const [sucessoSubmit, setSucessoSubmit] = useState(false);
    const [carregandoEdicao, setCarregandoEdicao] = useState(false);
    const [erroCarregamento, setErroCarregamento] = useState("");

    useEffect(() => {
        let ativo = true;

        const carregarDadosEdicao = async () => {
            if (!editId) {
                setFormData(initialState);
                setErroCarregamento("");
                return;
            }

            setCarregandoEdicao(true);
            setErroCarregamento("");

            try {
                const response = await api.getSocioPescador(editId);
                const data = response?.data || response;
                if (!ativo) return;
                setFormData(mapApiToFormData(data));
            } catch (error) {
                if (!ativo) return;
                setErroCarregamento(error?.message || "Nao foi possivel carregar o cadastro para edicao.");
            } finally {
                if (ativo) {
                    setCarregandoEdicao(false);
                }
            }
        };

        carregarDadosEdicao();

        return () => {
            ativo = false;
        };
    }, [editId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "municipio" ? { localidade: "" } : {}),
            ...(name === "moradiaTipo" && value !== "outro" ? { moradiaOutro: "" } : {}),
            ...(name === "tipoConstrucao" && value !== "outro" ? { tipoConstrucaoOutro: "" } : {}),
            ...(name === "registroColonia" && value !== "sim" ? { qualColonia: "" } : {}),
            ...(name === "registroAssociacao" && value !== "sim" ? { qualAssociacao: "" } : {}),
            ...(name === "possuiCarteira" && value !== "sim" ? { carteiraGrande: "", carteiraPequena: "" } : {}),
            ...(name === "escolaridade" && !["fundamental_incompleto", "fundamental_completo", "medio_incompleto"].includes(value) ? { motivoParouEstudar: "" } : {})
        }));
    };

    const handleCheckboxChange = (grupo, campo) => {
        setFormData((prev) => ({
            ...prev,
            [grupo]: {
                ...prev[grupo],
                [campo]: !prev[grupo][campo]
            },
            ...(grupo === "saude" && campo === "outros" && prev[grupo][campo]
                ? { saudeOutros: "" }
                : {})
        }));
    };

    // --- Auxiliar para Inputs aninhados do objeto embarcacao ---
    const handleEmbarcacaoInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            embarcacao: {
                ...prev.embarcacao,
                [name]: value
            }
        }));
    };

    const handleEmbarcacaoCheckboxChange = (campo) => {
        setFormData((prev) => ({
            ...prev,
            embarcacao: {
                ...prev.embarcacao,
                [campo]: !prev.embarcacao[campo]
            }
        }));
    };

    // --- Funções de controle de Propulsão ---
    const togglePropulsao = (propulsaoId) => {
        setFormData((prev) => {
            const existe = prev.propulsoes.includes(propulsaoId);
            const novasPropulsoes = existe
                ? prev.propulsoes.filter((p) => p !== propulsaoId)
                : [...prev.propulsoes, propulsaoId];
            return { ...prev, propulsoes: novasPropulsoes };
        });
    };

    // --- Funções de controle das Despesas Dinâmicas ---
    const addDespesa = () => {
        setFormData((prev) => ({
            ...prev,
            despesas: [
                ...prev.despesas,
                {
                    rowId: Date.now(),
                    item: "",
                    tipo: "",
                    quantidade: "",
                    unidade: "",
                    valor: "",
                    outros: "",
                    frequencia: ""
                }
            ]
        }));
    };

    const removeDespesa = (idx) => {
        setFormData((prev) => ({
            ...prev,
            despesas: prev.despesas.filter((_, i) => i !== idx)
        }));
    };

    const updateDespesa = (idx, campo, valor) => {
        setFormData((prev) => {
            const novasDespesas = [...prev.despesas];
            novasDespesas[idx] = { ...novasDespesas[idx], [campo]: valor };
            return { ...prev, despesas: novasDespesas };
        });
    };

    // --- Espécies (Legado mantido) ---
    const adicionarEspecie = () => {
        if (!formData.novaEspecie.trim()) return;
        setFormData((prev) => ({
            ...prev,
            especies: [
                ...prev.especies,
                {
                    id: Date.now(),
                    nome: prev.novaEspecie
                }
            ],
            novaEspecie: ""
        }));
    };

    const removerEspecie = (id) => {
        setFormData((prev) => ({
            ...prev,
            especies: prev.especies.filter(especie => especie.id !== id)
        }));
    };

    const submitForm = async () => {
        if (salvando) return false;
        setSalvando(true);
        setErroSubmit("");
        setSucessoSubmit(false);
        try {
            const payload = mapFormDataToPayload(formData);
            if (editId) {
                await api.atualizarSocioPescador(editId, payload);
            } else {
                await api.criarSocioPescador(payload);
            }
            setSucessoSubmit(true);
            return true;
        } catch (err) {
            const mensagem =
                err?.data?.error ||
                err?.data?.message ||
                err?.message ||
                "Erro ao salvar cadastro. Tente novamente.";
            setErroSubmit(mensagem);
            return false;
        } finally {
            setSalvando(false);
        }
    };

    return {
        formData,
        setFormData,
        handleInputChange,
        handleCheckboxChange,
        handleEmbarcacaoInputChange,
        handleEmbarcacaoCheckboxChange,
        togglePropulsao,
        addDespesa,
        removeDespesa,
        updateDespesa,
        adicionarEspecie,
        removerEspecie,
        submitForm,
        salvando,
        erroSubmit,
        sucessoSubmit,
        carregandoEdicao,
        erroCarregamento
    };
}