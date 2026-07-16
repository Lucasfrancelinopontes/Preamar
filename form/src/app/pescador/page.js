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

const TOTAL_ETAPAS = 10;

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

    // Retorna sugestões filtradas por ID (idd) ou nome similar
    function especieSugestoes(texto) {
        if (!texto || texto.trim() === "") return [];
        const t = texto.trim().toLowerCase();
        return especiesDisponiveis
            .filter((e) => {
                const porId  = String(e.idd ?? e.ID_especie ?? "").toLowerCase().includes(t);
                const porNome = (e.nome_popular ?? "").toLowerCase().includes(t);
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
                id_especie:      especie.ID_especie,
                buscaTexto:      String(especie.idd ?? especie.ID_especie),
                nome_popular:    especie.nome_popular,
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
            (m) => m.municipio === formData.municipio
        );

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

                            Cadastro Socioeconômico do Pescador

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

                    {etapaAtual === 1 && (

                        <div>

                            <h2 className="text-xl font-bold mb-6 color-slate-800">

                                Informações Iniciais

                            </h2>

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
                                        { id: "autonomo", nome: "Autônomo" },
                                        { id: "empregado", nome: "Empregado" },
                                        { id: "familiar", nome: "Trabalho Familiar" },
                                        { id: "cooperativa", nome: "Cooperativa" },
                                        { id: "outro", nome: "Outro" }
                                    ]}
                                    optionLabel="nome"
                                    optionValue="id"
                                />

                                <InputGroup
                                    label="Atividade Principal"
                                    name="atividadePrincipal"
                                    value={formData.atividadePrincipal}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Atividade Secundária"
                                    name="atividadeSecundaria"
                                    value={formData.atividadeSecundaria}
                                    onChange={handleInputChange}
                                />

                                <TextareaGroup
                                    label="Outras Fontes de Renda"
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
                                                            key={s.ID_especie}
                                                            type="button"
                                                            onMouseDown={(e) => { e.preventDefault(); handleEspecieSelecionada(idx, s); }}
                                                            className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b border-slate-100 last:border-0"
                                                        >
                                                            <span className="font-medium text-blue-700">{s.idd ?? s.ID_especie}</span>
                                                            <span className="text-slate-600"> — {s.nome_popular}</span>
                                                            {s.nome_cientifico && (
                                                                <span className="text-slate-400 italic text-xs block">{s.nome_cientifico}</span>
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
                    {etapaAtual === 9 && (

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
                    {etapaAtual === 10 && (

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