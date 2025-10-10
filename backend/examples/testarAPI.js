// Script para testar todos os endpoints da API

const API_URL = 'http://localhost:3001/api';

// Função auxiliar para fazer requests
async function request(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    return { error: error.message };
  }
}

// Dados de exemplo
const exemploDesembarque = {
  pescador: {
    nome: "João Teste da Silva",
    apelido: "João Teste",
    cpf: "123.456.789-09",
    nascimento: "1980-05-15",
    municipio: "João Pessoa"
  },
  embarcacao: {
    nome_embarcacao: "Estrela do Mar Teste",
    codigo_embarcacao: "TEST-001",
    proprietario: "João Teste",
    tipo: "bote",
    comprimento: 8.5,
    capacidade: 500,
    hp: 40,
    possui: "caixaTermica"
  },
  desembarque: {
    cod_desembarque: "JP-TU-10-10-25-99",
    municipio: "JP",
    localidade: "TU",
    data_coleta: "2025-10-10",
    consecutivo: 99,
    data_saida: "2025-10-09",
    hora_saida: "05:00:00",
    data_chegada: "2025-10-10",
    hora_desembarque: "14:30:00",
    numero_tripulantes: 3,
    pesqueiros: "Banco de Teste",
    lat_deg1: -7,
    lat_min1: 5,
    lat_sec1: 30.5,
    long_deg1: -34,
    long_min1: 50,
    long_sec1: 15.2,
    proprietario: "João Teste",
    apelido_proprietario: "João",
    atuou_pesca: "S",
    origem: "João Pessoa",
    desp_diesel: true,
    litros: 50,
    gelo_kg: 30,
    rancho_valor: 150.00,
    destino_pescado: "atravessador",
    destino_apelido: "Zé Teste",
    coletor: "Maria Teste",
    data_coletor: "2025-10-10"
  },
  artes: [
    {
      arte: "rede_fundeio",
      tamanho: "200",
      unidade: "m"
    }
  ],
  capturas: [
    {
      ID_especie: 24,
      peso_kg: 15.5,
      preco_kg: 12.00
    },
    {
      ID_especie: 45,
      peso_kg: 8.2,
      preco_kg: 15.00
    }
  ],
  individuos: [
    {
      ID_especie: 24,
      comprimento_padrao_cm: 45.5,
      peso_g: 1200,
      numero_individuo: 1
    },
    {
      ID_especie: 24,
      comprimento_padrao_cm: 48.0,
      peso_g: 1350,
      numero_individuo: 2
    }
  ]
};

// Testes
async function executarTestes() {
  console.log('🧪 Iniciando testes da API...\n');
  
  // 1. Testar endpoint raiz
  console.log('1️⃣  Testando endpoint raiz...');
  const root = await request('/', 'GET');
  console.log('Status:', root.status);
  console.log('Resposta:', root.data);
  console.log('');
  
  // 2. Listar municípios
  console.log('2️⃣  Listando municípios...');
  const municipios = await request('/municipios', 'GET');
  console.log('Status:', municipios.status);
  console.log('Total de municípios:', municipios.data?.length || 0);
  console.log('');
  
  // 3. Listar espécies
  console.log('3️⃣  Listando espécies...');
  const especies = await request('/especies', 'GET');
  console.log('Status:', especies.status);
  console.log('Total de espécies:', especies.data?.length || 0);
  console.log('');
  
  // 4. Criar desembarque
  console.log('4️⃣  Criando desembarque de teste...');
  const criar = await request('/desembarques', 'POST', exemploDesembarque);
  console.log('Status:', criar.status);
  console.log('Resposta:', criar.data);
  const desembarqueId = criar.data?.data?.ID_desembarque;
  console.log('');
  
  // 5. Listar desembarques
  console.log('5️⃣  Listando desembarques...');
  const listar = await request('/desembarques?limit=5', 'GET');
  console.log('Status:', listar.status);
  console.log('Total encontrado:', listar.data?.pagination?.total || 0);
  console.log('');
  
  // 6. Buscar desembarque específico
  if (desembarqueId) {
    console.log('6️⃣  Buscando desembarque criado...');
    const buscar = await request(`/desembarques/${desembarqueId}`, 'GET');
    console.log('Status:', buscar.status);
    console.log('Desembarque encontrado:', buscar.data?.data?.cod_desembarque);
    console.log('');
    
    // 7. Atualizar desembarque
    console.log('7️⃣  Atualizando desembarque...');
    const atualizar = await request(`/desembarques/${desembarqueId}`, 'PUT', {
      numero_tripulantes: 4,
      pesqueiros: "Banco Atualizado"
    });
    console.log('Status:', atualizar.status);
    console.log('Resposta:', atualizar.data?.message);
    console.log('');
  }
  
  // 8. Listar pescadores
  console.log('8️⃣  Listando pescadores...');
  const pescadores = await request('/pescadores', 'GET');
  console.log('Status:', pescadores.status);
  console.log('Total de pescadores:', pescadores.data?.data?.length || 0);
  console.log('');
  
  // 9. Listar embarcações
  console.log('9️⃣  Listando embarcações...');
  const embarcacoes = await request('/embarcacoes', 'GET');
  console.log('Status:', embarcacoes.status);
  console.log('Total de embarcações:', embarcacoes.data?.data?.length || 0);
  console.log('');
  
  // 10. Estatísticas
  console.log('🔟 Obtendo estatísticas...');
  const stats = await request('/desembarques/estatisticas?municipio=JP', 'GET');
  console.log('Status:', stats.status);
  console.log('Estatísticas:', stats.data?.data);
  console.log('');
  
  // 11. Deletar desembarque de teste (limpeza)
  if (desembarqueId) {
    console.log('🗑️  Deletando desembarque de teste...');
    const deletar = await request(`/desembarques/${desembarqueId}`, 'DELETE');
    console.log('Status:', deletar.status);
    console.log('Resposta:', deletar.data?.message);
    console.log('');
  }
  
  console.log('✅ Testes concluídos!');
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  executarTestes().catch(console.error);
}

export { executarTestes };