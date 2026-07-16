"use client";

import { initialState } from "./utils/initialState";
import TextareaGroup from "./components/TextareaGroup";

import InputGroup from "./components/InputGroup";

import SelectGroup from "./components/SelectGroup";

import CheckboxGroup from "./components/CheckboxGroup";

import usePescadorForm from "./hooks/usePescadorForm";

import api from "@/services/api";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const TOTAL_ETAPAS = 20;

export default function CadastroPescador({ editId = null }) {

    const router = useRouter();
    const [etapaAtual, setEtapaAtual] = useState(1);

    // ── Espécies disponíveis (carregadas do backend) ──────────────────────
    const [especiesDisponiveis, setEspeciesDisponiveis] = useState([]);
    const [carregandoEspecies, setCarregandoEspecies] = useState(false);

    useEffect(() => {
        async function carregarEspecies() {
            setCarregandoEspecies(true);
            try {
                const data = await api.getEspecies();
                setEspeciesDisponiveis(Array.isArray(data) ? data : []);
            } catch {
                // silencia — a tabela ainda funciona sem autocomplete
            } finally {
                setCarregandoEspecies(false);
            }
        }
        carregarEspecies();
    }, []);

    // Retorna sugestões filtradas por ID (IDD) ou nome similar
    // A API /especies retorna: { ID, IDD, Nome_popular, Nome_cientifico, ... }
    function especieSugestoes(texto) {
        if (!texto || texto.trim() === "") return [];
        const t = texto.trim().toLowerCase();
        return especiesDisponiveis
            .filter((e) => {
                const porId   = String(e.IDD ?? e.ID ?? "").toLowerCase().includes(t);
                const porNome = (e.Nome_popular ?? "").toLowerCase().includes(t);
                return porId || porNome;
            })
            .slice(0, 10);
    }

    // Adiciona linha em branco na tabela de espécies
    function adicionarEspecieLinha() {
        setFormData((prev) => ({
            ...prev,
            especies: [
                ...prev.especies,
                { rowId: Date.now(), id_especie: null, buscaTexto: "", nome_popular: "", inicioSafra: "", fimSafra: "", sugestoesvisiveis: false }
            ]
        }));
    }

    // Remove linha pelo índice
    function removerEspecieLinha(idx) {
        setFormData((prev) => ({
            ...prev,
            especies: prev.especies.filter((_, i) => i !== idx)
        }));
    }

    // Atualiza campo livre (inicioSafra / fimSafra)
    function handleEspecieCampo(idx, campo, valor) {
        setFormData((prev) => {
            const novas = [...prev.especies];
            novas[idx] = { ...novas[idx], [campo]: valor };
            return { ...prev, especies: novas };
        });
    }

    // Atualiza texto de busca e abre sugestões
    function handleEspecieBusca(idx, valor) {
        setFormData((prev) => {
            const novas = [...prev.especies];
            novas[idx] = { ...novas[idx], buscaTexto: valor, id_especie: null, nome_popular: "", sugestoesvisiveis: true };
            return { ...prev, especies: novas };
        });
    }

    function handleEspecieFocus(idx) {
        setFormData((prev) => {
            const novas = [...prev.especies];
            novas[idx] = { ...novas[idx], sugestoesvisiveis: true };
            return { ...prev, especies: novas };
        });
    }

    function handleEspecieBlur(idx) {
        setFormData((prev) => {
            const novas = [...prev.especies];
            novas[idx] = { ...novas[idx], sugestoesvisiveis: false };
            return { ...prev, especies: novas };
        });
    }

    // Seleciona uma espécie do dropdown
    function handleEspecieSelecionada(idx, especie) {
        setFormData((prev) => {
            const novas = [...prev.especies];
            novas[idx] = {
                ...novas[idx],
                id_especie:        especie.ID,
                buscaTexto:        String(especie.IDD ?? especie.ID),
                nome_popular:      especie.Nome_popular,
                sugestoesvisiveis: false
            };
            return { ...prev, especies: novas };
        });
    }

    const OPCOES_SIM_NAO = [
        { id: "sim", nome: "Sim" },
        { id: "nao", nome: "Não" }
    ];

    const {

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

        submitForm,
        salvando,
        erroSubmit,
        sucessoSubmit,
        carregandoEdicao,
        erroCarregamento

    } = usePescadorForm(editId);


    const [municipios, setMunicipios] = useState([]);

    const [carregando, setCarregando] = useState(true);

    const [erro, setErro] = useState("");

    useEffect(() => {

        async function carregarMunicipios() {

            try {

                const response = await api.getMunicipios();

                const lista = Array.isArray(response)
                    ? response
                    : response.data;

                setMunicipios(lista);

            } catch (err) {

                setErro("Não foi possível carregar os municípios.");

            } finally {

                setCarregando(false);

            }

        }

        carregarMunicipios();

    }, []);

    const municipioSelecionado = useMemo(() => {

        return municipios.find(
            (m) => String(m.ID_municipio) === String(formData.municipio)
        );

    }, [municipios, formData.municipio]);

    const localidades = useMemo(() => {

        return municipioSelecionado?.localidades || [];

    }, [municipioSelecionado]);

    if (carregandoEdicao) {
        return (
            <main className="min-h-screen bg-slate-100 py-10 flex items-center justify-center">
                <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-xl text-center max-w-md w-full mx-4">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <h1 className="text-2xl font-bold text-slate-800">
                        Carregando cadastro socioeconômico...
                    </h1>
                    <p className="mt-2 text-slate-500">
                        Aguarde enquanto o formulário é preenchido com os dados salvos.
                    </p>
                </div>
            </main>
        );
    }

    if (erroCarregamento) {
        return (
            <main className="min-h-screen bg-slate-100 py-10 flex items-center justify-center">
                <div className="rounded-2xl border border-red-200 bg-white px-8 py-10 shadow-xl text-center max-w-md w-full mx-4">
                    <h1 className="text-2xl font-bold text-slate-800">
                        Não foi possível carregar o cadastro.
                    </h1>
                    <p className="mt-3 text-slate-600">
                        {erroCarregamento}
                    </p>
                    <button
                        type="button"
                        onClick={() => router.push("/meus-pescadores")}
                        className="mt-6 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                    >
                        Voltar para a listagem
                    </button>
                </div>
            </main>
        );
    }

    // Garante ao menos uma linha ao entrar na etapa 8
    useEffect(() => {
        if (etapaAtual === 8 && formData.especies.length === 0) {
            adicionarEspecieLinha();
        }
    }, [etapaAtual]);

    function validarEtapaAtual(etapa) {
        switch (etapa) {
            case 1:
                return Boolean(formData.municipio && formData.localidade);
            case 3:
                if (formData.moradiaTipo === "outro" && !formData.moradiaOutro.trim()) return false;
                if (formData.tipoConstrucao === "outro" && !formData.tipoConstrucaoOutro.trim()) return false;
                return true;
            case 4:
                return !formData.saude.outros || Boolean(formData.saudeOutros.trim());
            case 5:
                if (formData.registroColonia === "sim" && !formData.qualColonia.trim()) return false;
                if (formData.registroAssociacao === "sim" && !formData.qualAssociacao.trim()) return false;
                return true;
            case 8:
                return !(formData.especies || []).some((esp) => {
                    const temDados = Boolean(
                        String(esp.buscaTexto || "").trim() ||
                        String(esp.inicioSafra || "").trim() ||
                        String(esp.fimSafra || "").trim()
                    );
                    return temDados && !esp.id_especie;
                });
            default:
                return true;
        }
    }

    function scrollToTop() {
        if (typeof window !== "undefined") {
            window.scrollTo(0, 0);
        }
    }

    function handleNext() {
        if (etapaAtual >= TOTAL_ETAPAS || !validarEtapaAtual(etapaAtual)) return;
        setEtapaAtual((e) => e + 1);
        scrollToTop();
    }

    function handlePrevious() {
        if (etapaAtual <= 1) return;
        setEtapaAtual((e) => e - 1);
        scrollToTop();
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (salvando || etapaAtual !== TOTAL_ETAPAS) return;
        if (!validarEtapaAtual(etapaAtual)) return;

        const ok = await submitForm();
        if (ok) {
            setTimeout(() => router.push(editId ? "/meus-pescadores" : "/"), 1500);
        }
    }

    function handleWizardKeyDown(e) {
        if (e.key !== "Enter") return;
        if (e.target?.tagName === "TEXTAREA") return;
        e.preventDefault();
    }

    return (

        <main className="min-h-screen bg-slate-100 py-10">

            <div className="max-w-6xl mx-auto">

                <div className="bg-white rounded-2xl border border-slate-300 shadow-xl p-10">

                    <div className="mb-8">

                            <h1 className="text-3xl font-bold text-slate-800">

                            {editId ? "Editar Cadastro Socioeconômico do Pescador" : "Cadastro Socioeconômico do Pescador"}

                        </h1>

                        <p className="text-slate-500 mt-2">

                            Etapa {etapaAtual} de {TOTAL_ETAPAS}

                        </p>

                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-3 mb-8">

                        <div

                            className="bg-blue-600 h-3 rounded-full transition-all"

                            style={{
                                width: `${(etapaAtual / TOTAL_ETAPAS) * 100}%`
                            }}

                        />

                    </div>

                    <form onSubmit={handleSubmit} onKeyDownCapture={handleWizardKeyDown}>

                    {etapaAtual === 1 && (

                        <div>

                            <div className="flex items-center gap-3 mb-6">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition"
                                    aria-label="Voltar"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </button>
                                <h2 className="text-xl font-bold color-slate-800">
                                    Informações Iniciais
                                </h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">

                                <InputGroup
                                    label="Código da Coleta"
                                    name="codigoColeta"
                                    value={formData.codigoColeta}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Código da Foto"
                                    name="codigoFoto"
                                    value={formData.codigoFoto}
                                    onChange={handleInputChange}
                                />

                                <SelectGroup
                                    label="Município"
                                    name="municipio"
                                    value={formData.municipio}
                                    onChange={handleInputChange}
                                    options={municipios}
                                    optionLabel="municipio"
                                    optionValue="ID_municipio"
                                />

                                <SelectGroup
                                    label="Localidade"
                                    name="localidade"
                                    value={formData.localidade}
                                    onChange={handleInputChange}
                                    options={localidades}
                                    optionLabel="localidade"
                                    optionValue="ID_localidade"
                                />

                            </div>

                        </div>

                    )}

                    {etapaAtual === 13 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">
                                Propulsão
                            </h2>

                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    ["vela", "Vela"],
                                    ["motor", "Motor"],
                                    ["remo", "Remo"],
                                    ["vara", "Vara"],
                                    ["rabeta", "Rabeta"]
                                ].map(([id, label]) => (
                                    <CheckboxGroup
                                        key={id}
                                        label={label}
                                        checked={formData.propulsoes.includes(id)}
                                        onChange={() => togglePropulsao(id)}
                                    />
                                ))}

                                <InputGroup
                                    label="Cilindros/hp"
                                    name="hpCilindros"
                                    value={formData.embarcacao.hpCilindros || ""}
                                    onChange={handleEmbarcacaoInputChange}
                                />
                            </div>
                        </div>
                    )}

                    {etapaAtual === 14 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">
                                Portos
                            </h2>

                            <div className="grid md:grid-cols-2 gap-5">
                                <InputGroup
                                    label="Porto origem"
                                    name="portoOrigem"
                                    value={formData.embarcacao.portoOrigem || ""}
                                    onChange={handleEmbarcacaoInputChange}
                                />
                                <InputGroup
                                    label="Porto desembarque"
                                    name="portoDesembarque"
                                    value={formData.embarcacao.portoDesembarque || ""}
                                    onChange={handleEmbarcacaoInputChange}
                                />
                            </div>
                        </div>
                    )}

                    {etapaAtual === 15 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">
                                Dados técnicos embarcação
                            </h2>

                            <div className="grid md:grid-cols-2 gap-5">
                                <InputGroup
                                    label="Nome embarcação"
                                    name="nomeEmbarcacao"
                                    value={formData.embarcacao.nomeEmbarcacao || ""}
                                    onChange={handleEmbarcacaoInputChange}
                                />
                                <InputGroup
                                    label="Comprimento"
                                    name="comprimento"
                                    value={formData.embarcacao.comprimento || ""}
                                    onChange={handleEmbarcacaoInputChange}
                                />
                                <InputGroup
                                    label="Número registro"
                                    name="numeroRegistro"
                                    value={formData.embarcacao.numeroRegistro || ""}
                                    onChange={handleEmbarcacaoInputChange}
                                />
                                <InputGroup
                                    label="Largura"
                                    name="largura"
                                    value={formData.embarcacao.largura || ""}
                                    onChange={handleEmbarcacaoInputChange}
                                />
                                <InputGroup
                                    label="Tonelada bruta"
                                    name="tonelagemBruta"
                                    value={formData.embarcacao.tonelagemBruta || ""}
                                    onChange={handleEmbarcacaoInputChange}
                                />
                                <InputGroup
                                    label="Material casco"
                                    name="materialCasco"
                                    value={formData.embarcacao.materialCasco || ""}
                                    onChange={handleEmbarcacaoInputChange}
                                />
                                <InputGroup
                                    label="Tripulação"
                                    name="capacidadeTripulacao"
                                    value={formData.embarcacao.capacidadeTripulacao || ""}
                                    onChange={handleEmbarcacaoInputChange}
                                />
                                <InputGroup
                                    label="Ano construção"
                                    name="anoConstrucao"
                                    type="number"
                                    value={formData.embarcacao.anoConstrucao || ""}
                                    onChange={handleEmbarcacaoInputChange}
                                />
                            </div>
                        </div>
                    )}

                    {etapaAtual === 16 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">
                                Registros embarcação
                            </h2>

                            <div className="grid md:grid-cols-2 gap-4">
                                <CheckboxGroup
                                    label="Capitania"
                                    checked={!!formData.embarcacao.registroCapitania}
                                    onChange={() => handleEmbarcacaoCheckboxChange("registroCapitania")}
                                />
                                <CheckboxGroup
                                    label="RGP"
                                    checked={!!formData.embarcacao.registroRGP}
                                    onChange={() => handleEmbarcacaoCheckboxChange("registroRGP")}
                                />
                                <CheckboxGroup
                                    label="IBAMA"
                                    checked={!!formData.embarcacao.licenciamentoIBAMA}
                                    onChange={() => handleEmbarcacaoCheckboxChange("licenciamentoIBAMA")}
                                />
                                <CheckboxGroup
                                    label="MPA"
                                    checked={!!formData.embarcacao.licenciamentoMPA}
                                    onChange={() => handleEmbarcacaoCheckboxChange("licenciamentoMPA")}
                                />
                            </div>
                        </div>
                    )}

                    {etapaAtual === 17 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">
                                Tipo embarcação
                            </h2>

                            <div className="grid md:grid-cols-2 gap-5">
                                <InputGroup
                                    label="Tipo embarcação"
                                    name="tipoEmbarcacao"
                                    value={formData.embarcacao.tipoEmbarcacao || ""}
                                    onChange={handleEmbarcacaoInputChange}
                                />

                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 flex items-center justify-center text-center text-slate-500 min-h-40">
                                    Área reservada para desenho/anotação da embarcação
                                </div>
                            </div>
                        </div>
                    )}

                    {etapaAtual === 18 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">
                                Atravessador
                            </h2>

                            <div className="grid md:grid-cols-2 gap-4">
                                <CheckboxGroup
                                    label="Entrega pescado atravessador"
                                    checked={!!formData.entregaAtravessador}
                                    onChange={() => setFormData((prev) => ({ ...prev, entregaAtravessador: !prev.entregaAtravessador }))}
                                />
                                <CheckboxGroup
                                    label="Dívida atravessador"
                                    checked={!!formData.dividaComAtravessador}
                                    onChange={() => setFormData((prev) => ({ ...prev, dividaComAtravessador: !prev.dividaComAtravessador }))}
                                />
                            </div>
                        </div>
                    )}

                    {etapaAtual === 19 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">
                                Percepções
                            </h2>

                            <div className="grid gap-5">
                                <TextareaGroup
                                    label="Percepção pesca hoje vs passado"
                                    name="percepcaoPescaHojeVsPassado"
                                    value={formData.percepcaoPescaHojeVsPassado || ""}
                                    onChange={handleInputChange}
                                />
                                <TextareaGroup
                                    label="Percepção tamanho e volume pescado"
                                    name="percepcaoTamanhoVolumePescado"
                                    value={formData.percepcaoTamanhoVolumePescado || ""}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    )}

                    {etapaAtual === 20 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">
                                Observações e finalização
                            </h2>

                            <div className="grid md:grid-cols-2 gap-5">
                                <TextareaGroup
                                    label="Observações"
                                    name="observacoes"
                                    value={formData.observacoes || ""}
                                    onChange={handleInputChange}
                                    rows={6}
                                />
                                <InputGroup
                                    label="Coletor"
                                    name="coletor"
                                    value={formData.coletor || ""}
                                    onChange={handleInputChange}
                                />
                                <InputGroup
                                    label="Data"
                                    name="dataColeta"
                                    type="date"
                                    value={formData.dataColeta || ""}
                                    onChange={handleInputChange}
                                />
                                <InputGroup
                                    label="Digitador"
                                    name="digitador"
                                    value={formData.digitador || ""}
                                    onChange={handleInputChange}
                                />
                                <InputGroup
                                    label="Data digitador"
                                    name="dataDigitador"
                                    type="date"
                                    value={formData.dataDigitador || ""}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="mt-10 p-6 rounded-xl bg-green-50 border border-green-200">
                                <h3 className="text-lg font-semibold text-green-700">
                                    Cadastro concluído
                                </h3>
                                <p className="text-slate-600 mt-2">
                                    Revise todas as informações antes de salvar o cadastro.
                                </p>
                            </div>

                            {erroSubmit && (
                                <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                                    {erroSubmit}
                                </div>
                            )}

                            {sucessoSubmit && (
                                <div className="mt-6 p-4 rounded-xl bg-green-100 border border-green-300 text-green-800 text-sm font-medium">
                                    {editId ? "Cadastro atualizado com sucesso." : "Cadastro salvo com sucesso!"}
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={salvando || sucessoSubmit}
                                    className="px-8 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-50"
                                >
                                    {salvando ? "Salvando..." : editId ? "Salvar Alterações" : "Salvar Cadastro"}
                                </button>
                            </div>

                        </div>
                    )}


                    {etapaAtual === 2 && (

                        <div>

                            <h2 className="text-xl font-bold mb-6">

                                Dados Pessoais

                            </h2>

                            <div className="grid md:grid-cols-2 gap-5">

                                <InputGroup
                                    label="Nome"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Apelido"
                                    name="apelido"
                                    value={formData.apelido}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="CPF"
                                    name="cpf"
                                    value={formData.cpf}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Telefone"
                                    name="telefone"
                                    value={formData.telefone}
                                    onChange={handleInputChange}
                                />

                                <SelectGroup
                                    label="Sexo"
                                    name="sexo"
                                    value={formData.sexo}
                                    onChange={handleInputChange}
                                    options={[
                                        { id: "M", nome: "Masculino" },
                                        { id: "F", nome: "Feminino" }
                                    ]}
                                    optionLabel="nome"
                                    optionValue="id"
                                />

                                <InputGroup
                                    label="Data de Nascimento"
                                    type="date"
                                    name="nascimento"
                                    value={formData.nascimento}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Naturalidade"
                                    name="naturalidade"
                                    value={formData.naturalidade}
                                    onChange={handleInputChange}
                                />

                                <SelectGroup
                                    label="Estado Civil"
                                    name="estadoCivil"
                                    value={formData.estadoCivil}
                                    onChange={handleInputChange}
                                    options={[
                                        { id: "solteiro", nome: "Solteiro(a)" },
                                        { id: "casado", nome: "Casado(a)" },
                                        { id: "separado", nome: "Separado(a)" },
                                        { id: "divorciado", nome: "Divorciado(a)" },
                                        { id: "viuvo", nome: "Viúvo(a)" }
                                    ]}
                                    optionLabel="nome"
                                    optionValue="id"
                                />

                                <InputGroup
                                    label="Escolaridade"
                                    name="escolaridade"
                                    value={formData.escolaridade}
                                    onChange={handleInputChange}
                                    colSpan={2}
                                />

                                <InputGroup
                                    label="Composição familiar"
                                    name="composicaoFamiliar"
                                    value={formData.composicaoFamiliar || ""}
                                    onChange={handleInputChange}
                                    colSpan={2}
                                />

                            </div>

                        </div>

                    )}
                    {etapaAtual === 3 && (

                        <div>

                            <h2 className="text-xl font-bold mb-6">

                                Moradia

                            </h2>

                            <div className="grid md:grid-cols-2 gap-5">

                                <SelectGroup
                                    label="Local de Moradia"
                                    name="moradiaTipo"
                                    value={formData.moradiaTipo}
                                    onChange={handleInputChange}
                                    options={[
                                        {
                                            id: "comunidade",
                                            nome: "Comunidade Tradicional"
                                        },
                                        {
                                            id: "sede",
                                            nome: "Sede Municipal"
                                        },
                                        {
                                            id: "outro",
                                            nome: "Outro"
                                        }
                                    ]}
                                    optionLabel="nome"
                                    optionValue="id"
                                />

                                <InputGroup
                                    label="Sede municipal"
                                    name="moradiaSedeMunicipal"
                                    value={formData.moradiaSedeMunicipal || ""}
                                    onChange={handleInputChange}
                                />

                                {
                                    formData.moradiaTipo === "outro" && (

                                        <InputGroup
                                            label="Qual?"
                                            name="moradiaOutro"
                                            value={formData.moradiaOutro}
                                            onChange={handleInputChange}
                                        />

                                    )
                                }

                                <SelectGroup
                                    label="Tipo de Construção"
                                    name="tipoConstrucao"
                                    value={formData.tipoConstrucao}
                                    onChange={handleInputChange}
                                    options={[
                                        {
                                            id: "alvenaria",
                                            nome: "Alvenaria"
                                        },
                                        {
                                            id: "madeira",
                                            nome: "Madeira"
                                        },
                                        {
                                            id: "outro",
                                            nome: "Outro"
                                        }
                                    ]}
                                    optionLabel="nome"
                                    optionValue="id"
                                />

                                {
                                    formData.tipoConstrucao === "outro" && (

                                        <InputGroup
                                            label="Outro tipo"
                                            name="tipoConstrucaoOutro"
                                            value={formData.tipoConstrucaoOutro}
                                            onChange={handleInputChange}
                                        />

                                    )
                                }

                            </div>

                        </div>

                    )}

                    {etapaAtual === 4 && (

                        <div>

                            <h2 className="text-xl font-bold mb-6">

                                Saúde

                            </h2>

                            <div className="grid md:grid-cols-2 gap-4">

                                <CheckboxGroup
                                    label="Problemas de Vista"
                                    checked={formData.saude.vista}
                                    onChange={() => handleCheckboxChange("saude", "vista")}
                                />

                                <CheckboxGroup
                                    label="Problemas de Pele"
                                    checked={formData.saude.pele}
                                    onChange={() => handleCheckboxChange("saude", "pele")}
                                />

                                <CheckboxGroup
                                    label="Problemas na Coluna"
                                    checked={formData.saude.coluna}
                                    onChange={() => handleCheckboxChange("saude", "coluna")}
                                />

                                <CheckboxGroup
                                    label="Problemas Ginecológicos"
                                    checked={formData.saude.ginecologico}
                                    onChange={() => handleCheckboxChange("saude", "ginecologico")}
                                />

                                <CheckboxGroup
                                    label="Outros"
                                    checked={formData.saude.outros}
                                    onChange={() => handleCheckboxChange("saude", "outros")}
                                />

                            </div>

                            {formData.saude.outros && (

                                <div className="mt-6">

                                    <InputGroup
                                        label="Descreva os outros problemas de saúde"
                                        name="saudeOutros"
                                        value={formData.saudeOutros}
                                        onChange={handleInputChange}
                                        colSpan={2}
                                    />

                                </div>

                            )}

                        </div>

                    )}
                    {etapaAtual === 5 && (

                        <div>

                            <h2 className="text-xl font-bold mb-6">

                                Registros

                            </h2>

                            <div className="grid md:grid-cols-2 gap-5">

                                <SelectGroup
                                    label="Possui Registro no INSS?"
                                    name="registroINSS"
                                    value={formData.registroINSS}
                                    onChange={handleInputChange}
                                    options={OPCOES_SIM_NAO}
                                    optionLabel="nome"
                                    optionValue="id"
                                />

                                <SelectGroup
                                    label="Registro em Colônia?"
                                    name="registroColonia"
                                    value={formData.registroColonia}
                                    onChange={handleInputChange}
                                    options={OPCOES_SIM_NAO}
                                    optionLabel="nome"
                                    optionValue="id"
                                />

                                {formData.registroColonia === "sim" && (

                                    <InputGroup
                                        label="Qual Colônia?"
                                        name="qualColonia"
                                        value={formData.qualColonia}
                                        onChange={handleInputChange}
                                    />

                                )}

                                <SelectGroup
                                    label="Registro em Associação?"
                                    name="registroAssociacao"
                                    value={formData.registroAssociacao}
                                    onChange={handleInputChange}
                                    options={OPCOES_SIM_NAO}
                                    optionLabel="nome"
                                    optionValue="id"
                                />

                                {formData.registroAssociacao === "sim" && (

                                    <InputGroup
                                        label="Qual Associação?"
                                        name="qualAssociacao"
                                        value={formData.qualAssociacao}
                                        onChange={handleInputChange}
                                    />

                                )}

                                <SelectGroup
                                    label="Possui Carteira de Pescador?"
                                    name="possuiCarteira"
                                    value={formData.possuiCarteira}
                                    onChange={handleInputChange}
                                    options={OPCOES_SIM_NAO}
                                    optionLabel="nome"
                                    optionValue="id"
                                />

                                {formData.possuiCarteira === "sim" && (

                                    <>
                                        <SelectGroup
                                            label="Carteira Grande Marinha"
                                            name="carteiraGrande"
                                            value={formData.carteiraGrande}
                                            onChange={handleInputChange}
                                            options={OPCOES_SIM_NAO}
                                            optionLabel="nome"
                                            optionValue="id"
                                        />

                                        <SelectGroup
                                            label="Carteira Pequena Colônia"
                                            name="carteiraPequena"
                                            value={formData.carteiraPequena}
                                            onChange={handleInputChange}
                                            options={OPCOES_SIM_NAO}
                                            optionLabel="nome"
                                            optionValue="id"
                                        />
                                    </>

                                )}

                            </div>

                        </div>

                    )}
                    {etapaAtual === 6 && (

                        <div>

                            <h2 className="text-xl font-bold mb-6">

                                Relação de Trabalho

                            </h2>

                            <div className="grid md:grid-cols-2 gap-5">

                                <InputGroup
                                    label="Há quanto tempo exerce a atividade pesqueira? (anos)"
                                    name="tempoAtividade"
                                    type="number"
                                    value={formData.tempoAtividade}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Horas de trabalho por dia"
                                    name="horasDia"
                                    type="number"
                                    value={formData.horasDia}
                                    onChange={handleInputChange}
                                />

                                <SelectGroup
                                    label="Relação de Trabalho"
                                    name="relacaoTrabalho"
                                    value={formData.relacaoTrabalho}
                                    onChange={handleInputChange}
                                    options={[
                                        { id: "familiar", nome: "Familiar" },
                                        { id: "vizinhos_amigos", nome: "Vizinhos/Amigos" },
                                        { id: "armador", nome: "Armador" },
                                        { id: "embarcado", nome: "Embarcado" },
                                        { id: "assalariado", nome: "Assalariado" }
                                    ]}
                                    optionLabel="nome"
                                    optionValue="id"
                                />

                                <TextareaGroup
                                    label="Principais fontes renda familiar"
                                    name="fontesRenda"
                                    value={formData.fontesRenda}
                                    onChange={handleInputChange}
                                />

                            </div>

                        </div>

                    )}
                    {etapaAtual === 7 && (

                        <div>

                            <h2 className="text-xl font-bold mb-6">

                                Composição da Pescaria

                            </h2>

                            <div className="grid md:grid-cols-2 gap-5">

                                <SelectGroup
                                    label="Categoria da Pesca"
                                    name="categoriaPesca"
                                    value={formData.categoriaPesca}
                                    onChange={handleInputChange}
                                    options={[
                                        { id: "artesanal", nome: "Artesanal" },
                                        { id: "industrial", nome: "Industrial" },
                                        { id: "subsistencia", nome: "Subsistência" }
                                    ]}
                                    optionLabel="nome"
                                    optionValue="id"
                                />

                                <InputGroup
                                    label="Principal Pescaria"
                                    name="principalPescaria"
                                    value={formData.principalPescaria}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Petrecho de Pesca"
                                    name="petrechoPesca"
                                    value={formData.petrechoPesca}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Material do Petrecho"
                                    name="materialPetrecho"
                                    value={formData.materialPetrecho}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Tipo de Isca"
                                    name="tipoIscas"
                                    value={formData.tipoIscas}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Processo de Lançamento"
                                    name="processoLancamento"
                                    value={formData.processoLancamento}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Observação braça"
                                    name="observacaoBraca"
                                    value={formData.observacaoBraca || ""}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Petrechos próprios"
                                    name="petrechosProprios"
                                    value={formData.petrechosProprios || ""}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Se não, de quem"
                                    name="petrechosDeQuem"
                                    value={formData.petrechosDeQuem || ""}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Conservação pescado"
                                    name="conservacaoPescado"
                                    value={formData.conservacaoPescado || ""}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Comprimento (metros)"
                                    name="tamanhoMetros"
                                    type="number"
                                    value={formData.tamanhoMetros}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Comprimento (braças)"
                                    name="tamanhoBracas"
                                    type="number"
                                    value={formData.tamanhoBracas}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Quantidade de Unidades"
                                    name="unidades"
                                    type="number"
                                    value={formData.unidades}
                                    onChange={handleInputChange}
                                />

                            </div>

                        </div>

                    )}

                    {etapaAtual === 8 && (

                        <div>

                            <h2 className="text-xl font-bold mb-6">
                                Espécies Capturadas
                            </h2>

                            {carregandoEspecies && (
                                <p className="text-slate-500 text-sm mb-4">Carregando espécies...</p>
                            )}

                            {/* ── Cabeçalho ── */}
                            <div className="hidden md:grid grid-cols-[160px_1fr_140px_140px_100px] gap-2 px-2 pb-1 border-b border-slate-200 mb-1">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">ID</span>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nome comum</span>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Início safra</span>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Fim safra</span>
                                <span></span>
                            </div>

                            {/* ── Linhas ── */}
                            <div className="space-y-2">
                                {formData.especies.length === 0 && (
                                    <p className="text-center text-slate-400 py-8 text-sm">
                                        Nenhuma espécie adicionada. Clique em &quot;+ Adicionar linha&quot;.
                                    </p>
                                )}

                                {formData.especies.map((esp, idx) => (
                                    <div key={esp.rowId} className="grid grid-cols-1 md:grid-cols-[160px_1fr_140px_140px_100px] gap-2 items-start border-b border-slate-100 pb-2">

                                        {/* ── Busca por ID ou nome ── */}
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="ID ou nome"
                                                value={esp.buscaTexto}
                                                onChange={(e) => handleEspecieBusca(idx, e.target.value)}
                                                onFocus={() => handleEspecieFocus(idx)}
                                                onBlur={() => setTimeout(() => handleEspecieBlur(idx), 200)}
                                                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                            {esp.sugestoesvisiveis && especieSugestoes(esp.buscaTexto).length > 0 && (
                                                <div className="absolute left-0 top-full z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto w-80">
                                                    {especieSugestoes(esp.buscaTexto).map((s) => (
                                                        <button
                                                            key={s.ID}
                                                            type="button"
                                                            onMouseDown={(e) => { e.preventDefault(); handleEspecieSelecionada(idx, s); }}
                                                            className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b border-slate-100 last:border-0"
                                                        >
                                                            <span className="font-medium text-blue-700">{s.IDD ?? s.ID}</span>
                                                            <span className="text-slate-600"> — {s.Nome_popular}</span>
                                                            {s.Nome_cientifico && (
                                                                <span className="text-slate-400 italic text-xs block">{s.Nome_cientifico}</span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* ── Nome comum (preenchido ao selecionar) ── */}
                                        <input
                                            type="text"
                                            readOnly
                                            value={esp.nome_popular || ""}
                                            placeholder="Nome comum"
                                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600 cursor-default"
                                        />

                                        {/* ── Início safra ── */}
                                        <input
                                            type="text"
                                            placeholder="Ex: janeiro"
                                            value={esp.inicioSafra}
                                            onChange={(e) => handleEspecieCampo(idx, "inicioSafra", e.target.value)}
                                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />

                                        {/* ── Fim safra ── */}
                                        <input
                                            type="text"
                                            placeholder="Ex: junho"
                                            value={esp.fimSafra}
                                            onChange={(e) => handleEspecieCampo(idx, "fimSafra", e.target.value)}
                                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />

                                        {/* ── Remover ── */}
                                        <button
                                            type="button"
                                            onClick={() => removerEspecieLinha(idx)}
                                            className="px-3 py-1.5 rounded-lg border border-red-400 text-red-500 text-sm hover:bg-red-50 transition w-full"
                                        >
                                            Remover
                                        </button>

                                    </div>
                                ))}
                            </div>

                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={adicionarEspecieLinha}
                                    className="px-4 py-2 rounded-lg border border-blue-500 text-blue-600 text-sm font-medium hover:bg-blue-50 transition"
                                >
                                    + Adicionar linha
                                </button>
                            </div>

                        </div>

                    )}

                    {/* ETAPA 9: EMBARCAÇÕES */}
                    {etapaAtual === 9 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">
                                Dados da embarcação
                            </h2>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="space-y-3 md:col-span-2">
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <CheckboxGroup
                                            label="Pesca embarcada"
                                            checked={!!formData.embarcacao.pescaEmbarcada}
                                            onChange={() => handleEmbarcacaoCheckboxChange("pescaEmbarcada")}
                                        />
                                        <CheckboxGroup
                                            label="Embarcação própria"
                                            checked={!!formData.embarcacao.embarcacaoPropria}
                                            onChange={() => handleEmbarcacaoCheckboxChange("embarcacaoPropria")}
                                        />
                                        <CheckboxGroup
                                            label="Financiada"
                                            checked={!!formData.embarcacao.financiada}
                                            onChange={() => handleEmbarcacaoCheckboxChange("financiada")}
                                        />
                                        <CheckboxGroup
                                            label="Quitada"
                                            checked={!!formData.embarcacao.quitada}
                                            onChange={() => handleEmbarcacaoCheckboxChange("quitada")}
                                        />
                                    </div>
                                </div>

                                <InputGroup
                                    label="Nome proprietário"
                                    name="nomeProprietario"
                                    value={formData.embarcacao.nomeProprietario || ""}
                                    onChange={handleEmbarcacaoInputChange}
                                />
                                <InputGroup
                                    label="Apelido proprietário"
                                    name="apelidoProprietario"
                                    value={formData.embarcacao.apelidoProprietario || ""}
                                    onChange={handleEmbarcacaoInputChange}
                                />
                            </div>
                        </div>
                    )}

                    {etapaAtual === 10 && (

                        <div>

                            <h2 className="text-xl font-bold mb-6">

                                Quadrantes de Pesca

                            </h2>

                            <p className="text-slate-500 mb-8">

                                Informe os principais quadrantes onde o pescador exerce sua atividade.

                            </p>

                            <div className="grid md:grid-cols-2 gap-5">

                                <InputGroup
                                    label="Quadrante 1"
                                    name="quadrante1"
                                    value={formData.quadrantes[0]}
                                    onChange={(e) => {
                                        const novos = [...formData.quadrantes];
                                        novos[0] = e.target.value;

                                        setFormData(prev => ({
                                            ...prev,
                                            quadrantes: novos
                                        }));
                                    }}
                                />

                                <InputGroup
                                    label="Quadrante 2"
                                    name="quadrante2"
                                    value={formData.quadrantes[1]}
                                    onChange={(e) => {
                                        const novos = [...formData.quadrantes];
                                        novos[1] = e.target.value;

                                        setFormData(prev => ({
                                            ...prev,
                                            quadrantes: novos
                                        }));
                                    }}
                                />

                                <InputGroup
                                    label="Quadrante 3"
                                    name="quadrante3"
                                    value={formData.quadrantes[2]}
                                    onChange={(e) => {
                                        const novos = [...formData.quadrantes];
                                        novos[2] = e.target.value;

                                        setFormData(prev => ({
                                            ...prev,
                                            quadrantes: novos
                                        }));
                                    }}
                                />

                                <InputGroup
                                    label="Quadrante 4"
                                    name="quadrante4"
                                    value={formData.quadrantes[3]}
                                    onChange={(e) => {
                                        const novos = [...formData.quadrantes];
                                        novos[3] = e.target.value;

                                        setFormData(prev => ({
                                            ...prev,
                                            quadrantes: novos
                                        }));
                                    }}
                                />

                                <InputGroup
                                    label="Quadrante 5"
                                    name="quadrante5"
                                    value={formData.quadrantes[4]}
                                    onChange={(e) => {
                                        const novos = [...formData.quadrantes];
                                        novos[4] = e.target.value;

                                        setFormData(prev => ({
                                            ...prev,
                                            quadrantes: novos
                                        }));
                                    }}
                                />

                            </div>

                        </div>

                    )}

                    {/* ETAPA 11: DESPESAS */}
                    {etapaAtual === 11 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">
                                Despesas da Atividade
                            </h2>
                            <p className="text-slate-500 mb-6">
                                Cadastre os custos operacionais do pescador na atividade.
                            </p>

                            {/* Cabeçalho da Tabela Dinâmica */}
                            <div className="hidden md:grid grid-cols-[1fr_120px_100px_100px_120px_1fr_120px_80px] gap-2 px-2 pb-1 border-b border-slate-200 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                <span>Item</span>
                                <span>Tipo</span>
                                <span>Quant.</span>
                                <span>Unidade</span>
                                <span>Valor (R$)</span>
                                <span>Frequência</span>
                                <span>Outros</span>
                                <span></span>
                            </div>

                            {/* Linhas de Despesas */}
                            <div className="space-y-2">
                                {formData.despesas && formData.despesas.length === 0 && (
                                    <p className="text-center text-slate-400 py-8 text-sm">
                                        Nenhuma despesa adicionada.
                                    </p>
                                )}
                                {formData.despesas && formData.despesas.map((desp, idx) => (
                                    <div
                                        key={desp.rowId}
                                        className="grid grid-cols-1 md:grid-cols-[1fr_120px_100px_100px_120px_1fr_120px_80px] gap-2 items-start border-b border-slate-100 pb-2"
                                    >
                                        <input
                                            type="text"
                                            placeholder="Ex: Combustível"
                                            value={desp.item}
                                            onChange={(e) => updateDespesa(idx, "item", e.target.value)}
                                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
                                        />
                                        <select
                                            value={desp.tipo}
                                            onChange={(e) => updateDespesa(idx, "tipo", e.target.value)}
                                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-400"
                                        >
                                            <option value="">Selecione</option>
                                            <option value="combustivel">Combustível</option>
                                            <option value="gelo">Gelo</option>
                                            <option value="rancho">Rancho</option>
                                            <option value="manutencao">Manutenção</option>
                                            <option value="outro">Outro</option>
                                        </select>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={desp.quantidade}
                                            onChange={(e) => updateDespesa(idx, "quantidade", e.target.value)}
                                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Litros, Kg"
                                            value={desp.unidade}
                                            onChange={(e) => updateDespesa(idx, "unidade", e.target.value)}
                                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
                                        />
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={desp.valor}
                                            onChange={(e) => updateDespesa(idx, "valor", e.target.value)}
                                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Ex: Por viagem, semanal"
                                            value={desp.frequencia}
                                            onChange={(e) => updateDespesa(idx, "frequencia", e.target.value)}
                                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Detalhes"
                                            value={desp.outros}
                                            onChange={(e) => updateDespesa(idx, "outros", e.target.value)}
                                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeDespesa(idx)}
                                            className="px-2 py-1.5 rounded-lg border border-red-400 text-red-500 text-xs hover:bg-red-50 transition w-full"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={addDespesa}
                                    className="px-4 py-2 rounded-lg border border-blue-500 text-blue-600 text-sm font-medium hover:bg-blue-50 transition"
                                >
                                    + Adicionar Despesa
                                </button>
                            </div>
                        </div>
                    )}

                    {etapaAtual === 12 && (

                        <div>

                            <h2 className="text-xl font-bold mb-6">

                                Produção e Comercialização

                            </h2>

                            <div className="grid md:grid-cols-2 gap-5">

                                <InputGroup
                                    label="Média de dias embarcado por mês"
                                    name="mediaDiasEmbarcado"
                                    type="number"
                                    value={formData.mediaDiasEmbarcado}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Viagens por mês"
                                    name="viagensPorMes"
                                    type="number"
                                    value={formData.viagensPorMes || ""}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Produção média (kg)"
                                    name="producaoMedia"
                                    type="number"
                                    value={formData.producaoMedia}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Produção média por viagem (kg)"
                                    name="producaoMediaViagemKg"
                                    type="number"
                                    step="0.01"
                                    value={formData.producaoMediaViagemKg || ""}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Produção média unidades"
                                    name="producaoMediaUnidades"
                                    type="number"
                                    step="0.01"
                                    value={formData.producaoMediaUnidades || ""}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Valor primeira qualidade"
                                    name="valorPrimeiraQualidade"
                                    type="number"
                                    step="0.01"
                                    value={formData.valorPrimeiraQualidade || ""}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Valor segunda qualidade"
                                    name="valorSegundaQualidade"
                                    type="number"
                                    step="0.01"
                                    value={formData.valorSegundaQualidade || ""}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Valor terceira qualidade"
                                    name="valorTerceiraQualidade"
                                    type="number"
                                    step="0.01"
                                    value={formData.valorTerceiraQualidade || ""}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Valor médio obtido (R$)"
                                    name="valorMedio"
                                    type="number"
                                    value={formData.valorMedio}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Renda mensal"
                                    name="rendaMensal"
                                    type="number"
                                    step="0.01"
                                    value={formData.rendaMensal || ""}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Renda por pescaria"
                                    name="rendaPorPescaria"
                                    type="number"
                                    step="0.01"
                                    value={formData.rendaPorPescaria || ""}
                                    onChange={handleInputChange}
                                />

                            </div>

                        </div>

                    )}
                    <div className="flex justify-between mt-10">

                        <button
                            type="button"

                            onClick={handlePrevious}

                            disabled={etapaAtual === 1}

                            className="px-6 py-3 rounded-lg bg-slate-300 disabled:opacity-40"

                        >

                            Anterior

                        </button>

                        <button
                            type="button"

                            onClick={handleNext}

                            disabled={etapaAtual === TOTAL_ETAPAS}

                            className="px-6 py-3 rounded-lg bg-blue-600 text-white"

                        >

                            Próximo

                        </button>

                    </div>

                    </form>

                </div>

            </div>

        </main>

    );

}