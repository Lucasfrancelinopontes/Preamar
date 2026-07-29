"use client";

import { useMemo, useState } from "react";

const normalizeText = (value) =>
    String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

const getSpeciesId = (especie) => String(especie?.IDD ?? especie?.ID ?? especie?.id ?? "").trim();
const getSpeciesName = (especie) => String(especie?.Nome_popular ?? especie?.nome_popular ?? especie?.nome ?? "").trim();
const getSpeciesScientific = (especie) => String(especie?.Nome_cientifico ?? especie?.nome_cientifico ?? especie?.cientifico ?? "").trim();

export const buildSpeciesLabel = (especie) => {
    const id = getSpeciesId(especie);
    const nome = getSpeciesName(especie);
    const cientifico = getSpeciesScientific(especie);
    const titulo = [id ? `#${id}` : "", nome].filter(Boolean).join(" - ");
    return {
        id,
        nome,
        cientifico,
        titulo: titulo || nome || id || "",
        textoBusca: titulo || nome || id || ""
    };
};

export default function SpeciesAutocomplete({
    options = [],
    value = "",
    onChange,
    onSelect,
    placeholder = "ID ou nome popular",
    disabled = false,
    inputClassName = "",
    dropdownClassName = "",
    labelClassName = "",
    emptyText = "Nenhuma espécie encontrada",
    limit = 10
}) {
    const [aberto, setAberto] = useState(false);

    const termo = String(value || "");
    const opcoesFiltradas = useMemo(() => {
        const busca = normalizeText(termo);
        if (!busca) return [];

        return (Array.isArray(options) ? options : [])
            .filter((especie) => {
                const id = normalizeText(getSpeciesId(especie));
                const nome = normalizeText(getSpeciesName(especie));
                return id.includes(busca) || nome.includes(busca);
            })
            .slice(0, limit);
    }, [limit, options, termo]);

    const selecionar = (especie) => {
        setAberto(false);
        onSelect?.(especie, buildSpeciesLabel(especie));
    };

    return (
        <div className="relative">
            <input
                type="text"
                value={termo}
                onChange={(e) => {
                    onChange?.(e.target.value);
                    if (!disabled) setAberto(true);
                }}
                onFocus={() => {
                    if (!disabled) setAberto(true);
                }}
                onBlur={() => {
                    setTimeout(() => setAberto(false), 180);
                }}
                placeholder={placeholder}
                disabled={disabled}
                className={inputClassName}
                autoComplete="off"
            />
            {aberto && !disabled && opcoesFiltradas.length > 0 && (
                <div className={`absolute left-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl ${dropdownClassName}`}>
                    {opcoesFiltradas.map((especie) => {
                        const label = buildSpeciesLabel(especie);
                        return (
                            <button
                                key={String(especie?.ID ?? especie?.IDD ?? label.titulo)}
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    selecionar(especie);
                                }}
                                className={`w-full border-b border-slate-100 px-3 py-2 text-left text-sm last:border-0 hover:bg-blue-50 ${labelClassName}`}
                            >
                                <span className="font-medium text-blue-700">{label.id ? `#${label.id}` : "-"}</span>
                                <span className="text-slate-600"> — {label.nome || "Sem nome popular"}</span>
                                {label.cientifico && (
                                    <span className="block text-xs italic text-slate-400">{label.cientifico}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
            {aberto && !disabled && opcoesFiltradas.length === 0 && normalizeText(termo) && (
                <div className={`absolute left-0 top-full z-50 mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-xl ${dropdownClassName}`}>
                    {emptyText}
                </div>
            )}
        </div>
    );
}