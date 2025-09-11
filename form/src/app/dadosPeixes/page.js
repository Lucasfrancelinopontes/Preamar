"use client";

import { useState } from "react";

export default function peixes() {
    const [especies, setEspecies] = useState([
        { id: "", peso: "", preco: "" },
        { id: "", peso: "", preco: "" },
    ]);

    function adicionarEspecie() {
        setEspecies((s) => [...s, { id: "", peso: "", preco: "" }]);
    }

    function atualizarEspecie(index, field, value) {
        setEspecies((s) => s.map((e, i) => (i === index ? { ...e, [field]: value } : e)));
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <form className="bg-white p-6 rounded-lg shadow-md w-[95vw] max-w-[900px]">
                <h2 className="text-lg font-semibold mb-4">Registro de Espécies</h2>

                <div className="space-y-4">
                    {especies.map((esp, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700">ID Espécie</label>
                                <input value={esp.id} onChange={(e) => atualizarEspecie(idx, "id", e.target.value)} name={`especie_${idx}_id`} type="text" className="px-3 py-2 border border-gray-200 rounded-lg" />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700">Peso (kg)</label>
                                <input value={esp.peso} onChange={(e) => atualizarEspecie(idx, "peso", e.target.value)} name={`especie_${idx}_peso`} type="number" step="0.01" className="px-3 py-2 border border-gray-200 rounded-lg" />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700">Preço / kg (R$)</label>
                                <input value={esp.preco} onChange={(e) => atualizarEspecie(idx, "preco", e.target.value)} name={`especie_${idx}_preco`} type="number" step="0.01" className="px-3 py-2 border border-gray-200 rounded-lg" />
                            </div>
                        </div>
                    ))}

                    <div className="flex mt-2">
                        <button type="button" onClick={adicionarEspecie} className="bg-blue-600 hover:bg-blue-500 text-white rounded-md px-3 py-2">
                            Adicionar espécie
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}