"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/services/api";
import { mapFormDataToPayload, mapApiToFormData } from "./utils/mapper";

const cardClass = "rounded-2xl border border-slate-200 bg-white shadow-sm";
const fieldClass = "w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white";
const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

function Card({ title, subtitle, children }) {
    return (
        <section className={`${cardClass} p-6 md:p-8`}>
            <div className="mb-6">
                <p className="text-sm font-semibold text-blue-600">{subtitle}</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-800">{title}</h2>
            </div>
            {children}
        </section>
    );
}

function Grid({ children, cols = 2 }) {
    return (
        <div className={`grid grid-cols-1 gap-5 ${cols === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
            {children}
        </div>
    );
}

function InputField({ label, value, onChange, name, type = "text", placeholder = "", colSpan = 1, inputMode = "text", min, max, step }) {
    return (
        <div className={colSpan === 2 ? "md:col-span-2" : ""}>
            <label className={labelClass}>{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                inputMode={inputMode}
                min={min}
                max={max}
                step={step}
                className={fieldClass}
            />
        </div>
    );
}

function SelectField({ label, value, onChange, name, options }) {
    return (
        <div>
            <label className={labelClass}>{label}</label>
            <select name={name} value={value} onChange={onChange} className={fieldClass}>
                <option value="">Selecione</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function TextareaField({ label, value, onChange, name, rows = 4, colSpan = 1 }) {
    return (
        <div className={colSpan === 2 ? "md:col-span-2" : ""}>
            <label className={labelClass}>{label}</label>
            <textarea name={name} value={value} onChange={onChange} rows={rows} className={`${fieldClass} min-h-[110px] resize-none`} />
        </div>
    );
}

function RadioGroupField({ label, value, onChange, name, options }) {
    return (
        <div>
            <label className={labelClass}>{label}</label>
            <div className="flex flex-wrap gap-3">
                {options.map((option) => (
                    <label key={option.value} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${value === option.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700"}`}>
                        <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={onChange} className="h-4 w-4 border-slate-300 text-blue-600" />
                        <span>{option.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

function CheckboxGroupField({ label, value = [], onChange, options }) {
    return (
        <div className="md:col-span-2">
            <label className={labelClass}>{label}</label>
            <div className="flex flex-wrap gap-3">
                {options.map((option) => {
                    const checked = value.includes(option.value);
                    return (
                        <label key={option.value} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${checked ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700"}`}>
                            <input type="checkbox" checked={checked} onChange={() => onChange(option.value)} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                            <span>{option.label}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}

function Button({ children, onClick, variant = "primary", type = "button" }) {
    const base = "rounded-lg px-4 py-2.5 text-sm font-semibold transition";
    const styles = variant === "secondary"
        ? `${base} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`
        : `${base} bg-blue-600 text-white hover:bg-blue-700`;

    return (
        <button type={type} onClick={onClick} className={styles}>
            {children}
        </button>
    );
}

function Table({ headers, children }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        {headers.map((header) => (
                            <th key={header} className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
            </table>
        </div>
    );
}

function PerdaPorEspecieCard({ titulo, linhas, onChange }) {
    const handlePercentChange = (index, value) => {
        const numericValue = value.replace(/[^\d]/g, "");
        const limitedValue = Math.min(100, Math.max(0, Number(numericValue || 0)));
        onChange(index, "estimativa", String(limitedValue));
    };

    return (
        <Card subtitle="Perdas por espécie" title={titulo}>
            <div className="overflow-x-auto">
                <Table headers={["Espécie", "Causa da perda", "Estimativa da perda (%)", "Destino do peixe perdido"]}>
                    {linhas.map((linha, index) => (
                        <tr key={linha.causa}>
                            <td className="px-3 py-3 font-medium text-slate-700">{titulo}</td>
                            <td className="px-3 py-3 text-slate-700">{linha.causa}</td>
                            <td className="px-3 py-3">
                                <input
                                    className={`${fieldClass} text-right`}
                                    value={linha.estimativa}
                                    onChange={(e) => handlePercentChange(index, e.target.value)}
                                    placeholder="0"
                                    min="0"
                                    max="100"
                                    type="number"
                                />
                            </td>
                            <td className="px-3 py-3">
                                <input
                                    className={fieldClass}
                                    value={linha.destino}
                                    onChange={(e) => onChange(index, "destino", e.target.value)}
                                    placeholder="Ex.: Mercado local"
                                />
                            </td>
                        </tr>
                    ))}
                </Table>
            </div>
        </Card>
    );
}

function MercadoTableCard({ titulo, tipoMercado, linhas, onAddRow, onRemoveRow, onChange }) {
    return (
        <Card subtitle="Comercialização por mercado" title={titulo}>
            <div className="mb-4 flex justify-end">
                <Button onClick={onAddRow}>Adicionar linha</Button>
            </div>
            <div className="overflow-x-auto">
                <Table headers={["ID", "Espécie", "Forma de comercialização", "Destino", "Volumes médios (kg)", "Preço de venda (R$/kg)", "Ações"]}>
                    {linhas.map((linha, index) => (
                        <tr key={linha.id}>
                            <td className="px-3 py-3 text-sm font-semibold text-slate-600">{index + 1}</td>
                            <td className="px-3 py-3">
                                <input
                                    className={fieldClass}
                                    value={linha.especie}
                                    onChange={(e) => onChange(index, "especie", e.target.value)}
                                    placeholder="Ex.: Tilápia"
                                />
                            </td>
                            <td className="px-3 py-3">
                                <select
                                    className={fieldClass}
                                    value={linha.formaComercializacao}
                                    onChange={(e) => onChange(index, "formaComercializacao", e.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    <option value="Fresco">Fresco</option>
                                    <option value="Congelado">Congelado</option>
                                    <option value="Processado">Processado</option>
                                    <option value="Vivo">Vivo</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </td>
                            <td className="px-3 py-3">
                                <input
                                    className={fieldClass}
                                    value={linha.destino}
                                    onChange={(e) => onChange(index, "destino", e.target.value)}
                                    placeholder="Ex.: Feirinha"
                                />
                            </td>
                            <td className="px-3 py-3">
                                <input
                                    className={`${fieldClass} text-right`}
                                    type="number"
                                    value={linha.volumeMedio}
                                    onChange={(e) => onChange(index, "volumeMedio", e.target.value)}
                                    placeholder="0"
                                    min="0"
                                    step="0.01"
                                />
                            </td>
                            <td className="px-3 py-3">
                                <input
                                    className={`${fieldClass} text-right`}
                                    type="number"
                                    value={linha.precoVenda}
                                    onChange={(e) => onChange(index, "precoVenda", e.target.value)}
                                    placeholder="0"
                                    min="0"
                                    step="0.01"
                                />
                            </td>
                            <td className="px-3 py-3">
                                <Button variant="secondary" onClick={() => onRemoveRow(index)}>Excluir</Button>
                            </td>
                        </tr>
                    ))}
                </Table>
            </div>
        </Card>
    );
}

const initialForm = {
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
    despesas: [
        { id: 1, descricao: "Gelo", quantidade: "", custo: "", frequencia: "" },
        { id: 2, descricao: "Isopor", quantidade: "", custo: "", frequencia: "" },
        { id: 3, descricao: "Energia", quantidade: "", custo: "", frequencia: "" },
        { id: 4, descricao: "Aluguel", quantidade: "", custo: "", frequencia: "" },
        { id: 5, descricao: "Salários", quantidade: "", custo: "", frequencia: "" },
        { id: 6, descricao: "Outros", quantidade: "", custo: "", frequencia: "" }
    ],
    fornecedores: [{ id: 1, nome: "", tipo: "", telefone: "" }],
    pescadoresLocais: [{ id: 1, nome: "", comunidade: "", volume: "" }],
    pescadoresEntregam: [{ id: 1, apelido: "", tipoBarco: "", numeroPescadores: "", volumeMedio: "", regularidade: "" }],
    especies: [{ id: 1, especie: "", quantidade: "", preco: "" }],
    perdas: [{ id: 1, descricao: "", quantidade: "", causa: "" }],
    perdasPorEspecie: [
        { id: 1, titulo: "Espécie 1", linhas: [
            { causa: "Deterioração", estimativa: "", destino: "" },
            { causa: "Falta de mercado", estimativa: "", destino: "" },
            { causa: "Transporte", estimativa: "", destino: "" }
        ] },
        { id: 2, titulo: "Espécie 2", linhas: [
            { causa: "Deterioração", estimativa: "", destino: "" },
            { causa: "Falta de mercado", estimativa: "", destino: "" },
            { causa: "Transporte", estimativa: "", destino: "" }
        ] },
        { id: 3, titulo: "Espécie 3", linhas: [
            { causa: "Deterioração", estimativa: "", destino: "" },
            { causa: "Falta de mercado", estimativa: "", destino: "" },
            { causa: "Transporte", estimativa: "", destino: "" }
        ] }
    ],
    mercadoLocal: {
        volume: "",
        valor: "",
        observacoes: "",
        linhas: [{ id: 1, especie: "", formaComercializacao: "", destino: "", volumeMedio: "", precoVenda: "" }]
    },
    especiesComerciais: [
        { id: 1, especie: "", quantidadeFresco: "", quantidadeCongelado: "", precoCompra: "", precoVenda: "" }
    ],
    origemPescado: [
        { id: 1, tipo: "Total pescado", pescadoresLocais: "", outrasLocalidadesPB: "", outrosEstados: "", outro: "" },
        { id: 2, tipo: "Peixe fresco", pescadoresLocais: "", outrasLocalidadesPB: "", outrosEstados: "", outro: "" },
        { id: 3, tipo: "Peixe congelado", pescadoresLocais: "", outrasLocalidadesPB: "", outrosEstados: "", outro: "" },
        { id: 4, tipo: "Processado", pescadoresLocais: "", outrasLocalidadesPB: "", outrosEstados: "", outro: "" },
        { id: 5, tipo: "Lagosta", pescadoresLocais: "", outrasLocalidadesPB: "", outrosEstados: "", outro: "" },
        { id: 6, tipo: "Camarão", pescadoresLocais: "", outrasLocalidadesPB: "", outrosEstados: "", outro: "" },
        { id: 7, tipo: "Polvo", pescadoresLocais: "", outrasLocalidadesPB: "", outrosEstados: "", outro: "" },
        { id: 8, tipo: "Outro", pescadoresLocais: "", outrasLocalidadesPB: "", outrosEstados: "", outro: "" }
    ],
    mercadoEstadual: {
        volume: "",
        valor: "",
        observacoes: "",
        linhas: [{ id: 1, especie: "", formaComercializacao: "", destino: "", volumeMedio: "", precoVenda: "" }]
    },
    mercadoNacional: {
        volume: "",
        valor: "",
        observacoes: "",
        linhas: [{ id: 1, especie: "", formaComercializacao: "", destino: "", volumeMedio: "", precoVenda: "" }]
    },
    mercadoInternacional: {
        volume: "",
        valor: "",
        observacoes: "",
        linhas: [{ id: 1, especie: "", formaComercializacao: "", destino: "", volumeMedio: "", precoVenda: "" }]
    }
};

export default function PeixariaPage() {
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");
    const isEditMode = Boolean(editId);

    const [form, setForm] = useState(initialForm);
    const [carregandoEdicao, setCarregandoEdicao] = useState(false);
    const [erroEnvio, setErroEnvio] = useState("");
    const [sucessoEnvio, setSucessoEnvio] = useState("");
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if (!isEditMode) {
            setForm(initialForm);
            return;
        }

        const carregarPeixaria = async () => {
            setCarregandoEdicao(true);
            setErroEnvio("");
            try {
                const response = await api.buscarPeixaria(editId);
                const data = response?.data || response;
                setForm(mapApiToFormData(data));
            } catch (err) {
                console.error('[Peixaria] Erro ao carregar edição:', err);
                setErroEnvio(err?.message || `Não foi possível carregar a peixaria #${editId}.`);
            } finally {
                setCarregandoEdicao(false);
            }
        };

        carregarPeixaria();
    }, [editId, isEditMode]);

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const updateNumericField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value.replace(/\D/g, "") }));
    };

    const updateNestedField = (group, field, value) => {
        setForm((prev) => ({
            ...prev,
            [group]: { ...prev[group], [field]: value }
        }));
    };

    const updateArrayItem = (key, index, field, value) => {
        setForm((prev) => ({
            ...prev,
            [key]: prev[key].map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)
        }));
    };

    const updatePercentField = (key, index, field, value) => {
        const numericValue = value.replace(/[^\d]/g, "");
        const limitedValue = Math.min(100, Math.max(0, Number(numericValue || 0)));
        updateArrayItem(key, index, field, String(limitedValue));
    };

    const updateMarketRow = (group, index, field, value) => {
        setForm((prev) => ({
            ...prev,
            [group]: {
                ...prev[group],
                linhas: prev[group].linhas.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)
            }
        }));
    };

    const addMarketRow = (group) => {
        setForm((prev) => ({
            ...prev,
            [group]: {
                ...prev[group],
                linhas: [...prev[group].linhas, { id: Date.now(), especie: "", formaComercializacao: "", destino: "", volumeMedio: "", precoVenda: "" }]
            }
        }));
    };

    const removeMarketRow = (group, index) => {
        setForm((prev) => ({
            ...prev,
            [group]: {
                ...prev[group],
                linhas: prev[group].linhas.filter((_, itemIndex) => itemIndex !== index)
            }
        }));
    };

    const updatePerdaPorEspecie = (speciesIndex, rowIndex, field, value) => {
        setForm((prev) => ({
            ...prev,
            perdasPorEspecie: prev.perdasPorEspecie.map((species, speciesItemIndex) => speciesItemIndex === speciesIndex ? {
                ...species,
                linhas: species.linhas.map((row, rowItemIndex) => rowItemIndex === rowIndex ? { ...row, [field]: value } : row)
            } : species)
        }));
    };

    const updateCurrencyField = (key, index, field, value) => {
        const digits = value.replace(/\D/g, "");
        const cents = digits.padStart(3, "0");
        const integer = cents.slice(0, -2);
        const decimal = cents.slice(-2);
        const formatted = integer ? `${Number(integer).toLocaleString("pt-BR")},${decimal}` : `0,${decimal}`;
        updateArrayItem(key, index, field, formatted);
    };

    const addRow = (key, template) => {
        setForm((prev) => ({
            ...prev,
            [key]: [...prev[key], { ...template, id: Date.now() }]
        }));
    };

    const removeRow = (key, index) => {
        setForm((prev) => ({
            ...prev,
            [key]: prev[key].filter((_, itemIndex) => itemIndex !== index)
        }));
    };

    const validarCamposObrigatorios = () => {
        const camposObrigatorios = [
            { valor: form.responsavel, mensagem: 'Preencha o nome do responsável.' },
            { valor: form.contato, mensagem: 'Preencha o contato.' },
            { valor: form.municipio, mensagem: 'Preencha o município.' },
            { valor: form.localidade, mensagem: 'Preencha a localidade.' },
            { valor: form.nome, mensagem: 'Preencha o nome do responsável pela peixaria.' },
            { valor: form.atividadePrincipal, mensagem: 'Preencha a atividade principal.' },
            { valor: form.atividadeComercial, mensagem: 'Preencha a atividade comercial.' },
            { valor: form.periodoComercializacao, mensagem: 'Preencha o período de comercialização.' },
            { valor: form.formaVenda, mensagem: 'Preencha a forma de venda.' },
            { valor: form.transporte, mensagem: 'Preencha o transporte.' }
        ];

        if (form.filiadoColonia === 'Sim') {
            camposObrigatorios.push({ valor: form.qualColonia, mensagem: 'Preencha qual colônia.' });
        }

        if (form.participaAssociacao === 'Sim') {
            camposObrigatorios.push({ valor: form.qualAssociacao, mensagem: 'Preencha qual associação.' });
        }

        if (form.possuiCarteiraPescador === 'Sim') {
            camposObrigatorios.push({ valor: form.orgaoEmissorCarteira, mensagem: 'Preencha o órgão emissor da carteira.' });
        }

        if (form.possuiPlanoSaude === 'Sim') {
            camposObrigatorios.push({ valor: form.planoSaudeEspecificar, mensagem: 'Preencha o plano de saúde especificado.' });
        }

        const erroEncontrado = camposObrigatorios.find((campo) => !campo.valor || String(campo.valor).trim() === '');
        if (erroEncontrado) {
            setErroEnvio(erroEncontrado.mensagem);
            setSucessoEnvio("");
            return false;
        }

        setErroEnvio("");
        return true;
    };

    const handleSave = async () => {
        if (enviando) return;

        if (!validarCamposObrigatorios()) {
            return;
        }

        const payload = mapFormDataToPayload(form);
        setEnviando(true);
        setErroEnvio("");
        setSucessoEnvio("");

        try {
            const response = isEditMode
                ? await api.editarPeixaria(editId, payload)
                : await api.criarPeixaria(payload);

            if (response?.success) {
                setSucessoEnvio(isEditMode ? 'Peixaria atualizada com sucesso.' : 'Peixaria criada com sucesso.');
            } else {
                throw new Error(response?.message || 'Falha ao salvar peixaria.');
            }
        } catch (error) {
            console.error('[Peixaria] Erro ao salvar:', error);
            setErroEnvio(error?.message || 'Erro ao salvar peixaria. Tente novamente.');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-slate-100 py-8 md:py-10">
                <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
                    <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-blue-600">Módulo operacional</p>
                                <h1 className="mt-1 text-3xl font-bold text-slate-800">Peixaria</h1>
                                <p className="mt-2 text-sm text-slate-500">
                                    Formulário para cadastro das principais informações de comercialização, fornecedores e mercados.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="secondary" onClick={() => { setForm(initialForm); setErroEnvio(""); setSucessoEnvio(""); }}>
                                    Limpar
                                </Button>
                                <Button onClick={handleSave} disabled={enviando}>{isEditMode ? "Atualizar" : "Salvar"}</Button>
                            </div>
                        </div>
                    </div>

                    {erroEnvio && (
                        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                            {erroEnvio}
                        </div>
                    )}

                    {sucessoEnvio && (
                        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                            {sucessoEnvio}
                        </div>
                    )}

                    <div className="space-y-6">
                        <Card subtitle="Informações socioeconômicas" title="Dados do responsável">
                            <Grid cols={2}>
                                <InputField label="Nome" value={form.nome} name="nome" onChange={(e) => updateField("nome", e.target.value)} />
                                <InputField label="Apelido" value={form.apelido} name="apelido" onChange={(e) => updateField("apelido", e.target.value)} />
                                <InputField label="Naturalidade" value={form.naturalidade} name="naturalidade" onChange={(e) => updateField("naturalidade", e.target.value)} />
                                <SelectField
                                    label="Sexo"
                                    value={form.sexo}
                                    name="sexo"
                                    onChange={(e) => updateField("sexo", e.target.value)}
                                    options={[
                                        { value: "Masculino", label: "Masculino" },
                                        { value: "Feminino", label: "Feminino" }
                                    ]}
                                />
                                <InputField label="Idade" value={form.idade} name="idade" type="number" inputMode="numeric" onChange={(e) => updateNumericField("idade", e.target.value)} />
                                <InputField label="Atividade principal de renda" value={form.atividadePrincipal} name="atividadePrincipal" onChange={(e) => updateField("atividadePrincipal", e.target.value)} />
                                <InputField label="Atividade secundária" value={form.atividadeSecundaria} name="atividadeSecundaria" onChange={(e) => updateField("atividadeSecundaria", e.target.value)} colSpan={2} />
                                <InputField label="Número total de peixarias/boxes" value={form.totalPeixariasBoxes} name="totalPeixariasBoxes" type="number" inputMode="numeric" onChange={(e) => updateNumericField("totalPeixariasBoxes", e.target.value)} />
                                <InputField label="Quantos você possui" value={form.quantosPossui} name="quantosPossui" type="number" inputMode="numeric" onChange={(e) => updateNumericField("quantosPossui", e.target.value)} />
                                <SelectField
                                    label="Estado civil"
                                    value={form.estadoCivil}
                                    name="estadoCivil"
                                    onChange={(e) => updateField("estadoCivil", e.target.value)}
                                    options={[
                                        { value: "Solteiro", label: "Solteiro" },
                                        { value: "Casado", label: "Casado" },
                                        { value: "Separado", label: "Separado" },
                                        { value: "Viúvo", label: "Viúvo" }
                                    ]}
                                />
                                <InputField label="Número de familiares" value={form.numeroFamiliares} name="numeroFamiliares" type="number" inputMode="numeric" onChange={(e) => updateNumericField("numeroFamiliares", e.target.value)} />
                                <SelectField
                                    label="Escolaridade"
                                    value={form.escolaridade}
                                    name="escolaridade"
                                    onChange={(e) => updateField("escolaridade", e.target.value)}
                                    options={[
                                        { value: "Fundamental", label: "Fundamental" },
                                        { value: "Médio", label: "Médio" },
                                        { value: "Superior", label: "Superior" }
                                    ]}
                                />
                                <RadioGroupField
                                    label="Local de moradia"
                                    value={form.localMoradia}
                                    name="localMoradia"
                                    onChange={(e) => updateField("localMoradia", e.target.value)}
                                    options={[
                                        { value: "Própria", label: "Própria" },
                                        { value: "Alugada", label: "Alugada" },
                                        { value: "Cedida", label: "Cedida" }
                                    ]}
                                />
                                <RadioGroupField
                                    label="Possui registro no INSS"
                                    value={form.possuiRegistroINSS}
                                    name="possuiRegistroINSS"
                                    onChange={(e) => updateField("possuiRegistroINSS", e.target.value)}
                                    options={[
                                        { value: "Sim", label: "Sim" },
                                        { value: "Não", label: "Não" }
                                    ]}
                                />
                                <RadioGroupField
                                    label="Filiação na colônia"
                                    value={form.filiadoColonia}
                                    name="filiadoColonia"
                                    onChange={(e) => updateField("filiadoColonia", e.target.value)}
                                    options={[
                                        { value: "Sim", label: "Sim" },
                                        { value: "Não", label: "Não" }
                                    ]}
                                />
                                {form.filiadoColonia === "Sim" && (
                                    <InputField label="Qual colônia" value={form.qualColonia} name="qualColonia" onChange={(e) => updateField("qualColonia", e.target.value)} />
                                )}
                                <RadioGroupField
                                    label="Participa de associação"
                                    value={form.participaAssociacao}
                                    name="participaAssociacao"
                                    onChange={(e) => updateField("participaAssociacao", e.target.value)}
                                    options={[
                                        { value: "Sim", label: "Sim" },
                                        { value: "Não", label: "Não" }
                                    ]}
                                />
                                {form.participaAssociacao === "Sim" && (
                                    <InputField label="Qual associação" value={form.qualAssociacao} name="qualAssociacao" onChange={(e) => updateField("qualAssociacao", e.target.value)} />
                                )}
                                <RadioGroupField
                                    label="Possui carteira de pescador"
                                    value={form.possuiCarteiraPescador}
                                    name="possuiCarteiraPescador"
                                    onChange={(e) => updateField("possuiCarteiraPescador", e.target.value)}
                                    options={[
                                        { value: "Sim", label: "Sim" },
                                        { value: "Não", label: "Não" }
                                    ]}
                                />
                                {form.possuiCarteiraPescador === "Sim" && (
                                    <InputField label="Órgão emissor" value={form.orgaoEmissorCarteira} name="orgaoEmissorCarteira" onChange={(e) => updateField("orgaoEmissorCarteira", e.target.value)} />
                                )}
                                <CheckboxGroupField
                                    label="Relações de trabalho"
                                    value={form.relacoesTrabalho}
                                    onChange={(value) => {
                                        const next = form.relacoesTrabalho.includes(value)
                                            ? form.relacoesTrabalho.filter((item) => item !== value)
                                            : [...form.relacoesTrabalho, value];
                                        updateField("relacoesTrabalho", next);
                                    }}
                                    options={[
                                        { value: "Autônomo", label: "Autônomo" },
                                        { value: "Empregado", label: "Empregado" },
                                        { value: "Familiar", label: "Familiar" },
                                        { value: "Associado", label: "Associado" }
                                    ]}
                                />
                                <RadioGroupField
                                    label="Possui assistência/plano de saúde"
                                    value={form.possuiPlanoSaude}
                                    name="possuiPlanoSaude"
                                    onChange={(e) => updateField("possuiPlanoSaude", e.target.value)}
                                    options={[
                                        { value: "Sim", label: "Sim" },
                                        { value: "Não", label: "Não" }
                                    ]}
                                />
                                {form.possuiPlanoSaude === "Sim" && (
                                    <InputField label="Especificar" value={form.planoSaudeEspecificar} name="planoSaudeEspecificar" onChange={(e) => updateField("planoSaudeEspecificar", e.target.value)} />
                                )}
                                <TextareaField label="Atividades que geram renda para a família" value={form.atividadesRendaFamilia} name="atividadesRendaFamilia" onChange={(e) => updateField("atividadesRendaFamilia", e.target.value)} colSpan={2} />
                                <TextareaField label="Quem trabalha na família" value={form.quemTrabalhaFamilia} name="quemTrabalhaFamilia" onChange={(e) => updateField("quemTrabalhaFamilia", e.target.value)} colSpan={2} />
                                <InputField label="Tempo na atividade" value={form.tempoAtividade} name="tempoAtividade" type="number" inputMode="numeric" onChange={(e) => updateNumericField("tempoAtividade", e.target.value)} />
                            </Grid>
                        </Card>

                        <Card subtitle="Informações básicas" title="Dados pessoais">
                            <Grid cols={2}>
                                <InputField label="Nome do responsável" value={form.responsavel} name="responsavel" onChange={(e) => updateField("responsavel", e.target.value)} />
                                <InputField label="Contato" value={form.contato} name="contato" onChange={(e) => updateField("contato", e.target.value)} />
                                <InputField label="Município" value={form.municipio} name="municipio" onChange={(e) => updateField("municipio", e.target.value)} />
                                <InputField label="Localidade" value={form.localidade} name="localidade" onChange={(e) => updateField("localidade", e.target.value)} />
                                <SelectField
                                    label="Atividade comercial"
                                    value={form.atividadeComercial}
                                    name="atividadeComercial"
                                    onChange={(e) => updateField("atividadeComercial", e.target.value)}
                                    options={[
                                        { value: "atacado", label: "Atacado" },
                                        { value: "varejo", label: "Varejo" },
                                        { value: "ambos", label: "Ambos" }
                                    ]}
                                />
                                <InputField label="Período de comercialização" value={form.periodoComercializacao} name="periodoComercializacao" onChange={(e) => updateField("periodoComercializacao", e.target.value)} />
                                <SelectField
                                    label="Forma de venda"
                                    value={form.formaVenda}
                                    name="formaVenda"
                                    onChange={(e) => updateField("formaVenda", e.target.value)}
                                    options={[
                                        { value: "pesada", label: "Venda pesada" },
                                        { value: "unidade", label: "Venda por unidade" },
                                        { value: "mix", label: "Mix de modalidades" }
                                    ]}
                                />
                                <SelectField
                                    label="Transporte"
                                    value={form.transporte}
                                    name="transporte"
                                    onChange={(e) => updateField("transporte", e.target.value)}
                                    options={[
                                        { value: "caminhao", label: "Caminhão" },
                                        { value: "carreta", label: "Carreta" },
                                        { value: "veiculo", label: "Veículo leve" }
                                    ]}
                                />
                            </Grid>
                        </Card>

                        <Card subtitle="Custos operacionais" title="Despesas do comércio">
                            <div className="mb-4 flex justify-end">
                                <Button onClick={() => addRow("despesas", { descricao: "", quantidade: "", custo: "", frequencia: "" })}>Adicionar linha</Button>
                            </div>
                            <div className="overflow-x-auto">
                                <Table headers={["Despesa", "Quantidade", "Custo (R$)", "Frequência", "Ações"]}>
                                    {form.despesas.map((item, index) => (
                                        <tr key={item.id}>
                                            <td className="px-3 py-3">
                                                <input className={fieldClass} value={item.descricao} onChange={(e) => updateArrayItem("despesas", index, "descricao", e.target.value)} placeholder="Ex.: Gelo" />
                                            </td>
                                            <td className="px-3 py-3">
                                                <input className={fieldClass} value={item.quantidade} onChange={(e) => updateArrayItem("despesas", index, "quantidade", e.target.value)} placeholder="0" />
                                            </td>
                                            <td className="px-3 py-3">
                                                <input
                                                    className={fieldClass}
                                                    value={item.custo}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/[^\d,.-]/g, "");
                                                        updateArrayItem("despesas", index, "custo", value);
                                                    }}
                                                    placeholder="R$ 0,00"
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <input className={fieldClass} value={item.frequencia} onChange={(e) => updateArrayItem("despesas", index, "frequencia", e.target.value)} placeholder="Diária / Mensal" />
                                            </td>
                                            <td className="px-3 py-3">
                                                <Button variant="secondary" onClick={() => removeRow("despesas", index)}>Excluir</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </Table>
                            </div>
                        </Card>

                        <Card subtitle="Fluxo comercial" title="Processo de comercialização">
                            <div className="w-full">
                                <label className={labelClass}>Descrição do processo de comércio do pescado</label>
                                <textarea
                                    name="processoComercializacao"
                                    value={form.processoComercializacao || ""}
                                    onChange={(e) => updateField("processoComercializacao", e.target.value)}
                                    placeholder="Descreva fornecedores, origem do pescado, percentuais, regularidade de compra, volumes médios, espécies comercializadas, destinos e variação sazonal."
                                    rows={8}
                                    className={`${fieldClass} min-h-[160px] resize-none`}
                                    maxLength={1000}
                                />
                                <div className="mt-2 text-right text-xs text-slate-500">
                                    {(form.processoComercializacao || "").length}/1000 caracteres
                                </div>
                            </div>
                        </Card>

                        <Card subtitle="Parcerias comerciais" title="Fornecedores dos pescados">
                            <div className="mb-4 flex justify-end">
                                <Button onClick={() => addRow("fornecedores", { nome: "", tipo: "", telefone: "" })}>Adicionar fornecedor</Button>
                            </div>
                            <Table headers={["Nome", "Tipo", "Telefone", "Ações"]}>
                                {form.fornecedores.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="px-3 py-3"><input className={fieldClass} value={item.nome} onChange={(e) => updateArrayItem("fornecedores", index, "nome", e.target.value)} /></td>
                                        <td className="px-3 py-3"><input className={fieldClass} value={item.tipo} onChange={(e) => updateArrayItem("fornecedores", index, "tipo", e.target.value)} /></td>
                                        <td className="px-3 py-3"><input className={fieldClass} value={item.telefone} onChange={(e) => updateArrayItem("fornecedores", index, "telefone", e.target.value)} /></td>
                                        <td className="px-3 py-3"><Button variant="secondary" onClick={() => removeRow("fornecedores", index)}>Excluir</Button></td>
                                    </tr>
                                ))}
                            </Table>
                        </Card>

                        <Card subtitle="Rede local" title="Pescadores fornecedores locais">
                            <div className="mb-4 flex justify-end">
                                <Button onClick={() => addRow("pescadoresLocais", { nome: "", comunidade: "", volume: "" })}>Adicionar pescador</Button>
                            </div>
                            <Table headers={["Nome", "Comunidade", "Volume", "Ações"]}>
                                {form.pescadoresLocais.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="px-3 py-3"><input className={fieldClass} value={item.nome} onChange={(e) => updateArrayItem("pescadoresLocais", index, "nome", e.target.value)} /></td>
                                        <td className="px-3 py-3"><input className={fieldClass} value={item.comunidade} onChange={(e) => updateArrayItem("pescadoresLocais", index, "comunidade", e.target.value)} /></td>
                                        <td className="px-3 py-3"><input className={fieldClass} value={item.volume} onChange={(e) => updateArrayItem("pescadoresLocais", index, "volume", e.target.value)} /></td>
                                        <td className="px-3 py-3"><Button variant="secondary" onClick={() => removeRow("pescadoresLocais", index)}>Excluir</Button></td>
                                    </tr>
                                ))}
                            </Table>
                        </Card>

                        <Card subtitle="Catálogo comercial" title="Espécies locais comercializadas">
                            <div className="mb-4 flex justify-end">
                                <Button onClick={() => addRow("especies", { especie: "", quantidade: "", preco: "" })}>Adicionar espécie</Button>
                            </div>
                            <Table headers={["Espécie", "Quantidade", "Preço", "Ações"]}>
                                {form.especies.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="px-3 py-3"><input className={fieldClass} value={item.especie} onChange={(e) => updateArrayItem("especies", index, "especie", e.target.value)} /></td>
                                        <td className="px-3 py-3"><input className={fieldClass} value={item.quantidade} onChange={(e) => updateArrayItem("especies", index, "quantidade", e.target.value)} /></td>
                                        <td className="px-3 py-3"><input className={fieldClass} value={item.preco} onChange={(e) => updateArrayItem("especies", index, "preco", e.target.value)} /></td>
                                        <td className="px-3 py-3"><Button variant="secondary" onClick={() => removeRow("especies", index)}>Excluir</Button></td>
                                    </tr>
                                ))}
                            </Table>
                        </Card>

                        <Card subtitle="Perdas operacionais" title="Principais perdas de pescado">
                            <div className="mb-4 flex justify-end">
                                <Button onClick={() => addRow("perdas", { descricao: "", quantidade: "", causa: "" })}>Adicionar perda</Button>
                            </div>
                            <Table headers={["Descrição", "Quantidade", "Causa", "Ações"]}>
                                {form.perdas.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="px-3 py-3"><input className={fieldClass} value={item.descricao} onChange={(e) => updateArrayItem("perdas", index, "descricao", e.target.value)} /></td>
                                        <td className="px-3 py-3"><input className={fieldClass} value={item.quantidade} onChange={(e) => updateArrayItem("perdas", index, "quantidade", e.target.value)} /></td>
                                        <td className="px-3 py-3"><input className={fieldClass} value={item.causa} onChange={(e) => updateArrayItem("perdas", index, "causa", e.target.value)} /></td>
                                        <td className="px-3 py-3"><Button variant="secondary" onClick={() => removeRow("perdas", index)}>Excluir</Button></td>
                                    </tr>
                                ))}
                            </Table>
                        </Card>

                        <div className="space-y-6">
                            {form.perdasPorEspecie.map((especie) => (
                                <PerdaPorEspecieCard
                                    key={especie.id}
                                    titulo={especie.titulo}
                                    linhas={especie.linhas}
                                    onChange={(rowIndex, field, value) => updatePerdaPorEspecie(form.perdasPorEspecie.findIndex((item) => item.id === especie.id), rowIndex, field, value)}
                                />
                            ))}
                        </div>

                        <Card subtitle="Entregas e parceiros" title="Pescadores que entregam pescado">
                            <div className="mb-4 flex justify-end">
                                <Button onClick={() => addRow("pescadoresEntregam", { apelido: "", tipoBarco: "", numeroPescadores: "", volumeMedio: "", regularidade: "" })}>Adicionar pescador</Button>
                            </div>
                            <div className="overflow-x-auto">
                                <Table headers={["Apelido do pescador", "Tipo de barco", "Nº de pescadores na pescaria", "Volume médio entregue (kg)", "Regularidade", "Ações"]}>
                                    {form.pescadoresEntregam.map((item, index) => (
                                        <tr key={item.id}>
                                            <td className="px-3 py-3">
                                                <input className={fieldClass} value={item.apelido} onChange={(e) => updateArrayItem("pescadoresEntregam", index, "apelido", e.target.value)} placeholder="Apelido" />
                                            </td>
                                            <td className="px-3 py-3">
                                                <input className={fieldClass} value={item.tipoBarco} onChange={(e) => updateArrayItem("pescadoresEntregam", index, "tipoBarco", e.target.value)} placeholder="Ex.: Canoa" />
                                            </td>
                                            <td className="px-3 py-3">
                                                <input className={fieldClass} value={item.numeroPescadores} onChange={(e) => updateArrayItem("pescadoresEntregam", index, "numeroPescadores", e.target.value)} placeholder="0" />
                                            </td>
                                            <td className="px-3 py-3">
                                                <input className={fieldClass} value={item.volumeMedio} onChange={(e) => updateArrayItem("pescadoresEntregam", index, "volumeMedio", e.target.value)} placeholder="0" />
                                            </td>
                                            <td className="px-3 py-3">
                                                <input className={fieldClass} value={item.regularidade} onChange={(e) => updateArrayItem("pescadoresEntregam", index, "regularidade", e.target.value)} placeholder="Diária / Semanal" />
                                            </td>
                                            <td className="px-3 py-3">
                                                <Button variant="secondary" onClick={() => removeRow("pescadoresEntregam", index)}>Excluir</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </Table>
                            </div>
                        </Card>

                        <Card subtitle="Origem do pescado" title="Distribuição por origem">
                            <div className="overflow-x-auto">
                                <Table headers={["Tipo de pescado", "Pescadores locais (%)", "Outras localidades da PB (%)", "Outros estados (%)", "Outro (%) / Quem"]}>
                                    {form.origemPescado.map((item, index) => (
                                        <tr key={item.id}>
                                            <td className="px-3 py-3 font-medium text-slate-700">{item.tipo}</td>
                                            <td className="px-3 py-3">
                                                <input
                                                    className={fieldClass}
                                                    value={item.pescadoresLocais}
                                                    onChange={(e) => updatePercentField("origemPescado", index, "pescadoresLocais", e.target.value)}
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <input
                                                    className={fieldClass}
                                                    value={item.outrasLocalidadesPB}
                                                    onChange={(e) => updatePercentField("origemPescado", index, "outrasLocalidadesPB", e.target.value)}
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <input
                                                    className={fieldClass}
                                                    value={item.outrosEstados}
                                                    onChange={(e) => updatePercentField("origemPescado", index, "outrosEstados", e.target.value)}
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <input
                                                    className={fieldClass}
                                                    value={item.outro}
                                                    onChange={(e) => updateArrayItem("origemPescado", index, "outro", e.target.value)}
                                                    placeholder="Ex.: Mercado externo"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </Table>
                            </div>
                        </Card>

                        <Card subtitle="Finanças da comercialização" title="Preço e volume por espécie">
                            <div className="mb-4 flex justify-end">
                                <Button onClick={() => addRow("especiesComerciais", { especie: "", quantidadeFresco: "", quantidadeCongelado: "", precoCompra: "", precoVenda: "" })}>Adicionar espécie</Button>
                            </div>
                            <div className="overflow-x-auto">
                                <Table headers={["Espécie", "Quantidade média semanal (fresco)", "Quantidade média semanal (congelado)", "Preço de compra (R$)", "Preço de venda (R$)", "Ações"]}>
                                    {form.especiesComerciais.map((item, index) => (
                                        <tr key={item.id}>
                                            <td className="px-3 py-3">
                                                <input className={fieldClass} value={item.especie} onChange={(e) => updateArrayItem("especiesComerciais", index, "especie", e.target.value)} placeholder="Ex.: Tilápia" />
                                            </td>
                                            <td className="px-3 py-3">
                                                <input className={`${fieldClass} text-right`} value={item.quantidadeFresco} onChange={(e) => updateArrayItem("especiesComerciais", index, "quantidadeFresco", e.target.value)} placeholder="0" />
                                            </td>
                                            <td className="px-3 py-3">
                                                <input className={`${fieldClass} text-right`} value={item.quantidadeCongelado} onChange={(e) => updateArrayItem("especiesComerciais", index, "quantidadeCongelado", e.target.value)} placeholder="0" />
                                            </td>
                                            <td className="px-3 py-3">
                                                <input className={`${fieldClass} text-right`} value={item.precoCompra} onChange={(e) => updateCurrencyField("especiesComerciais", index, "precoCompra", e.target.value)} placeholder="R$ 0,00" />
                                            </td>
                                            <td className="px-3 py-3">
                                                <input className={`${fieldClass} text-right`} value={item.precoVenda} onChange={(e) => updateCurrencyField("especiesComerciais", index, "precoVenda", e.target.value)} placeholder="R$ 0,00" />
                                            </td>
                                            <td className="px-3 py-3">
                                                <Button variant="secondary" onClick={() => removeRow("especiesComerciais", index)}>Excluir</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </Table>
                            </div>
                        </Card>

                        <MercadoTableCard
                            titulo="Mercado Local"
                            tipoMercado="local"
                            linhas={form.mercadoLocal.linhas}
                            onAddRow={() => addMarketRow("mercadoLocal")}
                            onRemoveRow={(index) => removeMarketRow("mercadoLocal", index)}
                            onChange={(index, field, value) => updateMarketRow("mercadoLocal", index, field, value)}
                        />

                        <MercadoTableCard
                            titulo="Mercado Estadual"
                            tipoMercado="estadual"
                            linhas={form.mercadoEstadual.linhas}
                            onAddRow={() => addMarketRow("mercadoEstadual")}
                            onRemoveRow={(index) => removeMarketRow("mercadoEstadual", index)}
                            onChange={(index, field, value) => updateMarketRow("mercadoEstadual", index, field, value)}
                        />

                        <MercadoTableCard
                            titulo="Mercado Nacional"
                            tipoMercado="nacional"
                            linhas={form.mercadoNacional.linhas}
                            onAddRow={() => addMarketRow("mercadoNacional")}
                            onRemoveRow={(index) => removeMarketRow("mercadoNacional", index)}
                            onChange={(index, field, value) => updateMarketRow("mercadoNacional", index, field, value)}
                        />

                        <MercadoTableCard
                            titulo="Mercado Internacional"
                            tipoMercado="internacional"
                            linhas={form.mercadoInternacional.linhas}
                            onAddRow={() => addMarketRow("mercadoInternacional")}
                            onRemoveRow={(index) => removeMarketRow("mercadoInternacional", index)}
                            onChange={(index, field, value) => updateMarketRow("mercadoInternacional", index, field, value)}
                        />
                    </div>
                </div>
            </main>
        </ProtectedRoute>
    );
}
