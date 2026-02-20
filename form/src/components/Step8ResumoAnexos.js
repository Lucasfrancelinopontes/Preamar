'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFormContext } from '@/app/contexts/FormContext'
import api from '@/services/api'
import { gerarCodigoDesembarque } from '@/utils/validations'

export default function Step8ResumoAnexos({ prevStep }) {
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

    // Generate preview URLs for images
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
    
    // Revoke URL to free memory
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index])
    }
    
    setAnexos(newAnexos)
    setPreviewUrls(newPreviews)
  }

  const prepararDadosEnvio = () => {
    // Usar a data de coleta para gerar o código (não a data de saída)
    const dataColetaOriginal = formData.dataColeta || new Date().toISOString().split('T')[0];
    const consecutivo = formData.consecutivo || 1;
    const municipio = formData.municipio || 'LOCAL';
    const localidade = formData.localidade || 'PRAIA';
    
    const codDesembarque = gerarCodigoDesembarque(
      municipio,
      localidade,
      dataColetaOriginal,
      consecutivo
    )

    // Preparar dados do pescador
    const pescador = {
      nome: formData.nomePescador || '',
      apelido: formData.apelidoPescador || null,
      cpf: formData.cpfPescador?.replace(/\D/g, '') || '',
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
    const destinoPescadoLower = Array.isArray(formData.destinoPescado)
      ? (formData.destinoPescado.length ? formData.destinoPescado.map(v => String(v).toLowerCase()).join(',') : null)
      : (formData.destinoPescado ? String(formData.destinoPescado).toLowerCase() : null)

    const destinoApelidoPayload = (formData.apelidosDestino && typeof formData.apelidosDestino === 'object')
      ? Object.entries(formData.apelidosDestino)
          .filter(([dest, apelido]) => (Array.isArray(formData.destinoPescado) ? formData.destinoPescado.includes(dest) : false) && apelido)
          .map(([dest, apelido]) => `${String(dest).toLowerCase()}:${String(apelido).trim()}`)
          .join(',') || null
      : (formData.apelidoDestino || null)

    const desembarque = {
      cod_desembarque: codDesembarque,
      municipio: municipio,
      municipio_code: formData.municipioCode || null,
      localidade: localidade,
      localidade_code: formData.localidadeCode || null,
      data_coleta: dataColetaOriginal,
      consecutivo: consecutivo,
      data_saida: formData.dataSaida || null,
      hora_saida: formData.horaSaida || null,
      data_chegada: formData.dataChegada || null,
      hora_desembarque: formData.horaChegada || null,
      numero_tripulantes: formData.numTripulantes ? parseInt(formData.numTripulantes) : null,
      pesqueiros: formData.numPesqueiros ? String(formData.numPesqueiros) : null,
      arte_obs: null,
      quadrante1: formData.quadrante1 || null,
      quadrante2: formData.quadrante2 || null,
      quadrante3: formData.quadrante3 || null,
      origem: null,
      desp_diesel: formData.combustivelTipo === 'Diesel',
      desp_gasolina: formData.combustivelTipo === 'Gasolina',
      litros: formData.combustivelLitros ? parseFloat(formData.combustivelLitros) : null,
      gelo_kg: formData.quantidadeGelo ? parseFloat(formData.quantidadeGelo) : null,
      rancho_valor: formData.valorRancho ? parseFloat(formData.valorRancho) : null,
      destino_pescado: destinoPescadoLower,
      destino_apelido: destinoApelidoPayload,
      destino_outros_qual: formData.outroDestino || null
    }

    // Preparar artes de pesca
    const artes = formData.arteSelecionadas 
      ? formData.arteSelecionadas
          .filter(arte => arte && arte.arte)
          .map(arte => {
            const tamanhoNum = (arte.tamanho !== undefined && arte.tamanho !== null && String(arte.tamanho).trim() !== '')
              ? parseFloat(arte.tamanho)
              : null;

            return {
              arte: arte.arte,
              nome: (arte.arte === 'outras' && (arte.arte_outro || '').trim()) ? String(arte.arte_outro).trim() : null,
              tamanho: (tamanhoNum != null && Number.isFinite(tamanhoNum)) ? tamanhoNum : null,
              unidade: arte.unidade || null
            };
          })
      : []

    // Preparar capturas
    const capturas = formData.especiesCapturadas
      ? formData.especiesCapturadas
          .filter(e => e.id && e.peso)
          .map(especie => ({
            ID_especie: parseInt(especie.id),
            peso_kg: parseFloat(especie.peso),
            preco_kg: especie.preco ? parseFloat(especie.preco) : null,
            comprimento_cm: especie.comprimento ? parseFloat(especie.comprimento) : null
          }))
      : []

    return {
      pescador,
      embarcacao,
      desembarque,
      artes,
      capturas
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
      const resultado = await api.criarDesembarque(dadosEnvio)
      
      console.log('✅ Desembarque criado com sucesso:', resultado)
      setSucesso(true)
      
      // Aguardar 2 segundos e redirecionar
      setTimeout(() => {
        resetForm()
        router.push('/sucesso')
      }, 2000)

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
    if (!formData.especiesCapturadas) return '0.00'
    
    return formData.especiesCapturadas
      .filter(e => e.peso && e.preco)
      .reduce((total, e) => total + (parseFloat(e.peso) * parseFloat(e.preco)), 0)
      .toFixed(2)
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
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Local e Datas</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Município:</span> {formData.municipio}</div>
              <div><span className="text-gray-500">Localidade:</span> {formData.localidade}</div>
              <div><span className="text-gray-500">Código de Coleta:</span> {formData.codigoColeta}</div>
              <div><span className="text-gray-500">Consecutivo:</span> {formData.consecutivo}</div>
              <div className="col-span-2 bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                <span className="text-gray-500 font-semibold">📅 Data de Coleta (coletor):</span> {formData.dataColeta ? new Date(formData.dataColeta + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informado'}
              </div>
              <div><span className="text-gray-500">⛵ Data de Saída (embarcação):</span> {formData.dataSaida ? new Date(formData.dataSaida).toLocaleString('pt-BR') : 'Não informado'}</div>
              <div><span className="text-gray-500">🚢 Data de Chegada (embarcação):</span> {formData.dataChegada ? new Date(formData.dataChegada).toLocaleString('pt-BR') : 'Não informado'}</div>
            </div>
          </div>

          {/* Pescador */}
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Pescador</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Nome:</span> {formData.nomePescador}</div>
              <div><span className="text-gray-500">CPF:</span> {formData.cpfPescador}</div>
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

          {/* Quadrantes */}
          {(formData.quadrante1 || formData.quadrante2 || formData.quadrante3) && (
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Quadrantes de Pesca</h3>
              <div className="space-y-1 text-sm">
                {formData.quadrante1 && <div>• Quadrante 1: {formData.quadrante1}</div>}
                {formData.quadrante2 && <div>• Quadrante 2: {formData.quadrante2}</div>}
                {formData.quadrante3 && <div>• Quadrante 3: {formData.quadrante3}</div>}
              </div>
            </div>
          )}

          {/* Espécies Capturadas */}
          {formData.especiesCapturadas && formData.especiesCapturadas.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Espécies Capturadas</h3>
              <div className="space-y-2 text-sm">
                {formData.especiesCapturadas.filter(e => e.id).map((especie, index) => (
                  <div key={index} className="border-b dark:border-gray-700 pb-2">
                    <div className="flex justify-between">
                      <span>• Espécie #{especie.id}</span>
                      <span>{especie.peso}kg × R${especie.preco}/kg = R${(parseFloat(especie.peso) * parseFloat(especie.preco)).toFixed(2)}</span>
                    </div>
                    {especie.comprimento && (
                      <div className="text-gray-500 ml-4">
                        Comprimento: {especie.comprimento} cm
                      </div>
                    )}
                  </div>
                ))}
                <div className="pt-2 font-semibold flex justify-between">
                  <span>Total:</span>
                  <span>R$ {calcularTotal()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Despesas */}
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Despesas</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Combustível:</span> {formData.combustivelLitros ? `${formData.combustivelLitros}L` : 'Não informado'} {formData.combustivelTipo ? `(${formData.combustivelTipo})` : ''}</div>
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