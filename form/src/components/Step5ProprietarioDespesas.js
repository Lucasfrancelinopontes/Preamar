'use client'

import { useState } from 'react'
import { useFormContext } from '@/app/contexts/FormContext'
import { validarCPF, formatarCPF } from '@/utils/validations'

export default function Step5ProprietarioDespesas({ nextStep, prevStep }) {
  const { formData, updateFormData } = useFormContext()

  // Estado local para CPF formatado
  const [cpfFormatado, setCpfFormatado] = useState(formData.cpfProprietario || '')

  const tiposCombustivel = [
    { value: 'Gasolina', label: 'Gasolina' },
    { value: 'Diesel', label: 'Diesel' },
    { value: 'Outro', label: 'Outro' }
  ]

  const handleCPFChange = (e) => {
    const rawCPF = e.target.value.replace(/\D/g, '')
    const formatted = formatarCPF(rawCPF)
    setCpfFormatado(formatted)
    updateFormData({ cpfProprietario: rawCPF })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    updateFormData({ [name]: value })
  }

  const handleRadioChange = (e) => {
    const { name, value } = e.target
    updateFormData({ [name]: value === 'true' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validar CPF
    // if (!validarCPF(formData.cpfProprietario)) {
    //   alert('Por favor, insira um CPF válido.')
    //   return
    // }

    // Validar campos obrigatórios
    const requiredFields = [
      'nomeProprietario',
      'atuouNaPesca',
      'litrosCombustivel',
      'tipoCombustivel'
    ]

    const missingFields = requiredFields.filter(field => {
      if (field === 'atuouNaPesca') {
        return typeof formData[field] !== 'boolean'
      }
      return !formData[field]
    })

    if (missingFields.length > 0) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    nextStep()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-4 max-w-2xl mx-auto">
      {/* Seção Proprietário */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Proprietário da embarcação
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome do proprietário 
            </label>
            <input
              type="text"
              name="nomeProprietario"
              value={formData.nomeProprietario || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Apelido
            </label>
            <input
              type="text"
              name="apelidoProprietario"
              value={formData.apelidoProprietario || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CPF 
            </label>
            <input
              type="text"
              name="cpfFormatado"
              value={cpfFormatado}
              onChange={handleCPFChange}
              maxLength="14"
              placeholder="000.000.000-00"
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Naturalidade
            </label>
            <input
              type="text"
              name="naturalidadeProprietario"
              value={formData.naturalidadeProprietario || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Atuou na pesca?
            </label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="atuouNaPesca"
                  value="true"
                  checked={formData.atuouNaPesca === true}
                  onChange={handleRadioChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Sim</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="atuouNaPesca"
                  value="false"
                  checked={formData.atuouNaPesca === false}
                  onChange={handleRadioChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  required
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Não</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Seção Despesas */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Despesas locais
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Gelo (kg)
            </label>
            <input
              type="number"
              name="quantidadeGelo"
              value={formData.quantidadeGelo || ''}
              onChange={handleChange}
              min="0"
              step="0.1"
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rancho (R$)
            </label>
            <input
              type="number"
              name="valorRancho"
              value={formData.valorRancho || ''}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Litros de combustível *
            </label>
            <input
              type="number"
              name="litrosCombustivel"
              value={formData.litrosCombustivel || ''}
              onChange={handleChange}
              min="0"
              step="0.1"
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de combustível *
            </label>
            <select
              name="tipoCombustivel"
              value={formData.tipoCombustivel || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="">Selecione o tipo</option>
              {tiposCombustivel.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>
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