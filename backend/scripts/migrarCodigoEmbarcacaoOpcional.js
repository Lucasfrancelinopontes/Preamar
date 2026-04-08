import { sequelize } from '../db.js';

const migrarCodigoEmbarcacaoOpcional = async () => {
  console.log('\n🔄 Iniciando migração: codigo_embarcacao opcional...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco estabelecida');

    // Evita conflito de unicidade entre múltiplos valores vazios.
    await sequelize.query("UPDATE embarcacoes SET codigo_embarcacao = NULL WHERE TRIM(COALESCE(codigo_embarcacao, '')) = ''");
    console.log('✅ Valores vazios convertidos para NULL');

    await sequelize.query('ALTER TABLE embarcacoes MODIFY COLUMN codigo_embarcacao VARCHAR(100) NULL');
    console.log('✅ Coluna codigo_embarcacao alterada para aceitar NULL');

    const [colunas] = await sequelize.query("SHOW COLUMNS FROM embarcacoes LIKE 'codigo_embarcacao'");
    if (colunas?.[0]) {
      console.log(`ℹ️ Estrutura final: Type=${colunas[0].Type}, Null=${colunas[0].Null}, Key=${colunas[0].Key}`);
    }

    console.log('\n🎉 Migração concluída com sucesso!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro na migração de codigo_embarcacao:\n', error);
    process.exit(1);
  }
};

migrarCodigoEmbarcacaoOpcional();
