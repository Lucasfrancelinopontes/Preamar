"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/services/api";
import usePescadorForm from "../hooks/usePescadorForm";
import { formatDatePtBr } from "@/utils/date";

const PROPULSAO_LABELS = {
    vela: "Vela",
    motor: "Motor",
    remo: "Remo",
    vara: "Vara",
    rabeta: "Rabeta"
};

function formatarValor(valor) {
    if (valor === undefined || valor === null || valor === "") return "-";
    return String(valor);
}

function formatarBooleano(valor) {
    if (valor === true) return "Sim";
    if (valor === false) return "Não";
    return "-";
}

function formatarMoeda(valor) {
    if (valor === undefined || valor === null || valor === "") return "-";
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return String(valor);
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(numero);
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

export default function VisualizarPescadorPage() {
    const params = useParams();
    const router = useRouter();
    const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

    const { formData, carregandoEdicao, erroCarregamento } = usePescadorForm(id);

    const [municipios, setMunicipios] = useState([]);
    const [carregandoMunicipios, setCarregandoMunicipios] = useState(false);

    useEffect(() => {
        let ativo = true;

        const carregarMunicipios = async () => {
            setCarregandoMunicipios(true);
            try {
                const response = await api.getMunicipios();
                const lista = Array.isArray(response) ? response : response?.data || [];
                if (ativo) setMunicipios(lista);
            } catch {
                if (ativo) setMunicipios([]);
            } finally {
                if (ativo) setCarregandoMunicipios(false);
            }
        };

        carregarMunicipios();

        return () => {
            ativo = false;
        };
    }, []);

    const municipioSelecionado = useMemo(() => {
        return municipios.find((municipio) => String(municipio.ID_municipio) === String(formData.municipio));
    }, [municipios, formData.municipio]);

    const municipioLabel = municipioSelecionado?.municipio || formData.municipio || "-";

    const especiesCadastradas = Array.isArray(formData.especies) ? formData.especies : [];
    const despesasCadastradas = Array.isArray(formData.despesas) ? formData.despesas : [];
    const propulsoesSelecionadas = Array.isArray(formData.propulsoes)
        ? formData.propulsoes.map((item) => PROPULSAO_LABELS[item] || item).filter(Boolean)
        : [];
    const quadrantesPreenchidos = Array.isArray(formData.quadrantes)
        ? formData.quadrantes.filter((quadrante) => String(quadrante || "").trim() !== "")
        : [];

    const handleImprimir = () => window.print();
    const handleEditar = () => router.push(`/pescador/editar/${id}`);

    const dadosIniciais = [
        { label: "Código da coleta", valor: formData.codigoColeta, destaque: true },
        { label: "Nº consecutivo", valor: formData.numConsecutivo },
        { label: "Código da foto", valor: formData.codigoFoto },
        { label: "Município", valor: carregandoMunicipios ? "Carregando..." : municipioLabel },
        { label: "Localidade", valor: formData.localidade },
        { label: "Data da coleta", valor: formatarData(formData.dataColeta) },
        { label: "Coletor", valor: formData.coletor },
        { label: "Digitador", valor: formData.digitador },
        { label: "Data digitador", valor: formatarData(formData.dataDigitador) },
        { label: "Observações", valor: formData.observacoes }
    ];

    const dadosPessoais = [
        { label: "Nome", valor: formData.nome, destaque: true },
        { label: "Apelido", valor: formData.apelido },
        { label: "CPF", valor: formData.cpf },
        { label: "Telefone", valor: formData.telefone },
        { label: "Sexo", valor: formData.sexo || "-" },
        { label: "Nascimento", valor: formatarData(formData.nascimento) },
        { label: "Naturalidade", valor: formData.naturalidade },
        { label: "Estado civil", valor: formData.estadoCivil },
        { label: "Escolaridade", valor: formData.escolaridade },
        { label: "Motivo parou de estudar", valor: formData.motivoParouEstudar },
        { label: "Composição familiar", valor: formData.composicaoFamiliar }
    ];

    const perfilSocioeconomico = [
        { label: "Atividade principal", valor: formData.atividadePrincipal },
        { label: "Atividade secundária", valor: formData.atividadeSecundaria },
        { label: "Tempo de atividade", valor: formatarValor(formData.tempoAtividade) },
        { label: "Horas por dia", valor: formatarValor(formData.horasDia) },
        { label: "Relação de trabalho", valor: formData.relacaoTrabalho },
        { label: "Fontes de renda", valor: formData.fontesRenda },
        { label: "Observação braça", valor: formData.observacaoBraca },
        { label: "Petrechos próprios", valor: formData.petrechosProprios },
        { label: "Se não, de quem", valor: formData.petrechosDeQuem },
        { label: "Conservação pescado", valor: formData.conservacaoPescado },
        { label: "Categoria da pesca", valor: formData.categoriaPesca },
        { label: "Principal pescaria", valor: formData.principalPescaria },
        { label: "Entrega a atravessador", valor: formatarBooleano(formData.entregaAtravessador) },
        { label: "Dívida com atravessador", valor: formatarBooleano(formData.dividaComAtravessador) }
    ];

    const moradia = [
        { label: "Tipo de moradia", valor: formData.moradiaTipo },
        { label: "Moradia na sede municipal", valor: formData.moradiaSedeMunicipal },
        { label: "Qualidade da moradia", valor: formData.moradiaQualidade },
        { label: "Outro tipo de moradia", valor: formData.moradiaOutro },
        { label: "Tipo de construção", valor: formData.tipoConstrucao },
        { label: "Outro tipo de construção", valor: formData.tipoConstrucaoOutro }
    ];

    const registros = [
        { label: "Possui registro no INSS", valor: formatarValor(formData.registroINSS) },
        { label: "Registro em colônia", valor: formatarValor(formData.registroColonia) },
        { label: "Qual colônia", valor: formData.qualColonia },
        { label: "Registro em associação", valor: formatarValor(formData.registroAssociacao) },
        { label: "Qual associação", valor: formData.qualAssociacao },
        { label: "Possui carteira de pescador", valor: formatarValor(formData.possuiCarteira) },
        { label: "Carteira grande marinha", valor: formatarValor(formData.carteiraGrande) },
        { label: "Carteira pequena colônia", valor: formatarValor(formData.carteiraPequena) }
    ];

    const saude = [
        { label: "Problemas de vista", valor: formatarBooleano(formData.saude?.vista) },
        { label: "Problemas de pele", valor: formatarBooleano(formData.saude?.pele) },
        { label: "Problemas na coluna", valor: formatarBooleano(formData.saude?.coluna) },
        { label: "Problemas ginecológicos", valor: formatarBooleano(formData.saude?.ginecologico) },
        { label: "Outros problemas", valor: formatarBooleano(formData.saude?.outros) },
        { label: "Descritivo dos outros problemas", valor: formData.saudeOutros }
    ];

    const embarcacaoGeral = [
        { label: "Pesca embarcada", valor: formatarValor(formData.embarcacao?.pescaEmbarcada) },
        { label: "Embarcação própria", valor: formatarValor(formData.embarcacao?.embarcacaoPropria) },
        { label: "Financiada", valor: formatarBooleano(formData.embarcacao?.financiada) },
        { label: "Quitada", valor: formatarBooleano(formData.embarcacao?.quitada) },
        { label: "Status financeiro", valor: formData.embarcacao?.statusFinanceiro },
        { label: "Nome do proprietário", valor: formData.embarcacao?.nomeProprietario },
        { label: "Apelido do proprietário", valor: formData.embarcacao?.apelidoProprietario },
        { label: "Porto de origem", valor: formData.embarcacao?.portoOrigem },
        { label: "Porto de desembarque", valor: formData.embarcacao?.portoDesembarque },
        { label: "Nome da embarcação", valor: formData.embarcacao?.nomeEmbarcacao },
        { label: "Número de registro", valor: formData.embarcacao?.numeroRegistro },
        { label: "Comprimento", valor: formData.embarcacao?.comprimento || formData.embarcacao?.comprimentoM },
        { label: "Largura", valor: formData.embarcacao?.largura },
        { label: "Tonelagem bruta", valor: formData.embarcacao?.tonelagemBruta },
        { label: "Capacidade da tripulação", valor: formData.embarcacao?.capacidadeTripulacao },
        { label: "Ano de construção", valor: formData.embarcacao?.anoConstrucao },
        { label: "HP/cilindros", valor: formData.embarcacao?.hpCilindros },
        { label: "Material do casco", valor: formData.embarcacao?.materialCasco },
        { label: "Tipo de embarcação", valor: formData.embarcacao?.tipoEmbarcacao }
    ];

    const embarcacaoDocumentos = [
        { label: "Registro na capitania", valor: formatarBooleano(formData.embarcacao?.registroCapitania) },
        { label: "Registro RGP", valor: formatarBooleano(formData.embarcacao?.registroRGP) },
        { label: "Licenciamento IBAMA", valor: formatarBooleano(formData.embarcacao?.licenciamentoIBAMA) },
        { label: "Licenciamento MPA", valor: formatarBooleano(formData.embarcacao?.licenciamentoMPA) }
    ];

    const producao = [
        { label: "Média de dias embarcado por mês", valor: formatarValor(formData.mediaDiasEmbarcado) },
        { label: "Viagens por mês", valor: formatarValor(formData.viagensPorMes) },
        { label: "Valor primeira qualidade", valor: formatarMoeda(formData.valorPrimeiraQualidade) },
        { label: "Valor segunda qualidade", valor: formatarMoeda(formData.valorSegundaQualidade) },
        { label: "Valor terceira qualidade", valor: formatarMoeda(formData.valorTerceiraQualidade) },
        { label: "Valor médio obtido", valor: formatarMoeda(formData.valorMedio) },
        { label: "Renda mensal", valor: formatarMoeda(formData.rendaMensal) },
        { label: "Renda por pescaria", valor: formatarMoeda(formData.rendaPorPescaria) },
        { label: "Percepção da pesca hoje vs passado", valor: formData.percepcaoPescaHojeVsPassado },
        { label: "Percepção do tamanho e volume pescado", valor: formData.percepcaoTamanhoVolumePescado }
    ];

    const despesasLinhas = despesasCadastradas.map((despesa, indice) => ({
        key: despesa.rowId || indice,
        valores: [
            despesa.item,
            despesa.tipo,
            despesa.quantidade,
            despesa.unidade,
            despesa.valor ? formatarMoeda(despesa.valor) : "-",
            despesa.frequencia,
            despesa.outros
        ]
    }));

    const especiesLinhas = especiesCadastradas.map((especie, indice) => ({
        key: especie.rowId || indice,
        valores: [
            especie.buscaTexto || especie.id_especie,
            especie.nome_popular,
            especie.inicioSafra,
            especie.fimSafra
        ]
    }));

    const quadrantesLinhas = quadrantesPreenchidos.length > 0
        ? quadrantesPreenchidos.map((quadrante, indice) => ({ key: indice, valores: [indice + 1, quadrante] }))
        : [];

    return (
        <ProtectedRoute>
            {carregandoEdicao && (
                <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando pescador...</p>
                    </div>
                </div>
            )}

            {erroCarregamento && (
                <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-8 max-w-md w-full">
                        <div className="text-center">
                            <div className="text-red-500 text-5xl mb-4">⚠️</div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Erro</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">{erroCarregamento}</p>
                            <div className="flex gap-3 justify-center">
                                <button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                                    Tentar Novamente
                                </button>
                                <button onClick={() => router.push("/meus-pescadores")} className="bg-brand hover:bg-brand-dark text-white font-medium py-2 px-6 rounded-lg transition-colors">
                                    Voltar para Lista
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!carregandoEdicao && !erroCarregamento && formData && (
                <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6 print:shadow-none">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{formData.nome || "Cadastro do pescador"}</h1>
                                    <p className="text-gray-600 dark:text-gray-300 mt-1">{municipioLabel} {formData.localidade ? `— ${formData.localidade}` : ""}</p>
                                </div>
                                <div className="flex flex-wrap gap-3 print:hidden">
                                    <button onClick={() => router.push("/meus-pescadores")} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
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
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatarValor(formData.codigoColeta)}</p>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Espécies</p>
                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{especiesCadastradas.length}</p>
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Despesas</p>
                                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{despesasCadastradas.length}</p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Quadrantes</p>
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{quadrantesPreenchidos.length}</p>
                                </div>
                            </div>
                        </div>

                        <SecaoCard titulo="Informações Iniciais" icone="📍">
                            <GradeCampos cols={2}>
                                {dadosIniciais.map((campo) => (
                                    <Campo key={campo.label} label={campo.label} valor={formatarValor(campo.valor)} destaque={campo.destaque} />
                                ))}
                            </GradeCampos>
                        </SecaoCard>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <SecaoCard titulo="Dados Pessoais" icone="👤">
                                <GradeCampos cols={2}>
                                    {dadosPessoais.map((campo) => (
                                        <Campo key={campo.label} label={campo.label} valor={formatarValor(campo.valor)} destaque={campo.destaque} />
                                    ))}
                                </GradeCampos>
                            </SecaoCard>

                            <SecaoCard titulo="Perfil Socioeconômico" icone="💼">
                                <GradeCampos cols={2}>
                                    {perfilSocioeconomico.map((campo) => (
                                        <Campo key={campo.label} label={campo.label} valor={formatarValor(campo.valor)} />
                                    ))}
                                </GradeCampos>
                            </SecaoCard>

                            <SecaoCard titulo="Moradia" icone="🏠">
                                <GradeCampos cols={2}>
                                    {moradia.map((campo) => (
                                        <Campo key={campo.label} label={campo.label} valor={formatarValor(campo.valor)} />
                                    ))}
                                </GradeCampos>
                            </SecaoCard>

                            <SecaoCard titulo="Saúde" icone="🩺">
                                <GradeCampos cols={2}>
                                    {saude.map((campo) => (
                                        <Campo key={campo.label} label={campo.label} valor={formatarValor(campo.valor)} />
                                    ))}
                                </GradeCampos>
                            </SecaoCard>

                            <SecaoCard titulo="Registros" icone="🪪">
                                <GradeCampos cols={2}>
                                    {registros.map((campo) => (
                                        <Campo key={campo.label} label={campo.label} valor={formatarValor(campo.valor)} />
                                    ))}
                                </GradeCampos>
                            </SecaoCard>

                            <SecaoCard titulo="Dados da Embarcação" icone="⛵">
                                <GradeCampos cols={2}>
                                    {embarcacaoGeral.map((campo) => (
                                        <Campo key={campo.label} label={campo.label} valor={formatarValor(campo.valor)} />
                                    ))}
                                </GradeCampos>
                            </SecaoCard>

                            <SecaoCard titulo="Documentação da Embarcação" icone="📑">
                                <GradeCampos cols={2}>
                                    {embarcacaoDocumentos.map((campo) => (
                                        <Campo key={campo.label} label={campo.label} valor={formatarValor(campo.valor)} />
                                    ))}
                                </GradeCampos>
                            </SecaoCard>

                            <SecaoCard titulo="Propulsões" icone="⚙️">
                                <Etiquetas itens={propulsoesSelecionadas} vazio="Nenhuma propulsão informada." />
                            </SecaoCard>

                            <SecaoCard titulo="Quadrantes de Pesca" icone="🧭">
                                <Tabela
                                    colunas={["#", "Quadrante"]}
                                    linhas={quadrantesLinhas}
                                    vazio="Nenhum quadrante preenchido."
                                />
                            </SecaoCard>
                        </div>

                        <SecaoCard titulo="Composição da Pescaria" icone="🎣">
                            <GradeCampos cols={2}>
                                <Campo label="Petrecho de pesca" valor={formatarValor(formData.petrechoPesca)} destaque />
                                <Campo label="Material do petrecho" valor={formatarValor(formData.materialPetrecho)} />
                                <Campo label="Comprimento (metros)" valor={formatarValor(formData.tamanhoMetros)} />
                                <Campo label="Comprimento (braças)" valor={formatarValor(formData.tamanhoBracas)} />
                                <Campo label="Quantidade de unidades" valor={formatarValor(formData.unidades)} />
                                <Campo label="Tipo de isca" valor={formatarValor(formData.tipoIscas)} />
                                <Campo label="Processo de lançamento" valor={formatarValor(formData.processoLancamento)} />
                            </GradeCampos>
                        </SecaoCard>

                        <SecaoCard titulo="Espécies Capturadas" icone="🐟">
                            <Tabela
                                colunas={["ID", "Nome comum", "Início safra", "Fim safra"]}
                                linhas={especiesLinhas}
                                vazio="Nenhuma espécie adicionada."
                            />
                        </SecaoCard>

                        <SecaoCard titulo="Despesas da Atividade" icone="💰">
                            <Tabela
                                colunas={["Item", "Tipo", "Quantidade", "Unidade", "Valor", "Frequência", "Outros"]}
                                linhas={despesasLinhas}
                                vazio="Nenhuma despesa adicionada."
                            />
                        </SecaoCard>

                        <SecaoCard titulo="Produção e Comercialização" icone="📈">
                            <GradeCampos cols={2}>
                                {producao.map((campo) => (
                                    <Campo key={campo.label} label={campo.label} valor={formatarValor(campo.valor)} />
                                ))}
                            </GradeCampos>
                        </SecaoCard>

                        <SecaoCard titulo="Finalização" icone="📝">
                            <GradeCampos cols={2}>
                                <Campo label="Coletor" valor={formatarValor(formData.coletor)} />
                                <Campo label="Digitador" valor={formatarValor(formData.digitador)} />
                                <Campo label="Data da coleta" valor={formatarData(formData.dataColeta)} />
                                <Campo label="Data digitador" valor={formatarData(formData.dataDigitador)} />
                                <Campo label="Observações" valor={formatarValor(formData.observacoes)} />
                            </GradeCampos>
                        </SecaoCard>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    );
}