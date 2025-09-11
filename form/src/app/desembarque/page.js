export default function DesembarquePage() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center" style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>
            <form className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 w-[90vw] max-w-[110vw] mx-auto flex flex-col gap-6">
                <div className="flex gap-4 flex-wrap">
                    <div className="flex flex-col flex-1 min-w-[120px]">
                        <label htmlFor="id" className="mb-2 text-sm font-medium text-gray-700">ID</label>
                        <input id="id" name="id" type="text" placeholder="ID" className="px-4 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-amber-400 focus:bg-amber-50" />
                    </div>

                    {/* cod desembarque - agora em cima das outras opções */}
                    <div className="flex flex-col gap-3 flex-1 min-w-[120px]">
                        <div className="flex flex-col w-full">
                            <label htmlFor="codDesembarque" className="mb-2 text-sm font-medium text-gray-700">COD. desembarque</label>
                            {/* se quiser, adicione um input/select aqui */}
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
                        <label htmlFor="dataSaida" className="mb-2 text-sm font-medium text-gray-700">Data de saída</label>
                        <input id="dataSaida" name="dataSaida" type="date" className="px-4 py-2 border border-gray-200 rounded-lg text-base text-gray-700 focus:outline-none focus:border-amber-400 focus:bg-amber-50" />
                    </div>

                    <div className="flex flex-col flex-1 min-w-[120px]">
                        <label htmlFor="dataChegada" className="mb-2 text-sm font-medium text-gray-700">Data de chegada</label>
                        <input id="dataChegada" name="dataChegada" type="date" className="px-4 py-2 border border-gray-200 rounded-lg text-base text-gray-700 focus:outline-none focus:border-amber-400 focus:bg-amber-50" />
                    </div>
                </div>

                <div className="flex gap-4 flex-wrap">
                    <div className="flex flex-col flex-1 min-w-[120px]">
                        <label htmlFor="apelido" className="mb-2 text-sm font-medium text-gray-700">Apelido</label>
                        <input id="apelido" name="apelido" type="text" placeholder="Apelido" className="px-4 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-amber-400 focus:bg-amber-50" />
                    </div>

                    <div className="flex flex-col flex-1 min-w-[120px]">
                        <label htmlFor="coordenadas" className="mb-2 text-sm font-medium text-gray-700">Coordenadas</label>
                        <input id="coordenadas" name="coordenadas" type="text" placeholder="Coordenadas" className="px-4 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-amber-400 focus:bg-amber-50" />
                    </div>
                </div>

                <div className="flex gap-4 flex-wrap">
                    <div className="flex flex-col flex-1 min-w-[180px] max-w-[400px]">
                        <label htmlFor="embarcacao" className="mb-2 text-sm font-medium text-gray-700">Nome da embarcação</label>
                        <input id="embarcacao" name="embarcacao" type="text" placeholder="Nome da embarcação" className="px-4 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-amber-400 focus:bg-amber-50 w-full" />
                    </div>

                    <div className="flex flex-col flex-1 min-w-[120px]">
                        <label htmlFor="petrecho" className="mb-2 text-sm font-medium text-gray-700">Petrecho</label>
                        <select id="petrecho" name="petrecho" className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-base focus:outline-none focus:border-amber-400 focus:bg-amber-50">
                            <option value="">Selecione</option>
                            <option value="petrecho1">Petrecho 1</option>
                            <option value="petrecho2">Petrecho 2</option>
                        </select>
                    </div>

                    <div className="flex flex-col flex-1 min-w-[140px] max-w-[400px]">
                        <label htmlFor="tamanhoPetrecho" className="mb-2 text-sm font-medium text-gray-700">Tamanho do petrecho</label>
                        <input id="tamanhoPetrecho" name="tamanhoPetrecho" type="text" placeholder="Tamanho petrecho" className="px-4 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-amber-400 focus:bg-amber-50 w-full" />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="bg-orange-500 hover:bg-green-400 text-white rounded-lg px-4 py-2">Enviar</button>
                </div>
            </form>
        </div>
    );
}
