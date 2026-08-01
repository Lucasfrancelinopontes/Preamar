"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/services/api";
import { mapApiToFormData } from "../utils/mapper";
import { formatDatePtBr } from "@/utils/date";

const TIPO_ESTABELECIMENTO_LABELS = {
    PEIXARIA: "Peixaria",
    FEIRA_LIVRE: "Feira livre",
    MERCADO: "Mercado"
};

const RELACOES_TRABALHO_DESTAQUE = [
    "Familiar",
    "Artesanal com vizinhos/amigos",
    "Armador ou embarcado",
    "Assalariado (carteira assinada)"
];

const FORMA_COMERCIALIZACAO_LABELS = {
    Fresco: "Fresco",
    Congelado: "Congelado",
    Processado: "Processado",
    Vivo: "Vivo",
    Outro: "Outro"
};

function formatarValor(valor) {
    if (valor === undefined || valor === null || valor === "") return "-";
    return String(valor);
}

function formatarNumero(valor) {
    if (valor === undefined || valor === null || valor === "") return "-";
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return String(valor);
    return String(numero);
}

function formatarBooleano(valor) {
    if (valor === true || valor === "Sim" || valor === "sim") return "Sim";
    if (valor === false || valor === "Não" || valor === "nao" || valor === "não") return "Não";
    return "-";
}

function formatarData(valor) {
    if (!valor) return "-";
    return formatDatePtBr(valor) || "-";
}

function Campo({ label, valor, destaque = false }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
            <span className={`text-sm break-words ${destaque ? "font-semibold text-gray-900 dark:text-white" : "text-gray-800 dark:text-gray-200"}`}>
                {valor}
            </span>
        </div>
    );
}

function SecaoCard({ titulo, icone, children }) {
    return (
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6 print:shadow-none">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>{icone}</span> {titulo}
            </h2>
            {children}
        </div>
    );
}

function GradeCampos({ children, cols = 2 }) {
    const colsClass = cols === 2 ? "sm:grid-cols-2" : cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4";
    return <div className={`grid grid-cols-1 ${colsClass} gap-x-8 gap-y-4`}>{children}</div>;
}

function Etiquetas({ itens, vazio = "-" }) {
    const lista = Array.isArray(itens)
        ? itens.filter((item) => item !== undefined && item !== null && String(item).trim() !== "")
        : [];

    if (lista.length === 0) return <span className="text-sm text-gray-700 dark:text-gray-300">{vazio}</span>;

    return (
        <div className="flex flex-wrap gap-2">
            {lista.map((item) => (
                <span key={item} className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {item}
                </span>
            ))}
        </div>
    );
}

function Tabela({ colunas, linhas, vazio = "Nenhum registro encontrado." }) {
    if (!Array.isArray(linhas) || linhas.length === 0) {
        return <p className="text-sm text-gray-500 dark:text-gray-400">{vazio}</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                    <tr>
                        {colunas.map((coluna) => (
                            <th key={coluna} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {coluna}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {linhas.map((linha, indice) => (
                        <tr key={linha.key ?? indice}>
                            {linha.valores.map((valor, colunaIndice) => (
                                <td key={colunaIndice} className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 align-top">
                                    {valor === undefined || valor === null || valor === "" ? "-" : valor}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function VisualizarPeixariaPage() {
    const params = useParams();
    const router = useRouter();
    const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

    const [form, setForm] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;

        const carregar = async () => {
            try {
                setCarregando(true);
                setErro("");
                const response = await api.buscarPeixaria(id);
                if (!ativo) return;
                setForm(mapApiToFormData(response?.data || response));
            } catch (err) {
                if (!ativo) return;
                setErro(err?.message || `Não foi possível carregar a peixaria #${id}.`);
            } finally {
                if (ativo) setCarregando(false);
            }
        };

        if (id) carregar();

        return () => {
            ativo = false;
        };
    }, [id]);

    const handleImprimir = () => window.print();
    const handleEditar = () => router.push(`/peixaria?edit=${id}`);

    const municipioLabel = form?.municipio || form?.ID_municipio || "-";
    const localidadeLabel = form?.localidade || "-";
    const relacoesTrabalhoSelecionadas = Array.isArray(form?.relacoesTrabalho) ? form.relacoesTrabalho : [];
    const despesas = Array.isArray(form?.despesas) ? form.despesas : [];
    const fornecedores = Array.isArray(form?.fornecedores) ? form.fornecedores : [];
    const pescadoresLocais = Array.isArray(form?.pescadoresLocais) ? form.pescadoresLocais : [];
    const pescadoresEntregam = Array.isArray(form?.pescadoresEntregam) ? form.pescadoresEntregam : [];
    const especiesComerciais = Array.isArray(form?.especiesComerciais) ? form.especiesComerciais : [];
    const especies = Array.isArray(form?.especies) ? form.especies : [];
    const perdas = Array.isArray(form?.perdas) ? form.perdas : [];
    const perdasPorEspecie = Array.isArray(form?.perdasPorEspecie) ? form.perdasPorEspecie : [];
    const origemPescado = Array.isArray(form?.origemPescado) ? form.origemPescado : [];

    const tipoLabel = TIPO_ESTABELECIMENTO_LABELS[form?.tipoEstabelecimento] || form?.tipoEstabelecimento || "-";

    const informacoesBasicas = [
        { label: "Código da peixaria", valor: form?.codPeixaria, destaque: true },
        { label: "Data da coleta", valor: formatarData(form?.dataColeta) },
        { label: "Nº consecutivo", valor: formatarValor(form?.consecutivoColeta) },
        { label: "Município", valor: municipioLabel },
        { label: "Localidade", valor: localidadeLabel },
        { label: "Tipo de estabelecimento", valor: tipoLabel },
        { label: "Responsável", valor: form?.responsavel },
        { label: "Contato", valor: form?.contato }
    ];

    const dadosResponsavel = [
        { label: "Nome", valor: form?.nome, destaque: true },
        { label: "Apelido", valor: form?.apelido },
        { label: "Naturalidade", valor: form?.naturalidade },
        { label: "Sexo", valor: form?.sexo },
        { label: "Idade", valor: formatarNumero(form?.idade) },
        { label: "Estado civil", valor: form?.estadoCivil },
        { label: "Número de familiares", valor: formatarNumero(form?.numeroFamiliares) },
        { label: "Escolaridade", valor: form?.escolaridade },
        { label: "Local de moradia", valor: form?.localMoradia }
    ];

    const atividade = [
        { label: "Atividade principal", valor: form?.atividadePrincipal },
        { label: "Atividade secundária", valor: form?.atividadeSecundaria },
        { label: "Número total de peixarias/boxes", valor: formatarNumero(form?.totalPeixariasBoxes) },
        { label: "Quantos possui", valor: formatarNumero(form?.quantosPossui) },
        { label: "Tempo de atividade", valor: formatarNumero(form?.tempoAtividade) },
        { label: "Atividade comercial", valor: form?.atividadeComercial },
        { label: "Período de comercialização", valor: form?.periodoComercializacao },
        { label: "Forma de venda", valor: form?.formaVenda },
        { label: "Transporte", valor: form?.transporte }
    ];

    const registros = [
        { label: "Possui registro no INSS", valor: formatarBooleano(form?.possuiRegistroINSS) },
        { label: "Filiado à colônia", valor: formatarBooleano(form?.filiadoColonia) },
        { label: "Qual colônia", valor: form?.qualColonia },
        { label: "Participa de associação", valor: formatarBooleano(form?.participaAssociacao) },
        { label: "Qual associação", valor: form?.qualAssociacao },
        { label: "Possui carteira de pescador", valor: formatarBooleano(form?.possuiCarteiraPescador) },
        { label: "Órgão emissor da carteira", valor: form?.orgaoEmissorCarteira },
        { label: "Possui plano de saúde", valor: formatarBooleano(form?.possuiPlanoSaude) },
        { label: "Plano de saúde - especificar", valor: form?.planoSaudeEspecificar }
    ];

    const renda = [
        { label: "Atividades de renda da família", valor: form?.atividadesRendaFamilia },
        { label: "Quem trabalha na família", valor: form?.quemTrabalhaFamilia },
        { label: "Observações sobre espécies", valor: form?.observacoesEspecies },
        { label: "Descrição do processo de comércio", valor: form?.descricaoProcessoComercio }
    ];

    const mercadoCards = [
        { key: "mercadoLocal", title: "Mercado Local" },
        { key: "mercadoEstadual", title: "Mercado Estadual" },
        { key: "mercadoNacional", title: "Mercado Nacional" },
        { key: "mercadoInternacional", title: "Mercado Internacional" }
    ];

    const mercadoData = mercadoCards.map((card) => ({
        ...card,
        volume: form?.[card.key]?.volume,
        valor: form?.[card.key]?.valor,
        observacoes: form?.[card.key]?.observacoes,
        linhas: Array.isArray(form?.[card.key]?.linhas) ? form[card.key].linhas : []
    }));

    const perdasPorEspecieLinhas = perdasPorEspecie.map((item, indice) => ({
        key: item.id || indice,
        titulo: item.titulo || `Espécie ${indice + 1}`,
        linhas: Array.isArray(item.linhas) ? item.linhas : []
    }));

    return (
        <ProtectedRoute>
            {carregando && (
                <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando peixaria...</p>
                    </div>
                </div>
            )}

            {erro && (
                <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-8 max-w-md w-full">
                        <div className="text-center">
                            <div className="text-red-500 text-5xl mb-4">⚠️</div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Erro</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">{erro}</p>
                            <div className="flex gap-3 justify-center">
                                <button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                                    Tentar Novamente
                                </button>
                                <button onClick={() => router.push("/meus-peixarias")} className="bg-brand hover:bg-brand-dark text-white font-medium py-2 px-6 rounded-lg transition-colors">
                                    Voltar para Lista
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!carregando && !erro && form && (
                <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6 print:shadow-none">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{form.nome || "Peixaria"}</h1>
                                    <p className="text-gray-600 dark:text-gray-300 mt-1">{municipioLabel} {localidadeLabel !== "-" ? `— ${localidadeLabel}` : ""}</p>
                                </div>
                                <div className="flex flex-wrap gap-3 print:hidden">
                                    <button onClick={() => router.push("/meus-peixarias")} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                                        <span>←</span> Voltar
                                    </button>
                                    <button onClick={handleImprimir} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                                        <span>🖨️</span> Imprimir
                                    </button>
                                    <button onClick={handleEditar} className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                                        <span>✏️</span> Editar
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Código</p>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatarValor(form.codPeixaria)}</p>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Fornecedores</p>
                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{fornecedores.length}</p>
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Espécies</p>
                                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{especiesComerciais.length}</p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Mercados</p>
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{mercadoData.filter((item) => item.volume || item.valor || item.observacoes || item.linhas.length).length}</p>
                                </div>
                            </div>
                        </div>

                        <SecaoCard titulo="Informações Iniciais" icone="📍">
                            <GradeCampos cols={2}>
                                {informacoesBasicas.map((campo) => (
                                    <Campo key={campo.label} label={campo.label} valor={formatarValor(campo.valor)} destaque={campo.destaque} />
                                ))}
                            </GradeCampos>
                        </SecaoCard>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <SecaoCard titulo="Dados do Responsável" icone="👤">
                                <GradeCampos cols={2}>
                                    {dadosResponsavel.map((campo) => (
                                        <Campo key={campo.label} label={campo.label} valor={formatarValor(campo.valor)} destaque={campo.destaque} />
                                    ))}
                                </GradeCampos>
                            </SecaoCard>

                            <SecaoCard titulo="Atividade e Estrutura" icone="🏪">
                                <GradeCampos cols={2}>
                                    {atividade.map((campo) => (
                                        <Campo key={campo.label} label={campo.label} valor={formatarValor(campo.valor)} />
                                    ))}
                                </GradeCampos>
                            </SecaoCard>

                            <SecaoCard titulo="Registros e Vínculos" icone="🪪">
                                <GradeCampos cols={2}>
                                    {registros.map((campo) => (
                                        <Campo key={campo.label} label={campo.label} valor={formatarValor(campo.valor)} />
                                    ))}
                                </GradeCampos>
                            </SecaoCard>

                            <SecaoCard titulo="Renda e Observações" icone="💬">
                                <GradeCampos cols={2}>
                                    {renda.map((campo) => (
                                        <Campo key={campo.label} label={campo.label} valor={formatarValor(campo.valor)} />
                                    ))}
                                </GradeCampos>
                            </SecaoCard>
                        </div>

                        <SecaoCard titulo="Relacionamento de Trabalho" icone="🤝">
                            <Etiquetas itens={relacoesTrabalhoSelecionadas.map((item) => RELACOES_TRABALHO_DESTAQUE.includes(item) ? item : item)} vazio="Nenhuma relação informada." />
                        </SecaoCard>

                        <SecaoCard titulo="Fornecedores dos Pescados" icone="🚚">
                            <Tabela
                                colunas={["Tipo", "Pescadores locais %", "Outras localidades (PB) %", "Outros estados %", "Outro %"]}
                                linhas={origemPescado.map((item, indice) => ({
                                    key: item.id || indice,
                                    valores: [item.tipo, item.pescadoresLocais, item.outrasLocalidadesPB, item.outrosEstados, item.outro]
                                }))}
                                vazio="Nenhum fornecedor informado."
                            />
                        </SecaoCard>

                        <SecaoCard titulo="Pescadores Fornecedores Locais" icone="👥">
                            <div className="space-y-6">
                                <div>
                                    <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Pescadores que entregam pescado</p>
                                    <Tabela
                                        colunas={["#", "Apelido", "Tipo de barco", "Nº pescadores", "Volume médio (kg)", "Regularidade"]}
                                        linhas={pescadoresEntregam.map((item, indice) => ({
                                            key: item.id || indice,
                                            valores: [indice + 1, item.apelido, item.tipoBarco, item.numeroPescadores, item.volumeMedio, item.regularidade]
                                        }))}
                                        vazio="Nenhum registro adicionado."
                                    />
                                </div>

                                <div>
                                    <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Pescadores locais</p>
                                    <Tabela
                                        colunas={["#", "Nome", "Comunidade", "Volume"]}
                                        linhas={pescadoresLocais.map((item, indice) => ({
                                            key: item.id || indice,
                                            valores: [indice + 1, item.nome, item.comunidade, item.volume]
                                        }))}
                                        vazio="Nenhum registro adicionado."
                                    />
                                </div>
                            </div>
                        </SecaoCard>

                        <SecaoCard titulo="Espécies Comercializadas" icone="🐟">
                            <Tabela
                                colunas={["#", "Espécie", "Qtd. fresco", "Qtd. congelado", "Preço compra", "Preço venda"]}
                                linhas={especiesComerciais.map((item, indice) => ({
                                    key: item.id || indice,
                                    valores: [
                                        indice + 1,
                                        item.nome_popular || item.especie || item.buscaTexto,
                                        item.quantidadeFresco,
                                        item.quantidadeCongelado,
                                        item.precoCompra,
                                        item.precoVenda
                                    ]
                                }))}
                                vazio="Nenhuma espécie adicionada."
                            />
                            <div className="mt-6">
                                <Campo label="Observações sobre espécies" valor={formatarValor(form.observacoesEspecies)} />
                            </div>
                        </SecaoCard>

                        <SecaoCard titulo="Perdas" icone="📉">
                            <Tabela
                                colunas={["#", "Descrição", "Quantidade", "Causa"]}
                                linhas={perdas.map((item, indice) => ({
                                    key: item.id || indice,
                                    valores: [indice + 1, item.descricao, item.quantidade, item.causa]
                                }))}
                                vazio="Nenhuma perda cadastrada."
                            />
                        </SecaoCard>

                        <SecaoCard titulo="Perdas por Espécie" icone="🧮">
                            <div className="space-y-6">
                                {perdasPorEspecieLinhas.map((grupo) => (
                                    <div key={grupo.key}>
                                        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">{grupo.titulo}</p>
                                        <Tabela
                                            colunas={["Causa da perda", "Estimativa (%)", "Destino do peixe perdido"]}
                                            linhas={grupo.linhas.map((linha, indice) => ({
                                                key: `${grupo.key}-${indice}`,
                                                valores: [linha.causa, linha.estimativa, linha.destino]
                                            }))}
                                            vazio="Sem dados para esta espécie."
                                        />
                                    </div>
                                ))}
                            </div>
                        </SecaoCard>

                        <SecaoCard titulo="Mercados" icone="🌐">
                            <div className="space-y-6">
                                {mercadoData.map((mercado) => (
                                    <div key={mercado.key} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">{mercado.title}</h3>
                                        <GradeCampos cols={2}>
                                            <Campo label="Volume total (kg)" valor={formatarNumero(mercado.volume)} />
                                            <Campo label="Valor total (R$)" valor={formatarNumero(mercado.valor)} />
                                            <Campo label="Observações" valor={formatarValor(mercado.observacoes)} />
                                        </GradeCampos>
                                        <div className="mt-4">
                                            <Tabela
                                                colunas={["#", "Espécie", "Forma de comercialização", "Destino", "Volume médio (kg)", "Preço venda (R$/kg)"]}
                                                linhas={mercado.linhas.map((linha, indice) => ({
                                                    key: linha.id || indice,
                                                    valores: [
                                                        indice + 1,
                                                        linha.especie,
                                                        FORMA_COMERCIALIZACAO_LABELS[linha.formaComercializacao] || linha.formaComercializacao,
                                                        linha.destino,
                                                        linha.volumeMedio,
                                                        linha.precoVenda
                                                    ]
                                                }))}
                                                vazio="Sem detalhamento por espécie."
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SecaoCard>

                        <SecaoCard titulo="Finalização" icone="📝">
                            <GradeCampos cols={2}>
                                <Campo label="Código da coleta" valor={formatarValor(form.codPeixaria)} destaque />
                                <Campo label="Data da coleta" valor={formatarData(form.dataColeta)} />
                                <Campo label="Responsável" valor={formatarValor(form.responsavel)} />
                                <Campo label="Contato" valor={formatarValor(form.contato)} />
                                <Campo label="Descrição do processo de comércio" valor={formatarValor(form.descricaoProcessoComercio)} />
                            </GradeCampos>
                        </SecaoCard>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    );
}