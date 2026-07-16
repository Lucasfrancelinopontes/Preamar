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

// Total de etapas agora é 12 (10 original + 2 novas)
const TOTAL_ETAPAS = 12;

export default function CadastroPescador() {
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
                const porId = String(e.IDD ?? e.ID ?? "").toLowerCase().includes(t);
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
                id_especie: especie.ID,
                buscaTexto: String(especie.IDD ?? especie.ID),
                nome_popular: especie.Nome_popular,
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
        sucessoSubmit
    } = usePescadorForm();

    const [municipios, setMunicipios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function carregarMunicipios() {
            try {
                const response = await api.getMunicipios();
                const lista = Array.isArray(response) ? response : response.data;
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
        return municipios.find((m) => m.municipio === formData.municipio);
    }, [municipios, formData.municipio]);

    const localidades = useMemo(() => {
        return municipioSelecionado?.localidades || [];
    }, [municipioSelecionado]);

    // Garante ao menos uma linha ao entrar na etapa 8
    useEffect(() => {
        if (etapaAtual === 8 && formData.especies.length === 0) {
            adicionarEspecieLinha();
        }
    }, [etapaAtual]);

    function proximaEtapa() {
        if (etapaAtual < TOTAL_ETAPAS)
            setEtapaAtual((e) => e + 1);

        window.scrollTo(0, 0);
    }

    function etapaAnterior() {
        if (etapaAtual > 1)
            setEtapaAtual((e) => e - 1);

        window.scrollTo(0, 0);
    }

    return (
        <main className="min-h-screen bg-slate-100 py-10">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl border border-slate-300 shadow-xl p-10">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-800">
                            Cadastro de Pescador
                        </h1>
                        <p className="text-slate-500 mt-2">
                            Preencha os dados abaixo para completar o cadastro
                        </p>
                    </div>

                    <div className="mb-6 bg-slate-100 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-600">
                                Etapa {etapaAtual} de {TOTAL_ETAPAS}
                            </span>
                            <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-300"
                                    style={{
                                        width: `${(etapaAtual / TOTAL_ETAPAS) * 100}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* ETAPA 1: INFORMAÇÕES PESSOAIS */}
                    {etapaAtual === 1 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">
                                Informações Pessoais
                            </h2>
                            <div className="grid md:grid-cols-2 gap-5">
                                <InputGroup
                                    label="Nome completo"
                                    name="nomeCompleto"
                                    value={formData.nomeCompleto || ""}
                                    onChange={handleInputChange}
                                />
                                <InputGroup
                                    label="CPF"
                                    name="cpf"
                                    value={formData.cpf || ""}
                                    onChange={handleInputChange}
                                />
                                <InputGroup
                                    label="Data de nascimento"
                                    name="dataNascimento"
                                    type="date"
                                    value={formData.dataNascimento || ""}
                                    onChange={handleInputChange}
                                />
                                <SelectGroup
                                    label="Sexo"
                                    name="sexo"
                                    value={formData.sexo || ""}
                                    onChange={handleInputChange}
                                    options={[
                                        { id: "", nome: "Selecione" },
                                        { id: "M", nome: "Masculino" },
                                        { id: "F", nome: "Feminino" }
                                    ]}
                                />
                            </div>
                        </div>
                    )}

                    {/* ETAPA 2: INFORMAÇÕES DE CONTATO */}
                    {etapaAtual === 2 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">
                                Informações de Contato
                            </h2>
                            <div className="grid md:grid-cols-2 gap-5">
                                <InputGroup
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email || ""}
                                    onChange={handleInputChange}
                                />
                                <InputGroup
                                    label="Telefone"
                                    name="telefone"
                                    value={formData.telefone || ""}
                                    onChange={handleInputChange}
                                />
                                <InputGroup
                                    label="Rua"
                                    name="rua"
                                    value={formData.rua || ""}
                                    onChange={handleInputChange}
                                />
                                <InputGroup
                                    label="Número"
                                    name="numero"
                                    value={formData.numero || ""}
                                    onChange={handleInputChange}
                                />
                                <InputGroup
                                    label="Complemento"
                                    name="complemento"
                                    value={formData.complemento || ""}
                                    onChange={handleInputChange}
                                />
                                <InputGroup
                                    label="Bairro"
                                    name="bairro"
                                    value={formData.bairro || ""}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    )}

                    {/* ETAPA 3: LOCALIZAÇÃO GEOGRÁFICA */}
                    {etapaAtual === 3 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">
                                Localização Geográfica
                            </h2>
                            <div className="grid md:grid-cols-2 gap-5">
                                <SelectGroup
                                    label="Município"
                                    name="municipio"
                                    value={formData.municipio || ""}
                                    onChange={handleInputChange}
                                    options={municipios.map((m) => ({
                                        id: m.municipio,
                                        nome: m.municipio
                                    }))}
                                />
                                <SelectGroup
                                    label="Localidade"
                                    name="localidade"
                                    value={formData.localidade || ""}
                                    onChange={handleInputChange}
                                    options={localidades.map((l) => ({
                                        id: l,
                                        nome: l
                                    }))}
                                />
                                <InputGroup
                                    label="CEP"
                                    name="cep"
                                    value={formData.cep || ""}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    )}

                    {/* ETAPA 4: INFORMAÇÕES PROFISSIONAIS */}
                    {etapaAtual === 4 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">
                                Informações Profissionais
                            </h2>
                            <div className="grid md:grid-cols-2 gap-5">
                                <InputGroup
                                    label="Número de RGP"
                                    name="numeroRGP"
                                    value={formData.numeroRGP || ""}
                                    onChange={handleInputChange}
                                />
                                <InputGroup
                                    label="Colônia de Pescadores"
                                    name="coloniaAfiliacoes"
                                    value={formData.coloniaAfiliacoes || ""}
                                    onChange={handleInputChange}
                                />
                                <SelectGroup
                                    label="Tipo de Pescador"
                                    name="tipoPescador"
                                    value={formData.tipoPescador || ""}
                                    onChange={handleInputChange}
                                    options={[
                                        { id: "", nome: "Selecione" },
                                        { id: "artesanal", nome: "Artesanal" },
                                        { id: "industrial", nome: "Industrial" },
                                        { id: "misto", nome: "Misto" }
                                    ]}
                                />
                                <SelectGroup
                                    label="É filiado a alguma associação?"
                                    name="eFiliadoAssociacao"
                                    value={formData.eFiliadoAssociacao || ""}
                                    onChange={handleInputChange}
                                    options={OPCOES_SIM_NAO}
                                />
                            </div>
                        </div>
                    )}

                    {/* ETAPA 5: INFORMAÇÕES SOBRE EMBARCAÇÕES */}
                    {etapaAtual === 5 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">
                                Informações sobre Embarcações
                            </h2>
                            <p className="text-slate-500 mb-6">
                                Cadastre informações sobre a embarcação(ões) utilizada(s).
                            </p>

                            <div className="space-y-8">
                                {formData.embarcacoes.map((emb, idx) => (
                                    <div key={idx} className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-50 rounded-lg">
                                        <h3 className="font-semibold text-slate-700 mb-4">
                                            Embarcação {idx + 1}
                                        </h3>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <InputGroup
                                                label="Nome da Embarcação"
                                                name="nomeEmbarcacao"
                                                value={emb.nomeEmbarcacao || ""}
                                                onChange={(e) => handleEmbarcacaoInputChange(idx, "nomeEmbarcacao", e.target.value)}
                                            />
                                            <InputGroup
                                                label="Comprimento (m)"
                                                name="comprimento"
                                                type="number"
                                                value={emb.comprimento || ""}
                                                onChange={(e) => handleEmbarcacaoInputChange(idx, "comprimento", e.target.value)}
                                            />
                                            <InputGroup
                                                label="Boca (m)"
                                                name="boca"
                                                type="number"
                                                value={emb.boca || ""}
                                                onChange={(e) => handleEmbarcacaoInputChange(idx, "boca", e.target.value)}
                                            />
                                            <InputGroup
                                                label="Pontal (m)"
                                                name="pontal"
                                                type="number"
                                                value={emb.pontal || ""}
                                                onChange={(e) => handleEmbarcacaoInputChange(idx, "pontal", e.target.value)}
                                            />
                                            <InputGroup
                                                label="Tonelagem (t)"
                                                name="tonelagem"
                                                type="number"
                                                value={emb.tonelagem || ""}
                                                onChange={(e) => handleEmbarcacaoInputChange(idx, "tonelagem", e.target.value)}
                                            />
                                            <SelectGroup
                                                label="Tipo de Embarcação"
                                                name="tipoEmbarcacao"
                                                value={emb.tipoEmbarcacao || ""}
                                                onChange={(e) => handleEmbarcacaoInputChange(idx, "tipoEmbarcacao", e.target.value)}
                                                options={[
                                                    { id: "", nome: "Selecione" },
                                                    { id: "lancha", nome: "Lancha" },
                                                    { id: "bote", nome: "Bote" },
                                                    { id: "barco", nome: "Barco" },
                                                    { id: "jangada", nome: "Jangada" }
                                                ]}
                                            />
                                        </div>

                                        <div className="mt-6">
                                            <h4 className="font-semibold text-slate-700 mb-3">
                                                Propulsão
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {["vela", "motor", "remo", "tração_animal"].map((prop) => (
                                                    <CheckboxGroup
                                                        key={prop}
                                                        label={prop.charAt(0).toUpperCase() + prop.slice(1)}
                                                        name={prop}
                                                        checked={emb.propulsoes?.[prop] || false}
                                                        onChange={(e) => togglePropulsao(idx, prop, e.target.checked)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ETAPA 6: TIPOS DE PESCA */}
                    {etapaAtual === 6 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">
                                Tipos de Pesca
                            </h2>
                            <div className="grid md:grid-cols-2 gap-5">
                                <CheckboxGroup
                                    label="Pesca em Alto Mar"
                                    name="pescaAltoMar"
                                    checked={formData.pescaAltoMar || false}
                                    onChange={handleCheckboxChange}
                                />
                                <CheckboxGroup
                                    label="Pesca em Águas Interiores"
                                    name="pescaAguasInteriores"
                                    checked={formData.pescaAguasInteriores || false}
                                    onChange={handleCheckboxChange}
                                />
                                <CheckboxGroup
                                    label="Pesca em Áreas Protegidas"
                                    name="pescaAreasProtegidas"
                                    checked={formData.pescaAreasProtegidas || false}
                                    onChange={handleCheckboxChange}
                                />
                                <CheckboxGroup
                                    label="Aquicultura"
                                    name="aquicultura"
                                    checked={formData.aquicultura || false}
                                    onChange={handleCheckboxChange}
                                />
                            </div>
                        </div>
                    )}

                    {/* ETAPA 7: TÉCNICAS E EQUIPAMENTOS */}
                    {etapaAtual === 7 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">
                                Técnicas e Equipamentos de Pesca
                            </h2>
                            <div className="grid md:grid-cols-2 gap-5">
                                <CheckboxGroup
                                    label="Rede de Arrasto"
                                    name="rede_arrasto"
                                    checked={formData.rede_arrasto || false}
                                    onChange={handleCheckboxChange}
                                />
                                <CheckboxGroup
                                    label="Rede de Cerco"
                                    name="rede_cerco"
                                    checked={formData.rede_cerco || false}
                                    onChange={handleCheckboxChange}
                                />
                                <CheckboxGroup
                                    label="Anzol e Linha"
                                    name="anzol_linha"
                                    checked={formData.anzol_linha || false}
                                    onChange={handleCheckboxChange}
                                />
                                <CheckboxGroup
                                    label="Armadilha"
                                    name="armadilha"
                                    checked={formData.armadilha || false}
                                    onChange={handleCheckboxChange}
                                />
                                <CheckboxGroup
                                    label="Mergulho"
                                    name="mergulho"
                                    checked={formData.mergulho || false}
                                    onChange={handleCheckboxChange}
                                />
                                <CheckboxGroup
                                    label="Arpão"
                                    name="arpao"
                                    checked={formData.arpao || false}
                                    onChange={handleCheckboxChange}
                                />
                            </div>
                        </div>
                    )}

                    {/* ETAPA 8: ESPÉCIES CAPTURADAS */}
                    {etapaAtual === 8 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">
                                Espécies Capturadas
                            </h2>
                            <p className="text-slate-500 mb-6">
                                Cadastre as espécies capturadas pelo pescador.
                            </p>

                            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-2 px-2 pb-1 border-b border-slate-200 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                <span>Espécie</span>
                                <span>Início Safra</span>
                                <span>Fim Safra</span>
                                <span>Período (dias)</span>
                                <span></span>
                            </div>

                            <div className="space-y-2">
                                {formData.especies.length === 0 && (
                                    <p className="text-center text-slate-400 py-8 text-sm">
                                        Nenhuma espécie adicionada.
                                    </p>
                                )}

                                {formData.especies.map((esp, idx) => (
                                    <div key={esp.rowId} className="relative grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_80px] gap-2 items-start border-b border-slate-100 pb-2">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Buscar ou descrever espécie..."
                                                value={esp.buscaTexto}
                                                onChange={(e) => handleEspecieBusca(idx, e.target.value)}
                                                onFocus={() => handleEspecieFocus(idx)}
                                                onBlur={() => handleEspecieBlur(idx)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
                                            />
                                            {esp.sugestoesvisiveis && especieSugestoes(esp.buscaTexto).length > 0 && (
                                                <div className="absolute top-full left-0 right-0 z-10 mt-1 border border-slate-200 rounded-lg bg-white shadow-lg max-h-40 overflow-y-auto">
                                                    {especieSugestoes(esp.buscaTexto).map((e) => (
                                                        <div
                                                            key={e.ID}
                                                            onClick={() => handleEspecieSelecionada(idx, e)}
                                                            className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm"
                                                        >
                                                            <strong>{e.Nome_popular || e.nome_popular}</strong>
                                                            <br />
                                                            <small className="text-slate-500">
                                                                {e.Nome_cientifico || e.nome_cientifico}
                                                            </small>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {esp.nome_popular && (
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Selecionado: {esp.nome_popular}
                                                </p>
                                            )}
                                        </div>
                                        <input
                                            type="date"
                                            value={esp.inicioSafra || ""}
                                            onChange={(e) => handleEspecieCampo(idx, "inicioSafra", e.target.value)}
                                            className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
                                        />
                                        <input
                                            type="date"
                                            value={esp.fimSafra || ""}
                                            onChange={(e) => handleEspecieCampo(idx, "fimSafra", e.target.value)}
                                            className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
                                        />
                                        <input
                                            type="number"
                                            placeholder="0"
                                            readOnly
                                            value={esp.inicioSafra && esp.fimSafra
                                                ? Math.round((new Date(esp.fimSafra) - new Date(esp.inicioSafra)) / (1000 * 60 * 60 * 24))
                                                : ""}
                                            className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-blue-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removerEspecieLinha(idx)}
                                            className="px-2 py-2 rounded-lg border border-red-400 text-red-500 text-xs hover:bg-red-50 transition h-fit"
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
                                    + Adicionar Espécie
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ETAPA 9: CAPACIDADE DE ARMAZENAGEM */}
                    {etapaAtual === 9 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">
                                Capacidade de Armazenagem
                            </h2>
                            <div className="grid md:grid-cols-2 gap-5">
                                <InputGroup
                                    label="Capacidade de Carga (kg)"
                                    name="capacidadeCarga"
                                    type="number"
                                    value={formData.capacidadeCarga || ""}
                                    onChange={handleInputChange}
                                />
                                <InputGroup
                                    label="Equipamento de Refrigeração (litros)"
                                    name="equipamentoRefrigeracao"
                                    type="number"
                                    value={formData.equipamentoRefrigeracao || ""}
                                    onChange={handleInputChange}
                                />
                                <SelectGroup
                                    label="Possui câmara fria?"
                                    name="possuiCamaraFria"
                                    value={formData.possuiCamaraFria || ""}
                                    onChange={handleInputChange}
                                    options={OPCOES_SIM_NAO}
                                />
                                <SelectGroup
                                    label="Possui tanque de armazenagem?"
                                    name="possuiTanqueArmazenagem"
                                    value={formData.possuiTanqueArmazenagem || ""}
                                    onChange={handleInputChange}
                                    options={OPCOES_SIM_NAO}
                                />
                            </div>
                        </div>
                    )}

                    {/* ETAPA 10: QUADRANTES DE PESCA */}
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
                                        setFormData(prev => ({ ...prev, quadrantes: novos }));
                                    }}
                                />
                                <InputGroup
                                    label="Quadrante 2"
                                    name="quadrante2"
                                    value={formData.quadrantes[1]}
                                    onChange={(e) => {
                                        const novos = [...formData.quadrantes];
                                        novos[1] = e.target.value;
                                        setFormData(prev => ({ ...prev, quadrantes: novos }));
                                    }}
                                />
                                <InputGroup
                                    label="Quadrante 3"
                                    name="quadrante3"
                                    value={formData.quadrantes[2]}
                                    onChange={(e) => {
                                        const novos = [...formData.quadrantes];
                                        novos[2] = e.target.value;
                                        setFormData(prev => ({ ...prev, quadrantes: novos }));
                                    }}
                                />
                                <InputGroup
                                    label="Quadrante 4"
                                    name="quadrante4"
                                    value={formData.quadrantes[3]}
                                    onChange={(e) => {
                                        const novos = [...formData.quadrantes];
                                        novos[3] = e.target.value;
                                        setFormData(prev => ({ ...prev, quadrantes: novos }));
                                    }}
                                />
                                <InputGroup
                                    label="Quadrante 5"
                                    name="quadrante5"
                                    value={formData.quadrantes[4]}
                                    onChange={(e) => {
                                        const novos = [...formData.quadrantes];
                                        novos[4] = e.target.value;
                                        setFormData(prev => ({ ...prev, quadrantes: novos }));
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* ETAPA 11: DESPESAS DA ATIVIDADE */}
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
                                {formData.despesas.length === 0 && (
                                    <p className="text-center text-slate-400 py-8 text-sm">
                                        Nenhuma despesa adicionada.
                                    </p>
                                )}
                                {formData.despesas.map((desp, idx) => (
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

                    {/* ETAPA 12: PRODUÇÃO E COMERCIALIZAÇÃO */}
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
                                    label="Produção média (kg)"
                                    name="producaoMedia"
                                    type="number"
                                    value={formData.producaoMedia}
                                    onChange={handleInputChange}
                                />
                                <InputGroup
                                    label="Valor médio obtido (R$)"
                                    name="valorMedio"
                                    type="number"
                                    value={formData.valorMedio}
                                    onChange={handleInputChange}
                                />
                                <TextareaGroup
                                    label="Observações"
                                    name="observacoes"
                                    value={formData.observacoes || ""}
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
                                    Cadastro salvo com sucesso!
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={async () => {
                                        const ok = await submitForm();
                                        if (ok) {
                                            setTimeout(() => router.push("/"), 1500);
                                        }
                                    }}
                                    disabled={salvando || sucessoSubmit}
                                    className="px-8 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-50"
                                >
                                    {salvando ? "Salvando..." : "Salvar Cadastro"}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between mt-10">
                        <button
                            onClick={etapaAnterior}
                            disabled={etapaAtual === 1}
                            className="px-6 py-3 rounded-lg bg-slate-300 disabled:opacity-40"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={proximaEtapa}
                            disabled={etapaAtual === TOTAL_ETAPAS}
                            className="px-6 py-3 rounded-lg bg-blue-600 text-white"
                        >
                            Próximo
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}