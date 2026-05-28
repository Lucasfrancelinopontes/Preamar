import fs from 'fs';
import { processarArquivoImportacao } from './utils/embarcacaoImportUtils.js';

(async () => {
  const buffer = fs.readFileSync('C:/Users/Labcrie/Downloads/embarcações atualizado-zorro-1.xlsx');
  const resultado = await processarArquivoImportacao(buffer, 'embarcações atualizado-zorro-1.xlsx');
  const vazios = resultado.linhas.filter(l => l.normalizado && typeof l.normalizado.nome_embarcacao === 'string' && l.normalizado.nome_embarcacao.trim() === '');
  console.log('linhas com nome vazio normalizado:', vazios.length);
  for (const v of vazios.slice(0,20)) console.log(JSON.stringify({linha:v.linha, original: v.original?.nome_da_embarcacao ?? v.original?.nome ?? null, nome_norm: v.normalizado.nome_embarcacao, avisos:v.avisos}));
})();
