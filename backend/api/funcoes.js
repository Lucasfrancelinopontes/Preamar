import municipios from './municipios.json' with { type: 'json' };
import especies from './especies.json' with { type: 'json' };

export const gmun = async (req,res) => {
    console.log(municipios);
    res.json(municipios);
}

export const gesp = async (req,res) => {
    console.log(especies);
    res.json(especies);
}
