"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import { useAuth } from "@/app/contexts/AuthContext";
import SpeciesAutocomplete from "@/components/SpeciesAutocomplete";

const TOTAL_ETAPAS = 6;

const ARTE_OPTIONS = [
    { value: "rede_boiera", label: "Rede Boiera" },
    { value: "espinhel", label: "Espinhel" },
    { value: "mergulho", label: "Mergulho" },
    { value: "rede_fundeio", label: "Rede Fundeio" },
    { value: "linha_mao", label: "Linha de Mao" },
    { value: "rede_cacoaria", label: "Rede Cacoaria" },
    { value: "covo", label: "Covo" },
    { value: "outras", label: "Outras" }
];

const ARTE_LABELS = {
    rede_boiera: "Rede Boiera",
    espinhel: "Espinhel",
    mergulho: "Mergulho",
    rede_fundeio: "Rede Fundeio",
    linha_mao: "Linha de Mao",
    rede_cacoaria: "Rede Cacoaria",
    covo: "Covo",
    outras: "Outras",
    espinhel_mergulho: "Espinhel/Mergulho"
};

function InputGroup({ label, name, value, onChange, type = "text", placeholder = "", colSpan = 1, step }) {
    const isCalendarInput = type === "date" || type === "datetime-local";
    const isNumberInput = type === "number";

    const handleNumberWheel = (event) => {
        if (!isNumberInput) return;
        event.currentTarget.blur();
    };

    return (
        <div className={colSpan === 2 ? "md:col-span-2" : ""}>
            <label className="mb-1.5 block text-sm font-semibold text-black">{label}</label>
            <input
                type={type}
                name={name}
                value={value ?? ""}
                onChange={onChange}
                onWheel={handleNumberWheel}
                step={step}
                placeholder={placeholder}
                className={`w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-black outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-blue-600 ${isCalendarInput ? "calendar-input-visible" : ""}`}
            />
        </div>
    );
}

const createCapturaItem = () => ({
    ID_captura: null,
    especieIdd: "",
    especieId: "",
    pesoTotalEspecie: "",
    precoKg: "",
    condicaoPeixe: ""
});

const createIndividuoItem = () => ({
    ID_individuo: null,
    especieId: "",
    especieBuscaTexto: "",
    numeroIndividuo: "",
    comprimentoIndividuo: "",
    pesoIndividuo: ""
});

const createArtePescaItem = () => ({
    ID: null,
    arte: "",
    nome: "",
    tamanho: "",
    quantidade: "",
    unidade: "m"
});

const normalizeArtesPesca = (artes) => {
    if (!Array.isArray(artes) || artes.length === 0) {
        return [createArtePescaItem()];
    }
    const itens = artes.map((arte) => ({
        ID: arte?.ID || arte?.id || null,
        arte: arte?.arte ? String(arte.arte) : "",
        nome: arte?.nome ? String(arte.nome) : "",
        tamanho: arte?.tamanho != null ? String(arte.tamanho) : "",
        quantidade: arte?.quantidade != null ? String(arte.quantidade) : "",
        unidade: arte?.unidade ? String(arte.unidade) : "m"
    }));
    return itens.length > 0 ? itens : [createArtePescaItem()];
};

const createInitialFormData = () => ({
    ID_desembarque: null,
    ID_embarcacao: null,
    municipio: "",
    localidade: "",
    dataColeta: "",
    numConsecutivo: "",
    dataSaida: "",
    dataChegada: "",
    codigoFoto: "",
    nomePescador: "",
    apelidoPescador: "",
    cpfPescador: "",
    nomeProprietario: "",
    apelidoProprietario: "",
    municipioEmbarcacao: "",
    municipioEmbarcacaoOutro: "",
    cpfProprietario: "",
    naturalidadeProprietario: "",
    atuouNaPesca: "",
    nomeEmbarcacao: "",
    codigoEmbarcacao: "",
    numTripulantes: "",
    numPesqueiros: "",
    tipoEmbarcacao: "",
    tipoEmbarcacaoOutro: "",
    comprimento: "",
    capacidadeEstocagem: "",
    forcaMotor: "",
    conservacao: "",
    artePesca: "",
    artePescaOutro: "",
    tamanhoArte: "",
    artesPesca: [createArtePescaItem()],
    gelo: "",
    rancho: "",
    litrosCombustivel: "",
    tipoCombustivel: "",
    latIda: "",
    longIda: "",
    latVolta: "",
    longVolta: "",
    quadrante1: "",
    quadrante2: "",
    quadrante3: "",
    destino: "",
    destinoApelido: "",
    capturas: [createCapturaItem()],
    individuos: [createIndividuoItem()]
});

const pad2 = (value) => String(value).padStart(2, "0");

const formatDateForInput = (value) => {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) return "";
    return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;
};

const formatTimeForInput = (value) => {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) return "";
    return `${pad2(value.getHours())}:${pad2(value.getMinutes())}`;
};

const toDateInput = (value) => {
    if (!value) return "";
    if (value instanceof Date) return formatDateForInput(value);
    const raw = String(value).trim();
    if (!raw) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    if (/^\d{4}-\d{2}-\d{2}[ T]/.test(raw)) return raw.slice(0, 10);
    if (raw.includes("T")) {
        const datePart = raw.split("T")[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;
    }
    const parsed = new Date(raw);
    return formatDateForInput(parsed);
};

const toTimeInput = (value) => {
    if (!value) return "";
    if (value instanceof Date) return formatTimeForInput(value);
    const raw = String(value).trim().replace(/Z$/, "");
    if (!raw) return "";
    if (raw.includes("T")) {
        const t = raw.split("T")[1] || "";
        return t.slice(0, 5);
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return "";
    if (/^\d{2}:\d{2}/.test(raw)) return raw.slice(0, 5);
    const dateTimeWithSpace = raw.match(/\s(\d{2}:\d{2})(?::\d{2})?/);
    if (dateTimeWithSpace) return dateTimeWithSpace[1];
    const parsed = new Date(raw);
    return formatTimeForInput(parsed);
};

const isValidDateInput = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);
const isValidTimeInput = (value) => /^\d{2}:\d{2}$/.test(value);

const toDatetimeLocal = (dateValue, timeValue) => {
    const date = toDateInput(dateValue);
    if (!isValidDateInput(date)) return "";
    const time = toTimeInput(timeValue || dateValue);
    if (!isValidTimeInput(time)) return "";
    return `${date}T${time}`;
};

const validarDataChegadaNaoMaiorQueSaida = (dataSaida, dataChegada) => {
    if (!dataSaida || !dataChegada) return true;

    const saida = new Date(dataSaida);
    const chegada = new Date(dataChegada);

    if (Number.isNaN(saida.getTime()) || Number.isNaN(chegada.getTime())) {
        return false;
    }

    return saida < chegada;
};

const splitDateTimeLocal = (value) => {
    if (!value) return { date: null, time: null };
    const str = String(value);
    if (!str.includes("T")) return { date: str, time: null };
    const [date, timeRaw] = str.split("T");
    return { date, time: (timeRaw || "").slice(0, 5) || null };
};

const toNumberOrNull = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const num = Number(String(value).replace(",", "."));
    return Number.isFinite(num) ? num : null;
};

const parseCoord = (raw, kind) => {
    if (!raw && raw !== 0) return null;
    const max = kind === "lat" ? 90 : 180;
    const normalized = String(raw).trim().replace(",", ".");
    if (!normalized) return null;
    const numeric = Number(normalized);
    if (Number.isFinite(numeric) && Math.abs(numeric) <= max) return numeric;
    return null;
};

const normalizeConservacaoValue = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (raw === "caixa") return "caixaTermica";
    if (raw === "in_natura") return "pescadoInNatura";
    return raw;
};

const normalizeTipoEmbarcacao = (value) => {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "";
    const map = {
        bote: "bote", lancha: "lancha",
        catraia: "catraia", caico: "caico",
        jangada: "jangada", canoa: "canoa", barco: "barco",
    };
    return map[raw] ?? "outro";
};

const getEmbarcacaoComprimento = (embarcacao = {}) => {
    const valor = embarcacao?.comprimento ?? embarcacao?.comprimento_m ?? embarcacao?.comprimentoM;
    return valor != null ? String(valor) : "";
};

const mapToArray = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    return [];
};

const normalizeBuscaTexto = (value) =>
    String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

const extractDestinoApelido = (raw, destino) => {
    if (!raw) return "";
    const texto = String(raw).trim();
    if (!texto) return "";
    if (!texto.includes(":")) return texto;
    const destinoKey = String(destino || "").trim().toLowerCase();
    if (!destinoKey) return texto;
    const entries = texto.split(",").map((item) => item.trim()).filter(Boolean);
    const match = entries.find((item) => item.toLowerCase().startsWith(`${destinoKey}:`));
    if (!match) return texto;
    const [, ...rest] = match.split(":");
    return rest.join(":").trim();
};

const mapApiToFormData = (data) => {
    const capturasApi = Array.isArray(data?.capturas) ? data.capturas : [];
    const individuosApi = Array.isArray(data?.individuos) ? data.individuos : [];
    const arte = Array.isArray(data?.artes) && data.artes.length > 0 ? data.artes[0] : null;
    const arteRaw = arte?.arte || "";
    const arteIsKnown = Object.prototype.hasOwnProperty.call(ARTE_LABELS, arteRaw);

    const destino = data?.destino_pescado
        ? String(data.destino_pescado).split(",")[0].trim().toLowerCase()
        : "";
    const destinoApelido = extractDestinoApelido(data?.destino_apelido, destino);

    return {
        ...createInitialFormData(),
        ID_desembarque: data?.ID_desembarque || null,
        ID_embarcacao: data?.embarcacao?.ID_embarcacao || null,
        municipio: data?.municipio || "",
        localidade: data?.localidade || "",
        dataColeta: toDateInput(data?.data_coleta),
        numConsecutivo: data?.consecutivo != null ? String(data.consecutivo) : "",
        dataSaida: toDatetimeLocal(data?.data_saida, data?.hora_saida),
        dataChegada: toDatetimeLocal(data?.data_chegada, data?.hora_desembarque),
        codigoFoto: data?.cod_foto || "",
        nomePescador: data?.pescador?.nome || "",
        apelidoPescador: data?.pescador?.apelido || "",
        cpfPescador: data?.pescador?.cpf || "",
        nomeProprietario: data?.proprietario || data?.embarcacao?.proprietario || "",
        apelidoProprietario: data?.apelido_proprietario || data?.embarcacao?.apelido_propietario || "",
        municipioEmbarcacao: data?.embarcacao?.municipio || data?.municipio || "",
        municipioEmbarcacaoOutro: "",
        cpfProprietario: data?.embarcacao?.cpf_proprietario || "",
        naturalidadeProprietario: data?.embarcacao?.localidade || "",
        atuouNaPesca: data?.atuou_pesca === "S" ? "sim" : data?.atuou_pesca === "N" ? "nao" : "",
        nomeEmbarcacao: data?.embarcacao?.nome_embarcacao || "",
        codigoEmbarcacao: data?.embarcacao?.codigo_embarcacao || "",
        numTripulantes: data?.numero_tripulantes != null ? String(data.numero_tripulantes) : "",
        numPesqueiros: data?.pesqueiros != null ? String(data.pesqueiros) : "",
        tipoEmbarcacao: normalizeTipoEmbarcacao(data?.embarcacao?.tipo),
        tipoEmbarcacaoOutro: data?.embarcacao?.tipo_outro || "",
        comprimento: getEmbarcacaoComprimento(data?.embarcacao),
        capacidadeEstocagem: data?.embarcacao?.capacidade != null ? String(data.embarcacao.capacidade) : "",
        forcaMotor: data?.embarcacao?.hp != null ? String(data.embarcacao.hp) : "",
        conservacao: normalizeConservacaoValue(data?.embarcacao?.possui),
        artePesca: arteRaw ? (arteIsKnown ? arteRaw : "outras") : "",
        artePescaOutro: arteRaw ? (arteIsKnown ? (arte?.nome || "") : arteRaw) : "",
        tamanhoArte: arte?.tamanho != null ? String(arte.tamanho) : "",
        artesPesca: normalizeArtesPesca(data?.artes),
        gelo: data?.gelo_kg != null ? String(data.gelo_kg) : "",
        rancho: data?.rancho_valor != null ? String(data.rancho_valor) : "",
        litrosCombustivel: data?.litros != null ? String(data.litros) : "",
        tipoCombustivel: data?.desp_diesel ? "Diesel" : data?.desp_gasolina ? "Gasolina" : "",
        latIda: data?.lat_ida != null ? String(data.lat_ida) : "",
        longIda: data?.long_ida != null ? String(data.long_ida) : "",
        latVolta: data?.lat_volta != null ? String(data.lat_volta) : "",
        longVolta: data?.long_volta != null ? String(data.long_volta) : "",
        quadrante1: data?.quadrante1 || "",
        quadrante2: data?.quadrante2 || "",
        quadrante3: data?.quadrante3 || "",
        destino,
        destinoApelido,
        capturas: capturasApi.length > 0
            ? capturasApi.map((captura) => ({
                ID_captura: captura?.ID_captura || null,
                especieIdd: captura?.especie?.idd != null
                    ? String(captura.especie.idd)
                    : captura?.especie?.IDD != null
                        ? String(captura.especie.IDD)
                        : captura?.ID_especie != null
                            ? String(captura.ID_especie)
                            : "",
                especieId: captura?.ID_especie != null ? String(captura.ID_especie) : "",
                pesoTotalEspecie: captura?.peso_kg != null ? String(captura.peso_kg) : "",
                precoKg: captura?.preco_kg != null ? String(captura.preco_kg) : "",
                condicaoPeixe: captura?.com_tripa === true
                    ? "com_visceras"
                    : captura?.com_tripa === false
                        ? "sem_visceras"
                        : ""
            }))
            : [createCapturaItem()],
        individuos: individuosApi.length > 0
            ? individuosApi.map((individuo, index) => ({
                ID_individuo: individuo?.ID_individuo || null,
                especieId: individuo?.ID_especie != null ? String(individuo.ID_especie) : "",
                especieBuscaTexto: individuo?.especie?.idd != null
                    ? `#${individuo.especie.idd} - ${individuo.especie.nome_popular || individuo.especie.Nome_popular || ""}`.trim()
                    : individuo?.especie?.IDD != null
                        ? `#${individuo.especie.IDD} - ${individuo.especie.nome_popular || individuo.especie.Nome_popular || ""}`.trim()
                        : individuo?.especie?.nome_popular || individuo?.especie?.Nome_popular || "",
                numeroIndividuo: individuo?.numero_individuo != null
                    ? String(individuo.numero_individuo)
                    : String(index + 1),
                comprimentoIndividuo: individuo?.comprimento_total_cm != null
                    ? String(individuo.comprimento_total_cm)
                    : individuo?.comprimento_padrao_cm != null
                        ? String(individuo.comprimento_padrao_cm)
                        : individuo?.comprimento_cm != null
                            ? String(individuo.comprimento_cm)
                            : "",
                pesoIndividuo: individuo?.peso_g != null ? String(individuo.peso_g) : ""
            }))
            : [createIndividuoItem()]
    };
};

function DesembarqueContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { atualizarPerfil } = useAuth();
    const editId = searchParams.get("edit");

    const [etapaAtual, setEtapaAtual] = useState(1);
    const [carregandoEnvio, setCarregandoEnvio] = useState(false);
    const [erroEnvio, setErroEnvio] = useState("");
    const [sucessoEnvio, setSucessoEnvio] = useState("");
    const [municipios, setMunicipios] = useState([]);
    const [especies, setEspecies] = useState([]);
    const [embarcacoesDoMunicipio, setEmbarcacoesDoMunicipio] = useState([]);
    const [embarcacoesTodosMunicipios, setEmbarcacoesTodosMunicipios] = useState([]);
    const [embarcacaoSelecionadaId, setEmbarcacaoSelecionadaId] = useState("");
    const [usarEmbarcacaoOutroMunicipio, setUsarEmbarcacaoOutroMunicipio] = useState(false);
    const [filtroEmbarcacaoOutroMunicipio, setFiltroEmbarcacaoOutroMunicipio] = useState("");
    const [carregandoEmbarcacoes, setCarregandoEmbarcacoes] = useState(false);
    const [carregandoEmbarcacoesOutroMunicipio, setCarregandoEmbarcacoesOutroMunicipio] = useState(false);
    const [erroEmbarcacoes, setErroEmbarcacoes] = useState("");
    const [erroEmbarcacoesOutroMunicipio, setErroEmbarcacoesOutroMunicipio] = useState("");
    const [carregandoInicial, setCarregandoInicial] = useState(true);
    const [carregandoEdicao, setCarregandoEdicao] = useState(false);
    const [erroInicial, setErroInicial] = useState("");
    const [formData, setFormData] = useState(createInitialFormData);

    // ── Carrega municipios e especies ──────────────────────────────────────────
    useEffect(() => {
        const carregarListas = async () => {
            setCarregandoInicial(true);
            setErroInicial("");
            try {
                const [municipiosRes, especiesRes] = await Promise.all([
                    api.getMunicipios(),
                    api.getEspecies()
                ]);
                setMunicipios(mapToArray(municipiosRes));
                setEspecies(mapToArray(especiesRes));
            } catch (error) {
                setErroInicial(error?.message || "Nao foi possivel carregar municipios e especies");
            } finally {
                setCarregandoInicial(false);
            }
        };
        carregarListas();
    }, []);

    // ── Carrega dados para edicao ──────────────────────────────────────────────
    useEffect(() => {
        const carregarEdicao = async () => {
            if (!editId) return;
            setCarregandoEdicao(true);
            setErroEnvio("");
            try {
                const response = await api.getDesembarque(editId);
                const data = response?.data || response;
                setFormData(mapApiToFormData(data));
            } catch (error) {
                setErroEnvio(error?.message || "Nao foi possivel carregar dados para edicao");
            } finally {
                setCarregandoEdicao(false);
            }
        };
        carregarEdicao();
    }, [editId]);

    // ── Carrega embarcacoes de todos os municipios (checkbox "outro municipio") ─
    useEffect(() => {
        if (!usarEmbarcacaoOutroMunicipio) return;
        if (embarcacoesTodosMunicipios.length > 0) return;

        const carregarEmbarcacoesDeTodosMunicipios = async () => {
            setCarregandoEmbarcacoesOutroMunicipio(true);
            setErroEmbarcacoesOutroMunicipio("");
            try {
                const limite = 200;
                let pagina = 1;
                let totalPaginas = 1;
                const embarcacoesCarregadas = [];
                do {
                    const response = await api.listarEmbarcacoes({ page: pagina, limit: limite });
                    const registros = mapToArray(response);
                    embarcacoesCarregadas.push(...registros);
                    totalPaginas = Number(response?.pagination?.pages || pagina);
                    pagina += 1;
                } while (pagina <= totalPaginas);
                setEmbarcacoesTodosMunicipios(embarcacoesCarregadas);
            } catch (error) {
                setEmbarcacoesTodosMunicipios([]);
                setErroEmbarcacoesOutroMunicipio(error?.message || "Nao foi possivel carregar embarcacoes de outros municipios");
            } finally {
                setCarregandoEmbarcacoesOutroMunicipio(false);
            }
        };
        carregarEmbarcacoesDeTodosMunicipios();
    }, [embarcacoesTodosMunicipios.length, usarEmbarcacaoOutroMunicipio]);

    // ── Carrega embarcacoes pelo municipio selecionado (criacao E edicao) ──────
    useEffect(() => {
        const carregarEmbarcacoesPorMunicipio = async () => {
            const municipio = (formData.municipio || "").trim();
            const municipioResolvido = municipios.find((m) => m.municipio === municipio) || null;

            setEmbarcacaoSelecionadaId("");
            setErroEmbarcacoes("");

            if (!municipio) {
                setEmbarcacoesDoMunicipio([]);
                return;
            }

            setCarregandoEmbarcacoes(true);
            try {
                const filtros = municipioResolvido?.ID_municipio
                    ? { municipioId: municipioResolvido.ID_municipio, limit: 200 }
                    : { municipio, limit: 200 };

                const response = await api.listarEmbarcacoes(filtros);
                setEmbarcacoesDoMunicipio(mapToArray(response));
            } catch (error) {
                setEmbarcacoesDoMunicipio([]);
                setErroEmbarcacoes(error?.message || "Nao foi possivel carregar embarcacoes do municipio");
            } finally {
                setCarregandoEmbarcacoes(false);
            }
        };
        carregarEmbarcacoesPorMunicipio();
    }, [formData.municipio, municipios]);
    const municipioSelecionado = useMemo(
        () => municipios.find((m) => m.municipio === formData.municipio) || null,
        [municipios, formData.municipio]
    );

    const localidadesDisponiveis = useMemo(
        () => municipioSelecionado?.localidades || [],
        [municipioSelecionado]
    );

    const localidadeSelecionada = useMemo(
        () => localidadesDisponiveis.find((l) => l.localidade === formData.localidade) || null,
        [localidadesDisponiveis, formData.localidade]
    );

    const codigoDesembarqueGerado = useMemo(() => {
        const municipioCode = municipioSelecionado?.municipioCode?.trim();
        const localidadeCode = localidadeSelecionada?.localidadeCode?.trim();
        if (!municipioCode || !localidadeCode || !formData.dataColeta) return "";
        const partesData = formData.dataColeta.split("-");
        if (partesData.length !== 3) return "";
        const [ano, mes, dia] = partesData;
        const consecutivoNumero = Number(formData.numConsecutivo || 1);
        if (!Number.isInteger(consecutivoNumero) || consecutivoNumero <= 0) return "";
        const consecutivo = String(consecutivoNumero).padStart(2, "0");
        return `${municipioCode} ${localidadeCode} ${dia} ${mes} ${ano.slice(-2)} ${consecutivo}`;
    }, [municipioSelecionado, localidadeSelecionada, formData.dataColeta, formData.numConsecutivo]);

    // validação in line do cdg desembarque
    useEffect(() => {
        if (modoEdicao || !codigoDesembarqueGerado) return;

        const verificarCodigo = async () => {
            try {
                const existe = await api.verificarCodigoDesembarque(codigoDesembarqueGerado);

                if (existe.existe) {
                    window.alert(
                        `O código ${codigoDesembarqueGerado} já existe.\n\n` +
                        "Altere o número consecutivo."
                    );
                }
            } catch (err) {
                console.error(err);
            }
        };

        verificarCodigo();
    }, [codigoDesembarqueGerado]);
    const especiesSelecionadasNaCaptura = useMemo(() => {
        const especiesSelecionadas = new Set(
            (formData.capturas || [])
                .map((captura) => String(captura.especieId || "").trim())
                .filter(Boolean)
        );
        return especies.filter((esp) => especiesSelecionadas.has(String(esp.ID)));
    }, [especies, formData.capturas]);

    const especiesPorId = useMemo(() => {
        const map = new Map();
        especies.forEach((esp) => {
            const key = String(esp.ID || "").trim();
            if (key) map.set(key, esp);
        });
        return map;
    }, [especies]);
    const modoEdicao = Boolean(formData.ID_desembarque);
    const especiesPorIdd = useMemo(() => {
        const map = new Map();
        especies.forEach((esp) => {
            const key = String(esp.IDD ?? esp.ID ?? "").trim();
            if (key) map.set(key, esp);
        });
        return map;
    }, [especies]);

    useEffect(() => {
        if (especies.length === 0) return;
        setFormData((prev) => {
            const capturas = Array.isArray(prev.capturas) ? prev.capturas : [];
            if (capturas.length === 0) return prev;
            let changed = false;
            const normalizadas = capturas.map((captura) => {
                const especieId = String(captura.especieId || "").trim();
                if (!especieId) return captura;
                const especie = especiesPorId.get(especieId);
                if (!especie) return captura;
                const iddCorreto = String(especie.IDD ?? especie.ID ?? "").trim();
                const iddAtual = String(captura.especieIdd || "").trim();
                if (!iddCorreto || iddAtual === iddCorreto) return captura;
                changed = true;
                return { ...captura, especieIdd: iddCorreto };
            });
            return changed ? { ...prev, capturas: normalizadas } : prev;
        });
    }, [especies, especiesPorId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            if (name === "municipio") {
                const syncMunicipioEmbarcacao = !prev.municipioEmbarcacao || prev.municipioEmbarcacao === prev.municipio;
                return {
                    ...prev,
                    municipio: value,
                    municipioEmbarcacao: syncMunicipioEmbarcacao ? value : prev.municipioEmbarcacao,
                    municipioEmbarcacaoOutro: syncMunicipioEmbarcacao ? "" : prev.municipioEmbarcacaoOutro,
                    localidade: ""
                };
            }
            if (name === "municipioEmbarcacao") {
                return {
                    ...prev,
                    municipioEmbarcacao: value,
                    municipioEmbarcacaoOutro: value === "outro" ? prev.municipioEmbarcacaoOutro : ""
                };
            }
            if (name === "artePesca") {
                return { ...prev, artePesca: value, artePescaOutro: value === "outras" ? prev.artePescaOutro : "" };
            }
            if (name === "artesPesca") {
                return { ...prev, artesPesca: value };
            }
            if (name === "destino") {
                return { ...prev, destino: value, destinoApelido: value ? prev.destinoApelido : "" };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleSelecionarEmbarcacao = (e) => {
        const selectedId = e.target.value;
        setEmbarcacaoSelecionadaId(selectedId);
        if (!selectedId) return;
        const embarcacao = embarcacoesDoMunicipio.find(
            (item) => String(item.ID_embarcacao) === String(selectedId)
        );
        if (!embarcacao) return;
        aplicarEmbarcacaoSelecionada(embarcacao);
    };

    const aplicarEmbarcacaoSelecionada = (embarcacao) => {
        if (!embarcacao) return;
        setFormData((prev) => ({
            ...prev,
            ID_embarcacao: embarcacao.ID_embarcacao || prev.ID_embarcacao || null,
            nomeEmbarcacao: embarcacao.nome_embarcacao || "",
            codigoEmbarcacao: embarcacao.codigo_embarcacao || "",
            tipoEmbarcacao: normalizeTipoEmbarcacao(embarcacao.tipo),
            tipoEmbarcacaoOutro: (() => {
                const tipo = normalizeTipoEmbarcacao(embarcacao.tipo);
                return tipo === "outro" ? (embarcacao.tipo || "") : (embarcacao.tipo_outro || "");
            })(),
            comprimento: getEmbarcacaoComprimento(embarcacao),
            capacidadeEstocagem: embarcacao.capacidade != null ? String(embarcacao.capacidade) : "",
            forcaMotor: embarcacao.hp != null ? String(embarcacao.hp) : "",
            conservacao: normalizeConservacaoValue(embarcacao.possui),
            municipioEmbarcacao: embarcacao.municipio || prev.municipioEmbarcacao || prev.municipio || "",
            nomeProprietario: prev.nomeProprietario || embarcacao.proprietario || "",
            apelidoProprietario: prev.apelidoProprietario || embarcacao.apelido_propietario || "",
            cpfProprietario: prev.cpfProprietario || embarcacao.cpf_proprietario || "",
            naturalidadeProprietario: prev.naturalidadeProprietario || embarcacao.localidade || ""
        }));
    };

    const embarcacoesFiltradasOutroMunicipio = useMemo(() => {
        const termo = normalizeBuscaTexto(filtroEmbarcacaoOutroMunicipio);
        if (!termo) return embarcacoesTodosMunicipios;
        return embarcacoesTodosMunicipios.filter((embarcacao) => {
            const campos = [
                embarcacao.nome_embarcacao,
                embarcacao.codigo_embarcacao,
                embarcacao.proprietario,
                embarcacao.municipio,
                embarcacao.localidade,
                embarcacao.tipo
            ].map(normalizeBuscaTexto).join(" ");
            return campos.includes(termo);
        });
    }, [embarcacoesTodosMunicipios, filtroEmbarcacaoOutroMunicipio]);

    const handleSelecionarEmbarcacaoOutroMunicipio = (e) => {
        const selectedId = e.target.value;
        setEmbarcacaoSelecionadaId(selectedId);
        if (!selectedId) return;
        const embarcacao = embarcacoesFiltradasOutroMunicipio.find(
            (item) => String(item.ID_embarcacao) === String(selectedId)
        );
        aplicarEmbarcacaoSelecionada(embarcacao);
    };

    const handleToggleEmbarcacaoOutroMunicipio = (e) => {
        const checked = e.target.checked;
        setUsarEmbarcacaoOutroMunicipio(checked);
        setEmbarcacaoSelecionadaId("");
        setFiltroEmbarcacaoOutroMunicipio("");
        setErroEmbarcacoesOutroMunicipio("");
        if (!checked) return;
        if (embarcacoesTodosMunicipios.length > 0) return;
        setCarregandoEmbarcacoesOutroMunicipio(true);
    };

    const handleCapturaChange = (index, field, value) => {
        setFormData((prev) => {
            const capturas = Array.isArray(prev.capturas) ? [...prev.capturas] : [createCapturaItem()];
            const capturaAtual = { ...(capturas[index] || createCapturaItem()) };

            if (field === "especieIdd") {
                const iddInformado = String(value || "").trim();
                if (!iddInformado) {
                    capturas[index] = { ...capturaAtual, especieIdd: "", especieId: "" };
                    return { ...prev, capturas };
                }
                const especieEncontrada = especiesPorIdd.get(iddInformado);
                capturas[index] = {
                    ...capturaAtual,
                    especieIdd: iddInformado,
                    especieId: especieEncontrada ? String(especieEncontrada.ID) : ""
                };
                return { ...prev, capturas };
            }

            if (field === "especieId") {
                const especieId = String(value || "").trim();
                if (!especieId) {
                    capturas[index] = { ...capturaAtual, especieId: "", especieIdd: "" };
                    return { ...prev, capturas };
                }
                const especieEncontrada = especiesPorId.get(especieId);
                capturas[index] = {
                    ...capturaAtual,
                    especieId,
                    especieIdd: especieEncontrada
                        ? String(especieEncontrada.IDD ?? especieEncontrada.ID ?? "")
                        : ""
                };
                return { ...prev, capturas };
            }

            capturas[index] = { ...capturaAtual, [field]: value };
            return { ...prev, capturas };
        });
    };

    const adicionarCaptura = () => {
        setFormData((prev) => ({
            ...prev,
            capturas: [...(prev.capturas || []), createCapturaItem()]
        }));
    };

    const removerCaptura = (index) => {
        setFormData((prev) => {
            const capturas = Array.isArray(prev.capturas) ? [...prev.capturas] : [];
            if (capturas.length <= 1) return prev;
            capturas.splice(index, 1);
            return { ...prev, capturas };
        });
    };

    const handleIndividuoChange = (index, field, value) => {
        setFormData((prev) => {
            const individuos = Array.isArray(prev.individuos) ? [...prev.individuos] : [createIndividuoItem()];
            if (field === "especieBuscaTexto") {
                individuos[index] = { ...individuos[index], especieBuscaTexto: value, especieId: "" };
                return { ...prev, individuos };
            }
            individuos[index] = { ...individuos[index], [field]: value };
            return { ...prev, individuos };
        });
    };

    const handleIndividuoEspecieSelecionada = (index, especie) => {
        const idEspecie = especie?.ID != null ? String(especie.ID) : especie?.IDD != null ? String(especie.IDD) : "";
        const labelId = especie?.IDD != null ? String(especie.IDD) : idEspecie;
        const nomePopular = especie?.Nome_popular || especie?.nome_popular || "";
        const textoBusca = labelId
            ? `#${labelId}${nomePopular ? ` - ${nomePopular}` : ""}`
            : nomePopular;

        setFormData((prev) => {
            const individuos = Array.isArray(prev.individuos) ? [...prev.individuos] : [createIndividuoItem()];
            individuos[index] = {
                ...individuos[index],
                especieId: idEspecie,
                especieBuscaTexto: textoBusca
            };
            return { ...prev, individuos };
        });
    };

    const adicionarIndividuo = () => {
        setFormData((prev) => ({
            ...prev,
            individuos: [...(prev.individuos || []), createIndividuoItem()]
        }));
    };

    const removerIndividuo = (index) => {
        setFormData((prev) => {
            const individuos = Array.isArray(prev.individuos) ? [...prev.individuos] : [];
            if (individuos.length <= 1) return prev;
            individuos.splice(index, 1);
            return { ...prev, individuos };
        });
    };

    const validarDatasDoDesembarque = () => {
        if (!validarDataChegadaNaoMaiorQueSaida(formData.dataSaida, formData.dataChegada)) {
            setErroEnvio("Data/Hora Saida tem que ser menor que Data/Hora Chegada.");
            window.scrollTo({ top: 0, behavior: "smooth" });
            return false;
        }

        return true;
    };

    useEffect(() => {
        setFormData((prev) => {
            const especiesValidas = new Set(
                (prev.capturas || [])
                    .map((captura) => String(captura.especieId || "").trim())
                    .filter(Boolean)
            );
            let changed = false;
            const individuos = (prev.individuos || []).map((individuo) => {
                if (!individuo.especieId) return individuo;
                if (!especiesValidas.has(String(individuo.especieId))) {
                    changed = true;
                    return { ...individuo, especieId: "" };
                }
                return individuo;
            });
            return changed ? { ...prev, individuos } : prev;
        });
    }, [formData.capturas]);

    const proximaEtapa = () => {
        if (etapaAtual === 1 && !validarDatasDoDesembarque()) return;
        if (etapaAtual < TOTAL_ETAPAS) setEtapaAtual((atual) => atual + 1);
        window.scrollTo(0, 0);
    };

    const etapaAnterior = () => {
        if (etapaAtual > 1) {
            setEtapaAtual((atual) => atual - 1);
        } else {
            router.push("/");
        }
        window.scrollTo(0, 0);
    };

    const montarPayload = () => {
        const municipioCode = municipioSelecionado?.municipioCode || null;
        const localidadeCode = localidadeSelecionada?.localidadeCode || null;
        const saida = splitDateTimeLocal(formData.dataSaida);
        const chegada = splitDateTimeLocal(formData.dataChegada);

        const capturasPayload = (formData.capturas || [])
            .map((captura) => {
                const especieId = Number.parseInt(String(captura.especieId || "").trim(), 10);
                if (!Number.isInteger(especieId) || especieId <= 0) return null;
                return {
                    ...(captura.ID_captura ? { ID_captura: captura.ID_captura } : {}),
                    ID_especie: especieId,
                    peso_kg: toNumberOrNull(captura.pesoTotalEspecie),
                    preco_kg: toNumberOrNull(captura.precoKg),
                    com_tripa: captura.condicaoPeixe === "com_visceras"
                        ? true
                        : captura.condicaoPeixe === "sem_visceras"
                            ? false
                            : null
                };
            })
            .filter(Boolean);

        const artesPescaPayload = Array.isArray(formData.artesPesca)
            ? formData.artesPesca
                .map((item) => {
                    const arteSelecionada = String(item?.arte || "").trim();
                    if (!arteSelecionada) return null;
                    const nomeOutro = String(item?.nome || "").trim();
                    return {
                        ID: item?.ID || null,
                        arte: arteSelecionada,
                        nome: arteSelecionada === "outras" ? (nomeOutro || null) : null,
                        tamanho: toNumberOrNull(item?.tamanho),
                        quantidade: toNumberOrNull(item?.quantidade),
                        unidade: item?.unidade || "m"
                    };
                })
                .filter(Boolean)
            : [];

        const individuosPayload = (formData.individuos || [])
            .map((individuo, index) => {
                const especieId = Number.parseInt(String(individuo.especieId || "").trim(), 10);
                const comprimento = toNumberOrNull(individuo.comprimentoIndividuo);
                const peso = toNumberOrNull(individuo.pesoIndividuo);
                if (!Number.isInteger(especieId) || especieId <= 0 || (comprimento == null && peso == null)) return null;
                return {
                    ...(individuo.ID_individuo ? { ID_individuo: individuo.ID_individuo } : {}),
                    ID_especie: especieId,
                    numero_individuo: Number(individuo.numeroIndividuo) || index + 1,
                    comprimento_total_cm: comprimento,
                    peso_g: peso
                };
            })
            .filter(Boolean);

        return {
            pescador: {
                nome: (formData.nomePescador || "").trim() || null,
                apelido: (formData.apelidoPescador || "").trim() || null,
                cpf: (formData.cpfPescador || "").replace(/\D/g, "") || null
            },
            embarcacao: {
                ID_embarcacao: formData.ID_embarcacao ? Number(formData.ID_embarcacao) : null,
                nome_embarcacao: formData.nomeEmbarcacao || null,
                codigo_embarcacao: formData.codigoEmbarcacao || null,
                tipo: formData.tipoEmbarcacao || null,
                tipo_outro: formData.tipoEmbarcacao === "outro" ? (formData.tipoEmbarcacaoOutro || null) : null,
                comprimento: toNumberOrNull(formData.comprimento),
                capacidade: toNumberOrNull(formData.capacidadeEstocagem),
                hp: toNumberOrNull(formData.forcaMotor),
                possui: normalizeConservacaoValue(formData.conservacao) || null,
                municipio: formData.municipioEmbarcacao === "outro"
                    ? ((formData.municipioEmbarcacaoOutro || "").trim() || null)
                    : (formData.municipioEmbarcacao || formData.municipio || null),
                proprietario: formData.nomeProprietario || null,
                apelido_propietario: formData.apelidoProprietario || null,
                cpf_proprietario: (formData.cpfProprietario || "").replace(/\D/g, "") || null,
                localidade: formData.naturalidadeProprietario || null
            },
            desembarque: {
                cod_desembarque: codigoDesembarqueGerado || null,
                municipio: formData.municipio || null,
                municipio_code: municipioCode,
                localidade: formData.localidade || null,
                localidade_code: localidadeCode,
                data_coleta: formData.dataColeta || null,
                consecutivo: Number(formData.numConsecutivo) || 1,
                data_saida: saida.date,
                hora_saida: saida.time,
                data_chegada: chegada.date,
                hora_desembarque: chegada.time,
                cod_foto: formData.codigoFoto || null,
                numero_tripulantes: Number(formData.numTripulantes) || null,
                pesqueiros: formData.numPesqueiros || null,
                lat_ida: parseCoord(formData.latIda, "lat"),
                long_ida: parseCoord(formData.longIda, "long"),
                lat_volta: parseCoord(formData.latVolta, "lat"),
                long_volta: parseCoord(formData.longVolta, "long"),
                quadrante1: formData.quadrante1 || null,
                quadrante2: formData.quadrante2 || null,
                quadrante3: formData.quadrante3 || null,
                gelo_kg: toNumberOrNull(formData.gelo),
                rancho_valor: toNumberOrNull(formData.rancho),
                litros: toNumberOrNull(formData.litrosCombustivel),
                desp_diesel: formData.tipoCombustivel === "Diesel",
                desp_gasolina: formData.tipoCombustivel === "Gasolina",
                destino_pescado: formData.destino || null,
                destino_apelido: (formData.destinoApelido || "").trim() || null,
                proprietario: formData.nomeProprietario || null,
                apelido_proprietario: formData.apelidoProprietario || null,
                atuou_pesca: formData.atuouNaPesca === "sim" ? "S" : formData.atuouNaPesca === "nao" ? "N" : null
            },
            artes: artesPescaPayload,
            capturas: capturasPayload,
            individuos: individuosPayload
        };
    };

    const handleSubmit = async () => {
        if (etapaAtual !== TOTAL_ETAPAS) return;
        setErroEnvio("");
        setSucessoEnvio("");

        if (!validarDatasDoDesembarque()) {
            return;
        }

        setCarregandoEnvio(true);
        try {
            const payload = montarPayload();
            if (formData.ID_desembarque) {
                await api.atualizarDesembarque(formData.ID_desembarque, payload);
                setSucessoEnvio("Desembarque atualizado com sucesso! Redirecionando...");
            } else {
                await api.criarDesembarque(payload);
                await atualizarPerfil();
                setSucessoEnvio("Desembarque cadastrado com sucesso! Redirecionando...");
            }
            // Dá tempo do usuário ver a confirmação antes de sair da página
            window.scrollTo({ top: 0, behavior: "smooth" });
            setTimeout(() => {
                router.replace("/");
            }, 1200);
        } catch (error) {
            const mensagemservidor = error?.response?.data?.message || error?.message;
            setErroEnvio(
                mensagemservidor || "Falha ao salvar desembarque. Verifique os dados e tente novamente."
            );
            setCarregandoEnvio(false);
            // Garante que o usuário veja o erro, independente de onde estava na tela
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
        // Não reseta carregandoEnvio no caminho de sucesso: o botão continua
        // desabilitado/"Enviando..." até o redirect acontecer, evitando duplo clique.
    };

    const handleConfirmarEnvio = async () => {
        if (etapaAtual !== TOTAL_ETAPAS || carregandoEnvio || carregandoInicial || carregandoEdicao) return;
        const mensagemConfirmacao = formData.ID_desembarque
            ? "Confirma a atualizacao do desembarque?"
            : "Confirma o envio do desembarque?";
        const confirmado = window.confirm(mensagemConfirmacao);
        if (!confirmado) return;
        await handleSubmit();
    };

    const possuiValor = (value) => {
        if (value === null || value === undefined) return false;
        return String(value).trim() !== "";
    };

    const valorResumo = (value) => (possuiValor(value) ? String(value) : "-");
    const formatarDataHoraResumo = (value) => (!possuiValor(value) ? "-" : String(value).replace("T", " "));
    const formatarAtuouNaPescaResumo = (value) => (value === "sim" ? "Sim" : value === "nao" ? "Nao" : "-");

    const formatarConservacaoResumo = (value) => {
        const labels = { urna: "Urna", caixaTermica: "Caixa Termica", pescadoInNatura: "Pescado In Natura" };
        return labels[value] || valorResumo(value);
    };

    const formatarTipoEmbarcacaoResumo = () => {
        if (!possuiValor(formData.tipoEmbarcacao)) return "-";
        if (formData.tipoEmbarcacao === "outro") return valorResumo(formData.tipoEmbarcacaoOutro);
        return formData.tipoEmbarcacao;
    };

    const formatarMunicipioEmbarcacaoResumo = () => {
        if (formData.municipioEmbarcacao === "outro") return valorResumo(formData.municipioEmbarcacaoOutro);
        return valorResumo(formData.municipioEmbarcacao);
    };

    const formatarArtePescaResumo = () => {
        const itens = Array.isArray(formData.artesPesca) ? formData.artesPesca : [];
        const textos = itens
            .filter((item) => possuiValor(item?.arte))
            .map((item) => {
                const label = ARTE_LABELS[item.arte] || String(item.arte);
                const nomeOutro = possuiValor(item?.nome) ? ` (${item.nome})` : "";
                const tamanho = possuiValor(item?.tamanho) ? ` - ${item.tamanho} m` : "";
                const quantidade = possuiValor(item?.quantidade) ? ` - Qtd: ${item.quantidade}` : "";
                return `${label}${nomeOutro}${tamanho}${quantidade}`;
            });
        return textos.length > 0 ? textos.join("; ") : "-";
    };

    const formatarArtePescaPrincipalResumo = () => {
        const itens = Array.isArray(formData.artesPesca) ? formData.artesPesca : [];
        const principal = itens.length > 0 ? itens[0] : null;
        if (!principal || !possuiValor(principal?.arte)) return "-";
        const label = ARTE_LABELS[principal.arte] || String(principal.arte);
        const nomeOutro = possuiValor(principal?.nome) ? ` (${principal.nome})` : "";
        const tamanho = possuiValor(principal?.tamanho) ? ` - ${principal.tamanho} m` : "";
        const quantidade = possuiValor(principal?.quantidade) ? ` - Qtd: ${principal.quantidade}` : "";
        return `${label}${nomeOutro}${tamanho}${quantidade}`;
    };

    const formatarDestinoResumo = (value) => {
        if (!possuiValor(value)) return "-";
        const texto = String(value).trim();
        return `${texto.charAt(0).toUpperCase()}${texto.slice(1)}`;
    };

    const formatarCondicaoPeixeResumo = (value) => {
        const labels = { com_visceras: "Com visceras", sem_visceras: "Sem visceras" };
        return labels[value] || valorResumo(value);
    };

    const formatarEspecieResumo = (especieIdd, especieId) => {
        const iddKey = possuiValor(especieIdd) ? String(especieIdd).trim() : "";
        const especiePorIdd = iddKey ? especiesPorIdd.get(iddKey) : null;
        const especiePorId = possuiValor(especieId) ? especiesPorId.get(String(especieId).trim()) : null;
        const especie = especiePorIdd || especiePorId;
        const nomePopular = especie?.Nome_popular || especie?.nome_popular || "";
        const idd = iddKey || String(especie?.IDD ?? especie?.idd ?? especie?.ID ?? "").trim();
        if (!idd && !nomePopular) return "-";
        if (idd && nomePopular) return `#${idd} - ${nomePopular}`;
        if (nomePopular) return nomePopular;
        return `#${idd}`;
    };

    const capturasDigitadas = (formData.capturas || []).filter((captura) =>
        [captura.especieIdd, captura.especieId, captura.pesoTotalEspecie, captura.precoKg, captura.condicaoPeixe].some(possuiValor)
    );

    const individuosDigitados = (formData.individuos || []).filter((individuo) =>
        [individuo.especieId, individuo.numeroIndividuo, individuo.comprimentoIndividuo, individuo.pesoIndividuo].some(possuiValor)
    );

    return (
        <div className="min-h-screen bg-slate-100 pb-10 text-black">
            <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-8 py-4 shadow-sm">
                <h1 className="text-lg font-bold text-black">Sistema Preamar</h1>
                <p className="text-xs text-black">
                    {editId ? "Editar Desembarque" : "Registro de Desembarque"}
                </p>
            </header>

            <main className="mx-auto flex w-full max-w-5xl flex-col items-center p-4 pt-8 sm:p-6">
                <div className="mb-8 w-full max-w-4xl">
                    <div className="mb-2 flex justify-between px-1 text-xs font-medium text-slate-400 sm:text-sm">
                        <span className={etapaAtual >= 1 ? "font-bold text-blue-600" : "hidden sm:inline"}>1. Local</span>
                        <span className={etapaAtual >= 2 ? "font-bold text-blue-600" : "hidden sm:inline"}>2. Pessoas</span>
                        <span className={etapaAtual >= 3 ? "font-bold text-blue-600" : "hidden sm:inline"}>3. Embarcacao</span>
                        <span className={etapaAtual >= 4 ? "font-bold text-blue-600" : "hidden sm:inline"}>4. Viagem</span>
                        <span className={etapaAtual >= 5 ? "font-bold text-blue-600" : "hidden sm:inline"}>5. Captura</span>
                        <span className={etapaAtual >= 6 ? "font-bold text-blue-600" : "hidden sm:inline"}>6. Resumo</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                        <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${((etapaAtual - 1) / (TOTAL_ETAPAS - 1)) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                    <div className="px-6 py-8 sm:p-10">
                        <form onSubmit={(e) => e.preventDefault()} className="text-black">
                            {carregandoInicial && (
                                <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-600">
                                    Carregando municipios e especies...
                                </div>
                            )}
                            {carregandoEdicao && (
                                <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-600">
                                    Carregando dados para edicao...
                                </div>
                            )}
                            {erroInicial && (
                                <div className="mb-6 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm font-medium text-amber-700">
                                    {erroInicial}
                                </div>
                            )}
                            {erroEnvio && (
                                <div className="mb-6 rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600">
                                    {erroEnvio}
                                </div>
                            )}
                            {sucessoEnvio && (
                                <div className="mb-6 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                                    {sucessoEnvio}
                                </div>
                            )}

                            {/* ── ETAPA 1: Local e Identificação ── */}
                            {etapaAtual === 1 && (
                                <div className="animate-in fade-in duration-300">
                                    <h2 className="mb-6 border-b border-slate-100 pb-4 text-2xl font-bold text-black">Local e Identificacao</h2>
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <div className="md:col-span-2">
                                            <label className="mb-1.5 block text-sm font-semibold text-black">Codigo do Desembarque (gerado)</label>
                                            <input
                                                type="text"
                                                value={codigoDesembarqueGerado}
                                                readOnly
                                                placeholder="Selecione municipio, localidade e data da coleta"
                                                className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-2.5 text-black outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-black">Municipio</label>
                                            <select
                                                name="municipio"
                                                value={formData.municipio}
                                                onChange={handleInputChange}
                                                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-600"
                                                disabled={carregandoInicial}
                                            >
                                                <option value="">Selecione o municipio...</option>
                                                {municipios.map((municipio) => (
                                                    <option key={municipio.municipioCode || municipio.municipio} value={municipio.municipio}>
                                                        {municipio.municipio}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-black">Localidade</label>
                                            <select
                                                name="localidade"
                                                value={formData.localidade}
                                                onChange={handleInputChange}
                                                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-400"
                                                disabled={!formData.municipio || carregandoInicial}
                                            >
                                                <option value="">Selecione a localidade...</option>
                                                {localidadesDisponiveis.map((localidade) => (
                                                    <option key={localidade.localidadeCode || localidade.localidade} value={localidade.localidade}>
                                                        {localidade.localidade}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <InputGroup label="Data da Coleta" name="dataColeta" type="date" value={formData.dataColeta} onChange={handleInputChange} />
                                        <InputGroup label="Numero Consecutivo" name="numConsecutivo" placeholder="Ex: 1, 2, 3..." value={formData.numConsecutivo} onChange={handleInputChange} />
                                        <InputGroup label="Data/Hora Saida" name="dataSaida" type="datetime-local" value={formData.dataSaida} onChange={handleInputChange} />
                                        <InputGroup label="Data/Hora Chegada" name="dataChegada" type="datetime-local" value={formData.dataChegada} onChange={handleInputChange} />
                                        <InputGroup label="Codigo da Foto" name="codigoFoto" placeholder="Opcional" colSpan={2} value={formData.codigoFoto} onChange={handleInputChange} />
                                    </div>
                                </div>
                            )}

                            {/* ── ETAPA 2: Pescador e Proprietário ── */}
                            {etapaAtual === 2 && (
                                <div className="animate-in fade-in duration-300">
                                    <h2 className="mb-6 border-b border-slate-100 pb-4 text-2xl font-bold text-black">Pescador e Proprietario</h2>

                                    <h3 className="mb-4 text-lg font-semibold text-black">Dados do Pescador</h3>
                                    <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <InputGroup label="Nome Completo" name="nomePescador" colSpan={2} value={formData.nomePescador} onChange={handleInputChange} />
                                        <InputGroup label="Apelido" name="apelidoPescador" value={formData.apelidoPescador} onChange={handleInputChange} />
                                        <InputGroup label="CPF" name="cpfPescador" placeholder="000.000.000-00" value={formData.cpfPescador} onChange={handleInputChange} />
                                    </div>

                                    {/* Pré-seleção de embarcação — idêntica em criação E edição */}
                                    <h3 className="mb-4 text-lg font-semibold text-black">Pre-selecao de Embarcacao</h3>
                                    <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-4 flex items-center gap-2">
                                            <input
                                                id="usarEmbarcacaoOutroMunicipio"
                                                type="checkbox"
                                                checked={usarEmbarcacaoOutroMunicipio}
                                                onChange={handleToggleEmbarcacaoOutroMunicipio}
                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                                            />
                                            <label htmlFor="usarEmbarcacaoOutroMunicipio" className="text-sm font-semibold text-black">
                                                Selecionar embarcacao de outro municipio
                                            </label>
                                        </div>

                                        {!usarEmbarcacaoOutroMunicipio ? (
                                            <>
                                                <label className="mb-1.5 block text-sm font-semibold text-black">
                                                    Selecionar embarcacao ja cadastrada
                                                </label>
                                                <select
                                                    value={embarcacaoSelecionadaId}
                                                    onChange={handleSelecionarEmbarcacao}
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-black outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-400"
                                                    disabled={!formData.municipio || carregandoEmbarcacoes}
                                                >
                                                    <option value="">
                                                        {!formData.municipio
                                                            ? "Selecione um municipio na etapa 1"
                                                            : carregandoEmbarcacoes
                                                                ? "Carregando embarcacoes..."
                                                                : "Selecione uma embarcacao (opcional)"}
                                                    </option>
                                                    {embarcacoesDoMunicipio.map((embarcacao) => (
                                                        <option key={embarcacao.ID_embarcacao} value={embarcacao.ID_embarcacao}>
                                                            {embarcacao.nome_embarcacao || "Sem nome"}
                                                            {embarcacao.codigo_embarcacao ? ` - ${embarcacao.codigo_embarcacao}` : ""}
                                                            {embarcacao.proprietario ? ` - ${embarcacao.proprietario}` : ""}
                                                        </option>
                                                    ))}
                                                </select>
                                                {erroEmbarcacoes && (
                                                    <p className="mt-2 text-sm font-medium text-red-600">{erroEmbarcacoes}</p>
                                                )}
                                                {!carregandoEmbarcacoes && formData.municipio && embarcacoesDoMunicipio.length === 0 && !erroEmbarcacoes && (
                                                    <p className="mt-2 text-sm text-slate-600">Nenhuma embarcacao encontrada para este municipio.</p>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <label className="mb-1.5 block text-sm font-semibold text-black">
                                                    Buscar embarcacao em outros municipios
                                                </label>
                                                <input
                                                    type="text"
                                                    value={filtroEmbarcacaoOutroMunicipio}
                                                    onChange={(e) => setFiltroEmbarcacaoOutroMunicipio(e.target.value)}
                                                    placeholder="Digite nome, codigo, proprietario ou municipio..."
                                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-black outline-none focus:ring-2 focus:ring-blue-600"
                                                />
                                                <div className="mt-3">
                                                    <label className="mb-1.5 block text-sm font-semibold text-black">
                                                        Selecione a embarcacao
                                                    </label>
                                                    <select
                                                        value={embarcacaoSelecionadaId}
                                                        onChange={handleSelecionarEmbarcacaoOutroMunicipio}
                                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-black outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-400"
                                                        disabled={carregandoEmbarcacoesOutroMunicipio}
                                                    >
                                                        <option value="">
                                                            {carregandoEmbarcacoesOutroMunicipio
                                                                ? "Carregando embarcacoes..."
                                                                : embarcacoesFiltradasOutroMunicipio.length > 0
                                                                    ? "Selecione uma embarcacao (opcional)"
                                                                    : "Nenhuma embarcacao encontrada"}
                                                        </option>
                                                        {embarcacoesFiltradasOutroMunicipio.map((embarcacao) => (
                                                            <option key={embarcacao.ID_embarcacao} value={embarcacao.ID_embarcacao}>
                                                                {embarcacao.nome_embarcacao || "Sem nome"}
                                                                {embarcacao.codigo_embarcacao ? ` - ${embarcacao.codigo_embarcacao}` : ""}
                                                                {embarcacao.municipio ? ` - ${embarcacao.municipio}` : ""}
                                                                {embarcacao.proprietario ? ` - ${embarcacao.proprietario}` : ""}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {erroEmbarcacoesOutroMunicipio && (
                                                    <p className="mt-2 text-sm font-medium text-red-600">{erroEmbarcacoesOutroMunicipio}</p>
                                                )}
                                                {!carregandoEmbarcacoesOutroMunicipio && embarcacoesTodosMunicipios.length === 0 && !erroEmbarcacoesOutroMunicipio && (
                                                    <p className="mt-2 text-sm text-slate-600">Nenhuma embarcacao carregada.</p>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <h3 className="mb-4 text-lg font-semibold text-black">Dados do Proprietario</h3>
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <InputGroup label="Nome do Proprietario" name="nomeProprietario" colSpan={2} value={formData.nomeProprietario} onChange={handleInputChange} />
                                        <InputGroup label="Apelido" name="apelidoProprietario" value={formData.apelidoProprietario} onChange={handleInputChange} />
                                        <InputGroup label="CPF" name="cpfProprietario" placeholder="000.000.000-00" value={formData.cpfProprietario} onChange={handleInputChange} />
                                        <InputGroup label="Naturalidade" name="naturalidadeProprietario" value={formData.naturalidadeProprietario} onChange={handleInputChange} />
                                        <div className="md:col-span-2">
                                            <label className="mb-1.5 block text-sm font-semibold text-black">Municipio da embarcacao</label>
                                            <select
                                                name="municipioEmbarcacao"
                                                value={formData.municipioEmbarcacao}
                                                onChange={handleInputChange}
                                                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-black outline-none focus:ring-2 focus:ring-blue-600"
                                            >
                                                <option value="">Selecione...</option>
                                                {formData.municipioEmbarcacao &&
                                                    formData.municipioEmbarcacao !== "outro" &&
                                                    !municipios.some((m) => m.municipio === formData.municipioEmbarcacao) && (
                                                        <option value={formData.municipioEmbarcacao}>{formData.municipioEmbarcacao}</option>
                                                    )}
                                                {municipios.map((municipio) => (
                                                    <option key={municipio.municipioCode || municipio.municipio} value={municipio.municipio}>
                                                        {municipio.municipio}
                                                    </option>
                                                ))}
                                                <option value="outro">Outro</option>
                                            </select>
                                        </div>
                                        {formData.municipioEmbarcacao === "outro" && (
                                            <InputGroup
                                                label="Digite o municipio da embarcacao"
                                                name="municipioEmbarcacaoOutro"
                                                colSpan={2}
                                                value={formData.municipioEmbarcacaoOutro}
                                                onChange={handleInputChange}
                                            />
                                        )}
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-black">Atuou na pesca?</label>
                                            <select
                                                name="atuouNaPesca"
                                                value={formData.atuouNaPesca}
                                                onChange={handleInputChange}
                                                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-600"
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="sim">Sim</option>
                                                <option value="nao">Nao</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── ETAPA 3: Embarcação e Artes de Pesca ── */}
                            {etapaAtual === 3 && (
                                <div className="animate-in fade-in duration-300">
                                    <h2 className="mb-6 border-b border-slate-100 pb-4 text-2xl font-bold text-black">Embarcacao e Artes de Pesca</h2>

                                    <h3 className="mb-4 text-lg font-semibold text-black">Dados da Embarcacao</h3>
                                    <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <InputGroup label="Nome da embarcacao" name="nomeEmbarcacao" value={formData.nomeEmbarcacao} onChange={handleInputChange} />
                                        <InputGroup label="Codigo da embarcacao" name="codigoEmbarcacao" value={formData.codigoEmbarcacao} onChange={handleInputChange} />
                                        <InputGroup label="N de tripulantes" name="numTripulantes" type="number" value={formData.numTripulantes} onChange={handleInputChange} />
                                        <InputGroup label="N de pesqueiros" name="numPesqueiros" type="number" value={formData.numPesqueiros} onChange={handleInputChange} />
                                        <div className="md:col-span-2">
                                            <label className="mb-1.5 block text-sm font-semibold text-black">Tipo de embarcacao</label>
                                            <select
                                                name="tipoEmbarcacao"
                                                value={formData.tipoEmbarcacao}
                                                onChange={handleInputChange}
                                                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-600"
                                            >
                                                <option value="">Selecione um tipo...</option>
                                                <option value="catraia">Catraia</option>
                                                <option value="caico">Caico</option>
                                                <option value="jangada">Jangada</option>
                                                <option value="bote">Bote</option>
                                                <option value="lancha">Lancha</option>
                                                <option value="canoa">Canoa</option>
                                                <option value="barco">Barco</option>
                                                <option value="outro">Outro</option>
                                            </select>
                                        </div>
                                        {formData.tipoEmbarcacao === "outro" && (
                                            <InputGroup label="Tipo (outro)" name="tipoEmbarcacaoOutro" colSpan={2} value={formData.tipoEmbarcacaoOutro} onChange={handleInputChange} />
                                        )}
                                        <InputGroup label="Comprimento (m)" name="comprimento" type="number" value={formData.comprimento} onChange={handleInputChange} />
                                        <InputGroup label="Capacidade (kg)" name="capacidadeEstocagem" type="number" value={formData.capacidadeEstocagem} onChange={handleInputChange} />
                                        <InputGroup label="Forca do motor (HP)" name="forcaMotor" type="number" step="any" value={formData.forcaMotor} onChange={handleInputChange} />
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-black">Conservacao (possui)</label>
                                            <select
                                                name="conservacao"
                                                value={formData.conservacao}
                                                onChange={handleInputChange}
                                                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-600"
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="urna">Urna</option>
                                                <option value="caixaTermica">Caixa Termica</option>
                                                <option value="pescadoInNatura">Pescado In Natura</option>
                                            </select>
                                        </div>
                                    </div>

                                    <h3 className="mb-4 border-t pt-6 text-lg font-semibold text-black">Arte de Pesca</h3>
                                    <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-4 flex items-center justify-between gap-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-black">Adicionar arte de pesca</h3>
                                                <p className="text-sm text-slate-600">Inclua uma ou mais artes usadas no desembarque.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData((prev) => ({
                                                    ...prev,
                                                    artesPesca: [...(Array.isArray(prev.artesPesca) ? prev.artesPesca : []), createArtePescaItem()]
                                                }))}
                                                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                            >
                                                + Adicionar arte
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {(Array.isArray(formData.artesPesca) ? formData.artesPesca : []).map((item, index) => (
                                                <div key={item.ID ?? index} className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[minmax(0,1fr)_140px_140px_auto]">
                                                    <div>
                                                        <label className="mb-1.5 block text-sm font-semibold text-black">Arte Utilizada</label>
                                                        <select
                                                            value={item.arte}
                                                            onChange={(e) => setFormData((prev) => ({
                                                                ...prev,
                                                                artesPesca: prev.artesPesca.map((arteItem, arteIndex) => (
                                                                    arteIndex === index
                                                                        ? { ...arteItem, arte: e.target.value, nome: e.target.value === "outras" ? arteItem.nome : "" }
                                                                        : arteItem
                                                                ))
                                                            }))}
                                                            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-black outline-none focus:ring-2 focus:ring-blue-600"
                                                        >
                                                            <option value="">Selecione...</option>
                                                            {ARTE_OPTIONS.map((option) => (
                                                                <option key={option.value} value={option.value}>{option.label}</option>
                                                            ))}
                                                            {item.arte === "espinhel_mergulho" && (
                                                                <option value="espinhel_mergulho" hidden>Espinhel/Mergulho</option>
                                                            )}
                                                        </select>
                                                    </div>
                                                    <InputGroup
                                                        label="Tamanho (m)"
                                                        name={`tamanhoArte-${index}`}
                                                        type="text"
                                                        value={item.tamanho}
                                                        onChange={(e) => setFormData((prev) => ({
                                                            ...prev,
                                                            artesPesca: prev.artesPesca.map((arteItem, arteIndex) => (
                                                                arteIndex === index ? { ...arteItem, tamanho: e.target.value } : arteItem
                                                            ))
                                                        }))}
                                                    />
                                                    <InputGroup
                                                        label="Quantidade"
                                                        name={`quantidadeArte-${index}`}
                                                        type="number"
                                                        step="1"
                                                        value={item.quantidade}
                                                        onChange={(e) => setFormData((prev) => ({
                                                            ...prev,
                                                            artesPesca: prev.artesPesca.map((arteItem, arteIndex) => (
                                                                arteIndex === index ? { ...arteItem, quantidade: e.target.value } : arteItem
                                                            ))
                                                        }))}
                                                    />
                                                    <div className="flex items-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData((prev) => {
                                                                const artesAtualizadas = prev.artesPesca.filter((_, arteIndex) => arteIndex !== index);
                                                                return {
                                                                    ...prev,
                                                                    artesPesca: artesAtualizadas.length > 0 ? artesAtualizadas : [createArtePescaItem()]
                                                                };
                                                            })}
                                                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                                                        >
                                                            Remover
                                                        </button>
                                                    </div>
                                                    {item.arte === "outras" && (
                                                        <InputGroup
                                                            label="Qual arte?"
                                                            name={`artePescaOutro-${index}`}
                                                            colSpan={2}
                                                            value={item.nome}
                                                            onChange={(e) => setFormData((prev) => ({
                                                                ...prev,
                                                                artesPesca: prev.artesPesca.map((arteItem, arteIndex) => (
                                                                    arteIndex === index ? { ...arteItem, nome: e.target.value } : arteItem
                                                                ))
                                                            }))}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── ETAPA 4: Viagem, Despesas e Destino ── */}
                            {etapaAtual === 4 && (
                                <div className="animate-in fade-in duration-300">
                                    <h2 className="mb-6 border-b border-slate-100 pb-4 text-2xl font-bold text-black">Viagem, Despesas e Destino</h2>

                                    <h3 className="mb-4 text-lg font-semibold text-black">Despesas Locais</h3>
                                    <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <InputGroup label="Gelo (kg)" name="gelo" type="number" value={formData.gelo} onChange={handleInputChange} />
                                        <InputGroup label="Rancho (R$)" name="rancho" type="number" value={formData.rancho} onChange={handleInputChange} />
                                        <InputGroup label="Litros de combustivel" name="litrosCombustivel" type="number" value={formData.litrosCombustivel} onChange={handleInputChange} />
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-black">Tipo de combustivel</label>
                                            <select
                                                name="tipoCombustivel"
                                                value={formData.tipoCombustivel}
                                                onChange={handleInputChange}
                                                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-600"
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="Diesel">Diesel</option>
                                                <option value="Gasolina">Gasolina</option>
                                                <option value="Outro">Outro</option>
                                            </select>
                                        </div>
                                    </div>

                                    <h3 className="mb-4 border-t pt-6 text-lg font-semibold text-black">Coordenadas e Quadrantes</h3>
                                    <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <InputGroup label="Ponto de Ida - Latitude" name="latIda" placeholder="-0.000000" value={formData.latIda} onChange={handleInputChange} />
                                        <InputGroup label="Ponto de Ida - Longitude" name="longIda" placeholder="-0.000000" value={formData.longIda} onChange={handleInputChange} />
                                        <InputGroup label="Ponto de Volta - Latitude" name="latVolta" placeholder="-0.000000" value={formData.latVolta} onChange={handleInputChange} />
                                        <InputGroup label="Ponto de Volta - Longitude" name="longVolta" placeholder="-0.000000" value={formData.longVolta} onChange={handleInputChange} />
                                        <InputGroup label="Quadrante 1" name="quadrante1" placeholder="Ex: 123" value={formData.quadrante1} onChange={handleInputChange} />
                                        <InputGroup label="Quadrante 2" name="quadrante2" placeholder="Ex: 456" value={formData.quadrante2} onChange={handleInputChange} />
                                        <InputGroup label="Quadrante 3" name="quadrante3" placeholder="Ex: 789" value={formData.quadrante3} onChange={handleInputChange} />
                                    </div>

                                    <h3 className="mb-4 border-t pt-6 text-lg font-semibold text-black">Destino do Pescado</h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {["Atravessador", "Armador", "Consumidor", "Outros"].map((dest) => {
                                            const value = dest.toLowerCase();
                                            return (
                                                <label key={dest} className="flex cursor-pointer items-center rounded-lg border border-slate-200 p-4 transition-colors hover:bg-blue-50">
                                                    <input
                                                        type="radio"
                                                        name="destino"
                                                        value={value}
                                                        onChange={handleInputChange}
                                                        checked={formData.destino === value}
                                                        className="h-4 w-4 text-blue-600"
                                                    />
                                                    <span className="ml-3 font-medium text-black">{dest}</span>
                                                </label>
                                            );
                                        })}
                                        {formData.destino && (
                                            <InputGroup
                                                label="Nome do individuo"
                                                name="destinoApelido"
                                                placeholder="Digite o nome do individuo"
                                                colSpan={2}
                                                value={formData.destinoApelido}
                                                onChange={handleInputChange}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── ETAPA 5: Captura ── */}
                            {etapaAtual === 5 && (
                                <div className="animate-in fade-in duration-300">
                                    <h2 className="mb-6 border-b border-slate-100 pb-4 text-2xl font-bold text-black">Dados de Captura</h2>

                                    <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
                                        <div className="mb-4 flex items-center justify-between gap-3">
                                            <h3 className="text-base font-bold text-black">Registro Geral das Especies</h3>
                                        </div>
                                        <div className="space-y-4">
                                            {(formData.capturas || []).map((captura, index) => (
                                                <div key={`captura-${captura.ID_captura || index}`} className="rounded-lg border border-slate-200 bg-white p-4">
                                                    <div className="mb-3 flex items-center justify-between gap-3">
                                                        <p className="text-sm font-semibold text-black">Especie {index + 1}</p>
                                                        <button
                                                            type="button"
                                                            onClick={() => removerCaptura(index)}
                                                            disabled={(formData.capturas || []).length <= 1}
                                                            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                        >
                                                            Remover
                                                        </button>
                                                    </div>
                                                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                                                        <div>
                                                            <label className="mb-1.5 block text-sm font-semibold text-black">Especie</label>
                                                            <SpeciesAutocomplete
                                                                options={especies}
                                                                value={captura.especieIdd || ""}
                                                                onChange={(value) => handleCapturaChange(index, "especieIdd", value)}
                                                                onSelect={(especie) => {
                                                                    const idd = especie?.IDD ?? especie?.ID ?? "";
                                                                    handleCapturaChange(index, "especieIdd", String(idd));
                                                                    handleCapturaChange(index, "especieId", especie?.ID != null ? String(especie.ID) : String(especie?.IDD ?? ""));
                                                                }}
                                                                placeholder="IDD ou nome popular"
                                                                inputClassName="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-600"
                                                                dropdownClassName="w-96"
                                                            />
                                                        </div>
                                                        <InputGroup
                                                            label="Peso Total (kg)"
                                                            name={`pesoTotalEspecie-${index}`}
                                                            type="float"
                                                            value={captura.pesoTotalEspecie}
                                                            onChange={(e) => handleCapturaChange(index, "pesoTotalEspecie", e.target.value)}
                                                        />
                                                        <InputGroup
                                                            label="Preco/kg (R$)"
                                                            name={`precoKg-${index}`}
                                                            type="float"
                                                            value={captura.precoKg}
                                                            onChange={(e) => handleCapturaChange(index, "precoKg", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="flex flex-wrap gap-4">
                                                        <label className="flex items-center text-black">
                                                            <input type="radio" name={`condicaoPeixe-${index}`} value="com_visceras" onChange={(e) => handleCapturaChange(index, "condicaoPeixe", e.target.value)} checked={captura.condicaoPeixe === "com_visceras"} className="mr-2" />
                                                            Com visceras
                                                        </label>
                                                        <label className="flex items-center text-black">
                                                            <input type="radio" name={`condicaoPeixe-${index}`} value="sem_visceras" onChange={(e) => handleCapturaChange(index, "condicaoPeixe", e.target.value)} checked={captura.condicaoPeixe === "sem_visceras"} className="mr-2" />
                                                            Sem visceras
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 flex justify-end">
                                            <button type="button" onClick={adicionarCaptura} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
                                                + Adicionar especie
                                            </button>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <h3 className="text-base font-bold text-black">Biometria (Dados Individuais)</h3>
                                        </div>
                                        <p className="mb-4 text-sm text-black">Adicione peso e comprimento de peixes individuais, se houver.</p>
                                        {especiesSelecionadasNaCaptura.length === 0 && (
                                            <div className="mb-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm font-medium text-amber-700">
                                                Selecione ao menos uma especie em Registro Geral para vincular individuos.
                                            </div>
                                        )}
                                        {/* input */}
                                        <div className="space-y-4">
                                            {(formData.individuos || []).map((individuo, index) => (
                                                <div key={`individuo-${individuo.ID_individuo || index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                                    <div className="mb-3 flex items-center justify-between gap-3">
                                                        <p className="text-sm font-semibold text-black">Individuo {index + 1}</p>
                                                        <button
                                                            type="button"
                                                            onClick={() => removerIndividuo(index)}
                                                            disabled={(formData.individuos || []).length <= 1}
                                                            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                        >
                                                            Remover
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                                        <div>
                                                            <label className="mb-1.5 block text-sm font-semibold text-black">Especie vinculada</label>
                                                            <SpeciesAutocomplete
                                                                options={especiesSelecionadasNaCaptura}
                                                                value={individuo.especieBuscaTexto || ""}
                                                                onChange={(value) => handleIndividuoChange(index, "especieBuscaTexto", value)}
                                                                onSelect={(especie) => handleIndividuoEspecieSelecionada(index, especie)}
                                                                placeholder="IDD ou nome popular"
                                                                disabled={especiesSelecionadasNaCaptura.length === 0}
                                                                inputClassName="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-400"
                                                                dropdownClassName="w-80"
                                                            />
                                                        </div>
                                                        <InputGroup label="N do individuo" name={`numeroIndividuo-${index}`} type="float" value={individuo.numeroIndividuo} onChange={(e) => handleIndividuoChange(index, "numeroIndividuo", e.target.value)} />
                                                        <InputGroup label="Comprimento (cm)" name={`comprimentoIndividuo-${index}`} type="float" value={individuo.comprimentoIndividuo} onChange={(e) => handleIndividuoChange(index, "comprimentoIndividuo", e.target.value)} />
                                                        <InputGroup label="Peso (g)" name={`pesoIndividuo-${index}`} type="float" value={individuo.pesoIndividuo} onChange={(e) => handleIndividuoChange(index, "pesoIndividuo", e.target.value)} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 flex justify-end">
                                            <button type="button" onClick={adicionarIndividuo} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
                                                + Adicionar individuo
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── ETAPA 6: Resumo ── */}
                            {etapaAtual === 6 && (
                                <div className="animate-in fade-in duration-300">
                                    <h2 className="mb-6 border-b border-slate-100 pb-4 text-2xl font-bold text-black">Resumo</h2>
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-black space-y-5">
                                        <h3 className="mb-2 border-b pb-2 text-lg font-bold text-black">Resumo completo antes do envio</h3>

                                        <div className="rounded-lg border border-slate-200 bg-white p-4">
                                            <h4 className="mb-3 text-base font-bold text-black">1. Local e Identificacao</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                                <p><span className="font-semibold">Codigo do desembarque:</span> {valorResumo(codigoDesembarqueGerado)}</p>
                                                <p><span className="font-semibold">Municipio:</span> {valorResumo(formData.municipio)}</p>
                                                <p><span className="font-semibold">Localidade:</span> {valorResumo(formData.localidade)}</p>
                                                <p><span className="font-semibold">Data da coleta:</span> {valorResumo(formData.dataColeta)}</p>
                                                <p><span className="font-semibold">Numero consecutivo:</span> {valorResumo(formData.numConsecutivo)}</p>
                                                <p><span className="font-semibold">Data/Hora saida:</span> {formatarDataHoraResumo(formData.dataSaida)}</p>
                                                <p><span className="font-semibold">Data/Hora chegada:</span> {formatarDataHoraResumo(formData.dataChegada)}</p>
                                                <p><span className="font-semibold">Codigo da foto:</span> {valorResumo(formData.codigoFoto)}</p>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-slate-200 bg-white p-4">
                                            <h4 className="mb-3 text-base font-bold text-black">2. Pescador e Proprietario</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                                <p><span className="font-semibold">Nome do pescador:</span> {valorResumo(formData.nomePescador)}</p>
                                                <p><span className="font-semibold">Apelido do pescador:</span> {valorResumo(formData.apelidoPescador)}</p>
                                                <p><span className="font-semibold">CPF do pescador:</span> {valorResumo(formData.cpfPescador)}</p>
                                                <p><span className="font-semibold">Nome do proprietario:</span> {valorResumo(formData.nomeProprietario)}</p>
                                                <p><span className="font-semibold">Apelido do proprietario:</span> {valorResumo(formData.apelidoProprietario)}</p>
                                                <p><span className="font-semibold">CPF do proprietario:</span> {valorResumo(formData.cpfProprietario)}</p>
                                                <p><span className="font-semibold">Naturalidade do proprietario:</span> {valorResumo(formData.naturalidadeProprietario)}</p>
                                                <p><span className="font-semibold">Municipio da embarcacao:</span> {formatarMunicipioEmbarcacaoResumo()}</p>
                                                <p><span className="font-semibold">Municipio da embarcacao (outro):</span> {valorResumo(formData.municipioEmbarcacaoOutro)}</p>
                                                <p><span className="font-semibold">Atuou na pesca:</span> {formatarAtuouNaPescaResumo(formData.atuouNaPesca)}</p>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-slate-200 bg-white p-4">
                                            <h4 className="mb-3 text-base font-bold text-black">3. Embarcacao e Artes</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                                <p><span className="font-semibold">ID embarcacao selecionada:</span> {valorResumo(formData.ID_embarcacao)}</p>
                                                <p><span className="font-semibold">Nome da embarcacao:</span> {valorResumo(formData.nomeEmbarcacao)}</p>
                                                <p><span className="font-semibold">Codigo da embarcacao:</span> {valorResumo(formData.codigoEmbarcacao)}</p>
                                                <p><span className="font-semibold">Numero de tripulantes:</span> {valorResumo(formData.numTripulantes)}</p>
                                                <p><span className="font-semibold">Numero de pesqueiros:</span> {valorResumo(formData.numPesqueiros)}</p>
                                                <p><span className="font-semibold">Tipo de embarcacao:</span> {formatarTipoEmbarcacaoResumo()}</p>
                                                <p><span className="font-semibold">Tipo de embarcacao (outro):</span> {valorResumo(formData.tipoEmbarcacaoOutro)}</p>
                                                <p><span className="font-semibold">Comprimento (m):</span> {valorResumo(formData.comprimento)}</p>
                                                <p><span className="font-semibold">Capacidade de estocagem (kg):</span> {valorResumo(formData.capacidadeEstocagem)}</p>
                                                <p><span className="font-semibold">Forca do motor (HP):</span> {valorResumo(formData.forcaMotor)}</p>
                                                <p><span className="font-semibold">Conservacao:</span> {formatarConservacaoResumo(formData.conservacao)}</p>
                                                <p><span className="font-semibold">Arte de pesca:</span> {formatarArtePescaPrincipalResumo()}</p>
                                                <p><span className="font-semibold">Artes de pesca:</span> {formatarArtePescaResumo()}</p>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-slate-200 bg-white p-4">
                                            <h4 className="mb-3 text-base font-bold text-black">4. Viagem, Despesas e Destino</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                                <p><span className="font-semibold">Gelo (kg):</span> {valorResumo(formData.gelo)}</p>
                                                <p><span className="font-semibold">Rancho (R$):</span> {valorResumo(formData.rancho)}</p>
                                                <p><span className="font-semibold">Litros de combustivel:</span> {valorResumo(formData.litrosCombustivel)}</p>
                                                <p><span className="font-semibold">Tipo de combustivel:</span> {valorResumo(formData.tipoCombustivel)}</p>
                                                <p><span className="font-semibold">Latitude ida:</span> {valorResumo(formData.latIda)}</p>
                                                <p><span className="font-semibold">Longitude ida:</span> {valorResumo(formData.longIda)}</p>
                                                <p><span className="font-semibold">Latitude volta:</span> {valorResumo(formData.latVolta)}</p>
                                                <p><span className="font-semibold">Longitude volta:</span> {valorResumo(formData.longVolta)}</p>
                                                <p><span className="font-semibold">Quadrante 1:</span> {valorResumo(formData.quadrante1)}</p>
                                                <p><span className="font-semibold">Quadrante 2:</span> {valorResumo(formData.quadrante2)}</p>
                                                <p><span className="font-semibold">Quadrante 3:</span> {valorResumo(formData.quadrante3)}</p>
                                                <p><span className="font-semibold">Destino do pescado:</span> {formatarDestinoResumo(formData.destino)}</p>
                                                <p><span className="font-semibold">Nome do individuo (destino):</span> {valorResumo(formData.destinoApelido)}</p>
                                            </div>
                                        </div>

                                        <div className="rounded-lg border border-slate-200 bg-white p-4">
                                            <h4 className="mb-3 text-base font-bold text-black">5. Capturas</h4>
                                            {capturasDigitadas.length === 0 ? (
                                                <p className="text-slate-600">Nenhuma captura preenchida.</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {capturasDigitadas.map((captura, index) => (
                                                        <div key={`resumo-captura-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                                            <p className="mb-2 font-semibold text-black">Captura {index + 1}</p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                                                <p><span className="font-semibold">Especie:</span> {formatarEspecieResumo(captura.especieIdd, captura.especieId)}</p>
                                                                <p><span className="font-semibold">IDD informado:</span> {valorResumo(captura.especieIdd)}</p>
                                                                <p><span className="font-semibold">Peso total da especie (kg):</span> {valorResumo(captura.pesoTotalEspecie)}</p>
                                                                <p><span className="font-semibold">Preco por kg:</span> {valorResumo(captura.precoKg)}</p>
                                                                <p><span className="font-semibold">Condicao do peixe:</span> {formatarCondicaoPeixeResumo(captura.condicaoPeixe)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="rounded-lg border border-slate-200 bg-white p-4">
                                            <h4 className="mb-3 text-base font-bold text-black">6. Biometria de Individuos</h4>
                                            {individuosDigitados.length === 0 ? (
                                                <p className="text-slate-600">Nenhum individuo preenchido.</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {individuosDigitados.map((individuo, index) => (
                                                        <div key={`resumo-individuo-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                                            <p className="mb-2 font-semibold text-black">Individuo {index + 1}</p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                                                <p><span className="font-semibold">Especie vinculada:</span> {valorResumo(individuo.especieBuscaTexto || formatarEspecieResumo(individuo.especieId, null))}</p>
                                                                <p><span className="font-semibold">Numero do individuo:</span> {valorResumo(individuo.numeroIndividuo)}</p>
                                                                <p><span className="font-semibold">Comprimento (cm):</span> {valorResumo(individuo.comprimentoIndividuo)}</p>
                                                                <p><span className="font-semibold">Peso (g):</span> {valorResumo(individuo.pesoIndividuo)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Navegação ── */}
                            <div className="mt-10 flex gap-4 border-t border-slate-100 pt-6">
                                <button
                                    type="button"
                                    onClick={etapaAnterior}
                                    className="flex-1 rounded-lg border border-slate-300 px-6 py-3 font-semibold text-black transition-colors hover:bg-slate-50 md:w-40 md:flex-none"
                                >
                                    Voltar
                                </button>
                                <div className="flex-1" />
                                {etapaAtual < TOTAL_ETAPAS ? (
                                    <button
                                        type="button"
                                        onClick={proximaEtapa}
                                        className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 md:w-56 md:flex-none"
                                    >
                                        Proximo Passo
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleConfirmarEnvio}
                                        disabled={carregandoEnvio || carregandoInicial || carregandoEdicao}
                                        className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 md:w-56 md:flex-none"
                                    >
                                        {carregandoEnvio ? "Enviando..." : formData.ID_desembarque ? "Atualizar Cadastro" : "Enviar Cadastro"}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function DesembarquePage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <DesembarqueContent />
        </Suspense>
    );
}