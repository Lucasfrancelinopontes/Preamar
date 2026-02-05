'use client'
import { useFormContext } from '@/app/contexts/FormContext'

export default function Step6QuadrantesDestino({ nextStep, prevStep }) {
  const { formData, updateFormData } = useFormContext()

  const opcoesDestino = [
    { value: 'Atravessador', label: 'Atravessador' },
    { value: 'Armador', label: 'Armador' },
    { value: 'Consumidor', label: 'Consumidor' },
    { value: 'Outros', label: 'Outros' }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    updateFormData({ [name]: value })
  }

  const handleQuadranteChange = (e, quadranteNum) => {
    const { value } = e.target
    // Only allow numbers and limit to 3 digits
    if (value === '' || (/^\d{0,3}$/.test(value))) {
      updateFormData({ [`quadrante${quadranteNum}`]: value })
    }
  }

  const destinosSelecionados = Array.isArray(formData.destinoPescado)
    ? formData.destinoPescado
    : (formData.destinoPescado ? [formData.destinoPescado] : [])

  const opcoesComApelido = ['Atravessador', 'Armador', 'Consumidor']
  const destinosComApelidoSelecionados = destinosSelecionados.filter(v => opcoesComApelido.includes(v))
  const precisaApelido = destinosComApelidoSelecionados.length > 0
  const isOutrosSelecionado = destinosSelecionados.includes('Outros')

  const apelidosDestino = (formData.apelidosDestino && typeof formData.apelidosDestino === 'object')
    ? formData.apelidosDestino
    : {}

  const handleApelidoDestinoChange = (destino, value) => {
    updateFormData({
      apelidosDestino: {
        ...apelidosDestino,
        [destino]: value
      }
    })
  }

  const handleDestinoToggle = (value) => {
    const isSelected = destinosSelecionados.includes(value)

    // Seleção única: escolher outro destino substitui o anterior.
    // Clicar no selecionado desmarca (fica sem destino selecionado).
    const nextValues = isSelected ? [] : [value]
    updateFormData({ destinoPescado: nextValues })

    const nextIsOutros = nextValues.includes('Outros')
    if (!nextIsOutros && formData.outroDestino) {
      updateFormData({ outroDestino: '' })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate at least one quadrante
    const quadrante1 = formData.quadrante1 || ''
    const quadrante2 = formData.quadrante2 || ''
    const quadrante3 = formData.quadrante3 || ''

    // if (!quadrante1 && !quadrante2 && !quadrante3) {
    //   alert('Por favor, informe pelo menos um quadrante de pesca.')
    //   return
    // }

    // Validate that quadrantes have 3 digits if filled
    if (quadrante1 && quadrante1.length !== 3) {
      alert('O Quadrante 1 deve ter exatamente 3 algarismos.')
      return
    }
    if (quadrante2 && quadrante2.length !== 3) {
      alert('O Quadrante 2 deve ter exatamente 3 algarismos.')
      return
    }
    if (quadrante3 && quadrante3.length !== 3) {
      alert('O Quadrante 3 deve ter exatamente 3 algarismos.')
      return
    }

    // Validate apelido/outro when destination requires it
    if (precisaApelido) {
      const faltando = destinosComApelidoSelecionados.find(d => !apelidosDestino?.[d])
      if (faltando) {
        alert(`Por favor, informe o apelido ${faltando.toLowerCase()}.`)
        return
      }
    }
    if (isOutrosSelecionado && !formData.outroDestino) {
      alert('Por favor, informe o outro destino.')
      return
    }

    nextStep()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-4 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Coordenadas, Quadrantes & Destino
        </h2>

        <div className="space-y-6">
          {/* Coordenadas */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Coordenadas (Opcional)
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Ponto de Ida</p>
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  name="latIda"
                  value={formData.latIda || ''}
                  onChange={handleChange}
                  placeholder="-0.000000"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  name="longIda"
                  value={formData.longIda || ''}
                  onChange={handleChange}
                  placeholder="-0.000000"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Ponto de Volta</p>
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  name="latVolta"
                  value={formData.latVolta || ''}
                  onChange={handleChange}
                  placeholder="-0.000000"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  name="longVolta"
                  value={formData.longVolta || ''}
                  onChange={handleChange}
                  placeholder="-0.000000"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Campos Quadrantes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Quadrantes de pesca 
            </label>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              Informe até 3 quadrantes. Cada quadrante deve ter exatamente 3 algarismos.
            </p>
            
            <div className="space-y-3">
              {/* Quadrante 1 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Quadrante 1
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{3}"
                  maxLength="3"
                  name="quadrante1"
                  value={formData.quadrante1 || ''}
                  onChange={(e) => handleQuadranteChange(e, 1)}
                  placeholder="Ex: 123"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-lg"
                />
              </div>

              {/* Quadrante 2 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Quadrante 2 (opcional)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{3}"
                  maxLength="3"
                  name="quadrante2"
                  value={formData.quadrante2 || ''}
                  onChange={(e) => handleQuadranteChange(e, 2)}
                  placeholder="Ex: 456"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-lg"
                />
              </div>

              {/* Quadrante 3 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Quadrante 3 (opcional)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{3}"
                  maxLength="3"
                  name="quadrante3"
                  value={formData.quadrante3 || ''}
                  onChange={(e) => handleQuadranteChange(e, 3)}
                  placeholder="Ex: 789"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-lg"
                />
              </div>
            </div>
          </div>

          {/* Campo Destino */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Destino
            </label>
            <div className="grid grid-cols-2 gap-3">
              {opcoesDestino.map((opcao) => {
                const isSelected = destinosSelecionados.includes(opcao.value)
                return (
                  <button
                    key={opcao.value}
                    type="button"
                    onClick={() => handleDestinoToggle(opcao.value)}
                    className={
                      `px-4 py-2 rounded-md border text-sm font-medium transition-colors ` +
                      (isSelected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600')
                    }
                    aria-pressed={isSelected}
                  >
                    {opcao.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Campo Apelido (condicional) */}
          {destinosComApelidoSelecionados.map((destino) => (
            <div key={destino} className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Apelido {destino.toLowerCase()} *
              </label>
              <input
                type="text"
                value={apelidosDestino?.[destino] || ''}
                onChange={(e) => handleApelidoDestinoChange(destino, e.target.value)}
                placeholder={`Informe o apelido ${destino.toLowerCase()}`}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          ))}

          {/* Campo Outro (condicional) */}
          {isOutrosSelecionado && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Outro *
              </label>
              <input
                type="text"
                name="outroDestino"
                value={formData.outroDestino || ''}
                onChange={handleChange}
                placeholder="Informe o outro destino"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required={isOutrosSelecionado}
              />
            </div>
          )}
        </div>
      </div>

      {/* Botões de navegação */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={prevStep}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          &lt; Voltar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Próximo &gt;
        </button>
      </div>
    </form>
  )
}