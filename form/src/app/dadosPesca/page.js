"use client";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useFormContext } from '../contexts/FormContext';

export default function DadosPesca() {
    const router = useRouter();
    const { formData, updateFormData } = useFormContext();
    
    const saveFormData = (formElement) => {
        const formValues = {};
        
        // Inputs de texto, número, data, hora
        const simpleInputs = formElement.querySelectorAll('input[type="text"], input[type="number"], input[type="date"], input[type="time"]');
        simpleInputs.forEach(input => {
            if (input.name) {
                formValues[input.name] = input.value;
            }
        });

        // Checkboxes
        const checkboxes = formElement.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox.name) {
                formValues[checkbox.name] = checkbox.checked;
            }
        });

        // Radio buttons
        const radioGroups = new Set(Array.from(formElement.querySelectorAll('input[type="radio"]')).map(radio => radio.name));
        radioGroups.forEach(groupName => {
            const selectedRadio = formElement.querySelector(`input[name="${groupName}"]:checked`);
            formValues[groupName] = selectedRadio ? selectedRadio.value : '';
        });

        // Selects
        const selects = formElement.querySelectorAll('select');
        selects.forEach(select => {
            if (select.name) {
                formValues[select.name] = select.value;
            }
        });

        // Textareas
        const textareas = formElement.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            if (textarea.name) {
                formValues[textarea.name] = textarea.value;
            }
        });

        // Atualizar o contexto com os novos dados
        updateFormData(formValues);
    };

    const handleBack = (e) => {
        e.preventDefault();
        // Salva os dados antes de voltar
        const formElement = e.target.closest('form');
        if (formElement) {
            saveFormData(formElement);
        }
        router.back();
    };

    // Efeito para preencher o formulário com dados do contexto
    useEffect(() => {
        if (formData) {
            // Preencher inputs simples
            Object.keys(formData).forEach(key => {
                const element = document.querySelector(`[name="${key}"]`);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = formData[key];
                    } else if (element.type === 'radio') {
                        const radio = document.querySelector(`[name="${key}"][value="${formData[key]}"]`);
                        if (radio) {
                            radio.checked = true;
                        }
                    } else {
                        element.value = formData[key];
                    }
                }
            });
        }
    }, [formData]);

    const handleNext = (e) => {
        e.preventDefault();
        
        // Salvar os dados do formulário
        const formElement = e.target.closest('form');
        if (formElement) {
            saveFormData(formElement);

        // Navegar para a próxima página
        router.push('/dadosPeixes');
    }
    // Fim da função handleNext
}

return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center flex-wrap" style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>
        <div className="mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 text-justify lg:text-left">Formulário de Dados de Pesca</h1>
        </div>

        <form className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 w-[90vw] max-w-[110vw] mx-auto flex flex-col gap-6">
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="nomePescador" className="mb-2 text-sm font-medium text-gray-700">Nome pescador</label>
                        <input id="nomePescador" name="nomePescador" type="text" placeholder="Nome do pescador" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-base" />
                    </div>

                    <div>
                        <label htmlFor="numeroTripulantes" className="mb-2 text-sm font-medium text-gray-700">Número de tripulantes</label>
                        <input id="numeroTripulantes" name="numeroTripulantes" type="number" min="0" placeholder="Número de tripulantes" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-base" />
                    </div>

                    <div>
                        <label htmlFor="pesqueiros" className="mb-2 text-sm font-medium text-gray-700">Pesqueiros</label>
                        <input id="pesqueiros" name="pesqueiros" type="text" placeholder="Pesqueiros" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-base" />
                    </div>
                </div>

                {/* Bloco de Arte (checkboxes para escolha múltipla) */}
                <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <fieldset className="space-y-3">
                        <legend className="mb-2 text-sm font-medium text-gray-700">Arte (escolha múltipla)</legend>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            <label className="flex items-center gap-2 text-gray-700">
                                <input type="checkbox" name="arte[]" value="rede_boirea" className="h-4 w-4 border-gray-300 rounded" />
                                <span className="text-sm">Rede - boiera</span>
                            </label>

                            <label className="flex items-center gap-2 text-gray-700">
                                <input type="checkbox" name="arte[]" value="espinhel_mergulho" className="h-4 w-4 border-gray-300 rounded" />
                                <span className="text-sm">Espinhel - Mergulho</span>
                            </label>

                            <label className="flex items-center gap-2 text-gray-700">
                                <input type="checkbox" name="arte[]" value="rede_fundeio" className="h-4 w-4 border-gray-300 rounded" />
                                <span className="text-sm">Rede - Fundeio</span>
                            </label>

                            <label className="flex items-center gap-2 text-gray-700">
                                <input type="checkbox" name="arte[]" value="linha_mao" className="h-4 w-4 border-gray-300 rounded" />
                                <span className="text-sm">Linha de mão</span>
                            </label>

                            <label className="flex items-center gap-2 text-gray-700">
                                <input type="checkbox" name="arte[]" value="rede_cacoaria" className="h-4 w-4 border-gray-300 rounded" />
                                <span className="text-sm">Rede - caçoeira</span>
                            </label>

                            <label className="flex items-center gap-2 text-gray-700">
                                <input type="checkbox" name="arte[]" value="covo" className="h-4 w-4 border-gray-300 rounded" />
                                <span className="text-sm">Covo</span>
                            </label>

                            <label className="flex items-center gap-2 text-gray-700">
                                <input type="checkbox" name="arte[]" value="outras" className="h-4 w-4 border-gray-300 rounded" />
                                <span className="text-sm">Outras</span>
                            </label>
                        </div>

                        <div className="mt-3">
                            <label className="text-sm text-gray-700">Observações</label>
                            <textarea name="arte_obs" rows={3} placeholder="* 1 braça = ________ metros. Obs:" className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg" />
                        </div>
                    </fieldset>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label htmlFor="tipoPetrecho" className="mb-2 text-sm font-medium text-gray-700">Tipo (embarcação)</label>
                        <select id="tipoPetrecho" name="tipoPetrecho" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-base">
                            <option value="">Selecione</option>
                            <option value="catraia">Catraia</option>
                            <option value="caico">Caico</option>
                            <option value="jangada">Jangada</option>
                            <option value="boteLancha">Bote/lancha</option>
                            <option value="canoa">Canoa</option>
                            <option value="barco">Barco</option>
                            <option value="outro">Outro</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="comprimento" className="mb-2 text-sm font-medium text-gray-700">Comprimento (m)</label>
                        <input id="comprimento" name="comprimento" type="number" step="0.1" placeholder="Comprimento (m)" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-base" />
                    </div>

                    <div>
                        <label htmlFor="capacidadeEstocagem" className="mb-2 text-sm font-medium text-gray-700">Capacidade estocagem (kg)</label>
                        <input id="capacidadeEstocagem" name="capacidadeEstocagem" type="number" placeholder="kg" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-base" />
                    </div>

                    <div>
                        <label htmlFor="forcaMotorHP" className="mb-2 text-sm font-medium text-gray-700">Força do motor (HP)</label>
                        <input id="forcaMotorHP" name="forcaMotorHP" type="number" step="1" min="0" placeholder="HP" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-base" />
                    </div>

                    <div>
                        <label htmlFor="possui" className="mb-2 text-sm font-medium text-gray-700">Possui</label>
                        <select id="possui" name="possui" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-base">
                            <option value="">Selecione</option>
                            <option value="urna">Urna</option>
                            <option value="caixaTermica">Caixa térmica</option>
                            <option value="pescadoInNatura">Pescado in natura</option>
                        </select>
                    </div>
                </div>

                {/* Bloco Proprietário e Despesas */}
                <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                            <label htmlFor="proprietario" className="mb-2 text-sm font-medium text-gray-700">Proprietário</label>
                            <input id="proprietario" name="proprietario" type="text" placeholder="Proprietário" className="px-4 py-2 border border-gray-200 rounded-lg text-base" />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="apelidoProprietario" className="mb-2 text-sm font-medium text-gray-700">Apelido</label>
                            <input id="apelidoProprietario" name="apelidoProprietario" type="text" placeholder="Apelido" className="px-4 py-2 border border-gray-200 rounded-lg text-base" />
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-2 text-sm font-medium text-gray-700">Atuou na pesca</label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-gray-700"><input type="radio" name="atuouPesca" value="S" className="h-4 w-4" /> <span className="text-sm">S</span></label>
                                <label className="flex items-center gap-2 text-gray-700"><input type="radio" name="atuouPesca" value="N" className="h-4 w-4" /> <span className="text-sm">N</span></label>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="flex flex-col">
                            <label htmlFor="origem" className="mb-2 text-sm font-medium text-gray-700">Origem</label>
                            <input id="origem" name="origem" type="text" placeholder="Origem" className="px-4 py-2 border border-gray-200 rounded-lg text-base" />
                        </div>

                        <div>
                            <label className="mb-2 text-sm font-medium text-gray-700">Despesas</label>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 text-gray-700"><input type="checkbox" name="desp_diesel" className="h-4 w-4" /> <span className="text-sm">Diesel</span></label>
                                <label className="flex items-center gap-2 text-gray-700"><input type="checkbox" name="desp_gasolina" className="h-4 w-4" /> <span className="text-sm">Gasolina</span></label>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="litros" className="mb-2 text-sm font-medium text-gray-700">(litros)</label>
                            <input id="litros" name="litros" type="number" placeholder="litros" className="px-4 py-2 border border-gray-200 rounded-lg text-base" />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="geloKg" className="mb-2 text-sm font-medium text-gray-700">Gelo (kg)</label>
                            <input id="geloKg" name="geloKg" type="number" placeholder="kg" className="px-4 py-2 border border-gray-200 rounded-lg text-base" />
                        </div>
                    </div>

                    <div className="mt-3 flex gap-4 items-center">
                        <div className="flex flex-col">
                            <label htmlFor="ranchoValor" className="mb-2 text-sm font-medium text-gray-700">Rancho R$</label>
                            <input id="ranchoValor" name="ranchoValor" type="number" step="0.01" placeholder="R$" className="px-4 py-2 border border-gray-200 rounded-lg text-base" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex flex-col flex-1 min-w-[120px]">
                        <label htmlFor="dataSaida" className="mb-2 text-sm font-medium text-gray-700">Data de saída</label>
                        <input id="dataSaida" name="dataSaida" type="date" className="px-4 py-2 border border-gray-200 rounded-lg text-base" />
                    </div>

                    <div className="flex flex-col flex-1 min-w-[120px]">
                        <label htmlFor="dataChegada" className="mb-2 text-sm font-medium text-gray-700">Data de chegada</label>
                        <input id="dataChegada" name="dataChegada" type="date" className="px-4 py-2 border border-gray-200 rounded-lg text-base" />
                    </div>
                </div>

                <div className="flex gap-4 flex-wrap">
                    <div className="flex flex-col flex-1 min-w-[120px]">
                        <label htmlFor="apelido" className="mb-2 text-sm font-medium text-gray-700">Apelido</label>
                        <input id="apelido" name="apelido" type="text" placeholder="Apelido" className="px-4 py-2 border border-gray-200 rounded-lg text-base" />
                    </div>

                    <div className="flex flex-col flex-1 min-w-[120px]">
                        <label htmlFor="cpf" className="mb-2 text-sm font-medium text-gray-700">CPF</label>
                        <input id="cpf" name="cpf" type="text" placeholder="CPF" className="px-4 py-2 border border-gray-200 rounded-lg text-base" />
                    </div>

                    <div className="flex flex-col flex-1 min-w-[120px]">
                        <label htmlFor="horaSaida" className="mb-2 text-sm font-medium text-gray-700">Hora saída</label>
                        <input id="horaSaida" name="horaSaida" type="time" className="px-4 py-2 border border-gray-200 rounded-lg text-base" />
                    </div>

                    <div className="flex flex-col flex-1 min-w-[120px]">
                        <label htmlFor="horaDesembarque" className="mb-2 text-sm font-medium text-gray-700">Hora de desembarque</label>
                        <input id="horaDesembarque" name="horaDesembarque" type="time" className="px-4 py-2 border border-gray-200 rounded-lg text-base" />
                    </div>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="nomeEmbarcacao" className="mb-2 text-sm font-medium text-gray-700">Nome da embarcação</label>
                    <input id="nomeEmbarcacao" name="nomeEmbarcacao" type="text" placeholder="Nome da embarcação" className="px-4 py-2 border border-gray-200 rounded-lg text-base w-full" />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="codigoEmbarcacao" className="mb-2 text-sm font-medium text-gray-700">Código embarcação</label>
                    <input id="codigoEmbarcacao" name="codigoEmbarcacao" type="text" placeholder="Código da embarcação" className="px-4 py-2 border border-gray-200 rounded-lg text-base w-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-medium text-gray-700">Lat</label>
                        <div className="flex gap-2">
                            <input id="lat_deg1" name="lat_deg1" type="text" placeholder="graus" className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                            <input id="lat_min1" name="lat_min1" type="text" placeholder="min" className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                            <input id="lat_sec1" name="lat_sec1" type="text" placeholder="sec" className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-medium text-gray-700">Lat</label>
                        <div className="flex gap-2">
                            <input id="lat_deg2" name="lat_deg2" type="text" placeholder="graus" className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                            <input id="lat_min2" name="lat_min2" type="text" placeholder="min" className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                            <input id="lat_sec2" name="lat_sec2" type="text" placeholder="sec" className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-medium text-gray-700">Long</label>
                        <div className="flex gap-2">
                            <input id="long_deg1" name="long_deg1" type="text" placeholder="graus" className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                            <input id="long_min1" name="long_min1" type="text" placeholder="min" className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                            <input id="long_sec1" name="long_sec1" type="text" placeholder="sec" className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-medium text-gray-700">Long</label>
                        <div className="flex gap-2">
                            <input id="long_deg2" name="long_deg2" type="text" placeholder="graus" className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                            <input id="long_min2" name="long_min2" type="text" placeholder="min" className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                            <input id="long_sec2" name="long_sec2" type="text" placeholder="sec" className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                        </div>
                    </div>
                </div>

                {/* Número(s) Quadrante(s) de pesca(s) */}
                <div className="mt-4">
                    <label className="mb-2 text-sm font-medium text-gray-700">Número(s) Quadrante(s) de pesca(s)</label>
                    <div className="flex gap-3 mt-2">
                        <input name="quadrante1" type="text" placeholder="_____" className="px-3 py-2 border border-gray-200 rounded-lg text-base w-1/3" />
                        <input name="quadrante2" type="text" placeholder="_____" className="px-3 py-2 border border-gray-200 rounded-lg text-base w-1/3" />
                        <input name="quadrante3" type="text" placeholder="_____" className="px-3 py-2 border border-gray-200 rounded-lg text-base w-1/3" />
                    </div>
                </div>

                {/* Destino do pescado */}
                <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <fieldset className="space-y-3">
                        <legend className="text-sm font-medium text-gray-700">Destino do pescado</legend>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 text-gray-700">
                                    <input type="radio" name="destinoPescado" value="atravessador" className="h-4 w-4" />
                                    <span className="text-sm">Atravessador</span>
                                </label>
                                <input name="atravessadorApelido" type="text" placeholder="Apelido" className="px-3 py-2 border border-gray-200 rounded-lg text-base" />
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 text-gray-700">
                                    <input type="radio" name="destinoPescado" value="armador" className="h-4 w-4" />
                                    <span className="text-sm">Armador</span>
                                </label>
                                <input name="armadorApelido" type="text" placeholder="Apelido" className="px-3 py-2 border border-gray-200 rounded-lg text-base" />
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 text-gray-700">
                                    <input type="radio" name="destinoPescado" value="diretoConsumidor" className="h-4 w-4" />
                                    <span className="text-sm">Direto consumidor</span>
                                </label>
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 text-gray-700">
                                    <input type="radio" name="destinoPescado" value="outros" className="h-4 w-4" />
                                    <span className="text-sm">Outros</span>
                                </label>
                                <input name="destinoOutrosQual" type="text" placeholder="Qual" className="px-3 py-2 border border-gray-200 rounded-lg text-base" />
                            </div>
                        </div>
                    </fieldset>
                </div>

                <div className="flex justify-between mt-6">
                    <button 
                        onClick={handleBack}
                        type="button"
                        className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Voltar
                    </button>
                    <button 
                        onClick={handleNext}
                        type="button"
                        className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Próximo
                    </button>
                </div>
            </div>
        </form>
    </div>
);
}
