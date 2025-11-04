import { connectDB } from '../db.js';
import { Usuario } from '../models/Usuario.js';

const criarAdminPadrao = async () => {
  try {
    await connectDB();
    
    console.log('🔍 Verificando se já existe um administrador...');
    
    const adminExistente = await Usuario.findOne({ 
      where: { funcao: 'Administrador' } 
    });
    
    if (adminExistente) {
      console.log('✅ Já existe um usuário administrador no sistema.');
      console.log(`   Email: ${adminExistente.email}`);
      process.exit(0);
    }
    
    console.log('📝 Criando usuário administrador padrão...');
    
    const admin = await Usuario.create({
      nome: 'Administrador',
      email: 'admin@preamar.com',
      senha: 'admin123',
      funcao: 'Administrador'
    });
    
    console.log('');
    console.log('✅ Usuário administrador criado com sucesso!');
    console.log('');
    console.log('================================================');
    console.log('   CREDENCIAIS DE ACESSO');
    console.log('================================================');
    console.log('   Email:    admin@preamar.com');
    console.log('   Senha:    admin123');
    console.log('================================================');
    console.log('');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    console.log('');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error);
    process.exit(1);
  }
};

criarAdminPadrao();