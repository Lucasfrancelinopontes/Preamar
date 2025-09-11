export default function DadosPesca() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center flex-wrap" style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>
            <div className="mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 text-justify lg:text-left">
                    Formulário de Dados de Pesca
                </h1>
            </div>
            <form className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 w-[90vw] max-w-[110vw] mx-auto flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                        <label htmlFor="nomePescador" className="mb-2 text-sm font-medium text-gray-700">Nome pescador</label>
                        <input id="nomePescador" name="nomePescador" type="text" placeholder="Nome do pescador" className="px-4 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-amber-400 focus:bg-amber-50" />
                    </div>

                    <div className="flex gap-4 flex-wrap">
                        <div className="flex flex-col flex-1 min-w-[120px]">
                            <label htmlFor="dataSaida" className="mb-2 text-sm font-medium text-gray-700">Data de saída</label>
                            <input id="dataSaida" name="dataSaida" type="date" className="px-4 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-amber-400 focus:bg-amber-50" />
                        </div>

                        <div className="flex flex-col flex-1 min-w-[120px]">
                            <label htmlFor="dataChegada" className="mb-2 text-sm font-medium text-gray-700">Data de chegada</label>
                            <input id="dataChegada" name="dataChegada" type="date" className="px-4 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-amber-400 focus:bg-amber-50" />
                        </div>
                    </div>

                    <div className="flex gap-4 flex-wrap">
                        <div className="flex flex-col flex-1 min-w-[120px]">
                            <label htmlFor="apelido" className="mb-2 text-sm font-medium text-gray-700">Apelido</label>
                            <input id="apelido" name="apelido" type="text" placeholder="Apelido" className="px-4 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-amber-400 focus:bg-amber-50" />
                        </div>

                        <div className="flex flex-col flex-1 min-w-[120px]">
                            <label htmlFor="cpf" className="mb-2 text-sm font-medium text-gray-700">CPF</label>
                            <input id="cpf" name="cpf" type="text" placeholder="CPF" className="px-4 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-amber-400 focus:bg-amber-50" />
                        </div>

                        <div className="flex flex-col flex-1 min-w-[120px]">
                            <label htmlFor="horaSaida" className="mb-2 text-sm font-medium text-gray-700">Hora saída</label>
                            <input id="horaSaida" name="horaSaida" type="time" className="px-4 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-amber-400 focus:bg-amber-50" />
                        </div>

                        <div className="flex flex-col flex-1 min-w-[120px]">
                            <label htmlFor="horaDesembarque" className="mb-2 text-sm font-medium text-gray-700">Hora de desembarque</label>
                            <input id="horaDesembarque" name="horaDesembarque" type="time" className="px-4 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-amber-400 focus:bg-amber-50" />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="nomeEmbarcacao" className="mb-2 text-sm font-medium text-gray-700">Nome da embarcação</label>
                        <input id="nomeEmbarcacao" name="nomeEmbarcacao" type="text" placeholder="Nome da embarcação" className="px-4 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-amber-400 focus:bg-amber-50 w-full" />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="codigoEmbarcacao" className="mb-2 text-sm font-medium text-gray-700">Código embarcação</label>
                        <input id="codigoEmbarcacao" name="codigoEmbarcacao" type="text" placeholder="Código da embarcação" className="px-4 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-amber-400 focus:bg-amber-50 w-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label className="mb-2 text-sm font-medium text-gray-700">Lat</label>
                            <div className="flex gap-2">
                                <input id="lat_deg1" name="lat_deg1" type="text" placeholder="graus" className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                                <input id="lat_min1" name="lat_min1" type="text" placeholder="o'" className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                                <input id="lat_sec1" name="lat_sec1" type="text" placeholder='"' className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-2 text-sm font-medium text-gray-700">Lat</label>
                            <div className="flex gap-2">
                                <input id="lat_deg2" name="lat_deg2" type="text" placeholder="graus" className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                                <input id="lat_min2" name="lat_min2" type="text" placeholder="o'" className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                                <input id="lat_sec2" name="lat_sec2" type="text" placeholder='"' className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-2 text-sm font-medium text-gray-700">Long</label>
                            <div className="flex gap-2">
                                <input id="long_deg1" name="long_deg1" type="text" placeholder="graus" className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                                <input id="long_min1" name="long_min1" type="text" placeholder="o'" className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                                <input id="long_sec1" name="long_sec1" type="text" placeholder='"' className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-2 text-sm font-medium text-gray-700">Long</label>
                            <div className="flex gap-2">
                                <input id="long_deg2" name="long_deg2" type="text" placeholder="graus" className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                                <input id="long_min2" name="long_min2" type="text" placeholder="o'" className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                                <input id="long_sec2" name="long_sec2" type="text" placeholder='"' className="px-3 py-2 border border-gray-200 rounded-lg text-base w-20" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" className="bg-orange-500 hover:bg-green-400 text-white rounded-lg px-4 py-2">Enviar</button>
                    </div>
                </div>
            </form>
        </div>
    );
}
