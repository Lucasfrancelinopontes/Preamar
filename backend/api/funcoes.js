import { Especie, Municipio } from '../models/index.js';

export const gmun = async (req,res) => {
    try {
        const municipios = await Municipio.findAll({
            order: [['municipio', 'ASC']]
        });

        res.json(municipios.map((municipio) => ({
            municipio: municipio.municipio,
            municipioCode: municipio.municipioCode,
            localidades: Array.isArray(municipio.localidades) ? municipio.localidades : []
        })));
    } catch (error) {
        console.error('Erro ao buscar municipios no banco:', error);
        res.status(500).json({
            message: 'Erro ao buscar municipios'
        });
    }
}

export const gesp = async (req,res) => {
    try {
        const especies = await Especie.findAll({
            order: [['nome_popular', 'ASC']],
            attributes: [
                'ID_especie',
                'idd',
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
            IDD: especie.idd ?? especie.ID_especie,
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
