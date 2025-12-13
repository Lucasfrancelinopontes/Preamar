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

  const handleQuadranteChange = (e, quadranteNum) => {
    const { value } = e.target
    // Only allow numbers and limit to 3 digits
    if (value === '' || (/^\d{0,3}$/.test(value))) {
      updateFormData({ [`quadrante${quadranteNum}`]: value })
    }
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