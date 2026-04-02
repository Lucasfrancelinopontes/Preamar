import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

(async () => {
  console.log('\n🔧 Alterando coluna `hp` para FLOAT na tabela `embarcacoes`...\n');

  try {
    const qi = sequelize.getQueryInterface();

    // Descrever a tabela para inspecionar o tipo atual (log útil)
    try {
      const desc = await qi.describeTable('embarcacoes');
      console.log('Coluna atual `hp`:', desc.hp || '(não encontrada)');
    } catch (e) {
      console.warn('Não foi possível descrever a tabela embarcacoes:', e.message || e);
    }

    await qi.changeColumn('embarcacoes', 'hp', {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Força do motor em HP'
    });

    console.log('\n✅ Coluna `hp` alterada com sucesso para FLOAT.\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro ao alterar coluna `hp`:\n', error);
    process.exit(1);
  }
})();
