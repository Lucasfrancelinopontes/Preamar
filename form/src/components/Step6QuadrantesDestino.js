'use client'

import { useState } from 'react'
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

  const handleDestinoChange = (value) => {
    updateFormData({ destinoPescado: value })
    // Clear apelido if changing from 'Outros' to another option
    if (value !== 'Outros' && formData.apelidoDestino) {
      updateFormData({ apelidoDestino: '' })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.quadrantesPesca) {
      alert('Por favor, informe o(s) quadrante(s) de pesca.')
      return
    }

    // Validate apelido if 'Outros' is selected
    if (formData.destinoPescado === 'Outros' && !formData.apelidoDestino) {
      alert('Por favor, informe o apelido quando o destino for "Outros".')
      return
    }

    nextStep()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-4 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Quadrantes & destino do pescado
        </h2>

        <div className="space-y-6">
          {/* Campo Quadrantes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Número(s) quadrante(s) de pesca(s) *
            </label>
            <input
              type="text"
              name="quadrantesPesca"
              value={formData.quadrantesPesca || ''}
              onChange={handleChange}
              placeholder="Ex: 1, 2, 3"
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Informe os números dos quadrantes separados por vírgula
            </p>
          </div>

          {/* Campo Destino */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Destino
            </label>
            <div className="space-y-3">
              {opcoesDestino.map(opcao => (
                <div key={opcao.value} className="flex items-center">
                  <input
                    type="radio"
                    id={opcao.value}
                    name="destinoPescado"
                    value={opcao.value}
                    checked={formData.destinoPescado === opcao.value}
                    onChange={() => handleDestinoChange(opcao.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
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

          {/* Campo Apelido (condicional) */}
          {formData.destinoPescado === 'Outros' && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Apelido *
              </label>
              <input
                type="text"
                name="apelidoDestino"
                value={formData.apelidoDestino || ''}
                onChange={handleChange}
                placeholder="Informe o apelido"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required={formData.destinoPescado === 'Outros'}
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