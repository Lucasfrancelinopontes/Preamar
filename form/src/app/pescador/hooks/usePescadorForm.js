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

const mapApiToFormData = (data) => {
    const coleta = data?.coleta || {};
    const saude = data?.saude || {};
    const registro = data?.registro || {};
    const embarcacao = data?.embarcacao || {};
    const producao = data?.producao || {};
    const relacao = Array.isArray(data?.relacoes_trabalho) ? data.relacoes_trabalho[0] : null;
    const petrecho = Array.isArray(data?.petrechos) ? data.petrechos[0] : null;

    return {
        ...initialState,
        codigoColeta: toText(coleta.codigo_coleta),
        codigoFoto: toText(coleta.codigo_foto),
        municipio: coleta.ID_municipio != null ? String(coleta.ID_municipio) : "",
        localidade: toText(coleta.localidade),
        nome: toText(data?.nome),
        apelido: toText(data?.apelido),
        cpf: toText(data?.cpf),
        telefone: toText(data?.telefone),
        sexo: toText(data?.sexo),
        nascimento: toText(data?.data_nascimento),
        naturalidade: toText(data?.naturalidade),
        estadoCivil: toText(data?.estado_civil),
        escolaridade: toText(data?.escolaridade),
        composicaoFamiliar: toText(data?.composicao_familiar),
        moradiaTipo: toText(data?.local_moradia),
        moradiaSedeMunicipal: toText(data?.local_moradia_sede_municipal),
        moradiaOutro: toText(data?.local_moradia_outro),
        tipoConstrucao: toText(data?.tipo_construcao),
        tipoConstrucaoOutro: toText(data?.tipo_construcao_outro),
        atividadePrincipal: toText(data?.atividade_principal_renda),
        atividadeSecundaria: toText(data?.atividade_secundaria_renda),
        tempoAtividade: toNumberText(data?.tempo_atividade),
        horasDia: toNumberText(data?.horas_dia),
        relacaoTrabalho: toText(relacao?.tipo),
        fontesRenda: toText(data?.fontes_renda),
        observacaoBraca: toText(data?.observacao_braca),
        petrechosProprios: toText(data?.petrechos_proprios),
        petrechosDeQuem: toText(data?.petrechos_de_quem),
        conservacaoPescado: toText(data?.conservacao_pescado),
        categoriaPesca: toText(data?.categoria_pesca),
        principalPescaria: toText(data?.principal_pescaria),
        entregaAtravessador: Boolean(data?.entrega_atravessador),
        dividaComAtravessador: Boolean(data?.divida_com_atravessador),
        saude: {
            vista: Boolean(saude.vista),
            pele: Boolean(saude.pele),
            coluna: Boolean(saude.coluna),
            ginecologico: Boolean(saude.ginecologico),
            outros: Boolean(saude.outros)
        },
        saudeOutros: toText(saude.outros_texto),
        registroINSS: toText(registro.registro_inss),
        registroColonia: toText(registro.registro_colonia),
        qualColonia: toText(registro.nome_colonia),
        registroAssociacao: toText(registro.registro_associacao),
        qualAssociacao: toText(registro.nome_associacao),
        possuiCarteira: toText(registro.possui_carteira),
        carteiraGrande: toText(registro.carteira_grande),
        carteiraPequena: toText(registro.carteira_pequena),
        embarcacao: {
            ...initialState.embarcacao,
            pescaEmbarcada: toText(embarcacao.pesca_embarcada),
            embarcacaoPropria: toText(embarcacao.embarcacao_propria),
            financiada: Boolean(embarcacao.financiada),
            quitada: Boolean(embarcacao.quitada),
            statusFinanceiro: toText(embarcacao.status_financeiro),
            nomeProprietario: toText(embarcacao.nome_proprietario),
            apelidoProprietario: toText(embarcacao.apelido_proprietario),
            portoOrigem: toText(embarcacao.porto_origem),
            portoDesembarque: toText(embarcacao.porto_desembarque),
            nomeEmbarcacao: toText(embarcacao.nome_embarcacao),
            numeroRegistro: toText(embarcacao.numero_registro),
            comprimento: toNumberText(embarcacao.comprimento_m),
            largura: toNumberText(embarcacao.largura),
            tonelagemBruta: toNumberText(embarcacao.tonelagem_bruta),
            capacidadeTripulacao: toNumberText(embarcacao.capacidade_tripulacao),
            anoConstrucao: toNumberText(embarcacao.ano_construcao),
            hpCilindros: toNumberText(embarcacao.hp),
            materialCasco: toText(embarcacao.material_casco),
            registroCapitania: Boolean(embarcacao.registro_capitania),
            registroRGP: Boolean(embarcacao.registro_rgp),
            licenciamentoIBAMA: Boolean(embarcacao.licenciamento_ibama),
            licenciamentoMPA: Boolean(embarcacao.licenciamento_mpa),
            tipoEmbarcacao: toText(embarcacao.tipo_embarcacao)
        },
        propulsoes: parsePropulsoes(embarcacao.propulsoes),
        quadrantes: Array.isArray(data?.quadrantes)
            ? [0, 1, 2, 3, 4].map((index) => toText(data.quadrantes[index]?.quadrante))
            : initialState.quadrantes,
        mediaDiasEmbarcado: toNumberText(producao.media_dias_embarcado),
        producaoMedia: toNumberText(producao.producao_media_kg),
        producaoMediaViagemKg: toNumberText(producao.producao_media_viagem_kg),
        producaoMediaUnidades: toNumberText(producao.producao_media_unidades),
        valorPrimeiraQualidade: toNumberText(producao.valor_primeira),
        valorSegundaQualidade: toNumberText(producao.valor_segunda),
        valorTerceiraQualidade: toNumberText(producao.valor_terceira),
        valorMedio: toNumberText(producao.valor_medio),
        rendaMensal: toNumberText(producao.renda_media_mensal),
        rendaPorPescaria: toNumberText(producao.renda_media_pescaria),
        percepcaoPescaHojeVsPassado: toText(producao.percepcao_pesca_hoje_vs_passado),
        percepcaoTamanhoVolumePescado: toText(producao.percepcao_tamanho_volume_pescado),
        observacoes: toText(coleta.observacoes),
        coletor: toText(coleta.coletor),
        dataColeta: toText(coleta.data_coleta),
        digitador: toText(coleta.digitador),
        dataDigitador: toText(coleta.data_digitacao),
        petrechoPesca: toText(petrecho?.nome),
        materialPetrecho: toText(petrecho?.material),
        tamanhoMetros: toNumberText(petrecho?.tamanho_m),
        tamanhoBracas: toNumberText(petrecho?.tamanho_bracas),
        unidades: toNumberText(petrecho?.unidades),
        tipoIscas: toText(petrecho?.tipo_isca),
        processoLancamento: toText(petrecho?.processo),
        despesas: Array.isArray(data?.despesas)
            ? data.despesas.map((item) => ({
                rowId: item?.id || Date.now(),
                item: toText(item?.item || item?.categoria),
                tipo: toText(item?.tipo),
                quantidade: toNumberText(item?.quantidade),
                unidade: toText(item?.unidade),
                valor: toNumberText(item?.valor),
                outros: toText(item?.outros),
                frequencia: toText(item?.frequencia)
            }))
            : [createDespesaItem()],
        especies: Array.isArray(data?.pescador_especies)
            ? data.pescador_especies.map((item) => ({
                rowId: item?.id || Date.now(),
                id_especie: item?.id_especie || null,
                buscaTexto: item?.id_especie != null ? String(item.id_especie) : "",
                nome_popular: item?.especie?.Nome_popular || item?.especie?.nome_popular || "",
                inicioSafra: toText(item?.inicio_safra),
                fimSafra: toText(item?.fim_safra),
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
            ...(name === "possuiCarteira" && value !== "sim" ? { carteiraGrande: "", carteiraPequena: "" } : {})
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