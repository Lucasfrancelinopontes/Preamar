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
      'tipoEmbarcacao',
      'comprimento',
      'capacidadeEstocagem',
      'forcaMotor',
      'armazenamento'
    ]

    const missingFields = requiredFields.filter(field => !formData[field])
    // if (missingFields.length > 0) {
    //   alert('Por favor, preencha todos os campos obrigatórios.')
    //   return
    // }

    nextStep()
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'tipoEmbarcacao') {
      updateFormData({
        tipoEmbarcacao: value,
        tipoEmbarcacaoOutro: value === 'outro' ? (formData.tipoEmbarcacaoOutro || '') : ''
      })
      return
    }

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
      <div className="card">
        <h2 className="heading-secondary">
          Embarcação
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label-standard">
              Nome da embarcação 
            </label>
            <input
              type="text"
              name="nomeEmbarcacao"
              value={formData.nomeEmbarcacao || ''}
              onChange={handleChange}
              className="input-standard"
            />
          </div>

          <div>
            <label className="label-standard">
              Código da embarcação
            </label>
            <input
              type="text"
              name="codigoEmbarcacao"
              value={formData.codigoEmbarcacao || ''}
              onChange={handleChange}
              className="input-standard"
            />
          </div>

          <div>
            <label className="label-standard">
              N° de tripulantes
            </label>
            <input
              type="number"
              name="numTripulantes"
              value={formData.numTripulantes || ''}
              onChange={handleChange}
              min="1"
              className="input-standard"
            />
          </div>

          <div>
            <label className="label-standard">
              N° de pesqueiros
            </label>
            <input
              type="number"
              name="numPesqueiros"
              value={formData.numPesqueiros || ''}
              onChange={handleChange}
              min="1"
              className="input-standard"
            />
          </div>
        </div>
      </div>

      {/* Seção Tipo de embarcação */}
      <div className="card">
        <h2 className="heading-secondary">
          Tipo de embarcação
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="label-standard">
              Tipo de embarcação *
            </label>
            <select
              name="tipoEmbarcacao"
              value={formData.tipoEmbarcacao || ''}
              onChange={handleChange}
              className="select-standard"
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

          {formData.tipoEmbarcacao === 'outro' && (
            <div className="md:col-span-2">
              <label className="label-standard">
                Qual tipo de embarcação?
              </label>
              <input
                type="text"
                name="tipoEmbarcacaoOutro"
                value={formData.tipoEmbarcacaoOutro || ''}
                onChange={handleChange}
                className="input-standard"
                placeholder="Digite o tipo"
                required
              />
            </div>
          )}

          <div>
            <label className="label-standard">
              Comprimento (m) *
            </label>
            <input
              type="number"
              name="comprimento"
              value={formData.comprimento || ''}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="input-standard"
              required
            />
          </div>

          <div>
            <label className="label-standard">
              Capacidade de estocagem (kg) *
            </label>
            <input
              type="number"
              name="capacidadeEstocagem"
              value={formData.capacidadeEstocagem || ''}
              onChange={handleChange}
              min="0"
              className="input-standard"
              required
            />
          </div>

          <div>
            <label className="label-standard">
              Força do motor (HP) *
            </label>
            <input
              type="number"
              name="forcaMotor"
              value={formData.forcaMotor || ''}
              onChange={handleChange}
              min="0"
              className="input-standard"
              required
            />
          </div>
        </div>
      </div>

      {/* Seção Possui */}
      <div className="card">
        <h2 className="heading-secondary">
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
                className="h-4 w-4 text-brand focus:ring-brand border-gray-300"
                required
              />
              <label
                htmlFor={opcao.value}
                className="label-standard ml-2 mb-0"
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
          className="btn-secondary"
        >
          &lt; Voltar
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          Próximo &gt;
        </button>
      </div>
    </form>
  )
}