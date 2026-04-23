"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";

const TOTAL_ETAPAS = 6;

const ARTE_OPTIONS = [
    { value: "rede_boirea", label: "Rede Boireia" },
    { value: "espinhel_mergulho", label: "Espinhel/Mergulho" },
    { value: "rede_fundeio", label: "Rede Fundeio" },
    { value: "linha_mao", label: "Linha de Mao" },
    { value: "rede_cacoaria", label: "Rede Cacoaria" },
    { value: "covo", label: "Covo" },
    { value: "outras", label: "Outras" }
];

function InputGroup({ label, name, value, onChange, type = "text", placeholder = "", colSpan = 1 }) {
    const isCalendarInput = type === "date" || type === "datetime-local";

    return (
        <div className={colSpan === 2 ? "md:col-span-2" : ""}>
            <label className="mb-1.5 block text-sm font-semibold text-black">{label}</label>
            <input
                type={type}
                name={name}
                value={value ?? ""}
                onChange={onChange}
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
    numeroIndividuo: "",
    comprimentoIndividuo: "",
    pesoIndividuo: ""
});

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
    if (Number.isFinite(numeric) && Math.abs(numeric) <= max) {
        return numeric;
    }
    return null;
};

const normalizeConservacaoValue = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";

    if (raw === "caixa") return "caixaTermica";
    if (raw === "in_natura") return "pescadoInNatura";

    return raw;
};

const mapToArray = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    return [];
};

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
    const arteIsKnown = ARTE_OPTIONS.some((item) => item.value === arteRaw);

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
        tipoEmbarcacao: data?.embarcacao?.tipo || "",
        tipoEmbarcacaoOutro: data?.embarcacao?.tipo_outro || "",
        comprimento: data?.embarcacao?.comprimento != null ? String(data.embarcacao.comprimento) : "",
        capacidadeEstocagem: data?.embarcacao?.capacidade != null ? String(data.embarcacao.capacidade) : "",
        forcaMotor: data?.embarcacao?.hp != null ? String(data.embarcacao.hp) : "",
        conservacao: normalizeConservacaoValue(data?.embarcacao?.possui),
        artePesca: arteRaw ? (arteIsKnown ? arteRaw : "outras") : "",
        artePescaOutro: arteRaw ? (arteIsKnown ? (arte?.nome || "") : arteRaw) : "",
        tamanhoArte: arte?.tamanho != null ? String(arte.tamanho) : "",
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
                especieIdd: captura?.ID_especie != null ? String(captura.ID_especie) : "",
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
    const editId = searchParams.get("edit");

    const [etapaAtual, setEtapaAtual] = useState(1);
    const [carregandoEnvio, setCarregandoEnvio] = useState(false);
    const [erroEnvio, setErroEnvio] = useState("");
    const [sucessoEnvio, setSucessoEnvio] = useState("");
    const [municipios, setMunicipios] = useState([]);
    const [especies, setEspecies] = useState([]);
    const [embarcacoesDoMunicipio, setEmbarcacoesDoMunicipio] = useState([]);
    const [embarcacaoSelecionadaId, setEmbarcacaoSelecionadaId] = useState("");
    const [carregandoEmbarcacoes, setCarregandoEmbarcacoes] = useState(false);
    const [erroEmbarcacoes, setErroEmbarcacoes] = useState("");
    const [carregandoInicial, setCarregandoInicial] = useState(true);
    const [carregandoEdicao, setCarregandoEdicao] = useState(false);
    const [erroInicial, setErroInicial] = useState("");
    const [formData, setFormData] = useState(createInitialFormData);

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

    useEffect(() => {
        if (editId) {
            setEmbarcacoesDoMunicipio([]);
            setEmbarcacaoSelecionadaId("");
            setErroEmbarcacoes("");
            setCarregandoEmbarcacoes(false);
            return;
        }

        const carregarEmbarcacoesPorMunicipio = async () => {
            const municipio = (formData.municipio || "").trim();

            setEmbarcacaoSelecionadaId("");
            setErroEmbarcacoes("");

            if (!municipio) {
                setEmbarcacoesDoMunicipio([]);
                return;
            }

            setCarregandoEmbarcacoes(true);
            try {
                const response = await api.listarEmbarcacoes({ municipio, limit: 200 });
                setEmbarcacoesDoMunicipio(mapToArray(response));
            } catch (error) {
                setEmbarcacoesDoMunicipio([]);
                setErroEmbarcacoes(error?.message || "Nao foi possivel carregar embarcacoes do municipio");
            } finally {
                setCarregandoEmbarcacoes(false);
            }
        };

        carregarEmbarcacoesPorMunicipio();
    }, [editId, formData.municipio]);

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

        setFormData((prev) => ({
            ...prev,
            ID_embarcacao: embarcacao.ID_embarcacao || prev.ID_embarcacao || null,
            nomeEmbarcacao: embarcacao.nome_embarcacao || "",
            codigoEmbarcacao: embarcacao.codigo_embarcacao || "",
            tipoEmbarcacao: embarcacao.tipo || "",
            tipoEmbarcacaoOutro: embarcacao.tipo_outro || "",
            comprimento: embarcacao.comprimento != null ? String(embarcacao.comprimento) : "",
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

    const handleCapturaChange = (index, field, value) => {
        setFormData((prev) => {
            const capturas = Array.isArray(prev.capturas) ? [...prev.capturas] : [createCapturaItem()];
            const capturaAtual = { ...(capturas[index] || createCapturaItem()) };

            if (field === "especieIdd") {
                const iddInformado = String(value || "").trim();

                if (!iddInformado) {
                    capturas[index] = {
                        ...capturaAtual,
                        especieIdd: "",
                        especieId: ""
                    };
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
                    capturas[index] = {
                        ...capturaAtual,
                        especieId: "",
                        especieIdd: ""
                    };
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
            individuos[index] = { ...individuos[index], [field]: value };
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

        const individuosPayload = (formData.individuos || [])
            .map((individuo, index) => {
                const especieId = Number.parseInt(String(individuo.especieId || "").trim(), 10);
                const comprimento = toNumberOrNull(individuo.comprimentoIndividuo);
                const peso = toNumberOrNull(individuo.pesoIndividuo);

                if (!Number.isInteger(especieId) || especieId <= 0 || (comprimento == null && peso == null)) {
                    return null;
                }

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
            artes: formData.artePesca
                ? [{
                        arte: formData.artePesca,
                        nome: formData.artePesca === "outras" ? (formData.artePescaOutro || null) : null,
                        tamanho: toNumberOrNull(formData.tamanhoArte),
                        unidade: "m"
                    }]
                : [],
            capturas: capturasPayload,
            individuos: individuosPayload
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErroEnvio("");
        setSucessoEnvio("");
        setCarregandoEnvio(true);

        try {
            const payload = montarPayload();

            if (formData.ID_desembarque) {
                await api.atualizarDesembarque(formData.ID_desembarque, payload);
                setSucessoEnvio("Desembarque atualizado com sucesso!");
            } else {
                const response = await api.criarDesembarque(payload);
                const codigo = response?.data?.cod_desembarque || codigoDesembarqueGerado;
                setSucessoEnvio(codigo ? `Desembarque ${codigo} salvo com sucesso!` : "Desembarque salvo com sucesso!");
                setFormData(createInitialFormData());
                setEtapaAtual(1);
            }
        } catch (error) {
            setErroEnvio(error?.message || "Falha ao salvar desembarque");
        } finally {
            setCarregandoEnvio(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 pb-10 text-black">
            <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-8 py-4 shadow-sm">
                <h1 className="text-lg font-bold text-black">Sistema Preamar</h1>
                <p className="text-xs text-black">Registro de Desembarque</p>
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
                        <form onSubmit={etapaAtual === TOTAL_ETAPAS ? handleSubmit : (e) => e.preventDefault()} className="text-black">
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

                            {etapaAtual === 2 && (
                                <div className="animate-in fade-in duration-300">
                                    <h2 className="mb-6 border-b border-slate-100 pb-4 text-2xl font-bold text-black">Pescador e Proprietario</h2>

                                    <h3 className="mb-4 text-lg font-semibold text-black">Dados do Pescador</h3>
                                    <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <InputGroup label="Nome Completo" name="nomePescador" colSpan={2} value={formData.nomePescador} onChange={handleInputChange} />
                                        <InputGroup label="Apelido" name="apelidoPescador" value={formData.apelidoPescador} onChange={handleInputChange} />
                                        <InputGroup label="CPF" name="cpfPescador" placeholder="000.000.000-00" value={formData.cpfPescador} onChange={handleInputChange} />
                                    </div>

                                    {!editId && (
                                        <>
                                            <h3 className="mb-4 text-lg font-semibold text-black">Pre-selecao de Embarcacao</h3>
                                            <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
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
                                            </div>
                                        </>
                                    )}

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
                                                <option value="boteLancha">Bote/Lancha</option>
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
                                        <InputGroup label="Forca do motor (HP)" name="forcaMotor" type="number" value={formData.forcaMotor} onChange={handleInputChange} />
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
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-black">Arte Utilizada</label>
                                            <select
                                                name="artePesca"
                                                value={formData.artePesca}
                                                onChange={handleInputChange}
                                                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-black outline-none focus:ring-2 focus:ring-blue-600"
                                            >
                                                <option value="">Selecione...</option>
                                                {ARTE_OPTIONS.map((item) => (
                                                    <option key={item.value} value={item.value}>{item.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <InputGroup label="Tamanho (m)" name="tamanhoArte" type="number" value={formData.tamanhoArte} onChange={handleInputChange} />
                                        {formData.artePesca === "outras" && (
                                            <InputGroup label="Qual arte?" name="artePescaOutro" colSpan={2} value={formData.artePescaOutro} onChange={handleInputChange} />
                                        )}
                                    </div>
                                </div>
                            )}

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

                            {etapaAtual === 5 && (
                                <div className="animate-in fade-in duration-300">
                                    <h2 className="mb-6 border-b border-slate-100 pb-4 text-2xl font-bold text-black">Dados de Captura</h2>

                                    <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
                                        <div className="mb-4 flex items-center justify-between gap-3">
                                            <h3 className="text-base font-bold text-black">Registro Geral das Especies</h3>
                                            <button
                                                type="button"
                                                onClick={adicionarCaptura}
                                                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                                            >
                                                + Adicionar especie
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <datalist id="captura-especies-idd-options">
                                                {especies.map((esp) => (
                                                    <option
                                                        key={`idd-option-${esp.ID}`}
                                                        value={String(esp.IDD ?? esp.ID ?? "")}
                                                    >
                                                        {esp.Nome_popular} ({esp.Nome_cientifico})
                                                    </option>
                                                ))}
                                            </datalist>

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
                                                            <label className="mb-1.5 block text-sm font-semibold text-black">IDD da especie</label>
                                                            <input
                                                                type="text"
                                                                inputMode="numeric"
                                                                value={captura.especieIdd || ""}
                                                                onChange={(e) => handleCapturaChange(index, "especieIdd", e.target.value)}
                                                                list="captura-especies-idd-options"
                                                                placeholder="Digite ou selecione IDD"
                                                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-600"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="mb-1.5 block text-sm font-semibold text-black">Nome da especie</label>
                                                            <select
                                                                value={captura.especieId}
                                                                onChange={(e) => handleCapturaChange(index, "especieId", e.target.value)}
                                                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-600"
                                                            >
                                                                <option value="">Selecione...</option>
                                                                {especies.map((esp) => (
                                                                    <option key={esp.ID} value={esp.ID}>
                                                                        {esp.Nome_popular} ({esp.Nome_cientifico})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <InputGroup
                                                            label="Peso Total (kg)"
                                                            name={`pesoTotalEspecie-${index}`}
                                                            type="number"
                                                            value={captura.pesoTotalEspecie}
                                                            onChange={(e) => handleCapturaChange(index, "pesoTotalEspecie", e.target.value)}
                                                        />

                                                        <InputGroup
                                                            label="Preco/kg (R$)"
                                                            name={`precoKg-${index}`}
                                                            type="number"
                                                            value={captura.precoKg}
                                                            onChange={(e) => handleCapturaChange(index, "precoKg", e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="flex flex-wrap gap-4">
                                                        <label className="flex items-center text-black">
                                                            <input
                                                                type="radio"
                                                                name={`condicaoPeixe-${index}`}
                                                                value="com_visceras"
                                                                onChange={(e) => handleCapturaChange(index, "condicaoPeixe", e.target.value)}
                                                                checked={captura.condicaoPeixe === "com_visceras"}
                                                                className="mr-2"
                                                            />
                                                            Com visceras
                                                        </label>
                                                        <label className="flex items-center text-black">
                                                            <input
                                                                type="radio"
                                                                name={`condicaoPeixe-${index}`}
                                                                value="sem_visceras"
                                                                onChange={(e) => handleCapturaChange(index, "condicaoPeixe", e.target.value)}
                                                                checked={captura.condicaoPeixe === "sem_visceras"}
                                                                className="mr-2"
                                                            />
                                                            Sem visceras
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <h3 className="text-base font-bold text-black">Biometria (Dados Individuais)</h3>
                                            <button
                                                type="button"
                                                onClick={adicionarIndividuo}
                                                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                                            >
                                                + Adicionar individuo
                                            </button>
                                        </div>
                                        <p className="mb-4 text-sm text-black">Adicione peso e comprimento de peixes individuais, se houver.</p>

                                        {especiesSelecionadasNaCaptura.length === 0 && (
                                            <div className="mb-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm font-medium text-amber-700">
                                                Selecione ao menos uma especie em Registro Geral para vincular individuos.
                                            </div>
                                        )}

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
                                                            <select
                                                                value={individuo.especieId}
                                                                onChange={(e) => handleIndividuoChange(index, "especieId", e.target.value)}
                                                                disabled={especiesSelecionadasNaCaptura.length === 0}
                                                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-400"
                                                            >
                                                                <option value="">Selecione...</option>
                                                                {especiesSelecionadasNaCaptura.map((esp) => (
                                                                    <option key={`ind-esp-${esp.ID}`} value={esp.ID}>
                                                                            #{esp.IDD ?? esp.ID} - {esp.Nome_popular}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <InputGroup
                                                            label="N do individuo"
                                                            name={`numeroIndividuo-${index}`}
                                                            type="number"
                                                            value={individuo.numeroIndividuo}
                                                            onChange={(e) => handleIndividuoChange(index, "numeroIndividuo", e.target.value)}
                                                        />

                                                        <InputGroup
                                                            label="Comprimento (cm)"
                                                            name={`comprimentoIndividuo-${index}`}
                                                            type="number"
                                                            value={individuo.comprimentoIndividuo}
                                                            onChange={(e) => handleIndividuoChange(index, "comprimentoIndividuo", e.target.value)}
                                                        />

                                                        <InputGroup
                                                            label="Peso (g)"
                                                            name={`pesoIndividuo-${index}`}
                                                            type="number"
                                                            value={individuo.pesoIndividuo}
                                                            onChange={(e) => handleIndividuoChange(index, "pesoIndividuo", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {etapaAtual === 6 && (
                                <div className="animate-in fade-in duration-300">
                                    <h2 className="mb-6 border-b border-slate-100 pb-4 text-2xl font-bold text-black">Resumo</h2>

                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-black">
                                        <h3 className="mb-4 border-b pb-2 text-lg font-bold text-black">Resumo dos Dados</h3>
                                        <div className="grid grid-cols-2 gap-y-3">
                                            <p><span className="font-semibold">Codigo:</span> {codigoDesembarqueGerado || "-"}</p>
                                            <p><span className="font-semibold">Data coleta:</span> {formData.dataColeta || "-"}</p>
                                            <p><span className="font-semibold">Localidade:</span> {formData.localidade || "-"}</p>
                                            <p><span className="font-semibold">Pescador:</span> {formData.nomePescador || "-"}</p>
                                            <p><span className="font-semibold">Embarcacao:</span> {formData.nomeEmbarcacao || "-"}</p>
                                            <p><span className="font-semibold">Especies registradas:</span> {(formData.capturas || []).filter((captura) => captura.especieId).length || "-"}</p>
                                            <p><span className="font-semibold">Individuos registrados:</span> {(formData.individuos || []).filter((individuo) => individuo.especieId && (individuo.pesoIndividuo || individuo.comprimentoIndividuo)).length || "-"}</p>
                                            <p><span className="font-semibold">Destino:</span> {formData.destino || "-"}</p>
                                            <p><span className="font-semibold">Nome do individuo:</span> {formData.destinoApelido || "-"}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

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
                                        type="submit"
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