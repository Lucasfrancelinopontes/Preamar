"use client";

import { initialState } from "./utils/initialState";
import TextareaGroup from "./components/TextareaGroup";

import InputGroup from "./components/InputGroup";

import SelectGroup from "./components/SelectGroup";

import CheckboxGroup from "./components/CheckboxGroup";

import usePescadorForm from "./hooks/usePescadorForm";

import api from "@/services/api";
import { useEffect, useMemo, useState } from "react";

const TOTAL_ETAPAS = 10;

export default function CadastroPescador() {

    const [etapaAtual, setEtapaAtual] = useState(1);
    const OPCOES_SIM_NAO = [
    { id: "sim", nome: "Sim" },
    { id: "nao", nome: "Não" }
];

    const {

    formData,
    setFormData,

    handleInputChange,
    handleCheckboxChange,

    adicionarEspecie,
    removerEspecie

} = usePescadorForm();


    const [municipios, setMunicipios] = useState([]);

    const [carregando, setCarregando] = useState(true);

    const [erro, setErro] = useState("");

    useEffect(() => {

        async function carregarMunicipios() {

            try {

                const response = await api.getMunicipios();

                const lista = Array.isArray(response)
                    ? response
                    : response.data;

                setMunicipios(lista);

            } catch (err) {

                setErro("Não foi possível carregar os municípios.");

            } finally {

                setCarregando(false);

            }

        }

        carregarMunicipios();

    }, []);

    const municipioSelecionado = useMemo(() => {

        return municipios.find(
            (m) => m.municipio === formData.municipio
        );

    }, [municipios, formData.municipio]);

    const localidades = useMemo(() => {

        return municipioSelecionado?.localidades || [];

    }, [municipioSelecionado]);

    function proximaEtapa() {

        if (etapaAtual < TOTAL_ETAPAS)
            setEtapaAtual((e) => e + 1);

        window.scrollTo(0, 0);

    }

    function etapaAnterior() {

        if (etapaAtual > 1)
            setEtapaAtual((e) => e - 1);

        window.scrollTo(0, 0);

    }

    return (

        <main className="min-h-screen bg-slate-100 py-10">

            <div className="max-w-6xl mx-auto">

                <div className="bg-white rounded-2xl shadow p-8">

                    <div className="mb-8">

                        <h1 className="text-3xl font-bold text-slate-800">

                            Cadastro Socioeconômico do Pescador

                        </h1>

                        <p className="text-slate-500 mt-2">

                            Etapa {etapaAtual} de {TOTAL_ETAPAS}

                        </p>

                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-3 mb-8">

                        <div

                            className="bg-blue-600 h-3 rounded-full transition-all"

                            style={{
                                width: `${(etapaAtual / TOTAL_ETAPAS) * 100}%`
                            }}

                        />

                    </div>

                    {etapaAtual === 1 && (

                        <div>

                            <h2 className="text-xl font-bold mb-6">

                                Informações Iniciais

                            </h2>

                            <div className="grid md:grid-cols-2 gap-5">

                                <InputGroup
                                    label="Código da Coleta"
                                    name="codigoColeta"
                                    value={formData.codigoColeta}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Código da Foto"
                                    name="codigoFoto"
                                    value={formData.codigoFoto}
                                    onChange={handleInputChange}
                                />

                                <SelectGroup
                                    label="Município"
                                    name="municipio"
                                    value={formData.municipio}
                                    onChange={handleInputChange}
                                    options={municipios}
                                    optionLabel="municipio"
                                    optionValue="ID_municipio"
                                />

                                <SelectGroup
                                    label="Localidade"
                                    name="localidade"
                                    value={formData.localidade}
                                    onChange={handleInputChange}
                                    options={localidades}
                                    optionLabel="localidade"
                                    optionValue="ID_localidade"
                                />

                            </div>

                        </div>

                    )}

                    {etapaAtual === 2 && (

                        <div>

                            <h2 className="text-xl font-bold mb-6">

                                Dados Pessoais

                            </h2>

                            <div className="grid md:grid-cols-2 gap-5">

                                <InputGroup
                                    label="Nome"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Apelido"
                                    name="apelido"
                                    value={formData.apelido}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="CPF"
                                    name="cpf"
                                    value={formData.cpf}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Telefone"
                                    name="telefone"
                                    value={formData.telefone}
                                    onChange={handleInputChange}
                                />

                                <SelectGroup
                                    label="Sexo"
                                    name="sexo"
                                    value={formData.sexo}
                                    onChange={handleInputChange}
                                    options={[
                                        { id: "M", nome: "Masculino" },
                                        { id: "F", nome: "Feminino" }
                                    ]}
                                    optionLabel="nome"
                                    optionValue="id"
                                />

                                <InputGroup
                                    label="Data de Nascimento"
                                    type="date"
                                    name="nascimento"
                                    value={formData.nascimento}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Naturalidade"
                                    name="naturalidade"
                                    value={formData.naturalidade}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Estado Civil"
                                    name="estadoCivil"
                                    value={formData.estadoCivil}
                                    onChange={handleInputChange}
                                />

                                <InputGroup
                                    label="Escolaridade"
                                    name="escolaridade"
                                    value={formData.escolaridade}
                                    onChange={handleInputChange}
                                    colSpan={2}
                                />

                            </div>

                        </div>

                    )}
                    {etapaAtual === 3 && (

    <div>

        <h2 className="text-xl font-bold mb-6">

            Moradia

        </h2>

        <div className="grid md:grid-cols-2 gap-5">

            <SelectGroup
                label="Local de Moradia"
                name="moradiaTipo"
                value={formData.moradiaTipo}
                onChange={handleInputChange}
                options={[
                    {
                        id: "comunidade",
                        nome: "Comunidade Tradicional"
                    },
                    {
                        id: "sede",
                        nome: "Sede Municipal"
                    },
                    {
                        id: "outro",
                        nome: "Outro"
                    }
                ]}
                optionLabel="nome"
                optionValue="id"
            />

            {
                formData.moradiaTipo === "outro" && (

                    <InputGroup
                        label="Qual?"
                        name="moradiaOutro"
                        value={formData.moradiaOutro}
                        onChange={handleInputChange}
                    />

                )
            }

            <SelectGroup
                label="Tipo de Construção"
                name="tipoConstrucao"
                value={formData.tipoConstrucao}
                onChange={handleInputChange}
                options={[
                    {
                        id: "alvenaria",
                        nome: "Alvenaria"
                    },
                    {
                        id: "madeira",
                        nome: "Madeira"
                    },
                    {
                        id: "outro",
                        nome: "Outro"
                    }
                ]}
                optionLabel="nome"
                optionValue="id"
            />

            {
                formData.tipoConstrucao === "outro" && (

                    <InputGroup
                        label="Outro tipo"
                        name="tipoConstrucaoOutro"
                        value={formData.tipoConstrucaoOutro}
                        onChange={handleInputChange}
                    />

                )
            }

        </div>

    </div>

)}

{etapaAtual === 4 && (

    <div>

        <h2 className="text-xl font-bold mb-6">

            Saúde

        </h2>

        <div className="grid md:grid-cols-2 gap-4">

            <CheckboxGroup
                label="Problemas de Vista"
                checked={formData.saude.vista}
                onChange={() => handleCheckboxChange("saude", "vista")}
            />

            <CheckboxGroup
                label="Problemas de Pele"
                checked={formData.saude.pele}
                onChange={() => handleCheckboxChange("saude", "pele")}
            />

            <CheckboxGroup
                label="Problemas na Coluna"
                checked={formData.saude.coluna}
                onChange={() => handleCheckboxChange("saude", "coluna")}
            />

            <CheckboxGroup
                label="Problemas Ginecológicos"
                checked={formData.saude.ginecologico}
                onChange={() => handleCheckboxChange("saude", "ginecologico")}
            />

            <CheckboxGroup
                label="Outros"
                checked={formData.saude.outros}
                onChange={() => handleCheckboxChange("saude", "outros")}
            />

        </div>

        {formData.saude.outros && (

            <div className="mt-6">

                <InputGroup
                    label="Descreva os outros problemas de saúde"
                    name="saudeOutros"
                    value={formData.saudeOutros}
                    onChange={handleInputChange}
                    colSpan={2}
                />

            </div>

        )}

    </div>

)}
{etapaAtual === 5 && (

    <div>

        <h2 className="text-xl font-bold mb-6">

            Registros

        </h2>

        <div className="grid md:grid-cols-2 gap-5">

            <SelectGroup
                label="Possui Registro no INSS?"
                name="registroINSS"
                value={formData.registroINSS}
                onChange={handleInputChange}
                options={OPCOES_SIM_NAO}
                optionLabel="nome"
                optionValue="id"
            />

            <SelectGroup
                label="Registro em Colônia?"
                name="registroColonia"
                value={formData.registroColonia}
                onChange={handleInputChange}
                options={OPCOES_SIM_NAO}
                optionLabel="nome"
                optionValue="id"
            />

            {formData.registroColonia === "sim" && (

                <InputGroup
                    label="Qual Colônia?"
                    name="qualColonia"
                    value={formData.qualColonia}
                    onChange={handleInputChange}
                />

            )}

            <SelectGroup
                label="Registro em Associação?"
                name="registroAssociacao"
                value={formData.registroAssociacao}
                onChange={handleInputChange}
                options={OPCOES_SIM_NAO}
                optionLabel="nome"
                optionValue="id"
            />

            {formData.registroAssociacao === "sim" && (

                <InputGroup
                    label="Qual Associação?"
                    name="qualAssociacao"
                    value={formData.qualAssociacao}
                    onChange={handleInputChange}
                />

            )}

            <SelectGroup
                label="Possui Carteira de Pescador?"
                name="possuiCarteira"
                value={formData.possuiCarteira}
                onChange={handleInputChange}
                options={OPCOES_SIM_NAO}
                optionLabel="nome"
                optionValue="id"
            />

            {formData.possuiCarteira === "sim" && (

                <>
                    <SelectGroup
                        label="Carteira Grande Marinha"
                        name="carteiraGrande"
                        value={formData.carteiraGrande}
                        onChange={handleInputChange}
                        options={OPCOES_SIM_NAO}
                        optionLabel="nome"
                        optionValue="id"
                    />

                    <SelectGroup
                        label="Carteira Pequena Colônia"
                        name="carteiraPequena"
                        value={formData.carteiraPequena}
                        onChange={handleInputChange}
                        options={OPCOES_SIM_NAO}
                        optionLabel="nome"
                        optionValue="id"
                    />
                </>

            )}

        </div>

    </div>

)}
{etapaAtual === 6 && (

    <div>

        <h2 className="text-xl font-bold mb-6">

            Relação de Trabalho

        </h2>

        <div className="grid md:grid-cols-2 gap-5">

            <InputGroup
                label="Há quanto tempo exerce a atividade pesqueira? (anos)"
                name="tempoAtividade"
                type="number"
                value={formData.tempoAtividade}
                onChange={handleInputChange}
            />

            <InputGroup
                label="Horas de trabalho por dia"
                name="horasDia"
                type="number"
                value={formData.horasDia}
                onChange={handleInputChange}
            />

            <SelectGroup
                label="Relação de Trabalho"
                name="relacaoTrabalho"
                value={formData.relacaoTrabalho}
                onChange={handleInputChange}
                options={[
                    { id: "autonomo", nome: "Autônomo" },
                    { id: "empregado", nome: "Empregado" },
                    { id: "familiar", nome: "Trabalho Familiar" },
                    { id: "cooperativa", nome: "Cooperativa" },
                    { id: "outro", nome: "Outro" }
                ]}
                optionLabel="nome"
                optionValue="id"
            />

            <InputGroup
                label="Atividade Principal"
                name="atividadePrincipal"
                value={formData.atividadePrincipal}
                onChange={handleInputChange}
            />

            <InputGroup
                label="Atividade Secundária"
                name="atividadeSecundaria"
                value={formData.atividadeSecundaria}
                onChange={handleInputChange}
            />

            <TextareaGroup
                label="Outras Fontes de Renda"
                name="fontesRenda"
                value={formData.fontesRenda}
                onChange={handleInputChange}
            />

        </div>

    </div>

)}
{etapaAtual === 7 && (

    <div>

        <h2 className="text-xl font-bold mb-6">

            Composição da Pescaria

        </h2>

        <div className="grid md:grid-cols-2 gap-5">

            <SelectGroup
                label="Categoria da Pesca"
                name="categoriaPesca"
                value={formData.categoriaPesca}
                onChange={handleInputChange}
                options={[
                    { id: "artesanal", nome: "Artesanal" },
                    { id: "industrial", nome: "Industrial" },
                    { id: "subsistencia", nome: "Subsistência" }
                ]}
                optionLabel="nome"
                optionValue="id"
            />

            <InputGroup
                label="Principal Pescaria"
                name="principalPescaria"
                value={formData.principalPescaria}
                onChange={handleInputChange}
            />

            <InputGroup
                label="Petrecho de Pesca"
                name="petrechoPesca"
                value={formData.petrechoPesca}
                onChange={handleInputChange}
            />

            <InputGroup
                label="Material do Petrecho"
                name="materialPetrecho"
                value={formData.materialPetrecho}
                onChange={handleInputChange}
            />

            <InputGroup
                label="Tipo de Isca"
                name="tipoIscas"
                value={formData.tipoIscas}
                onChange={handleInputChange}
            />

            <InputGroup
                label="Processo de Lançamento"
                name="processoLancamento"
                value={formData.processoLancamento}
                onChange={handleInputChange}
            />

            <InputGroup
                label="Comprimento (metros)"
                name="tamanhoMetros"
                type="number"
                value={formData.tamanhoMetros}
                onChange={handleInputChange}
            />

            <InputGroup
                label="Comprimento (braças)"
                name="tamanhoBracas"
                type="number"
                value={formData.tamanhoBracas}
                onChange={handleInputChange}
            />

            <InputGroup
                label="Quantidade de Unidades"
                name="unidades"
                type="number"
                value={formData.unidades}
                onChange={handleInputChange}
            />

        </div>

    </div>

)}

{etapaAtual === 8 && (

    <div>

        <h2 className="text-xl font-bold mb-6">

            Espécies Capturadas

        </h2>

        <div className="grid md:grid-cols-5 gap-4 items-end">

            <div className="md:col-span-4">

                <InputGroup
                    label="Espécie"
                    name="novaEspecie"
                    value={formData.novaEspecie}
                    onChange={handleInputChange}
                    placeholder="Digite o nome da espécie"
                />

            </div>

            <button

                type="button"

                onClick={adicionarEspecie}

                className="h-12 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"

            >

                Adicionar

            </button>

        </div>

        <div className="mt-8 overflow-x-auto">

            <table className="w-full">

                <thead>

                    <tr className="border-b bg-slate-100">

                        <th className="text-left p-4">

                            Espécie

                        </th>

                        <th className="w-40 text-center p-4">

                            Ações

                        </th>

                    </tr>

                </thead>

                <tbody>

                    {formData.especies.length === 0 && (

                        <tr>

                            <td
                                colSpan={2}
                                className="text-center text-slate-500 py-8"
                            >

                                Nenhuma espécie adicionada.

                            </td>

                        </tr>

                    )}

                    {formData.especies.map((especie) => (

                        <tr
                            key={especie.id}
                            className="border-b hover:bg-slate-50"
                        >

                            <td className="p-4">

                                {especie.nome}

                            </td>

                            <td className="text-center">

                                <button

                                    type="button"

                                    onClick={() => removerEspecie(especie.id)}

                                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"

                                >

                                    Remover

                                </button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    </div>

)}
{etapaAtual === 9 && (

    <div>

        <h2 className="text-xl font-bold mb-6">

            Quadrantes de Pesca

        </h2>

        <p className="text-slate-500 mb-8">

            Informe os principais quadrantes onde o pescador exerce sua atividade.

        </p>

        <div className="grid md:grid-cols-2 gap-5">

            <InputGroup
                label="Quadrante 1"
                name="quadrante1"
                value={formData.quadrantes[0]}
                onChange={(e) => {
                    const novos = [...formData.quadrantes];
                    novos[0] = e.target.value;

                    setFormData(prev => ({
                        ...prev,
                        quadrantes: novos
                    }));
                }}
            />

            <InputGroup
                label="Quadrante 2"
                name="quadrante2"
                value={formData.quadrantes[1]}
                onChange={(e) => {
                    const novos = [...formData.quadrantes];
                    novos[1] = e.target.value;

                    setFormData(prev => ({
                        ...prev,
                        quadrantes: novos
                    }));
                }}
            />

            <InputGroup
                label="Quadrante 3"
                name="quadrante3"
                value={formData.quadrantes[2]}
                onChange={(e) => {
                    const novos = [...formData.quadrantes];
                    novos[2] = e.target.value;

                    setFormData(prev => ({
                        ...prev,
                        quadrantes: novos
                    }));
                }}
            />

            <InputGroup
                label="Quadrante 4"
                name="quadrante4"
                value={formData.quadrantes[3]}
                onChange={(e) => {
                    const novos = [...formData.quadrantes];
                    novos[3] = e.target.value;

                    setFormData(prev => ({
                        ...prev,
                        quadrantes: novos
                    }));
                }}
            />

            <InputGroup
                label="Quadrante 5"
                name="quadrante5"
                value={formData.quadrantes[4]}
                onChange={(e) => {
                    const novos = [...formData.quadrantes];
                    novos[4] = e.target.value;

                    setFormData(prev => ({
                        ...prev,
                        quadrantes: novos
                    }));
                }}
            />

        </div>

    </div>

)}
{etapaAtual === 10 && (

    <div>

        <h2 className="text-xl font-bold mb-6">

            Produção e Comercialização

        </h2>

        <div className="grid md:grid-cols-2 gap-5">

            <InputGroup
                label="Média de dias embarcado por mês"
                name="mediaDiasEmbarcado"
                type="number"
                value={formData.mediaDiasEmbarcado}
                onChange={handleInputChange}
            />

            <InputGroup
                label="Produção média (kg)"
                name="producaoMedia"
                type="number"
                value={formData.producaoMedia}
                onChange={handleInputChange}
            />

            <InputGroup
                label="Valor médio obtido (R$)"
                name="valorMedio"
                type="number"
                value={formData.valorMedio}
                onChange={handleInputChange}
            />

            <TextareaGroup
                label="Observações"
                name="observacoes"
                value={formData.observacoes || ""}
                onChange={handleInputChange}
            />

        </div>

        <div className="mt-10 p-6 rounded-xl bg-green-50 border border-green-200">

            <h3 className="text-lg font-semibold text-green-700">

                Cadastro concluído

            </h3>

            <p className="text-slate-600 mt-2">

                Revise todas as informações antes de salvar o cadastro.

            </p>

        </div>

    </div>

)}
                    <div className="flex justify-between mt-10">

                        <button

                            onClick={etapaAnterior}

                            disabled={etapaAtual === 1}

                            className="px-6 py-3 rounded-lg bg-slate-300 disabled:opacity-40"

                        >

                            Anterior

                        </button>

                        <button

                            onClick={proximaEtapa}

                            disabled={etapaAtual === TOTAL_ETAPAS}

                            className="px-6 py-3 rounded-lg bg-blue-600 text-white"

                        >

                            Próximo

                        </button>

                    </div>

                </div>

            </div>

        </main>

    );

}