"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/services/api";
import { mapFormDataToPayload, mapApiToFormData } from "./utils/mapper";
import DeleteConfirmModal from "./DeleteConfirmModal";
// ─────────────────────────────────────────────────────────────────────────────
// Classes base padronizadas (alinhadas com Desembarque e Pescador)
// ─────────────────────────────────────────────────────────────────────────────
const inputClass =
    "w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-black outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-blue-600";

const btnPrimary =
    "rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50";

const btnSecondary =
    "rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

const btnDanger =
    "rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40";

const btnAdd =
    "rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700";

const labelClass = "mb-1.5 block text-sm font-semibold text-black";

const TIPO_ESTABELECIMENTO_OPTIONS = [
    { value: "PEIXARIA", label: "Peixaria" },
    { value: "FEIRA_LIVRE", label: "Feira livre" },
    { value: "MERCADO", label: "Mercado" },
];

const RELACOES_TRABALHO_OPTIONS = [
    "Familiar",
    "Artesanal com vizinhos/amigos",
    "Armador ou embarcado",
    "Assalariado (carteira assinada)",
];



// ─────────────────────────────────────────────────────────────────────────────
// Componentes de formulário locais — padrão Desembarque/Pescador
// ─────────────────────────────────────────────────────────────────────────────

function SectionTitle({ children }) {
    return (
        <h3 className="mb-4 text-lg font-semibold text-black">{children}</h3>
    );
}

function SectionDivider({ title }) {
    return (
        <h3 className="mb-4 border-t pt-6 text-lg font-semibold text-black">
            {title}
        </h3>
    );
}

function SectionCard({ subtitle, title, children }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6">
                <p className="text-sm font-semibold text-blue-600">{subtitle}</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-800">{title}</h2>
            </div>
            {children}
        </div>
    );
}

function InputGroup({ label, name, value, onChange, type = "text", placeholder = "", colSpan = 1, inputMode, min, max, step, readOnly, disabled }) {
    const isNumberInput = type === "number";
    const handleWheel = (e) => { if (isNumberInput) e.currentTarget.blur(); };
    return (
        <div className={colSpan === 2 ? "md:col-span-2" : colSpan === 3 ? "md:col-span-3" : ""}>
            <label className={labelClass}>{label}</label>
            <input
                type={type}
                name={name}
                value={value ?? ""}
                onChange={onChange}
                onWheel={handleWheel}
                placeholder={placeholder}
                inputMode={inputMode}
                min={min}
                max={max}
                step={step}
                readOnly={readOnly}
                disabled={disabled}
                className={inputClass}
            />
        </div>
    );
}

function SelectGroup({ label, name, value, onChange, options, colSpan = 1 }) {
    return (
        <div className={colSpan === 2 ? "md:col-span-2" : ""}>
            <label className={labelClass}>{label}</label>
            <select name={name} value={value ?? ""} onChange={onChange} className={inputClass}>
                <option value="">Selecione</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function TextareaGroup({ label, name, value, onChange, rows = 3, colSpan = 2 }) {
    return (
        <div className={colSpan === 2 ? "md:col-span-2" : ""}>
            <label className={labelClass}>{label}</label>
            <textarea
                name={name}
                value={value ?? ""}
                onChange={onChange}
                rows={rows}
                className={`${inputClass} resize-none`}
            />
        </div>
    );
}

function FormGrid({ children, cols = 2 }) {
    const colClass = cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2";
    return (
        <div className={`grid grid-cols-1 gap-5 ${colClass}`}>
            {children}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente de linha condicional (Sim/Não → campo extra)
// ─────────────────────────────────────────────────────────────────────────────
function ConditionalField({ selectLabel, selectName, selectValue, onSelectChange, fieldLabel, fieldName, fieldValue, onFieldChange }) {
    return (
        <>
            <SelectGroup
                label={selectLabel}
                name={selectName}
                value={selectValue}
                onChange={onSelectChange}
                options={[{ value: "Sim", label: "Sim" }, { value: "Não", label: "Não" }]}
            />
            {selectValue === "Sim" && (
                <InputGroup
                    label={fieldLabel}
                    name={fieldName}
                    value={fieldValue}
                    onChange={onFieldChange}
                />
            )}
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tabela genérica (padrão Desembarque)
// ─────────────────────────────────────────────────────────────────────────────
function DataTable({ headers, children, emptyMessage = "Nenhum registro encontrado." }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                    <tr>
                        {headers.map((h) => (
                            <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
            </table>
        </div>
    );
}

const mapToArray = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.result)) return response.result;
    return [];
};

// ─────────────────────────────────────────────────────────────────────────────
// Estado inicial
// ─────────────────────────────────────────────────────────────────────────────
const initialForm = {
    codPeixaria: "",
    dataColeta: "",
    consecutivoColeta: "",
    ID_municipio: "",
    tipoEstabelecimento: "",
    responsavel: "",
    contato: "",
    municipio: "",
    localidade: "",
    nome: "",
    apelido: "",
    naturalidade: "",
    sexo: "",
    idade: "",
    atividadePrincipal: "",
    atividadeSecundaria: "",
    totalPeixariasBoxes: "",
    quantosPossui: "",
    estadoCivil: "",
    numeroFamiliares: "",
    escolaridade: "",
    localMoradia: "",
    possuiRegistroINSS: "",
    filiadoColonia: "",
    qualColonia: "",
    participaAssociacao: "",
    qualAssociacao: "",
    possuiCarteiraPescador: "",
    orgaoEmissorCarteira: "",
    relacoesTrabalho: [],
    possuiPlanoSaude: "",
    planoSaudeEspecificar: "",
    atividadesRendaFamilia: "",
    quemTrabalhaFamilia: "",
    tempoAtividade: "",
    atividadeComercial: "",
    periodoComercializacao: "",
    formaVenda: "",
    transporte: "",
    ordemVendaLocal: "",
    descricaoProcessoComercio: "",
    despesas: [
        { id: 1, descricao: "Gelo", quantidade: "", custo: "", frequencia: "" },
        { id: 2, descricao: "Isopor", quantidade: "", custo: "", frequencia: "" },
        { id: 3, descricao: "Energia", quantidade: "", custo: "", frequencia: "" },
        { id: 4, descricao: "Aluguel", quantidade: "", custo: "", frequencia: "" },
        { id: 5, descricao: "Salários", quantidade: "", custo: "", frequencia: "" },
        { id: 6, descricao: "Outros", quantidade: "", custo: "", frequencia: "" },
    ],
    fornecedores: [{ id: 1, nome: "", tipo: "", telefone: "" }],
    pescadoresLocais: [{ id: 1, nome: "", comunidade: "", volume: "" }],
    pescadoresEntregam: [{ id: 1, apelido: "", tipoBarco: "", numeroPescadores: "", volumeMedio: "", regularidade: "" }],
    especies: [{ id: 1, especie: "", quantidade: "", preco: "" }],
    perdas: [{ id: 1, descricao: "", quantidade: "", causa: "" }],
    perdasPorEspecie: [
        { id: 1, titulo: "Espécie 1", linhas: [{ causa: "Deterioração", estimativa: "", destino: "" }, { causa: "Falta de mercado", estimativa: "", destino: "" }, { causa: "Transporte", estimativa: "", destino: "" }] },
        { id: 2, titulo: "Espécie 2", linhas: [{ causa: "Deterioração", estimativa: "", destino: "" }, { causa: "Falta de mercado", estimativa: "", destino: "" }, { causa: "Transporte", estimativa: "", destino: "" }] },
        { id: 3, titulo: "Espécie 3", linhas: [{ causa: "Deterioração", estimativa: "", destino: "" }, { causa: "Falta de mercado", estimativa: "", destino: "" }, { causa: "Transporte", estimativa: "", destino: "" }] },
    ],
    mercadoLocal: { volume: "", valor: "", observacoes: "", linhas: [{ id: 1, especie: "", formaComercializacao: "", destino: "", volumeMedio: "", precoVenda: "" }] },
    especiesComerciais: [{ id: 1, especie: "", quantidadeFresco: "", quantidadeCongelado: "", precoCompra: "", precoVenda: "" }],
    observacoesEspecies: "",
    origemPescado: [
        { id: 1, tipo: "Total pescado", pescadoresLocais: "", outrasLocalidadesPB: "", outrosEstados: "", outro: "" },
        { id: 2, tipo: "Peixe fresco", pescadoresLocais: "", outrasLocalidadesPB: "", outrosEstados: "", outro: "" },
        { id: 3, tipo: "Peixe congelado", pescadoresLocais: "", outrasLocalidadesPB: "", outrosEstados: "", outro: "" },
        { id: 4, tipo: "Processado", pescadoresLocais: "", outrasLocalidadesPB: "", outrosEstados: "", outro: "" },
        { id: 5, tipo: "Lagosta", pescadoresLocais: "", outrasLocalidadesPB: "", outrosEstados: "", outro: "" },
        { id: 6, tipo: "Camarão", pescadoresLocais: "", outrasLocalidadesPB: "", outrosEstados: "", outro: "" },
        { id: 7, tipo: "Polvo", pescadoresLocais: "", outrasLocalidadesPB: "", outrosEstados: "", outro: "" },
        { id: 8, tipo: "Outro", pescadoresLocais: "", outrasLocalidadesPB: "", outrosEstados: "", outro: "" },
    ],
    mercadoEstadual: { volume: "", valor: "", observacoes: "", linhas: [{ id: 1, especie: "", formaComercializacao: "", destino: "", volumeMedio: "", precoVenda: "" }] },
    mercadoNacional: { volume: "", valor: "", observacoes: "", linhas: [{ id: 1, especie: "", formaComercializacao: "", destino: "", volumeMedio: "", precoVenda: "" }] },
    mercadoInternacional: { volume: "", valor: "", observacoes: "", linhas: [{ id: 1, especie: "", formaComercializacao: "", destino: "", volumeMedio: "", precoVenda: "" }] },
};
// ─────────────────────────────────────────────────────────────────────────────
// Definição dos steps do wizard
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
    { id: 0, title: "Identificação e dados pessoais", subtitle: "Dados pessoais" },
    { id: 1, title: "Atividade e vínculos", subtitle: "Atividade profissional" },
    { id: 2, title: "Despesas no comércio", subtitle: "Custos operacionais" },
    { id: 3, title: "Fornecedores e pescadores", subtitle: "Cadeia de fornecimento" },
    { id: 4, title: "Espécies e comercialização", subtitle: "Produção e preços" },
    { id: 5, title: "Perdas por espécie", subtitle: "Perdas" },
    { id: 6, title: "Mercados", subtitle: "Comercialização final" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Componente de indicador de progresso (steps)
// ─────────────────────────────────────────────────────────────────────────────
function StepIndicator({ steps, currentStep, onStepClick }) {
    const progressWidth = steps.length <= 1 ? 0 : ((currentStep) / (steps.length - 1)) * 100;

    return (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-2 flex justify-between px-1 text-xs font-medium text-slate-400 sm:text-sm">
                {steps.map((step, idx) => (
                    <button
                        key={step.id}
                        type="button"
                        onClick={() => onStepClick(idx)}
                        className={`text-left ${idx <= currentStep ? "font-bold text-blue-600" : "hidden sm:inline"}`}
                    >
                        {idx + 1}. {step.subtitle}
                    </button>
                ))}
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, progressWidth))}%` }}
                />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────
export default function PeixariaClient() {
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");
    const isEditMode = Boolean(editId);

    const [currentStep, setCurrentStep] = useState(0);
    const [form, setForm] = useState(initialForm);
    const [carregandoEdicao, setCarregandoEdicao] = useState(false);
    const [erroEnvio, setErroEnvio] = useState("");
    const [sucessoEnvio, setSucessoEnvio] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletando, setDeletando] = useState(false);
    const [verificandoCodigoPeixaria, setVerificandoCodigoPeixaria] = useState(false);
    const ultimoCodigoAlertadoRef = useRef("");
    const router = useRouter();

    const [municipios, setMunicipios] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [municipioSelecionado, setMunicipioSelecionado] = useState(null);
    const [localidadeSelecionada, setLocalidadeSelecionada] = useState(null);

    const codigoColetaGerado = useMemo(() => {
        const municipioCode = municipioSelecionado?.municipioCode?.trim();
        const localidadeCode = localidadeSelecionada?.localidadeCode?.trim();

        if (!municipioCode || !localidadeCode || !form.dataColeta) {
            return "";
        }

        const partesData = form.dataColeta.split("-");
        if (partesData.length !== 3) return "";

        const [ano, mes, dia] = partesData;
        const consecutivoNumero = Number(form.consecutivoColeta || 1);

        if (!Number.isInteger(consecutivoNumero) || consecutivoNumero <= 0) {
            return "";
        }

        const consecutivo = String(consecutivoNumero).padStart(2, "0");

        return `${municipioCode} ${localidadeCode} ${dia} ${mes} ${ano.slice(-2)} ${consecutivo}`;
    }, [municipioSelecionado, localidadeSelecionada, form.dataColeta, form.consecutivoColeta]);

    const validarCodigoPeixaria = useCallback(async () => {
        const codigo = (codigoColetaGerado || "").trim();
        if (!codigo) {
            const msg = "Preencha município, localidade, data e consecutivo para gerar o código da peixaria.";
            setErroEnvio(msg);
            window.alert(msg);
            return false;
        }

        if (isEditMode) return true;

        try {
            setVerificandoCodigoPeixaria(true);
            const resultado = await api.verificarCodigoPeixaria(codigo);
            if (resultado?.existe) {
                const msg = `O código ${codigo} já existe. Gere um novo código para continuar.`;
                setErroEnvio(msg);
                window.alert(msg);
                return false;
            }
            return true;
        } catch (error) {
            const msg = error?.message || "Não foi possível validar o código da peixaria.";
            setErroEnvio(msg);
            window.alert(msg);
            return false;
        } finally {
            setVerificandoCodigoPeixaria(false);
        }
    }, [codigoColetaGerado, isEditMode]);

    const carregarMunicipios = useCallback(async () => {
        try {
            const response = await api.getMunicipios();
            setMunicipios(mapToArray(response));
        } catch (err) {
            console.error(err);
        }
    }, []);

    const updateField = useCallback((field, value) => setForm((prev) => ({ ...prev, [field]: value })), []);

    const updateNumericField = useCallback((field, value) =>
        setForm((prev) => ({ ...prev, [field]: value.replace(/\D/g, "") })), []);

    const updateNestedField = useCallback((group, field, value) =>
        setForm((prev) => ({ ...prev, [group]: { ...prev[group], [field]: value } })), []);

    const updateArrayItem = useCallback((key, index, field, value) =>
        setForm((prev) => ({
            ...prev,
            [key]: prev[key].map((item, i) => (i === index ? { ...item, [field]: value } : item)),
        })), []);

    const updateMarketRow = useCallback((group, index, field, value) =>
        setForm((prev) => ({
            ...prev,
            [group]: {
                ...prev[group],
                linhas: prev[group].linhas.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
            },
        })), []);

    const addMarketRow = useCallback((group) =>
        setForm((prev) => ({
            ...prev,
            [group]: {
                ...prev[group],
                linhas: [...prev[group].linhas, { id: Date.now(), especie: "", formaComercializacao: "", destino: "", volumeMedio: "", precoVenda: "" }],
            },
        })), []);

    const removeMarketRow = useCallback((group, index) =>
        setForm((prev) => ({
            ...prev,
            [group]: {
                ...prev[group],
                linhas: prev[group].linhas.filter((_, i) => i !== index),
            },
        })), []);

    const updatePerdaPorEspecie = useCallback((speciesIndex, rowIndex, field, value) =>
        setForm((prev) => ({
            ...prev,
            perdasPorEspecie: prev.perdasPorEspecie.map((sp, si) =>
                si === speciesIndex
                    ? { ...sp, linhas: sp.linhas.map((row, ri) => (ri === rowIndex ? { ...row, [field]: value } : row)) }
                    : sp
            ),
        })), []);

    const handlePercentInput = useCallback((speciesIndex, rowIndex, value) => {
        const num = Math.min(100, Math.max(0, Number(value.replace(/[^0-9]/g, "") || 0)));
        updatePerdaPorEspecie(speciesIndex, rowIndex, "estimativa", String(num));
    }, [updatePerdaPorEspecie]);

    const addRow = useCallback((key, template) =>
        setForm((prev) => ({ ...prev, [key]: [...prev[key], { ...template, id: Date.now() }] })), []);

    const removeRow = useCallback((key, index) =>
        setForm((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) })), []);

    const toggleRelacaoTrabalho = useCallback((tipo) => {
        setForm((prev) => {
            const atuais = Array.isArray(prev.relacoesTrabalho) ? prev.relacoesTrabalho : [];
            const jaSelecionado = atuais.includes(tipo);
            return {
                ...prev,
                relacoesTrabalho: jaSelecionado
                    ? atuais.filter((item) => item !== tipo)
                    : [...atuais, tipo],
            };
        });
    }, []);

    const handleMunicipioChange = useCallback((e) => {
        const nomeMunicipio = e.target.value;
        const municipio = municipios.find((m) => m.municipio === nomeMunicipio);

        if (!municipio) {
            setMunicipioSelecionado(null);
            updateField("municipio", "");
            updateField("ID_municipio", "");
            setLocalidadeSelecionada(null);
            updateField("localidade", "");
            setLocalidades([]);
            return;
        }

        setMunicipioSelecionado(municipio);
        updateField("municipio", municipio.municipio || "");
        updateField("ID_municipio", municipio.ID_municipio || "");
        setLocalidadeSelecionada(null);
        updateField("localidade", "");
        setLocalidades(Array.isArray(municipio.localidades) ? municipio.localidades : []);
    }, [municipios, updateField]);

    const handleLocalidadeChange = useCallback((e) => {
        const nomeLocalidade = e.target.value;
        const localidade = localidades.find((l) => l.localidade === nomeLocalidade);

        if (!localidade) {
            setLocalidadeSelecionada(null);
            updateField("localidade", "");
            return;
        }

        setLocalidadeSelecionada(localidade);
        updateField("localidade", localidade.localidade || "");
    }, [localidades, updateField]);

    useEffect(() => {
        const municipio = municipios.find((m) => m.municipio === form.municipio) || null;
        setMunicipioSelecionado(municipio);

        const localidadesDoMunicipio = Array.isArray(municipio?.localidades) ? municipio.localidades : [];
        setLocalidades(localidadesDoMunicipio);

        const localidade = localidadesDoMunicipio.find((l) => l.localidade === form.localidade) || null;
        setLocalidadeSelecionada(localidade);
    }, [municipios, form.municipio, form.localidade]);

    useEffect(() => {
        if (isEditMode) return;
        const codigo = (codigoColetaGerado || "").trim();
        if (!codigo || codigo === ultimoCodigoAlertadoRef.current) return;

        let cancelado = false;

        const verificar = async () => {
            try {
                const resultado = await api.verificarCodigoPeixaria(codigo);
                if (!cancelado && resultado?.existe) {
                    ultimoCodigoAlertadoRef.current = codigo;
                    const msg = `O código ${codigo} já existe. Gere um novo código para continuar.`;
                    setErroEnvio(msg);
                    window.alert(msg);
                }
            } catch {
                // Não interrompe fluxo de digitação/edição por falha de verificação automática.
            }
        };

        verificar();

        return () => {
            cancelado = true;
        };
    }, [codigoColetaGerado, isEditMode]);

    useEffect(() => {
        carregarMunicipios();

        if (!isEditMode) {
            setForm(initialForm);
            setMunicipioSelecionado(null);
            setLocalidadeSelecionada(null);
            return;
        }

        const carregar = async () => {
            setCarregandoEdicao(true);
            setErroEnvio("");
            try {
                const response = await api.buscarPeixaria(editId);
                setForm(mapApiToFormData(response?.data || response));
            } catch (err) {
                console.error("[Peixaria] Erro ao carregar:", err);
                setErroEnvio(err?.message || `Não foi possível carregar a peixaria #${editId}.`);
            } finally {
                setCarregandoEdicao(false);
            }
        };

        carregar();
    }, [carregarMunicipios, editId, isEditMode]);

    // ── Helpers de atualização de estado ────────────────────────────────────

    // ── Validação ────────────────────────────────────────────────────────────
    const validarCamposObrigatorios = () => {
        setErroEnvio("");
        setSucessoEnvio("");
        return true;
    };

    // ── Validação por step ───────────────────────────────────────────────────
    const validarStep = () => {
        setErroEnvio("");
        setSucessoEnvio("");
        return true;
    };

    // ── Navegação de steps ──────────────────────────────────────────────────
    const handleNext = async () => {
        if (!validarStep()) return;
        const codigoValido = await validarCodigoPeixaria();
        if (!codigoValido) return;
        setCurrentStep(Math.min(currentStep + 1, STEPS.length - 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handlePrev = () => {
        setCurrentStep(Math.max(currentStep - 1, 0));
        setErroEnvio("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleStepClick = async (idx) => {
        if (idx <= currentStep) {
            setCurrentStep(idx);
            setErroEnvio("");
            return;
        }

        if (!validarStep()) return;
        const codigoValido = await validarCodigoPeixaria();
        if (!codigoValido) return;

        setCurrentStep(idx);
        setErroEnvio("");
    };

    // ── Salvar / Excluir ─────────────────────────────────────────────────────
    const handleSave = async () => {
        if (enviando || verificandoCodigoPeixaria) return;
        validarCamposObrigatorios();
        const codigoValido = await validarCodigoPeixaria();
        if (!codigoValido) return;
        const payload = mapFormDataToPayload(form);
        payload.cod_peixaria = codigoColetaGerado || null;
        setEnviando(true);
        setErroEnvio("");
        setSucessoEnvio("");
        try {
            const response = isEditMode
                ? await api.editarPeixaria(editId, payload)
                : await api.criarPeixaria(payload);
            if (response?.success) {
                setSucessoEnvio(isEditMode ? "Peixaria atualizada com sucesso." : "Peixaria criada com sucesso.");
                if (!isEditMode) {
                    setTimeout(() => router.push("/"), 800);
                }
            } else {
                throw new Error(response?.message || "Falha ao salvar peixaria.");
            }
        } catch (error) {
            console.error("[Peixaria] Erro ao salvar:", error);
            setErroEnvio(error?.message || "Erro ao salvar peixaria. Tente novamente.");
        } finally {
            setEnviando(false);
        }
    };

    const handleDelete = async () => {
        if (!isEditMode || deletando) return;
        setDeletando(true);
        setErroEnvio("");
        try {
            const response = await api.excluirPeixaria(editId);
            if (response?.success) {
                setSucessoEnvio("Peixaria excluída com sucesso. Redirecionando...");
                setShowDeleteModal(false);
                setTimeout(() => router.push("/peixaria"), 800);
                return;
            }
            throw new Error(response?.message || "Falha ao excluir peixaria.");
        } catch (err) {
            console.error("[Peixaria] Erro ao excluir:", err);
            const status = err?.status || err?.statusCode || 500;
            if (status === 404) setErroEnvio("Peixaria não encontrada (404).");
            else if (status === 403) setErroEnvio("Acesso negado (403). Você não tem permissão para excluir.");
            else setErroEnvio(err?.message || "Erro ao excluir peixaria. Tente novamente.");
        } finally {
            setDeletando(false);
        }
    };

    // ── Opções de select reutilizadas ────────────────────────────────────────
    const optsSexo = [{ value: "Masculino", label: "Masculino" }, { value: "Feminino", label: "Feminino" }];
    const optsEstadoCivil = [
        { value: "Solteiro", label: "Solteiro" }, { value: "Casado", label: "Casado" },
        { value: "Separado", label: "Separado" }, { value: "Viúvo", label: "Viúvo" },
    ];
    const optsSimNao = [{ value: "Sim", label: "Sim" }, { value: "Não", label: "Não" }];
    const optsFormaComercializacao = [
        { value: "Fresco", label: "Fresco" }, { value: "Congelado", label: "Congelado" },
        { value: "Processado", label: "Processado" }, { value: "Vivo", label: "Vivo" },
        { value: "Outro", label: "Outro" },
    ];

    // ── Loading state (edição) ───────────────────────────────────────────────
    if (carregandoEdicao) {
        return (
            <ProtectedRoute>
                <main className="min-h-screen bg-slate-100 py-10 flex items-center justify-center">
                    <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-xl text-center max-w-md w-full mx-4">
                        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                        <h1 className="text-2xl font-bold text-slate-800">Carregando peixaria...</h1>
                        <p className="mt-2 text-slate-500">Aguarde enquanto os dados são carregados.</p>
                    </div>
                </main>
            </ProtectedRoute>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-slate-100 py-8 md:py-10">
                <div className="mx-auto w-full max-w-6xl px-4 md:px-6 lg:px-8">

                    {/* ── Cabeçalho (fixo) ─────────────────────────────────── */}
                    <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-blue-600">Módulo operacional</p>
                                <h1 className="mt-1 text-3xl font-bold text-slate-800">
                                    {isEditMode ? "Editar Peixaria" : "Cadastro de Peixaria"}
                                </h1>
                                <p className="mt-2 text-sm text-slate-500">
                                    Formulário para cadastro das principais informações de comercialização, fornecedores e mercados.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    className={btnSecondary}
                                    onClick={() => {
                                        setForm(initialForm);
                                        setCurrentStep(0);
                                        setErroEnvio("");
                                        setSucessoEnvio("");
                                    }}
                                    disabled={enviando}
                                >
                                    Limpar
                                </button>
                                {isEditMode && (
                                    <button
                                        type="button"
                                        className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        onClick={() => setShowDeleteModal(true)}
                                        disabled={enviando}
                                    >
                                        Excluir
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Alertas ─────────────────────────────────────────────── */}
                    {erroEnvio && (
                        <div className="mb-6 rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600">
                            {erroEnvio}
                        </div>
                    )}
                    {sucessoEnvio && (
                        <div className="mb-6 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm font-medium text-emerald-600">
                            {sucessoEnvio}
                        </div>
                    )}

                    {/* ── Indicador de Steps ──────────────────────────────────── */}
                    <StepIndicator steps={STEPS} currentStep={currentStep} onStepClick={handleStepClick} />

                    {/* ── Conteúdo do Step Atual ──────────────────────────────── */}
                    <div className="space-y-6 min-h-96">

                        {/* ══════════════════════════════════════════════════════════════
                            STEP 1 · Identificação e dados pessoais
                        ══════════════════════════════════════════════════════════════ */}
                        {currentStep === 0 && (
                            <>
                                <SectionCard subtitle="Identificação da coleta" title="Localização e responsável">
                                    <FormGrid cols={2}>
                                        <div className="md:col-span-2">
                                            <label className={labelClass}>Tipo de estabelecimento</label>
                                            <div className="flex flex-wrap gap-3">
                                                {TIPO_ESTABELECIMENTO_OPTIONS.map((opt) => (
                                                    <label key={opt.value} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                                                        <input
                                                            type="radio"
                                                            name="tipoEstabelecimento"
                                                            value={opt.value}
                                                            checked={form.tipoEstabelecimento === opt.value}
                                                            onChange={(e) => updateField("tipoEstabelecimento", e.target.value)}
                                                            className="h-4 w-4 accent-blue-600"
                                                        />
                                                        {opt.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <InputGroup
                                            label="Código da coleta"
                                            name="codigoColeta"
                                            value={codigoColetaGerado}
                                            readOnly
                                        />
                                        <InputGroup label="Responsável pela coleta" name="responsavel" value={form.responsavel} onChange={(e) => updateField("responsavel", e.target.value)} />
                                        <SelectGroup
                                            label="Município"
                                            name="municipio"
                                            value={form.municipio}
                                            onChange={handleMunicipioChange}
                                            options={municipios.map((m) => ({
                                                value: m.municipio,
                                                label: m.municipio,
                                            }))}
                                        />
                                        <SelectGroup
                                            label="Localidade"
                                            name="localidade"
                                            value={form.localidade}
                                            onChange={handleLocalidadeChange}
                                            options={localidades.map((l) => ({
                                                value: l.localidade,
                                                label: l.localidade,
                                            }))}
                                        />
                                        <InputGroup label="Data da coleta" name="dataColeta" value={form.dataColeta} onChange={(e) => updateField("dataColeta", e.target.value)} type="date" />
                                        <InputGroup label="Conscecutivo da coleta" name="consecutivoColeta" value={form.consecutivoColeta} onChange={(e) => updateField("consecutivoColeta", e.target.value)} type="number" inputMode="numeric" />
                                    </FormGrid>
                                </SectionCard>

                                <SectionCard subtitle="Informações socioeconômicas" title="Dados do responsável pela peixaria">
                                    <FormGrid cols={2}>
                                        <InputGroup label="Nome" name="nome" value={form.nome} onChange={(e) => updateField("nome", e.target.value)} />
                                        <InputGroup label="Apelido" name="apelido" value={form.apelido} onChange={(e) => updateField("apelido", e.target.value)} />
                                        <InputGroup label="Naturalidade" name="naturalidade" value={form.naturalidade} onChange={(e) => updateField("naturalidade", e.target.value)} />
                                        <SelectGroup label="Sexo" name="sexo" value={form.sexo} onChange={(e) => updateField("sexo", e.target.value)} options={optsSexo} />
                                        <InputGroup label="Idade" name="idade" value={form.idade} type="number" inputMode="numeric" onChange={(e) => updateNumericField("idade", e.target.value)} />
                                        <SelectGroup label="Estado civil" name="estadoCivil" value={form.estadoCivil} onChange={(e) => updateField("estadoCivil", e.target.value)} options={optsEstadoCivil} />
                                        <InputGroup label="Número de familiares" name="numeroFamiliares" value={form.numeroFamiliares} type="number" inputMode="numeric" onChange={(e) => updateNumericField("numeroFamiliares", e.target.value)} />
                                        <InputGroup label="Escolaridade" name="escolaridade" value={form.escolaridade} onChange={(e) => updateField("escolaridade", e.target.value)} />
                                        <InputGroup label="Local de moradia" name="localMoradia" value={form.localMoradia} onChange={(e) => updateField("localMoradia", e.target.value)} />
                                    </FormGrid>
                                </SectionCard>
                            </>
                        )}

                        {/* ══════════════════════════════════════════════════════════════
                            STEP 2 · Atividade e vínculos
                        ══════════════════════════════════════════════════════════════ */}
                        {currentStep === 1 && (
                            <>
                                <SectionCard subtitle="Atividade profissional" title="Estrutura da peixaria">
                                    <FormGrid cols={2}>
                                        <InputGroup label="Atividade principal de renda" name="atividadePrincipal" value={form.atividadePrincipal} onChange={(e) => updateField("atividadePrincipal", e.target.value)} />
                                        <InputGroup label="Atividade secundária" name="atividadeSecundaria" value={form.atividadeSecundaria} onChange={(e) => updateField("atividadeSecundaria", e.target.value)} />
                                        <InputGroup label="Número total de peixarias/boxes" name="totalPeixariasBoxes" value={form.totalPeixariasBoxes} type="number" inputMode="numeric" onChange={(e) => updateNumericField("totalPeixariasBoxes", e.target.value)} />
                                        <InputGroup label="Quantos você possui" name="quantosPossui" value={form.quantosPossui} type="number" inputMode="numeric" onChange={(e) => updateNumericField("quantosPossui", e.target.value)} />
                                        <InputGroup label="Tempo de atividade" name="tempoAtividade" value={form.tempoAtividade} onChange={(e) => updateField("tempoAtividade", e.target.value)} />
                                        <TextareaGroup label="Atividades de renda da família" name="atividadesRendaFamilia" value={form.atividadesRendaFamilia} onChange={(e) => updateField("atividadesRendaFamilia", e.target.value)} rows={2} />
                                        <InputGroup label="Quem trabalha na família" name="quemTrabalhaFamilia" value={form.quemTrabalhaFamilia} onChange={(e) => updateField("quemTrabalhaFamilia", e.target.value)} />
                                    </FormGrid>
                                </SectionCard>

                                <SectionCard subtitle="Registros e filiações" title="Documentação e vínculos institucionais">
                                    <FormGrid cols={2}>
                                        <SelectGroup label="Possui registro no INSS" name="possuiRegistroINSS" value={form.possuiRegistroINSS} onChange={(e) => updateField("possuiRegistroINSS", e.target.value)} options={optsSimNao} />
                                        <ConditionalField
                                            selectLabel="Filiado à colônia de pescadores"
                                            selectName="filiadoColonia"
                                            selectValue={form.filiadoColonia}
                                            onSelectChange={(e) => updateField("filiadoColonia", e.target.value)}
                                            fieldLabel="Qual colônia"
                                            fieldName="qualColonia"
                                            fieldValue={form.qualColonia}
                                            onFieldChange={(e) => updateField("qualColonia", e.target.value)}
                                        />
                                        <ConditionalField
                                            selectLabel="Participa de associação"
                                            selectName="participaAssociacao"
                                            selectValue={form.participaAssociacao}
                                            onSelectChange={(e) => updateField("participaAssociacao", e.target.value)}
                                            fieldLabel="Qual associação"
                                            fieldName="qualAssociacao"
                                            fieldValue={form.qualAssociacao}
                                            onFieldChange={(e) => updateField("qualAssociacao", e.target.value)}
                                        />
                                        <ConditionalField
                                            selectLabel="Possui carteira de pescador"
                                            selectName="possuiCarteiraPescador"
                                            selectValue={form.possuiCarteiraPescador}
                                            onSelectChange={(e) => updateField("possuiCarteiraPescador", e.target.value)}
                                            fieldLabel="Órgão emissor da carteira"
                                            fieldName="orgaoEmissorCarteira"
                                            fieldValue={form.orgaoEmissorCarteira}
                                            onFieldChange={(e) => updateField("orgaoEmissorCarteira", e.target.value)}
                                        />
                                        <ConditionalField
                                            selectLabel="Possui plano de saúde"
                                            selectName="possuiPlanoSaude"
                                            selectValue={form.possuiPlanoSaude}
                                            onSelectChange={(e) => updateField("possuiPlanoSaude", e.target.value)}
                                            fieldLabel="Especificar plano de saúde"
                                            fieldName="planoSaudeEspecificar"
                                            fieldValue={form.planoSaudeEspecificar}
                                            onFieldChange={(e) => updateField("planoSaudeEspecificar", e.target.value)}
                                        />
                                        <div className="md:col-span-2">
                                            <label className={labelClass}>Relações de trabalho (múltipla seleção)</label>
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                {RELACOES_TRABALHO_OPTIONS.map((tipo) => {
                                                    const checked = (form.relacoesTrabalho || []).includes(tipo);
                                                    return (
                                                        <label key={tipo} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={() => toggleRelacaoTrabalho(tipo)}
                                                                className="h-4 w-4 accent-blue-600"
                                                            />
                                                            {tipo}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </FormGrid>
                                </SectionCard>
                            </>
                        )}

                        {/* ══════════════════════════════════════════════════════════════
                            STEP 3 · Despesas no comércio
                        ══════════════════════════════════════════════════════════════ */}
                        {currentStep === 2 && (
                            <SectionCard subtitle="Custos operacionais" title="Despesas da peixaria">
                                <SectionTitle>Itens de despesa</SectionTitle>
                                {form.despesas.length === 0 && (
                                    <p className="mb-4 text-sm text-slate-500">Nenhuma despesa registrada.</p>
                                )}
                                <div className="space-y-4">
                                    {form.despesas.map((despesa, idx) => (
                                        <div key={despesa.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <div className="mb-3 flex items-center justify-between">
                                                <p className="text-sm font-semibold text-black">{despesa.descricao || `Item ${idx + 1}`}</p>
                                            </div>
                                            <FormGrid cols={3}>
                                                <InputGroup label="Quantidade" name={`despesa_qtd_${idx}`} value={despesa.quantidade} onChange={(e) => updateArrayItem("despesas", idx, "quantidade", e.target.value)} placeholder="Ex.: 5" />
                                                <InputGroup label="Custo (R$)" name={`despesa_custo_${idx}`} value={despesa.custo} onChange={(e) => updateArrayItem("despesas", idx, "custo", e.target.value)} placeholder="Ex.: 50,00" />
                                                <InputGroup label="Frequência" name={`despesa_freq_${idx}`} value={despesa.frequencia} onChange={(e) => updateArrayItem("despesas", idx, "frequencia", e.target.value)} placeholder="Ex.: Mensal" />
                                            </FormGrid>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        )}

                        {/* ══════════════════════════════════════════════════════════════
                            STEP 4 · Fornecedores e pescadores
                        ══════════════════════════════════════════════════════════════ */}
                        {currentStep === 3 && (
                            <>
                                <SectionCard subtitle="Cadeia de fornecimento" title="Fornecedores dos pescados (%)">
                                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    {["Tipo", "Pescadores locais %", "Outras localidades (PB) %", "Outros estados %", "Outro %"].map((h) => (
                                                        <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 bg-white">
                                                {form.origemPescado.map((row, idx) => (
                                                    <tr key={row.id}>
                                                        <td className="px-4 py-3 text-sm font-semibold text-slate-700">{row.tipo}</td>
                                                        <td className="px-4 py-3"><input className={`${inputClass} text-right`} type="number" value={row.pescadoresLocais} onChange={(e) => updateArrayItem("origemPescado", idx, "pescadoresLocais", e.target.value)} placeholder="0" min="0" max="100" /></td>
                                                        <td className="px-4 py-3"><input className={`${inputClass} text-right`} type="number" value={row.outrasLocalidadesPB} onChange={(e) => updateArrayItem("origemPescado", idx, "outrasLocalidadesPB", e.target.value)} placeholder="0" min="0" max="100" /></td>
                                                        <td className="px-4 py-3"><input className={`${inputClass} text-right`} type="number" value={row.outrosEstados} onChange={(e) => updateArrayItem("origemPescado", idx, "outrosEstados", e.target.value)} placeholder="0" min="0" max="100" /></td>
                                                        <td className="px-4 py-3"><input className={`${inputClass} text-right`} type="number" value={row.outro} onChange={(e) => updateArrayItem("origemPescado", idx, "outro", e.target.value)} placeholder="0" min="0" max="100" /></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </SectionCard>

                                <SectionCard subtitle="Vínculos locais" title="Pescadores fornecedores locais">
                                    <div className="mb-4 flex items-center justify-between">
                                        <SectionTitle>Pescadores que entregam pescado</SectionTitle>
                                        <button type="button" className={btnAdd} onClick={() => addRow("pescadoresEntregam", { apelido: "", tipoBarco: "", numeroPescadores: "", volumeMedio: "", regularidade: "" })}>
                                            + Adicionar linha
                                        </button>
                                    </div>
                                    {form.pescadoresEntregam.length === 0 && (
                                        <p className="mb-4 text-sm text-slate-500">Nenhum registro adicionado.</p>
                                    )}
                                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    {["#", "Apelido", "Tipo de barco", "Nº pescadores", "Volume médio (kg)", "Regularidade", "Ações"].map((h) => (
                                                        <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 bg-white">
                                                {form.pescadoresEntregam.map((p, idx) => (
                                                    <tr key={p.id}>
                                                        <td className="px-4 py-3 text-sm font-semibold text-slate-600">{idx + 1}</td>
                                                        <td className="px-4 py-3"><input className={inputClass} value={p.apelido} onChange={(e) => updateArrayItem("pescadoresEntregam", idx, "apelido", e.target.value)} placeholder="Apelido" /></td>
                                                        <td className="px-4 py-3"><input className={inputClass} value={p.tipoBarco} onChange={(e) => updateArrayItem("pescadoresEntregam", idx, "tipoBarco", e.target.value)} placeholder="Ex.: Lancha" /></td>
                                                        <td className="px-4 py-3"><input className={`${inputClass} text-right`} type="number" value={p.numeroPescadores} onChange={(e) => updateArrayItem("pescadoresEntregam", idx, "numeroPescadores", e.target.value)} placeholder="0" min="0" /></td>
                                                        <td className="px-4 py-3"><input className={`${inputClass} text-right`} type="number" value={p.volumeMedio} onChange={(e) => updateArrayItem("pescadoresEntregam", idx, "volumeMedio", e.target.value)} placeholder="0" min="0" step="0.01" /></td>
                                                        <td className="px-4 py-3"><input className={inputClass} value={p.regularidade} onChange={(e) => updateArrayItem("pescadoresEntregam", idx, "regularidade", e.target.value)} placeholder="Ex.: Semanal" /></td>
                                                        <td className="px-4 py-3"><button type="button" className={btnDanger} onClick={() => removeRow("pescadoresEntregam", idx)}>Remover</button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </SectionCard>
                            </>
                        )}

                        {/* ══════════════════════════════════════════════════════════════
                            STEP 5 · Espécies e comercialização
                        ══════════════════════════════════════════════════════════════ */}
                        {currentStep === 4 && (
                            <>
                                <SectionCard subtitle="Atividade comercial" title="Forma de comercialização">
                                    <FormGrid cols={2}>
                                        <InputGroup label="Atividade comercial" name="atividadeComercial" value={form.atividadeComercial} onChange={(e) => updateField("atividadeComercial", e.target.value)} />
                                        <InputGroup label="Período de comercialização" name="periodoComercializacao" value={form.periodoComercializacao} onChange={(e) => updateField("periodoComercializacao", e.target.value)} />
                                        <InputGroup label="Forma de venda" name="formaVenda" value={form.formaVenda} onChange={(e) => updateField("formaVenda", e.target.value)} />
                                        <InputGroup label="Transporte" name="transporte" value={form.transporte} onChange={(e) => updateField("transporte", e.target.value)} />
                                    </FormGrid>
                                </SectionCard>

                                <SectionCard subtitle="Produção e preços" title="Espécies comercializadas">
                                    <div className="mb-4 flex items-center justify-between">
                                        <SectionTitle>Lista de espécies</SectionTitle>
                                        <button type="button" className={btnAdd} onClick={() => addRow("especiesComerciais", { especie: "", quantidadeFresco: "", quantidadeCongelado: "", precoCompra: "", precoVenda: "" })}>
                                            + Adicionar espécie
                                        </button>
                                    </div>
                                    {form.especiesComerciais.length === 0 && (
                                        <p className="mb-4 text-sm text-slate-500">Nenhuma espécie adicionada.</p>
                                    )}
                                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    {["#", "Espécie", "Qtd. fresco (kg)", "Qtd. congelado (kg)", "Preço compra (R$/kg)", "Preço venda (R$/kg)", "Ações"].map((h) => (
                                                        <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 bg-white">
                                                {form.especiesComerciais.map((esp, idx) => (
                                                    <tr key={esp.id}>
                                                        <td className="px-4 py-3 text-sm font-semibold text-slate-600">{idx + 1}</td>
                                                        <td className="px-4 py-3"><input className={inputClass} value={esp.especie} onChange={(e) => updateArrayItem("especiesComerciais", idx, "especie", e.target.value)} placeholder="Ex.: Tilápia" /></td>
                                                        <td className="px-4 py-3"><input className={`${inputClass} text-right`} type="number" value={esp.quantidadeFresco} onChange={(e) => updateArrayItem("especiesComerciais", idx, "quantidadeFresco", e.target.value)} placeholder="0" min="0" step="0.01" /></td>
                                                        <td className="px-4 py-3"><input className={`${inputClass} text-right`} type="number" value={esp.quantidadeCongelado} onChange={(e) => updateArrayItem("especiesComerciais", idx, "quantidadeCongelado", e.target.value)} placeholder="0" min="0" step="0.01" /></td>
                                                        <td className="px-4 py-3"><input className={`${inputClass} text-right`} type="number" value={esp.precoCompra} onChange={(e) => updateArrayItem("especiesComerciais", idx, "precoCompra", e.target.value)} placeholder="0,00" min="0" step="0.01" /></td>
                                                        <td className="px-4 py-3"><input className={`${inputClass} text-right`} type="number" value={esp.precoVenda} onChange={(e) => updateArrayItem("especiesComerciais", idx, "precoVenda", e.target.value)} placeholder="0,00" min="0" step="0.01" /></td>
                                                        <td className="px-4 py-3"><button type="button" className={btnDanger} onClick={() => removeRow("especiesComerciais", idx)}>Remover</button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-6">
                                        <SectionDivider title="Observações sobre espécies" />
                                        <TextareaGroup label="Nota (ex.: Peixes pelágicos - Nica 40-45 / Dourado)" name="observacoesEspecies" value={form.observacoesEspecies} onChange={(e) => updateField("observacoesEspecies", e.target.value)} rows={3} colSpan={2} />
                                    </div>
                                </SectionCard>
                            </>
                        )}

                        {/* ══════════════════════════════════════════════════════════════
                            STEP 6 · Perdas por espécie
                        ══════════════════════════════════════════════════════════════ */}
                        {currentStep === 5 && (
                            <SectionCard subtitle="Perdas" title="Perdas por espécie">
                                <div className="space-y-6">
                                    {form.perdasPorEspecie.map((sp, si) => (
                                        <div key={sp.id}>
                                            <SectionDivider title={sp.titulo} />
                                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                                <table className="min-w-full divide-y divide-slate-200 text-sm">
                                                    <thead className="bg-slate-50">
                                                        <tr>
                                                            {["Causa da perda", "Estimativa (%)", "Destino do peixe perdido"].map((h) => (
                                                                <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 bg-white">
                                                        {sp.linhas.map((linha, li) => (
                                                            <tr key={`${sp.id}-${li}`}>
                                                                <td className="px-4 py-3 font-medium text-slate-700">{linha.causa}</td>
                                                                <td className="px-4 py-3">
                                                                    <input
                                                                        className={`${inputClass} text-right`}
                                                                        type="number"
                                                                        value={linha.estimativa}
                                                                        onChange={(e) => handlePercentInput(si, li, e.target.value)}
                                                                        placeholder="0"
                                                                        min="0"
                                                                        max="100"
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <input
                                                                        className={inputClass}
                                                                        value={linha.destino}
                                                                        onChange={(e) => updatePerdaPorEspecie(si, li, "destino", e.target.value)}
                                                                        placeholder="Ex.: Mercado local"
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        )}

                        {/* ══════════════════════════════════════════════════════════════
                            STEP 7 · Mercados
                        ══════════════════════════════════════════════════════════════ */}
                        {currentStep === 6 && (
                            <>
                                {[
                                    { key: "mercadoLocal", titulo: "Mercado Local", subtitle: "Comercialização por mercado" },
                                    { key: "mercadoEstadual", titulo: "Mercado Estadual", subtitle: "Comercialização por mercado" },
                                    { key: "mercadoNacional", titulo: "Mercado Nacional", subtitle: "Comercialização por mercado" },
                                    { key: "mercadoInternacional", titulo: "Mercado Internacional", subtitle: "Comercialização por mercado" },
                                ].map(({ key, titulo, subtitle }) => (
                                    <SectionCard key={key} subtitle={subtitle} title={titulo}>
                                        <FormGrid cols={2}>
                                            <InputGroup label="Volume total (kg)" name={`${key}_volume`} value={form[key].volume} type="number" onChange={(e) => updateNestedField(key, "volume", e.target.value)} placeholder="0" min="0" step="0.01" />
                                            <InputGroup label="Valor total (R$)" name={`${key}_valor`} value={form[key].valor} type="number" onChange={(e) => updateNestedField(key, "valor", e.target.value)} placeholder="0,00" min="0" step="0.01" />
                                            <TextareaGroup label="Observações" name={`${key}_obs`} value={form[key].observacoes} onChange={(e) => updateNestedField(key, "observacoes", e.target.value)} rows={2} />
                                        </FormGrid>

                                        <SectionDivider title="Detalhamento por espécie" />
                                        <div className="mb-4 flex justify-end">
                                            <button type="button" className={btnAdd} onClick={() => addMarketRow(key)}>
                                                + Adicionar linha
                                            </button>
                                        </div>
                                        {form[key].linhas.length === 0 && (
                                            <p className="mb-4 text-sm text-slate-500">Nenhuma linha adicionada.</p>
                                        )}
                                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        {["#", "Espécie", "Forma de comercialização", "Destino", "Volume médio (kg)", "Preço de venda (R$/kg)", "Ações"].map((h) => (
                                                            <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 bg-white">
                                                    {form[key].linhas.map((linha, idx) => (
                                                        <tr key={linha.id ?? idx}>
                                                            <td className="px-4 py-3 text-sm font-semibold text-slate-600">{idx + 1}</td>
                                                            <td className="px-4 py-3"><input className={inputClass} value={linha.especie} onChange={(e) => updateMarketRow(key, idx, "especie", e.target.value)} placeholder="Ex.: Tilápia" /></td>
                                                            <td className="px-4 py-3">
                                                                <select className={inputClass} value={linha.formaComercializacao} onChange={(e) => updateMarketRow(key, idx, "formaComercializacao", e.target.value)}>
                                                                    <option value="">Selecione</option>
                                                                    {optsFormaComercializacao.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                                </select>
                                                            </td>
                                                            <td className="px-4 py-3"><input className={inputClass} value={linha.destino} onChange={(e) => updateMarketRow(key, idx, "destino", e.target.value)} placeholder="Ex.: Feirinha" /></td>
                                                            <td className="px-4 py-3"><input className={`${inputClass} text-right`} type="number" value={linha.volumeMedio} onChange={(e) => updateMarketRow(key, idx, "volumeMedio", e.target.value)} placeholder="0" min="0" step="0.01" /></td>
                                                            <td className="px-4 py-3"><input className={`${inputClass} text-right`} type="number" value={linha.precoVenda} onChange={(e) => updateMarketRow(key, idx, "precoVenda", e.target.value)} placeholder="0,00" min="0" step="0.01" /></td>
                                                            <td className="px-4 py-3"><button type="button" className={btnDanger} onClick={() => removeMarketRow(key, idx)}>Remover</button></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </SectionCard>
                                ))}

                                <SectionCard subtitle="Descrição final" title="Processo de comércio do pescado">
                                    <p className="mb-4 text-sm text-slate-500">
                                        Descreva o processo de comércio do pescado (fornecedores, local de origem, porcentagens, regularidade de compra, volumes médios, espécies importadas e locais mais comercializadas, destino do pescado, variação sazonal).
                                    </p>
                                    <TextareaGroup label="Descrição do processo de comércio" name="descricaoProcessoComercio" value={form.descricaoProcessoComercio} onChange={(e) => updateField("descricaoProcessoComercio", e.target.value)} rows={6} colSpan={2} />
                                </SectionCard>
                            </>
                        )}

                    </div>

                    {/* ── Botões de navegação ──────────────────────────────── */}
                    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <button
                                type="button"
                                className={`${btnSecondary} w-full sm:w-auto`}
                                onClick={handlePrev}
                                disabled={currentStep === 0 || enviando || verificandoCodigoPeixaria}
                            >
                                Voltar
                            </button>

                            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                            {currentStep < STEPS.length - 1 ? (
                                <button
                                    type="button"
                                    className={`${btnPrimary} w-full sm:w-auto`}
                                    onClick={handleNext}
                                    disabled={enviando || verificandoCodigoPeixaria}
                                >
                                    Próximo Passo
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className={`${btnPrimary} w-full sm:w-auto`}
                                    onClick={handleSave}
                                    disabled={enviando || verificandoCodigoPeixaria}
                                >
                                    {enviando ? "Salvando..." : isEditMode ? "Atualizar" : "Salvar"}
                                </button>
                            )}
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <DeleteConfirmModal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                loading={deletando}
            />
        </ProtectedRoute>
    );
}