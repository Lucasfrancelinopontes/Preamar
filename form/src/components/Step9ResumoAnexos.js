'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFormContext } from '@/app/contexts/FormContext'
import api from '@/services/api'
import { gerarCodigoDesembarque } from '@/utils/validations'

export default function Step9ResumoAnexos({ prevStep }) {
  const router = useRouter()
  const { formData, resetForm } = useFormContext()
  const [anexos, setAnexos] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const [sucesso, setSucesso] = useState(false)

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setAnexos(files)

    const urls = files.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file)
      }
      return null
    })
    setPreviewUrls(urls)
  }

  const removerAnexo = (index) => {
    const newAnexos = anexos.filter((_, i) => i !== index)
    const newPreviews = previewUrls.filter((_, i) => i !== index)
    
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index])
    }
    
    setAnexos(newAnexos)
    setPreviewUrls(newPreviews)
  }

  const obterNomeEspecie = (id) => {
    return `Espécie #${id}`
  }
  // console.log((formData));
  const prepararDadosEnvio = () => {
    const parseCoord = (raw, kind) => {
      if (raw === undefined || raw === null || raw === '') return null

      const max = kind === 'lat' ? 90 : 180
      const str = String(raw).trim()
      if (!str) return null

      // Normaliza decimal pt-BR: "-7,123" -> "-7.123"
      const normalized = str.replace(',', '.')
      const numeric = parseFloat(normalized)

      // Tenta decimal padrão primeiro
      if (Number.isFinite(numeric) && Math.abs(numeric) <= max) {
        return numeric
      }

      // Tenta interpretar como DMS "ddmmss" / "dddmmss" (ex: 053020 -> 5°30'20")
      // Útil quando usuário cola coordenada sem separadores.
      const packed = parseFloat(normalized)
      if (!Number.isFinite(packed)) return null

      const sign = packed < 0 ? -1 : 1
      const absVal = Math.abs(packed)

      const deg = Math.floor(absVal / 10000)
      const rem = absVal % 10000
      const min = Math.floor(rem / 100)
      const sec = Math.round(rem % 100)

      if (deg <= max && min >= 0 && min < 60 && sec >= 0 && sec < 60) {
        const dec = deg + (min / 60) + (sec / 3600)
        if (dec <= max) return sign * dec
      }

      return null
    }

    // Usar a data de coleta (coletor). Na edição, é ela que deve persistir em `data_coleta`.
    const dataColeta = (formData.dataColeta || new Date().toISOString()).split('T')[0]; // YYYY-MM-DD
    const consecutivo = formData.consecutivo || 1;
    const municipio = formData.municipio || 'LOCAL';
    const localidade = formData.localidade || 'PRAIA';
    
    // Gerar código automaticamente se não existir (baseado em data de coleta)
    let codDesembarque = formData.codigoColeta;
    if (!codDesembarque) {
      const gen = gerarCodigoDesembarque(municipio, localidade, dataColeta, consecutivo);
      if (gen) codDesembarque = gen;
    }

    const pescador = {
      nome: formData.nomePescador || '',
      apelido: formData.apelidoPescador || null,
      cpf: formData.cpfPescador?.replace(/\D/g, '') || null,
      nascimento: formData.nascimentoPescador || null,
      municipio: formData.municipio
    }

    // Preparar dados da embarcação
    const embarcacao = {
      nome_embarcacao: formData.nomeEmbarcacao,
      codigo_embarcacao: formData.codigoEmbarcacao,
      proprietario: formData.nomeProprietario || null,
      cpf_proprietario: formData.cpfProprietario?.replace(/\D/g, '') || null,
      localidade: formData.naturalidadeProprietario || null,
      tipo: formData.tipoEmbarcacao,
      tipo_outro: formData.tipoEmbarcacao === 'outro' ? (formData.tipoEmbarcacaoOutro || null) : null,
      comprimento: formData.comprimento ? parseFloat(formData.comprimento) : null,
      capacidade: formData.capacidadeEstocagem ? parseFloat(formData.capacidadeEstocagem) : null,
      hp: formData.forcaMotor ? parseInt(formData.forcaMotor) : null,
      possui: formData.armazenamento || null
    }

    // Preparar dados do desembarque
    const desembarque = {
      cod_desembarque: codDesembarque,
      municipio: municipio,
      municipio_code: formData.municipioCode || null,
      localidade: localidade,
      localidade_code: formData.localidadeCode || null,
      data_coleta: dataColeta,
      consecutivo: consecutivo,
      data_saida: formData.dataSaida || null,
      hora_saida: formData.horaSaida || null,
      data_chegada: formData.dataChegada || null,
      hora_desembarque: formData.horaChegada || null,
      numero_tripulantes: formData.numTripulantes ? parseInt(formData.numTripulantes) : null,
      pesqueiros: formData.numPesqueiros ? String(formData.numPesqueiros) : null,
      arte_obs: (() => {
        const base = (formData.arte_obs || '').trim();
        const outros = Array.isArray(formData.arteSelecionadas)
          ? formData.arteSelecionadas
              .filter(a => a && a.arte === 'outras' && (a.arte_outro || '').trim())
              .map(a => String(a.arte_outro).trim())
          : [];

        const uniqueOutros = [...new Set(outros)];
        const extra = uniqueOutros.length ? `Outras artes: ${uniqueOutros.join('; ')}` : '';
        if (!base && !extra) return null;
        if (base && extra && base.toLowerCase().includes(extra.toLowerCase())) return base;
        return [base, extra].filter(Boolean).join(' | ');
      })(),
      quadrante1: formData.quadrante1 || null,
      quadrante2: formData.quadrante2 || null,
      quadrante3: formData.quadrante3 || null,
      lat_ida: parseCoord(formData.latIda, 'lat'),
      long_ida: parseCoord(formData.longIda, 'long'),
      lat_volta: parseCoord(formData.latVolta, 'lat'),
      long_volta: parseCoord(formData.longVolta, 'long'),
      origem: null,
      desp_diesel: formData.tipoCombustivel === 'Diesel',
      desp_gasolina: formData.tipoCombustivel === 'Gasolina',
      litros: formData.litrosCombustivel ? parseFloat(formData.litrosCombustivel) : null,
      gelo_kg: formData.quantidadeGelo ? parseFloat(formData.quantidadeGelo) : null,
      rancho_valor: formData.valorRancho ? parseFloat(formData.valorRancho) : null,
      proprietario: formData.nomeProprietario || null,
      apelido_proprietario: formData.apelidoProprietario || null,
      atuou_pesca: formData.atuouNaPesca === true ? 'S' : (formData.atuouNaPesca === false ? 'N' : null),
      destino_pescado: Array.isArray(formData.destinoPescado)
        ? (formData.destinoPescado.length ? formData.destinoPescado.map(v => String(v).toLowerCase()).join(',') : null)
        : (formData.destinoPescado ? String(formData.destinoPescado).toLowerCase() : null),
      destino_apelido: (formData.apelidosDestino && typeof formData.apelidosDestino === 'object')
        ? (Object.entries(formData.apelidosDestino)
            .filter(([dest, apelido]) => Array.isArray(formData.destinoPescado) && formData.destinoPescado.includes(dest) && apelido)
            .map(([dest, apelido]) => `${String(dest).toLowerCase()}:${String(apelido).trim()}`)
            .join(',') || null)
        : (formData.apelidoDestino || null),
      destino_outros_qual: formData.outroDestino || null
    }

    // Validação preventiva para evitar erro de banco (Out of range)
    const hasInvalidLat = (formData.latIda && desembarque.lat_ida === null) || (formData.latVolta && desembarque.lat_volta === null)
    const hasInvalidLong = (formData.longIda && desembarque.long_ida === null) || (formData.longVolta && desembarque.long_volta === null)
    if (hasInvalidLat || hasInvalidLong) {
      throw new Error('Coordenadas inválidas. Use graus decimais (ex: -7.123456) ou formato ddmmss (ex: 053020).')
    }

    // Preparar artes de pesca
    const artes = formData.arteSelecionadas 
      ? formData.arteSelecionadas
          .filter(arte => arte.arte && arte.tamanho)
          .map(arte => ({
            arte: arte.arte,
            nome: (arte.arte === 'outras' && (arte.arte_outro || '').trim()) ? String(arte.arte_outro).trim() : null,
            tamanho: parseFloat(arte.tamanho),
            unidade: arte.unidade || null
          }))
      : []

    // Preparar capturas (da etapa 1 - dados gerais por espécie)
    // Se não houver peso total informado, tenta calcular a partir dos indivíduos (g -> kg).
    // Caso não exista nenhum peso disponível, envia `peso_kg: null`.
    const pesoKgPorEspecieId = new Map()
    if (formData.especiesIndividuos) {
      formData.especiesIndividuos.forEach((especie) => {
        const totalG = (especie.individuos || [])
          .filter(i => i.peso)
          .reduce((sum, i) => sum + parseFloat(i.peso), 0)
        if (totalG > 0) {
          pesoKgPorEspecieId.set(String(especie.id), totalG / 1000)
        }
      })
    }

    const capturas = formData.especiesCaptura
      ? formData.especiesCaptura
          .filter(e => e.id)
          .map(especie => {
            const pesoKg = especie.peso
              ? parseFloat(especie.peso)
              : (pesoKgPorEspecieId.get(String(especie.id)) || null)

            const pesoVal = (pesoKg && !Number.isNaN(pesoKg) && pesoKg > 0) ? pesoKg : null
            const precoKg = especie.preco ? parseFloat(especie.preco) : null
            const precoVal = (precoKg && !Number.isNaN(precoKg) && precoKg >= 0) ? precoKg : null

            return {
              ID_especie: parseInt(especie.id),
              peso_kg: pesoVal,
              preco_kg: precoVal,
              preco_total: (pesoVal != null && precoVal != null) ? (pesoVal * precoVal) : null,
              com_tripa: especie.comTripa
            }
          })
      : []

    // Preparar indivíduos (da etapa 2 - dados individuais)
    const individuos = []
    if (formData.especiesIndividuos) {
      formData.especiesIndividuos.forEach((especie, especieIndex) => {
        if (especie.individuos && especie.individuos.length > 0) {
          especie.individuos.forEach((individuo) => {
            if (individuo.peso || individuo.comprimento) {
              individuos.push({
                ID_especie: parseInt(especie.id),
                peso_g: individuo.peso ? parseInt(individuo.peso) : null,
                comprimento_cm: individuo.comprimento ? parseFloat(individuo.comprimento) : null
              })
            }
          })
        }
      })
    }

    return {
      pescador,
      embarcacao,
      desembarque,
      artes,
      capturas,
      individuos
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setErro(null)
    setSucesso(false)

    // Preparar dados para envio
    const dadosEnvio = prepararDadosEnvio()

    console.log('📤 Dados preparados para envio:', JSON.stringify(dadosEnvio, null, 2))

    try {
      setEnviando(true)

      let resultado = null
      // Se estivermos editando (ID presente), chamar PUT de atualização
      if (formData.ID_desembarque) {
        resultado = await api.atualizarDesembarque(formData.ID_desembarque, dadosEnvio)
        console.log('✅ Desembarque atualizado com sucesso:', resultado)
        setSucesso(true)
        // Aguardar 1s e voltar para lista de desembarques
        setTimeout(() => {
          router.push('/meus-desembarques')
        }, 1000)
      } else {
        resultado = await api.criarDesembarque(dadosEnvio)
        console.log('✅ Desembarque criado com sucesso:', resultado)
        setSucesso(true)
        // Aguardar 2 segundos e redirecionar
        setTimeout(() => {
          resetForm()
          router.push('/sucesso')
        }, 2000)
      }

    } catch (error) {
      console.error('❌ Erro ao enviar:', error)

      let mensagemErro = 'Erro ao enviar dados. Tente novamente.'
      
      if (error?.response?.data?.message) {
        mensagemErro = error.response.data.message
      } else if (error?.response?.data?.error) {
        mensagemErro = error.response.data.error
      } else if (error?.response?.data?.errors) {
        mensagemErro = Array.isArray(error.response.data.errors) 
          ? error.response.data.errors.join(', ')
          : error.response.data.errors
      } else if (error?.message) {
        mensagemErro = error.message
      }

      if (error?.response?.status === 404) {
        mensagemErro = 'Servidor não encontrado. Verifique sua conexão.'
      } else if (error?.response?.status === 500) {
        mensagemErro = 'Erro interno do servidor. Tente novamente mais tarde.'
      }
      
      setErro(mensagemErro)
    } finally {
      setEnviando(false)
    }
  }

  const calcularTotal = () => {
    if (!formData.especiesCaptura) return '0.00'
    
    return formData.especiesCaptura
      .filter(e => e.peso && e.preco)
      .reduce((total, e) => total + (parseFloat(e.peso) * parseFloat(e.preco)), 0)
      .toFixed(2)
  }

  const calcularTotalIndividuos = () => {
    if (!formData.especiesIndividuos) return 0
    
    return formData.especiesIndividuos.reduce((total, especie) => {
      if (especie.individuos) {
        return total + especie.individuos.length
      }
      return total
    }, 0)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-4 max-w-4xl mx-auto">
      {/* Seção Anexos */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Anexos
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fazer upload de fotos e arquivos
            </label>
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
            />
          </div>

          {/* Preview de imagens */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {anexos.map((file, index) => (
                <div key={index} className="relative">
                  {previewUrls[index] ? (
                    <img
                      src={previewUrls[index]}
                      alt={file.name}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removerAnexo(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">{file.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Seção Resumo */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Resumo do Desembarque
        </h2>

        <div className="space-y-6">
          {/* Local */}
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Local</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Município:</span> {formData.municipio}</div>
              <div><span className="text-gray-500">Localidade:</span> {formData.localidade}</div>
              <div><span className="text-gray-500">Código de Coleta:</span> {formData.codigoColeta}</div>
              <div><span className="text-gray-500">Consecutivo:</span> {formData.consecutivo}</div>
              <div><span className="text-gray-500">Data de Saída:</span> {formData.dataSaida ? new Date(formData.dataSaida).toLocaleString('pt-BR') : 'Não informado'}</div>
              <div><span className="text-gray-500">Data de Chegada:</span> {formData.dataChegada ? new Date(formData.dataChegada).toLocaleString('pt-BR') : 'Não informado'}</div>
            </div>
          </div>

          {/* Pescador */}
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Pescador</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Nome:</span> {formData.nomePescador}</div>
              <div><span className="text-gray-500">CPF:</span> {formData.cpfPescador || 'Não informado'}</div>
              <div><span className="text-gray-500">Nascimento:</span> {formData.nascimentoPescador || 'Não informado'}</div>
              <div><span className="text-gray-500">Apelido:</span> {formData.apelidoPescador || 'Não informado'}</div>
            </div>
          </div>

          {/* Embarcação */}
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Embarcação</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Nome:</span> {formData.nomeEmbarcacao}</div>
              <div><span className="text-gray-500">Código:</span> {formData.codigoEmbarcacao}</div>
              <div><span className="text-gray-500">Tipo:</span> {formData.tipoEmbarcacao === 'outro' ? (formData.tipoEmbarcacaoOutro || 'Outro') : formData.tipoEmbarcacao}</div>
              <div><span className="text-gray-500">Comprimento:</span> {formData.comprimento ? `${formData.comprimento}m` : 'Não informado'}</div>
              <div><span className="text-gray-500">Tripulantes:</span> {formData.numTripulantes || 'Não informado'}</div>
              <div><span className="text-gray-500">Pesqueiros:</span> {formData.numPesqueiros || 'Não informado'}</div>
              <div><span className="text-gray-500">Força do Motor:</span> {formData.forcaMotor ? `${formData.forcaMotor} HP` : 'Não informado'}</div>
              <div><span className="text-gray-500">Capacidade:</span> {formData.capacidadeEstocagem ? `${formData.capacidadeEstocagem} kg` : 'Não informado'}</div>
            </div>
          </div>

          {/* Proprietário */}
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Proprietário</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Nome:</span> {formData.nomeProprietario || 'Não informado'}</div>
              <div><span className="text-gray-500">CPF:</span> {formData.cpfProprietario || 'Não informado'}</div>
              <div><span className="text-gray-500">Naturalidade:</span> {formData.naturalidadeProprietario || 'Não informado'}</div>
              <div>
                <span className="text-gray-500">Atuou na pesca:</span>{' '}
                {formData.atuouNaPesca === true ? 'Sim' : (formData.atuouNaPesca === false ? 'Não' : 'Não informado')}
              </div>
            </div>
          </div>

          {/* Artes de Pesca */}
          {formData.arteSelecionadas && formData.arteSelecionadas.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Artes de Pesca</h3>
              <div className="space-y-1 text-sm">
                {formData.arteSelecionadas.filter(a => a.arte).map((arte, index) => (
                  <div key={index}>
                    • {(arte.arte === 'outras' && (arte.arte_outro || '').trim()) ? `Outro: ${String(arte.arte_outro).trim()}` : arte.arte} - {arte.tamanho}m
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quadrantes e Coordenadas */}
          {(formData.quadrante1 || formData.quadrante2 || formData.quadrante3 || formData.latIda) && (
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Localização da Pesca</h3>
              <div className="space-y-1 text-sm">
                {formData.quadrante1 && <div>• Quadrante 1: {formData.quadrante1}</div>}
                {formData.quadrante2 && <div>• Quadrante 2: {formData.quadrante2}</div>}
                {formData.quadrante3 && <div>• Quadrante 3: {formData.quadrante3}</div>}
                
                {(formData.latIda || formData.longIda) && (
                  <div className="mt-2 text-xs text-gray-500">
                    <span className="font-medium">Ida:</span> {formData.latIda}, {formData.longIda}
                  </div>
                )}
                {(formData.latVolta || formData.longVolta) && (
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Volta:</span> {formData.latVolta}, {formData.longVolta}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Espécies Capturadas */}
          {formData.especiesCaptura && formData.especiesCaptura.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Espécies Capturadas</h3>
              <div className="space-y-2 text-sm">
                {formData.especiesCaptura.filter(e => e.id).map((especie, index) => (
                  <div key={index} className="border-b dark:border-gray-700 pb-2">
                    <div className="flex justify-between">
                      <span>• {obterNomeEspecie(especie.id)}</span>
                      <span>{especie.peso}kg × R${especie.preco}/kg = R${(parseFloat(especie.peso) * parseFloat(especie.preco)).toFixed(2)}</span>
                    </div>
                    <div className="text-gray-500 ml-4 text-xs">
                      Condição: {especie.comTripa ? 'Com tripa' : 'Sem tripa'}
                    </div>
                    {/* Mostrar indivíduos se existirem */}
                    {formData.especiesIndividuos && formData.especiesIndividuos.find(ei => ei.id === especie.id)?.individuos?.length > 0 && (
                      <div className="text-gray-500 ml-4 text-xs">
                        {formData.especiesIndividuos.find(ei => ei.id === especie.id)?.individuos?.length} indivíduos medidos
                      </div>
                    )}
                  </div>
                ))}
                <div className="pt-2 font-semibold flex justify-between">
                  <span>Total:</span>
                  <span>R$ {calcularTotal()}</span>
                </div>
              </div>
              
              {/* Resumo dos indivíduos */}
              {calcularTotalIndividuos() > 0 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Dados Individuais</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Total de {calcularTotalIndividuos()} indivíduos com dados biométricos registrados
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Despesas */}
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Despesas</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Combustível:</span> {formData.litrosCombustivel ? `${formData.litrosCombustivel}L` : 'Não informado'} {formData.tipoCombustivel ? `(${formData.tipoCombustivel})` : ''}</div>
              <div><span className="text-gray-500">Gelo:</span> {formData.quantidadeGelo ? `${formData.quantidadeGelo}kg` : 'Não informado'}</div>
              <div><span className="text-gray-500">Rancho:</span> R${formData.valorRancho || '0,00'}</div>
            </div>
          </div>

          {/* Destino */}
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Destino do Pescado</h3>
            <div className="text-sm">
              <div>
                <span className="text-gray-500">Destino:</span>{' '}
                {Array.isArray(formData.destinoPescado)
                  ? (formData.destinoPescado.length ? formData.destinoPescado.join(', ') : '')
                  : formData.destinoPescado}
              </div>
              {formData.apelidosDestino && typeof formData.apelidosDestino === 'object'
                ? (Object.entries(formData.apelidosDestino)
                    .filter(([dest, apelido]) => Array.isArray(formData.destinoPescado) && formData.destinoPescado.includes(dest) && apelido)
                    .map(([dest, apelido]) => (
                      <div key={dest}><span className="text-gray-500">Apelido {String(dest).toLowerCase()}:</span> {apelido}</div>
                    )))
                : (formData.apelidoDestino && (
                    <div><span className="text-gray-500">Apelido:</span> {formData.apelidoDestino}</div>
                  ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mensagens de Sucesso/Erro */}
      {sucesso && (
        <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md">
          <p className="text-green-700 dark:text-green-300">✅ Desembarque enviado com sucesso! Redirecionando...</p>
        </div>
      )}

      {erro && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-700 dark:text-red-300">❌ {erro}</p>
        </div>
      )}

      {/* Botões de navegação */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={prevStep}
          disabled={enviando}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          &lt; Voltar
        </button>
        <button
          type="submit"
          disabled={enviando}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {enviando ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Enviando...
            </>
          ) : (
            'Enviar cadastro'
          )}
        </button>
      </div>
    </form>
  )
}