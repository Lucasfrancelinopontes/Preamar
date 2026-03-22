// Exemplos de consultas úteis

import {
  Desembarque,
  Pescador,
  Embarcacao,
  Captura,
  Especie,
  sequelize
} from '../models/index.js';
import { Op } from 'sequelize';
import { connectDB } from '../db.js';

async function exemplosConsultas() {
  await connectDB();
  
  console.log('📊 Exemplos de Consultas\n');
  
  // 1. Desembarques do último mês
  console.log('1️⃣  Desembarques do último mês:');
  const umMesAtras = new Date();
  umMesAtras.setMonth(umMesAtras.getMonth() - 1);
  
  const desembarquesMes = await Desembarque.count({
    where: {
      data_coleta: {
        [Op.gte]: umMesAtras
      }
    }
  });
  console.log(`   Total: ${desembarquesMes}\n`);
  
  // 2. Top 5 pescadores mais ativos
  console.log('2️⃣  Top 5 pescadores mais ativos:');
  const topPescadores = await Pescador.findAll({
    attributes: [
      'nome',
      'apelido',
      [sequelize.fn('COUNT', sequelize.col('desembarques.ID_desembarque')), 'total']
    ],
    include: [{
      model: Desembarque,
      as: 'desembarques',
      attributes: []
    }],
    group: ['Pescador.ID_pescador'],
    order: [[sequelize.fn('COUNT', sequelize.col('desembarques.ID_desembarque')), 'DESC']],
    limit: 5,
    subQuery: false
  });
  
  topPescadores.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.nome} (${p.apelido}) - ${p.get('total')} desembarques`);
  });
  console.log('');
  
  // 3. Espécies mais capturadas
  console.log('3️⃣  Top 5 espécies mais capturadas (por peso):');
  const topEspecies = await Captura.findAll({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('peso_kg')), 'peso_total']
    ],
    include: [{
      model: Especie,
      as: 'especie',
      attributes: ['nome_popular', 'nome_cientifico']
    }],
    group: ['ID_especie'],
    order: [[sequelize.fn('SUM', sequelize.col('peso_kg')), 'DESC']],
    limit: 5
  });
  
  topEspecies.forEach((c, i) => {
    console.log(`   ${i + 1}. ${c.especie.nome_popular} - ${parseFloat(c.get('peso_total')).toFixed(2)} kg`);
  });
  console.log('');
  
  // 4. Valor total capturado por município
  console.log('4️⃣  Valor total capturado por município:');
  const valorPorMunicipio = await Desembarque.findAll({
    attributes: [
      'municipio',
      [sequelize.fn('COUNT', sequelize.col('ID_desembarque')), 'total_desembarques'],
      [sequelize.fn('SUM', sequelize.col('total_desembarque')), 'valor_total']
    ],
    group: ['municipio'],
    order: [[sequelize.fn('SUM', sequelize.col('total_desembarque')), 'DESC']]
  });
  
  valorPorMunicipio.forEach(d => {
    const valor = parseFloat(d.get('valor_total') || 0).toFixed(2);
    console.log(`   ${d.municipio}: R$ ${valor} (${d.get('total_desembarques')} desembarques)`);
  });
  console.log('');
  
  // 5. Média de tripulantes por tipo de embarcação
  console.log('5️⃣  Média de tripulantes por tipo de embarcação:');
  const mediaTripulantes = await Desembarque.findAll({
    attributes: [
      [sequelize.fn('AVG', sequelize.col('numero_tripulantes')), 'media_tripulantes']
    ],
    include: [{
      model: Embarcacao,
      as: 'embarcacao',
      attributes: ['tipo']
    }],
    group: ['embarcacao.tipo'],
    order: [[sequelize.fn('AVG', sequelize.col('numero_tripulantes')), 'DESC']]
  });
  
  mediaTripulantes.forEach(d => {
    const media = parseFloat(d.get('media_tripulantes')).toFixed(1);
    console.log(`   ${d.embarcacao.tipo}: ${media} tripulantes`);
  });
  console.log('');
  
  // 6. Desembarques por arte de pesca
  console.log('6️⃣  Desembarques por arte de pesca:');
  const porArte = await sequelize.query(`
    SELECT arte, COUNT(*) as total
    FROM desembarque_artes
    GROUP BY arte
    ORDER BY total DESC
  `, { type: sequelize.QueryTypes.SELECT });
  
  porArte.forEach(a => {
    console.log(`   ${a.arte}: ${a.total} registros`);
  });
  console.log('');
  
  // 7. Evolução mensal de capturas
  console.log('7️⃣  Evolução mensal de capturas (últimos 3 meses):');
  const evolucao = await sequelize.query(`
    SELECT 
      DATE_FORMAT(data_coleta, '%Y-%m') as mes,
      COUNT(*) as total_desembarques,
      SUM(total_desembarque) as valor_total
    FROM desembarques
    WHERE data_coleta >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
    GROUP BY DATE_FORMAT(data_coleta, '%Y-%m')
    ORDER BY mes DESC
  `, { type: sequelize.QueryTypes.SELECT });
  
  evolucao.forEach(e => {
    const valor = parseFloat(e.valor_total || 0).toFixed(2);
    console.log(`   ${e.mes}: ${e.total_desembarques} desembarques - R$ ${valor}`);
  });
  console.log('');
  
  // 8. Espécies ameaçadas capturadas
  console.log('8️⃣  Espécies ameaçadas capturadas (Vulnerável):');
  const especiesAmeacadas = await Captura.findAll({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('peso_kg')), 'peso_total'],
      [sequelize.fn('COUNT', sequelize.col('ID_captura')), 'num_capturas']
    ],
    include: [{
      model: Especie,
      as: 'especie',
      attributes: ['nome_popular', 'grau_ameaca'],
      where: {
        grau_ameaca: 'V'
      }
    }],
    group: ['ID_especie']
  });
  
  if (especiesAmeacadas.length > 0) {
    especiesAmeacadas.forEach(c => {
      console.log(`   ${c.especie.nome_popular}: ${parseFloat(c.get('peso_total')).toFixed(2)} kg (${c.get('num_capturas')} capturas)`);
    });
  } else {
    console.log('   Nenhuma espécie ameaçada capturada nos registros');
  }
  console.log('');
  
  process.exit(0);
}

// Executar
exemplosConsultas().catch(console.error);