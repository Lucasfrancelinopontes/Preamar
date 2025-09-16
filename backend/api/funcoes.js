import municipios from './municipios.json' with { type: 'json' };

export const gmun = async (req,res) => {
    console.log(municipios);
    res.json(municipios);
}
