import { connectDB } from './db.js';
import { 
  Pescador, 
  Embarcacao, 
  Especie, 
  Petrecho, 
  Desembarque,
  DesembarqueArte,
  Captura,
  Individuo,
  defineAssociations,
  sequelize
} from './models/index.js';
import especiesData from './api/especies.json' with { type: 'json' };

// Definir associações antes de sincronizar
defineAssociations();

const syncDatabase = async (options = {}) => {
  try {
    // Conectar ao banco
    await connectDB();
    
    console.log('Sincronizando modelos com o banco de dados...');
    
    // Opções de sincronização
    // { force: true } - dropa e recria todas as tabelas
    // { alter: true } - altera tabelas existentes para corresponder aos modelos
    await sequelize.sync(options);
    
    console.log('✅ Banco de dados sincronizado com sucesso!');
    
    // Se force: true, popular tabela de espécies
    if (options.force) {
      console.log('Populando tabela de espécies...');
      await seedEspecies();
      await seedPetrechos();
    }
    
  } catch (error) {
    console.error('❌ Erro ao sincronizar banco de dados:', error);
    throw error;
  }
};

const seedEspecies = async () => {
  try {
    const especies = especiesData.map(e => ({
      ID_especie: e.ID,
      familia: e.Familia,
      nome_cientifico: e.Nome_cientifico,
      nome_popular: e.Nome_popular,
      habitat: e.Habitat,
      grau_ameaca: e.Grau_de_ameaca,
      nivel_trofico: e.Nivel_trofico,
      valor_comercial: e.Valor_comercial,
      mercado: e.Mercado,
      comprimento_max_cm: e.Comprimento_max_cm,
      inicio_maturacao_cm: e.Inicio_maturacao_cm,
      pesca: e.Pesca
    }));

    await Especie.bulkCreate(especies, { 
      ignoreDuplicates: true,
      updateOnDuplicate: ['familia', 'nome_cientifico', 'nome_popular']
    });
    
    console.log(`✅ ${especies.length} espécies inseridas/atualizadas no banco de dados`);
  } catch (error) {
    console.error('❌ Erro ao popular espécies:', error);
  }
};

const seedPetrechos = async () => {
  const petrechos = [
    { petrecho: 'Rede - boiera', descricao: 'Rede de pesca tipo boiera' },
    { petrecho: 'Espinhel', descricao: 'Espinhel para pesca' },
    { petrecho: 'Mergulho', descricao: 'Pesca por mergulho' },
    { petrecho: 'Rede - Fundeio', descricao: 'Rede de fundeio' },
    { petrecho: 'Linha de mão', descricao: 'Pesca com linha de mão' },
    { petrecho: 'Rede - caçoeira', descricao: 'Rede tipo caçoeira' },
    { petrecho: 'Covo', descricao: 'Armadilha tipo covo' },
    { petrecho: 'Outras', descricao: 'Outros tipos de petrechos' }
  ];

  try {
    await Petrecho.bulkCreate(petrechos, { ignoreDuplicates: true });
    console.log('✅ Petrechos inseridos no banco de dados');
  } catch (error) {
    console.error('❌ Erro ao popular petrechos:', error);
  }
};

// Executar sincronização se chamado diretamente
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const alter = args.includes('--alter');
  
  syncDatabase({ force, alter })
    .then(() => {
      console.log('Sincronização completa!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro na sincronização:', error);
      process.exit(1);
    });
}

export { syncDatabase, seedEspecies, seedPetrechos };