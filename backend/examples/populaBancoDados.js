// Script para popular banco com dados de exemplo

import {
  Pescador,
  Embarcacao,
  Desembarque,
  DesembarqueArte,
  Captura,
  Individuo
} from '../models/index.js';
import { connectDB } from '../db.js';

const dadosExemplo = {
  pescadores: [
    {
      nome: "José da Silva",
      apelido: "Zé",
      cpf: "111.111.111-11",
      nascimento: "1975-03-20",
      municipio: "João Pessoa"
    },
    {
      nome: "Maria Santos",
      apelido: "Mariazinha",
      cpf: "222.222.222-22",
      nascimento: "1982-07-15",
      municipio: "Cabedelo"
    },
    {
      nome: "Pedro Oliveira",
      apelido: "Pedrinho",
      cpf: "333.333.333-33",
      nascimento: "1968-11-30",
      municipio: "Conde"
    }
  ],
  
  embarcacoes: [
    {
      nome_embarcacao: "Estrela do Mar",
      codigo_embarcacao: "JP-001",
      proprietario: "José da Silva",
      tipo: "bote",
      comprimento: 8.5,
      capacidade: 500,
      hp: 40,
      possui: "caixaTermica"
    },
    {
      nome_embarcacao: "Vento Norte",
      codigo_embarcacao: "CB-002",
      proprietario: "Maria Santos",
      tipo: "jangada",
      comprimento: 6.0,
      capacidade: 200,
      hp: 25,
      possui: "urna"
    },
    {
      nome_embarcacao: "Mar Azul",
      codigo_embarcacao: "CO-003",
      proprietario: "Pedro Oliveira",
      tipo: "barco",
      comprimento: 12.0,
      capacidade: 1000,
      hp: 80,
      possui: "caixaTermica"
    }
  ]
};

async function popularBanco() {
  try {
    console.log('📦 Conectando ao banco de dados...');
    await connectDB();
    
    console.log('👤 Criando pescadores...');
    const pescadores = await Pescador.bulkCreate(dadosExemplo.pescadores, {
      ignoreDuplicates: true
    });
    console.log(`✅ ${pescadores.length} pescadores criados`);
    
    console.log('⛵ Criando embarcações...');
    const embarcacoes = await Embarcacao.bulkCreate(dadosExemplo.embarcacoes, {
      ignoreDuplicates: true
    });
    console.log(`✅ ${embarcacoes.length} embarcações criadas`);
    
    console.log('🎣 Criando desembarques de exemplo...');
    let totalDesembarques = 0;
    
    for (let i = 0; i < 10; i++) {
      const pescadorIndex = i % pescadores.length;
      const embarcacaoIndex = i % embarcacoes.length;
      
      const data = new Date();
      data.setDate(data.getDate() - i);
      const dataStr = data.toISOString().split('T')[0];
      
      const desembarque = await Desembarque.create({
        cod_desembarque: `JP-TU-${String(10-i).padStart(2, '0')}-10-25-${String(i+1).padStart(2, '0')}`,
        municipio: "JP",
        localidade: "TU",
        data_coleta: dataStr,
        consecutivo: i + 1,
        ID_pescador: pescadores[pescadorIndex].ID_pescador,
        ID_embarcacao: embarcacoes[embarcacaoIndex].ID_embarcacao,
        data_saida: dataStr,
        hora_saida: "05:00:00",
        data_chegada: dataStr,
        hora_desembarque: "14:00:00",
        numero_tripulantes: 2 + (i % 3),
        pesqueiros: `Banco ${i + 1}`,
        coletor: "Sistema Automático",
        data_coletor: dataStr
      });
      
      // Criar artes
      await DesembarqueArte.create({
        ID_desembarque: desembarque.ID_desembarque,
        arte: i % 2 === 0 ? "rede_fundeio" : "linha_mao",
        tamanho: String(100 + (i * 10)),
        unidade: "m"
      });
      
      // Criar capturas
      const capturas = [
        {
          ID_desembarque: desembarque.ID_desembarque,
          ID_especie: 24, // Dourado
          peso_kg: 10 + (i * 2),
          preco_kg: 12.00
        },
        {
          ID_desembarque: desembarque.ID_desembarque,
          ID_especie: 45, // Ariacó
          peso_kg: 5 + i,
          preco_kg: 15.00
        }
      ];
      
      for (const captura of capturas) {
        captura.preco_total = captura.peso_kg * captura.preco_kg;
        await Captura.create(captura);
      }
      
      // Atualizar total do desembarque
      const total = capturas.reduce((sum, c) => sum + c.preco_total, 0);
      await desembarque.update({ total_desembarque: total });
      
      totalDesembarques++;
    }
    
    console.log(`✅ ${totalDesembarques} desembarques criados com sucesso!`);
    console.log('');
    console.log('🎉 Banco de dados populado com sucesso!');
    console.log('');
    console.log('📊 Resumo:');
    console.log(`   - ${pescadores.length} pescadores`);
    console.log(`   - ${embarcacoes.length} embarcações`);
    console.log(`   - ${totalDesembarques} desembarques`);
    console.log(`   - ${totalDesembarques * 2} capturas`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro ao popular banco:', error);
    process.exit(1);
  }
}

// Executar
popularBanco();