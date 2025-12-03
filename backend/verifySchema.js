import { sequelize } from './db.js';
import { Desembarque, Captura, Individuo } from './models/index.js';

const verifySchema = async () => {
  try {
    await sequelize.authenticate();
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
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

verifySchema();
