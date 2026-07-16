"use client";

import { useState } from "react";
import { initialState } from "../utils/initialState";
import { mapFormDataToPayload } from "../utils/mapper";
import api from "@/services/api";

export default function usePescadorForm() {

    const [formData, setFormData] = useState(initialState);

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

        especies: prev.especies.filter(
            especie => especie.id !== id
        )

    }));

};
    const [salvando, setSalvando] = useState(false);
    const [erroSubmit, setErroSubmit] = useState("");
    const [sucessoSubmit, setSucessoSubmit] = useState(false);

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

    adicionarEspecie,
    removerEspecie,

    submitForm,
    salvando,
    erroSubmit,
    sucessoSubmit

};

}