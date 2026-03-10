import { connectDB } from './db.js';
import { fileURLToPath } from 'url';
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
    
    // Se force: true, popular tabelas
    if (options.force) {
      console.log('Populando tabelas...');
      await seedEspecies();
      await seedPetrechos();
      await seedAdminUsuario();
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
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const alter = args.includes('--alter');
  const verify = args.includes('--verify') || args.includes('--verify-schema');

  (async () => {
    try {
      if (verify) {
        await verifySchema();
        console.log('Verificação de esquema completa!');
        process.exit(0);
      }

      await syncDatabase({ force, alter });
      console.log('Sincronização completa!');
      process.exit(0);
    } catch (error) {
      console.error('Erro na operação:', error);
      process.exit(1);
    }
  })();
}

// Verificar esquema: reimplementado aqui para evitar ficheiros dispersos
const verifySchema = async () => {
  try {
    await connectDB();
    console.log('✅ Conectado ao banco de dados!');
    console.log('');
    
    // Verificar colunas da tabela desembarques
    console.log('📋 Verificando estrutura da tabela DESEMBARQUES:');
    const [desembarqueColumns] = await sequelize.query(
      "DESCRIBE desembarques"
    );
    
    const importantColumns = ['municipio_code', 'localidade_code', 'quadrante1', 'quadrante2', 'quadrante3', 
                              'desp_diesel', 'desp_gasolina', 'litros', 'gelo_kg', 'rancho_valor',
                              'destino_pescado', 'destino_apelido', 'destino_outros_qual'];
    
    importantColumns.forEach(col => {
      const found = desembarqueColumns.find(c => c.Field === col);
      console.log(`   ${found ? '✅' : '❌'} ${col}: ${found ? found.Type : 'NÃO ENCONTRADO'}`);
    });
    
    console.log('');
    console.log('📋 Verificando estrutura da tabela CAPTURAS:');
    const [capturaColumns] = await sequelize.query(
      "DESCRIBE capturas"
    );
    
    const capturaImportant = ['ID_especie', 'peso_kg', 'preco_kg', 'preco_total', 'com_tripa'];
    capturaImportant.forEach(col => {
      const found = capturaColumns.find(c => c.Field === col);
      console.log(`   ${found ? '✅' : '❌'} ${col}: ${found ? found.Type : 'NÃO ENCONTRADO'}`);
    });
    
    console.log('');
    console.log('📋 Verificando estrutura da tabela INDIVIDUOS:');
    const [individuoColumns] = await sequelize.query(
      "DESCRIBE individuos"
    );
    
    const individuoImportant = ['ID_especie', 'peso_g', 'comprimento_cm'];
    individuoImportant.forEach(col => {
      const found = individuoColumns.find(c => c.Field === col);
      console.log(`   ${found ? '✅' : '❌'} ${col}: ${found ? found.Type : 'NÃO ENCONTRADO'}`);
    });
    
    console.log('');
    console.log('✅ Verificação completa!');
  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  }
};

const seedAdminUsuario = async () => {
  try {
    const adminExistente = await Usuario.findOne({ 
      where: { email: 'admin@preamar.com' } 
    });
    
    if (!adminExistente) {
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
    }
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
  }
};

export { syncDatabase, seedEspecies, seedPetrechos, seedAdminUsuario };