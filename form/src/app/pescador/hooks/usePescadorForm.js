"use client";

import { useState } from "react";
import { initialState } from "../utils/initialState";
import { mapFormDataToPayload } from "../utils/mapper";
import api from "@/services/api";

export default function usePescadorForm() {
    const [formData, setFormData] = useState(initialState);
    const [salvando, setSalvando] = useState(false);
    const [erroSubmit, setErroSubmit] = useState("");
    const [sucessoSubmit, setSucessoSubmit] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (grupo, campo) => {
        setFormData((prev) => ({
            ...prev,
            [grupo]: {
                ...prev[grupo],
                [campo]: !prev[grupo][campo]
            }
        }));
    };

    // --- Auxiliar para Inputs aninhados do objeto embarcacao ---
    const handleEmbarcacaoInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            embarcacao: {
                ...prev.embarcacao,
                [name]: value
            }
        }));
    };

    const handleEmbarcacaoCheckboxChange = (campo) => {
        setFormData((prev) => ({
            ...prev,
            embarcacao: {
                ...prev.embarcacao,
                [campo]: !prev.embarcacao[campo]
            }
        }));
    };

    // --- Funções de controle de Propulsão ---
    const togglePropulsao = (propulsaoId) => {
        setFormData((prev) => {
            const existe = prev.propulsoes.includes(propulsaoId);
            const novasPropulsoes = existe
                ? prev.propulsoes.filter((p) => p !== propulsaoId)
                : [...prev.propulsoes, propulsaoId];
            return { ...prev, propulsoes: novasPropulsoes };
        });
    };

    // --- Funções de controle das Despesas Dinâmicas ---
    const addDespesa = () => {
        setFormData((prev) => ({
            ...prev,
            despesas: [
                ...prev.despesas,
                {
                    rowId: Date.now(),
                    item: "",
                    tipo: "",
                    quantidade: "",
                    unidade: "",
                    valor: "",
                    outros: "",
                    frequencia: ""
                }
            ]
        }));
    };

    const removeDespesa = (idx) => {
        setFormData((prev) => ({
            ...prev,
            despesas: prev.despesas.filter((_, i) => i !== idx)
        }));
    };

    const updateDespesa = (idx, campo, valor) => {
        setFormData((prev) => {
            const novasDespesas = [...prev.despesas];
            novasDespesas[idx] = { ...novasDespesas[idx], [campo]: valor };
            return { ...prev, despesas: novasDespesas };
        });
    };

    // --- Espécies (Legado mantido) ---
    const adicionarEspecie = () => {
        if (!formData.novaEspecie.trim()) return;
        setFormData((prev) => ({
            ...prev,
            especies: [
                ...prev.especies,
                {
                    id: Date.now(),
                    nome: prev.novaEspecie
                }
            ],
            novaEspecie: ""
        }));
    };

    const removerEspecie = (id) => {
        setFormData((prev) => ({
            ...prev,
            especies: prev.especies.filter(especie => especie.id !== id)
        }));
    };

    const submitForm = async () => {
        setSalvando(true);
        setErroSubmit("");
        setSucessoSubmit(false);
        try {
            const payload = mapFormDataToPayload(formData);
            await api.criarSocioPescador(payload);
            setSucessoSubmit(true);
            return true;
        } catch (err) {
            const mensagem =
                err?.data?.error ||
                err?.data?.message ||
                err?.message ||
                "Erro ao salvar cadastro. Tente novamente.";
            setErroSubmit(mensagem);
            return false;
        } finally {
            setSalvando(false);
        }
    };

    return {
        formData,
        setFormData,
        handleInputChange,
        handleCheckboxChange,
        handleEmbarcacaoInputChange,
        handleEmbarcacaoCheckboxChange,
        togglePropulsao,
        addDespesa,
        removeDespesa,
        updateDespesa,
        adicionarEspecie,
        removerEspecie,
        submitForm,
        salvando,
        erroSubmit,
        sucessoSubmit
    };
}