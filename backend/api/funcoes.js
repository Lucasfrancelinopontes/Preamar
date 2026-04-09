import municipios from './municipios.json' with { type: 'json' };
import { Especie } from '../models/index.js';

export const gmun = async (req,res) => {
    console.log(municipios);
    res.json(municipios);
}

export const gesp = async (req,res) => {
    try {
        const especies = await Especie.findAll({
            order: [['nome_popular', 'ASC']],
            attributes: [
                'ID_especie',
                'familia',
                'nome_cientifico',
                'nome_popular',
                'genero',
                'habitat',
                'grau_ameaca',
                'nivel_trofico',
                'valor_comercial',
                'mercado',
                'comprimento_max_cm',
                'inicio_maturacao_cm',
                'pesca'
            ]
        });

        const especiesFormatadas = especies.map((especie) => ({
            ID: especie.ID_especie,
            Familia: especie.familia,
            Nome_cientifico: especie.nome_cientifico,
            Nome_popular: especie.nome_popular,
            Genero: especie.genero,
            Habitat: especie.habitat,
            Grau_de_ameaca: especie.grau_ameaca,
            Nivel_trofico: especie.nivel_trofico,
            Valor_comercial: especie.valor_comercial,
            Mercado: especie.mercado,
            Comprimento_max_cm: especie.comprimento_max_cm,
            Inicio_maturacao_cm: especie.inicio_maturacao_cm,
            Pesca: especie.pesca
        }));

        res.json(especiesFormatadas);
    } catch (error) {
        console.error('Erro ao buscar especies no banco:', error);
        res.status(500).json({
            message: 'Erro ao buscar especies'
        });
    }
}
