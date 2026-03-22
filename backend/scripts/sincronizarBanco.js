// Script para sincronizar estrutura do banco com os modelos atualizados

import { connectDB } from '../db.js';
import {
  Pescador,
  Embarcacao, 
  Desembarque,
  DesembarqueArte,
  Captura,
  Individuo,
  Especie,
  Usuario,
  Petrecho
} from '../models/index.js';

async function sincronizarBanco() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await connectDB();
    
    console.log('🔧 Sincronizando modelos com o banco...');
    
    // Sincronizar modelos com alter: true para atualizar estrutura existente
    await Promise.all([
      Pescador.sync({ alter: true }),
      Embarcacao.sync({ alter: true }),
      Especie.sync({ alter: true }),
      Usuario.sync({ alter: true }),
      Petrecho.sync({ alter: true })
    ]);
    
    console.log('✅ Modelos básicos sincronizados');
    
    // Sincronizar modelos com foreign keys
    await Promise.all([
      Desembarque.sync({ alter: true }),
      DesembarqueArte.sync({ alter: true }),
      Captura.sync({ alter: true }),
      Individuo.sync({ alter: true })
    ]);
    
    console.log('✅ Modelos com relacionamentos sincronizados');
    
    console.log('');
    console.log('🎉 Sincronização concluída com sucesso!');
    console.log('');
    console.log('📊 Alterações aplicadas:');
    console.log('   - municipio: expandido para 50 caracteres');
    console.log('   - localidade: expandido para 50 caracteres');
    console.log('   - cod_desembarque: expandido para 100 caracteres');
    console.log('   - codigo_embarcacao: expandido para 100 caracteres');
    console.log('   - Melhor tratamento de conflitos de chave única');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro ao sincronizar banco:', error);
    console.error('');
    console.error('💡 Dicas:');
    console.error('   - Verifique se o banco está rodando');
    console.error('   - Confirme as credenciais do .env');
    console.error('   - Verifique se há conflitos de dados existentes');
    process.exit(1);
  }
}

// Executar
sincronizarBanco();