"use client";
import { useRouter } from 'next/navigation';

export default function DesembarquePage() {
    const router = useRouter();

    const handleNext = (e) => {
        e.preventDefault();
        router.push('/dadosPesca');
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center flex-wrap" style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>
            <div className="mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 text-justify lg:text-left">
                    Formulário de Desembarque de Pescado
                </h1>
            </div>
            <form className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 w-[90vw] max-w-[110vw] mx-auto flex flex-col gap-6">
                <div className="flex gap-4 flex-wrap">

                    <div className="flex flex-col gap-3 flex-1 min-w-[120px]">
                        <div className="flex flex-col w-full">
                            <label htmlFor="codDesembarque" className="mb-2 text-sm font-medium text-gray-700">COD. desembarque</label>
                        </div>

                        <div className="flex gap-4 items-center flex-wrap">
                            <div className="flex flex-col">
                                <label htmlFor="municipio" className="mb-2 text-sm font-medium text-gray-700">Municipio</label>
                                <select id="municipio" name="municipio" className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-base focus:outline-none focus:border-amber-400 focus:bg-amber-50">
                                    <option value="">Selecione</option>
                                    <option value="#">EX1</option>
                                    <option value="#">EX2</option>
                                    <option value="#">EX3</option>
                                </select>
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="localidade" className="mb-2 text-sm font-medium text-gray-700">Localidade</label>
                                <select id="localidade" name="localidade" className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-base focus:outline-none focus:border-amber-400 focus:bg-amber-50">
                                    <option value="">Selecione</option>
                                    <option value="#">EX1</option>
                                    <option value="#">EX2</option>
                                    <option value="#">EX3</option>
                                </select>
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="data" className="mb-2 text-sm font-medium text-gray-700">Data</label>
                                <input id="data" name="data" type="date" className="px-4 py-2 border border-gray-200 rounded-lg text-base text-gray-700 focus:outline-none focus:border-amber-400 focus:bg-amber-50" />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="consecutivo" className="mb-2 text-sm font-medium text-gray-700">Consecutivo</label>
                                <input id="consecutivo" name="consecutivo" type="text" placeholder="EX: 2" className="px-4 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-amber-400 focus:bg-amber-50" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 flex-wrap">
                    <div className="flex flex-col flex-1 min-w-[120px]">
                        <label htmlFor="coletor" className="mb-2 text-sm font-medium text-gray-700">Coletor</label>
                        <input id="coletor" name="coletor" type="text" placeholder="Nome:" className="px-4 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-amber-400 focus:bg-amber-50" />
                    </div>

                    <div className="flex flex-col flex-1 min-w-[120px]">
                        <label htmlFor="dataChegada" className="mb-2 text-sm font-medium text-gray-700">Data</label>
                        <input id="dataC" name="dataC" type="date" className="px-4 py-2 border border-gray-200 rounded-lg text-base text-gray-700 focus:outline-none focus:border-amber-400 focus:bg-amber-50" />
                    </div>
                </div>
                <div className="flex gap-4 flex-wrap">
                    <div className="flex flex-col flex-1 min-w-[120px]">
                        <label htmlFor="revisor" className="mb-2 text-sm font-medium text-gray-700">Revisor</label>
                        <input id="revisor" name="revisor" type="text" placeholder="Nome:" className="px-4 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-amber-400 focus:bg-amber-50" />
                    </div>

                    <div className="flex flex-col flex-1 min-w-[120px]">
                        <label htmlFor="dataR" className="mb-2 text-sm font-medium text-gray-700">Data</label>
                        <input id="dataR" name="dataR" type="date" className="px-4 py-2 border border-gray-200 rounded-lg text-base text-gray-700 focus:outline-none focus:border-amber-400 focus:bg-amber-50" />
                    </div>
                </div>
                <div className="flex gap-4 flex-wrap">
                    <div className="flex flex-col flex-1 min-w-[120px]">
                        <label htmlFor="digitador" className="mb-2 text-sm font-medium text-gray-700">Digitador</label>
                        <input id="digitador" name="digitador" type="text" placeholder="Nome:" className="px-4 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-amber-400 focus:bg-amber-50" />
                    </div>

                    <div className="flex flex-col flex-1 min-w-[120px]">
                        <label htmlFor="dataD" className="mb-2 text-sm font-medium text-gray-700">Data</label>
                        <input id="dataD" name="dataD" type="date" className="px-4 py-2 border border-gray-200 rounded-lg text-base text-gray-700 focus:outline-none focus:border-amber-400 focus:bg-amber-50" />
                    </div>
                </div>
                <button onClick={handleNext} className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors w-full mt-4">
                    Proximo
                </button>
            </form>
        </div>
    );
}
