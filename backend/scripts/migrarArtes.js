/**
 * Corrige o ENUM da coluna 'arte' em desembarque_artes:
 * - Renomeia 'rede_boirea' → 'rede_boiera'
 * - Adiciona valores faltantes: 'espinhel', 'mergulho'
 * Uso: node backend/scripts/migrarEnumArtes.js
 */

import { connectDB } from '../db.js';
import { sequelize } from '../models/index.js';

const migrar = async () => {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await connectDB();

    // 1. Corrigir dados existentes com o typo antes de alterar o ENUM
    console.log("🔧 Corrigindo registros com 'rede_boirea' → 'rede_boiera'...");
    const [updated] = await sequelize.query(`
      UPDATE desembarque_artes SET arte = 'rede_boiera' WHERE arte = 'rede_boirea'
    `);
    console.log(`   ✅ ${updated.affectedRows ?? 0} registro(s) corrigido(s)`);

    // 2. Alterar o ENUM com todos os valores corretos
    console.log('🔧 Atualizando definição do ENUM...');
    await sequelize.query(`
      ALTER TABLE desembarque_artes
      MODIFY COLUMN arte ENUM(
        'rede_boiera',
        'espinhel',
        'mergulho',
        'espinhel_mergulho',
        'rede_fundeio',
        'linha_mao',
        'rede_cacoaria',
        'covo',
        'outras'
      ) NOT NULL
    `);

    console.log('✅ ENUM atualizado com sucesso!');
    console.log('   Valores aceitos agora:');
    [
      'rede_boiera',
      'espinhel',
      'mergulho',
      'espinhel_mergulho',
      'rede_fundeio',
      'linha_mao',
      'rede_cacoaria',
      'covo',
      'outras',
    ].forEach((v) => console.log(`   - ${v}`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    process.exit(1);
  }
};

migrar();