import { sequelize } from './db.js';
import { 
  Pescador, 
  Embarcacao, 
  Especie, 
  Petrecho, 
  Desembarque,
  DesembarqueArte,
  Captura,
  Individuo,
  Usuario,
  defineAssociations
} from './models/index.js';
import especiesData from './api/especies.json' with { type: 'json' };

// Definir associações antes de sincronizar
defineAssociations();

const forceSync = async () => {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados!');
    
    console.log('⚠️  ATENÇÃO: Todas as tabelas serão DELETADAS e RECRIADAS!');
    console.log('🔄 Sincronizando com force: true...');
    
    await sequelize.sync({ force: true });
    
    console.log('✅ Banco de dados sincronizado com sucesso!');
    console.log('');
    console.log('📋 Tabelas criadas:');
    console.log('   - pescadores');
    console.log('   - embarcacoes');
    console.log('   - especies');
    console.log('   - petrechos');
    console.log('   - desembarques (com municipio_code e localidade_code)');
    console.log('   - desembarque_artes');
    console.log('   - capturas (com com_tripa)');
    console.log('   - individuos (com comprimento_cm)');
    console.log('   - usuarios');
    console.log('');
    
    // Popular espécies
    console.log('📦 Populando espécies...');
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

    await Especie.bulkCreate(especies, { ignoreDuplicates: true });
    console.log(`✅ ${especies.length} espécies inseridas!`);
    
    // Popular petrechos
    console.log('📦 Populando petrechos...');
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
    await Petrecho.bulkCreate(petrechos, { ignoreDuplicates: true });
    console.log('✅ Petrechos inseridos!');
    
    // Criar usuário admin
    console.log('👤 Criando usuário administrador...');
    await Usuario.create({
      nome: 'Administrador',
      email: 'admin@preamar.com',
      senha: 'admin123',
      funcao: 'Administrador'
    });
    console.log('');
    console.log('================================================');
    console.log('   USUÁRIO ADMINISTRADOR CRIADO');
    console.log('================================================');
    console.log('   Email:    admin@preamar.com');
    console.log('   Senha:    admin123');
    console.log('================================================');
    console.log('');
    console.log('✅ Sincronização completa!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    process.exit(1);
  }
};

forceSync();
