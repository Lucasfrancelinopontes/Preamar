"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFormContext } from '@/app/contexts/FormContext';
import api from '@/services/api';
import Step1Local from '@/components/Step1Local';
import Step2Pescador from '@/components/Step2Pescador';
import Step3Embarcacao from '@/components/Step3Embarcacao';
import Step4ArtesPesca from '@/components/Step4ArtesPesca';
import Step5ProprietarioDespesas from '@/components/Step5ProprietarioDespesas';
import Step6QuadrantesDestino from '@/components/Step6QuadrantesDestino';
import Step7EspeciesCaptura from '@/components/Step7EspeciesCaptura';
import Step8EspeciesIndividuos from '@/components/Step8EspeciesIndividuos';
import Step9ResumoAnexos from '@/components/Step9ResumoAnexos';

function DesembarqueContent() {
    const [step, setStep] = useState(1);
    const [temaEscuro, setTemaEscuro] = useState(false);
    const [carregandoEdicao, setCarregandoEdicao] = useState(false);
    const [edicaoCarregada, setEdicaoCarregada] = useState(false);
    const [formSessionKey, setFormSessionKey] = useState(() => `new-${Date.now()}`);
    const [inicializando, setInicializando] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');
    const { formData, updateFormData, resetForm } = useFormContext();

    const initKeyRef = useRef(null);

    const carregarDadosEdicao = useCallback(async (id) => {
        try {
            const response = await api.getDesembarque(id);
            if (response.success) {
                const data = response.data;

                const makeTempId = (prefix, stable) => {
                    const seed = stable != null && stable !== '' ? String(stable) : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
                    return `${prefix}_${seed}`;
                };

                const toStr = (v) => (v === undefined || v === null ? '' : String(v));

                const isoToDate = (value) => {
                    if (!value) return '';
                    const s = String(value);
                    if (s.includes('T')) return s.split('T')[0];
                    // DATEONLY já vem como YYYY-MM-DD
                    return s;
                };

                const timeToHHmm = (value) => {
                    if (!value) return '';
                    const s = String(value);
                    if (s.includes('T')) {
                        const timePart = s.split('T')[1] || '';
                        return timePart.replace('Z', '').slice(0, 5);
                    }
                    // TIME pode vir como HH:mm:ss
                    if (/^\d{2}:\d{2}/.test(s)) return s.slice(0, 5);
                    return '';
                };

                const toDatetimeLocal = (dateOrIso, timeOrNull) => {
                    const datePart = isoToDate(dateOrIso);
                    if (!datePart) return '';
                    const timePart = timeToHHmm(timeOrNull || dateOrIso);
                    return timePart ? `${datePart}T${timePart}` : datePart;
                };

                const parseDestinoPescado = (value) => {
                    const arr = typeof value === 'string'
                        ? value
                            .split(',')
                            .map(s => s.trim())
                            .filter(Boolean)
                        : (Array.isArray(value) ? value : []);

                    return arr.map(s => {
                        const v = String(s).trim().toLowerCase();
                        if (v === 'atravessador') return 'Atravessador';
                        if (v === 'armador') return 'Armador';
                        if (v === 'consumidor') return 'Consumidor';
                        if (v === 'outros' || v === 'outro') return 'Outros';
                        return s;
                    });
                };

                const parseDestinoApelidos = (value) => {
                    const base = { Atravessador: '', Armador: '', Consumidor: '' };
                    if (!value) return base;

                    if (typeof value === 'object' && !Array.isArray(value)) {
                        return { ...base, ...value };
                    }

                    const parts = String(value)
                        .split(',')
                        .map(s => s.trim())
                        .filter(Boolean);

                    for (const item of parts) {
                        const [kRaw, ...rest] = item.split(':');
                        const k = String(kRaw || '').trim().toLowerCase();
                        const v = rest.join(':').trim();
                        if (!v) continue;
                        if (k === 'atravessador') base.Atravessador = v;
                        if (k === 'armador') base.Armador = v;
                        if (k === 'consumidor') base.Consumidor = v;
                    }

                    return base;
                };

                // Capturas -> Step7 (id, peso, preco, comTripa) + ids auxiliares
                const especiesCapturaRaw = Array.isArray(data.capturas)
                    ? data.capturas.map((c) => ({
                        id_temporario: makeTempId('captura', c.ID_captura ?? c.ID_especie),
                        ID_captura: c.ID_captura,
                        id: c.ID_especie != null ? String(c.ID_especie) : '',
                        peso: c.peso_kg != null ? toStr(c.peso_kg) : '',
                        preco: c.preco_kg != null ? toStr(c.preco_kg) : '',
                        comTripa: c.com_tripa !== undefined && c.com_tripa !== null ? Boolean(c.com_tripa) : true
                    }))
                    : [];

                // Indivíduos -> Step8 (peso, comprimento) agrupados por espécie
                const individuosByEspecie = new Map();
                if (Array.isArray(data.individuos)) {
                    for (const ind of data.individuos) {
                        const especieId = ind.ID_especie != null ? String(ind.ID_especie) : '';
                        if (!especieId) continue;
                        const list = individuosByEspecie.get(especieId) || [];

                        const comprimento = ind.comprimento_total_cm ?? ind.comprimento_padrao_cm ?? ind.comprimento_forquilha_cm ?? '';
                        list.push({
                            id_temporario: makeTempId('individuo', ind.ID_individuo ?? `${especieId}-${ind.numero_individuo ?? list.length + 1}`),
                            ID_individuo: ind.ID_individuo,
                            peso: ind.peso_g != null ? toStr(ind.peso_g) : '',
                            comprimento: comprimento != null ? toStr(comprimento) : ''
                        });
                        individuosByEspecie.set(especieId, list);
                    }
                }

                // Garantir que espécies presentes em indivíduos também apareçam na lista principal
                const especieIdsSet = new Set(especiesCapturaRaw.map(e => String(e.id)).filter(Boolean));
                for (const especieId of individuosByEspecie.keys()) {
                    if (!especieIdsSet.has(especieId)) {
                        especiesCapturaRaw.push({
                            id_temporario: makeTempId('captura', `from-individuos-${especieId}`),
                            ID_captura: null,
                            id: especieId,
                            peso: '',
                            preco: '',
                            comTripa: true
                        });
                        especieIdsSet.add(especieId);
                    }
                }

                const especiesIndividuos = especiesCapturaRaw
                    .filter(e => e.id)
                    .map(e => ({
                        ...e,
                        individuos: individuosByEspecie.get(String(e.id)) || []
                    }));

                const destinoPescado = parseDestinoPescado(data.destino_pescado);

                const mappedData = {
                    // Identificador do desembarque (para edição)
                    ID_desembarque: data.ID_desembarque,
                    codigoColeta: data.cod_desembarque,
                    // Step 1
                    municipio: data.municipio,
                    localidade: data.localidade,
                    municipioCode: data.municipio_code || data.municipioCode || null,
                    localidadeCode: data.localidade_code || data.localidadeCode || null,
                    dataColeta: isoToDate(data.data_coleta),
                    consecutivo: data.consecutivo,
                    codigoFoto: data.cod_foto,
                    // No front, Step1 usa datetime-local. Também preenchemos horaSaida/horaChegada para compatibilidade.
                    dataSaida: toDatetimeLocal(data.data_saida, data.hora_saida),
                    horaSaida: timeToHHmm(data.hora_saida || data.data_saida),
                    dataChegada: toDatetimeLocal(data.data_chegada, data.hora_desembarque),
                    horaChegada: timeToHHmm(data.hora_desembarque || data.data_chegada),
                    
                    // Step 2
                    nomePescador: data.pescador?.nome || '',
                    apelidoPescador: data.pescador?.apelido || '',
                    cpfPescador: data.pescador?.cpf || '',
                    nascimentoPescador: isoToDate(data.pescador?.nascimento),

                    // Step 3
                    nomeEmbarcacao: data.embarcacao?.nome_embarcacao || '',
                    codigoEmbarcacao: data.embarcacao?.codigo_embarcacao || '',
                    tipoEmbarcacao: (() => {
                        const known = new Set(['catraia', 'caico', 'jangada', 'boteLancha', 'canoa', 'barco', 'outro']);
                        const tipo = data.embarcacao?.tipo;
                        const tipoOutro = data.embarcacao?.tipo_outro;

                        if (tipoOutro) return 'outro';
                        if (tipo && known.has(String(tipo))) return String(tipo);
                        if (tipo) return 'outro';
                        return '';
                    })(),
                    tipoEmbarcacaoOutro: (() => {
                        const tipoOutro = data.embarcacao?.tipo_outro;
                        if (tipoOutro) return String(tipoOutro);

                        const tipo = data.embarcacao?.tipo;
                        const known = new Set(['catraia', 'caico', 'jangada', 'boteLancha', 'canoa', 'barco', 'outro']);
                        if (tipo && !known.has(String(tipo))) return String(tipo);
                        return '';
                    })(),
                    comprimento: data.embarcacao?.comprimento != null ? toStr(data.embarcacao.comprimento) : '',
                    forcaMotor: data.embarcacao?.hp != null ? toStr(data.embarcacao.hp) : '',
                    armazenamento: data.embarcacao?.possui || '',
                    capacidadeEstocagem: data.embarcacao?.capacidade != null ? toStr(data.embarcacao.capacidade) : '',
                    numTripulantes: data.numero_tripulantes != null ? toStr(data.numero_tripulantes) : '',
                    numPesqueiros: data.pesqueiros != null ? toStr(data.pesqueiros) : '',

                    // Step 4 (preserve IDs for incremental update)
                    arteSelecionadas: Array.isArray(data.artes)
                        ? data.artes.map(a => ({
                            id_temporario: makeTempId('arte', a.ID ?? `${a.arte}-${a.tamanho}`),
                            ID: a.ID,
                            arte: (() => {
                                const known = new Set(['rede_boirea', 'espinhel_mergulho', 'rede_fundeio', 'linha_mao', 'rede_cacoaria', 'covo', 'outras']);
                                const v = a.arte;
                                if (!v) return '';
                                return known.has(String(v)) ? String(v) : 'outras';
                            })(),
                            arte_outro: (() => {
                                const known = new Set(['rede_boirea', 'espinhel_mergulho', 'rede_fundeio', 'linha_mao', 'rede_cacoaria', 'covo', 'outras']);
                                const v = a.arte;
                                if (!v) return '';
                                const normalizedArte = known.has(String(v)) ? String(v) : 'outras';
                                const nome = a.nome != null ? String(a.nome) : '';
                                const legacyNome = known.has(String(v)) ? '' : String(v);
                                return normalizedArte === 'outras' ? (nome || legacyNome) : '';
                            })(),
                            tamanho: a.tamanho != null ? toStr(a.tamanho) : '',
                            unidade: a.unidade
                        }))
                        : [],
                    arte_obs: data.arte_obs || '',

                    // Step 5
                    nomeProprietario: data.proprietario || data.embarcacao?.proprietario || '',
                    apelidoProprietario: data.apelido_proprietario || '',
                    cpfProprietario: data.embarcacao?.cpf_proprietario || '',
                    atuouNaPesca: data.atuou_pesca === 'S' ? true : (data.atuou_pesca === 'N' ? false : null),
                    quantidadeGelo: data.gelo_kg != null ? toStr(data.gelo_kg) : '',
                    valorRancho: data.rancho_valor != null ? toStr(data.rancho_valor) : '',
                    litrosCombustivel: data.litros != null ? toStr(data.litros) : '',
                    tipoCombustivel: data.desp_diesel ? 'Diesel' : (data.desp_gasolina ? 'Gasolina' : 'Outro'),

                    // Step 6
                    quadrante1: data.quadrante1,
                    quadrante2: data.quadrante2,
                    quadrante3: data.quadrante3,
                    destinoPescado,
                    apelidoDestino: data.destino_apelido || '',
                    apelidosDestino: parseDestinoApelidos(data.destino_apelido),
                    outroDestino: data.destino_outros_qual || '',

                    // Coordinates (decimal)
                    latIda: data.lat_ida != null ? toStr(data.lat_ida) : '',
                    longIda: data.long_ida != null ? toStr(data.long_ida) : '',
                    latVolta: data.lat_volta != null ? toStr(data.lat_volta) : '',
                    longVolta: data.long_volta != null ? toStr(data.long_volta) : '',

                    // Step 7 & 8
                    especiesCaptura: especiesCapturaRaw.filter(e => e.id),
                    especiesIndividuos,
                };

                return mappedData;
            }
        } catch (error) {
            console.error("Erro ao carregar dados para edição", error);
        }

        return null;
    }, []);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            setInicializando(true);

            if (!editId) {
                setEdicaoCarregada(false);
                // Inicializa modo "novo" apenas uma vez, para não apagar dados ao avançar etapas.
                if (initKeyRef.current !== 'new') {
                    resetForm();
                    setStep(1);
                    setFormSessionKey(`new-${Date.now()}`);
                    initKeyRef.current = 'new';
                }
                if (!cancelled) setInicializando(false);
                return;
            }

            const targetKey = `edit:${editId}`;
            if (initKeyRef.current === targetKey && edicaoCarregada) {
                if (!cancelled) setInicializando(false);
                return;
            }

            setCarregandoEdicao(true);
            try {
                const mapped = await carregarDadosEdicao(editId);
                if (!cancelled && mapped) {
                    updateFormData(mapped);
                    setEdicaoCarregada(true);
                    setFormSessionKey(`edit-${editId}`);
                    initKeyRef.current = targetKey;
                }
            } finally {
                if (!cancelled) setCarregandoEdicao(false);
                if (!cancelled) setInicializando(false);
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [editId, carregarDadosEdicao, updateFormData, resetForm, edicaoCarregada]);

    // Array de etapas para o indicador de progresso
    const steps = [
        { number: 1, title: "Dados da viagem e embarcação" },
        { number: 2, title: "Dados da viagem e embarcação" },
        { number: 3, title: "Tipo de embarcação & artes de pesca" },
        { number: 4, title: "Tipo de embarcação & artes de pesca" },
        { number: 5, title: "Proprietário & despesas" },
        { number: 6, title: "Quadrantes & destino do pescado" },
        { number: 7, title: "Espécies & pesagens - Etapa 1" },
        { number: 8, title: "Espécies & pesagens - Etapa 2" },
        { number: 9, title: "Anexos & resumo" }
    ];

    const nextStep = () => setStep(s => Math.min(s + 1, steps.length));
    const prevStep = () => {
        if (step === 1) {
            router.push('/'); // Volta para a home se estiver no primeiro passo
        } else {
            setStep(s => s - 1);
        }
    };

    // Determina a largura da barra de progresso com base na etapa atual
    const progressWidth = `${((step - 1) / (steps.length - 1)) * 100}%`;

    // Renderiza o componente da etapa atual
    const renderStep = () => {
        if (inicializando) {
            return (
                <div className="max-w-3xl mx-auto p-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <p className="text-gray-700 dark:text-gray-200">Preparando formulário...</p>
                    </div>
                </div>
            );
        }

        if (editId && (carregandoEdicao || !edicaoCarregada)) {
            return (
                <div className="max-w-3xl mx-auto p-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <p className="text-gray-700 dark:text-gray-200">Carregando dados do desembarque para edição...</p>
                    </div>
                </div>
            );
        }

        switch (step) {
            case 1:
                return <Step1Local key={formSessionKey} nextStep={nextStep} prevStep={prevStep} />;
            case 2:
                return <Step2Pescador key={formSessionKey} nextStep={nextStep} prevStep={prevStep} />;
            case 3:
                return <Step3Embarcacao key={formSessionKey} nextStep={nextStep} prevStep={prevStep} />;
            case 4:
                return <Step4ArtesPesca key={formSessionKey} nextStep={nextStep} prevStep={prevStep} />;
            case 5:
                return <Step5ProprietarioDespesas key={formSessionKey} nextStep={nextStep} prevStep={prevStep} />;
            case 6:
                return <Step6QuadrantesDestino key={formSessionKey} nextStep={nextStep} prevStep={prevStep} />;
            case 7:
                return <Step7EspeciesCaptura key={formSessionKey} nextStep={nextStep} prevStep={prevStep} />;
            case 8:
                return <Step8EspeciesIndividuos key={formSessionKey} nextStep={nextStep} prevStep={prevStep} />;
            case 9:
                return <Step9ResumoAnexos key={formSessionKey} prevStep={prevStep} />;
            default:
                return null;
        }
    };

    return (
        <main className={`min-h-screen ${temaEscuro ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Indicador de Progresso */}
            <div className="px-4 pt-8 mb-8">
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                            <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                                temaEscuro ? 'bg-teal-900 text-teal-300' : 'bg-teal-200 text-teal-600'
                            }`}>
                                Etapa {step} de {steps.length}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className={`text-xs font-semibold inline-block ${
                                temaEscuro ? 'text-teal-300' : 'text-teal-600'
                            }`}>
                                {Math.round((step / steps.length) * 100)}%
                            </span>
                        </div>
                    </div>
                    <div className={`overflow-hidden h-2 mb-4 text-xs flex rounded ${
                        temaEscuro ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                        <div 
                            style={{ width: progressWidth }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-teal-500 transition-all duration-500"
                        />
                    </div>
                </div>
            </div>

            {/* Conteúdo da Etapa */}
            <div className="container mx-auto px-4 pb-12">
                {renderStep()}
            </div>
        </main>
    );
}

export default function DesembarquePage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <DesembarqueContent />
        </Suspense>
    );
}