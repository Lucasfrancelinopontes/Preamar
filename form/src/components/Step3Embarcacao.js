'use client'

import { useFormContext } from '@/app/contexts/FormContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.js';
import { Input } from '@/components/ui/Input.js';
import { Label } from '@/components/ui/label.js';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.js';
import { Ship } from 'lucide-react';

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
    <div className="space-y-8">
      {/* Seção Embarcação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Ship className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </span>
            Embarcação
          </CardTitle>
          <CardDescription>
            Informações básicas da embarcação utilizada na pesca
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nomeEmbarcacao">Nome da embarcação</Label>
              <Input
                id="nomeEmbarcacao"
                type="text"
                name="nomeEmbarcacao"
                value={formData.nomeEmbarcacao || ''}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigoEmbarcacao">Código da embarcação</Label>
              <Input
                id="codigoEmbarcacao"
                type="text"
                name="codigoEmbarcacao"
                value={formData.codigoEmbarcacao || ''}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numTripulantes">N° de tripulantes</Label>
              <Input
                id="numTripulantes"
                type="number"
                name="numTripulantes"
                value={formData.numTripulantes || ''}
                onChange={handleChange}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numPesqueiros">N° de pesqueiros</Label>
              <Input
                id="numPesqueiros"
                type="number"
                name="numPesqueiros"
                value={formData.numPesqueiros || ''}
                onChange={handleChange}
                min="1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção Tipo de embarcação */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo de embarcação</CardTitle>
          <CardDescription>
            Especificações técnicas da embarcação
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="tipoEmbarcacao">Tipo de embarcação</Label>
              <Select
                value={formData.tipoEmbarcacao || ''}
                onValueChange={(value) => handleChange({ target: { name: 'tipoEmbarcacao', value } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposEmbarcacao.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.tipoEmbarcacao === 'outro' && (
              <div className="space-y-2">
                <Label htmlFor="tipoEmbarcacaoOutro">Qual tipo de embarcação?</Label>
                <Input
                  id="tipoEmbarcacaoOutro"
                  type="text"
                  name="tipoEmbarcacaoOutro"
                  value={formData.tipoEmbarcacaoOutro || ''}
                  onChange={handleChange}
                  placeholder="Digite o tipo"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="comprimento">Comprimento (m)</Label>
              <Input
                id="comprimento"
                type="number"
                name="comprimento"
                value={formData.comprimento || ''}
                onChange={handleChange}
                step="0.01"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacidadeEstocagem">Capacidade de estocagem (kg)</Label>
              <Input
                id="capacidadeEstocagem"
                type="number"
                name="capacidadeEstocagem"
                value={formData.capacidadeEstocagem || ''}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="forcaMotor">Força do motor (HP)</Label>
              <Input
                id="forcaMotor"
                type="number"
                name="forcaMotor"
                value={formData.forcaMotor || ''}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção Possui */}
      <Card>
        <CardHeader>
          <CardTitle>Armazenamento</CardTitle>
          <CardDescription>
            Tipo de armazenamento utilizado para o pescado
          </CardDescription>
        </CardHeader>

        <CardContent>
          <RadioGroup
            value={formData.armazenamento || ''}
            onValueChange={(value) => handleChange({ target: { name: 'armazenamento', value } })}
            className="space-y-3"
          >
            {opcoesArmazenamento.map(opcao => (
              <div key={opcao.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={opcao.value}
                  id={opcao.value}
                />
                <Label htmlFor={opcao.value} className="cursor-pointer">
                  {opcao.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  )
}