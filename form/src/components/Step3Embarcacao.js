'use client'

import { useFormContext } from '@/app/contexts/FormContext'

export default function Step3Embarcacao({ nextStep, prevStep }) {
  const { formData, updateFormData } = useFormContext()

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate all required fields before proceeding
    const requiredFields = [
      'nomeEmbarcacao',
      'codigoEmbarcacao',
      'numTripulantes',
      'numPesqueiros',
      'coordenadasIdaLat',
      'coordenadasIdaLong',
      'coordenadasVoltaLat',
      'coordenadasVoltaLong',
      'tipoEmbarcacao',
      'comprimento',
      'capacidadeEstocagem',
      'forcaMotor',
      'armazenamento'
    ]

    const missingFields = requiredFields.filter(field => !formData[field])
    if (missingFields.length > 0) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    nextStep()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    updateFormData({ [name]: value })
  }

  const tiposEmbarcacao = [
    { value: 'catraia', label: 'Catraia' },
    { value: 'caico', label: 'Caico' },
    { value: 'jangada', label: 'Jangada' },
    { value: 'boteLancha', label: 'Bote/Lancha' },
    { value: 'canoa', label: 'Canoa' },
    { value: 'barco', label: 'Barco' },
    { value: 'outro', label: 'Outro' }
  ]

  const opcoesArmazenamento = [
    { value: 'urna', label: 'Urna' },
    { value: 'caixaTermica', label: 'Caixa Térmica' },
    { value: 'pescadoInNatura', label: 'Pescado In Natura' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-4 max-w-2xl mx-auto">
      {/* Seção Embarcação */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Embarcação
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome da embarcação *
            </label>
            <input
              type="text"
              name="nomeEmbarcacao"
              value={formData.nomeEmbarcacao || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Código da embarcação *
            </label>
            <input
              type="text"
              name="codigoEmbarcacao"
              value={formData.codigoEmbarcacao || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              N° de tripulantes *
            </label>
            <input
              type="number"
              name="numTripulantes"
              value={formData.numTripulantes || ''}
              onChange={handleChange}
              min="1"
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              N° de pesqueiros *
            </label>
            <input
              type="number"
              name="numPesqueiros"
              value={formData.numPesqueiros || ''}
              onChange={handleChange}
              min="1"
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Coordenadas ida *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  name="coordenadasIdaLat"
                  value={formData.coordenadasIdaLat || ''}
                  onChange={handleChange}
                  placeholder="Latitude"
                  step="any"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <input
                  type="number"
                  name="coordenadasIdaLong"
                  value={formData.coordenadasIdaLong || ''}
                  onChange={handleChange}
                  placeholder="Longitude"
                  step="any"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Coordenadas volta *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  name="coordenadasVoltaLat"
                  value={formData.coordenadasVoltaLat || ''}
                  onChange={handleChange}
                  placeholder="Latitude"
                  step="any"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <input
                  type="number"
                  name="coordenadasVoltaLong"
                  value={formData.coordenadasVoltaLong || ''}
                  onChange={handleChange}
                  placeholder="Longitude"
                  step="any"
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção Tipo de embarcação */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Tipo de embarcação
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de embarcação *
            </label>
            <select
              name="tipoEmbarcacao"
              value={formData.tipoEmbarcacao || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="">Selecione um tipo</option>
              {tiposEmbarcacao.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Comprimento (m) *
            </label>
            <input
              type="number"
              name="comprimento"
              value={formData.comprimento || ''}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Capacidade de estocagem (kg) *
            </label>
            <input
              type="number"
              name="capacidadeEstocagem"
              value={formData.capacidadeEstocagem || ''}
              onChange={handleChange}
              min="0"
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Força do motor (HP) *
            </label>
            <input
              type="number"
              name="forcaMotor"
              value={formData.forcaMotor || ''}
              onChange={handleChange}
              min="0"
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
        </div>
      </div>

      {/* Seção Possui */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Possui *
        </h2>
        <div className="space-y-4">
          {opcoesArmazenamento.map(opcao => (
            <div key={opcao.value} className="flex items-center">
              <input
                type="radio"
                id={opcao.value}
                name="armazenamento"
                value={opcao.value}
                checked={formData.armazenamento === opcao.value}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                required
              />
              <label
                htmlFor={opcao.value}
                className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {opcao.label}
              </label>
            </div>
          ))}
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