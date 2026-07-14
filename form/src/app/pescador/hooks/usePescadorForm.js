"use client";

import { useState } from "react";
import { initialState } from "../utils/initialState";

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
    return {

    formData,
    setFormData,

    handleInputChange,
    handleCheckboxChange,

    adicionarEspecie,
    removerEspecie

};

}