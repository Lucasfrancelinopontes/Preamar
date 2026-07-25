const API_BASE = process.env.API_BASE_URL || "http://localhost:3001/api";

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const message = data?.message || data?.error || `HTTP ${response.status}`;
    throw new Error(`${message} (${response.status})`);
  }

  return data;
}

function normalizeMunicipios(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
}

async function main() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const email = `copilot.peixaria.${stamp}@example.com`;
  const senha = "Teste@123";

  const registerPayload = {
    nome: "Copilot Teste",
    email,
    senha,
    telefone: "83999990000",
    funcao: "Coletor"
  };

  try {
    await requestJson(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerPayload)
    });
  } catch {
    // If register fails for any reason, try login anyway.
  }

  const login = await requestJson(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha })
  });

  const token = login?.data?.token;
  if (!token) {
    throw new Error("Token de autenticação não retornado no login.");
  }

  const municipiosResp = await requestJson(`${API_BASE}/municipios`);
  const municipios = normalizeMunicipios(municipiosResp);
  const primeiroMunicipio = municipios[0] || {};
  const primeiraLocalidade = Array.isArray(primeiroMunicipio.localidades)
    ? primeiroMunicipio.localidades[0] || {}
    : {};

  const codigo = `PEIXARIA-TESTE-${stamp}`;

  const payload = {
    cod_peixaria: codigo,
    tipo_estabelecimento: "PEIXARIA",
    ID_municipio: primeiroMunicipio.ID_municipio || null,
    responsavel: "Teste Automacao",
    contato: "83999991111",
    municipio: primeiroMunicipio.municipio || "Joao Pessoa",
    localidade: primeiraLocalidade.localidade || "Centro",
    nome: "Peixaria Teste Copilot",
    apelido: "Peixaria Demo",
    naturalidade: "PB",
    sexo: "Masculino",
    idade: 35,
    atividade_principal: "Comercio de pescado",
    atividade_secundaria: "Distribuicao",
    total_peixarias: 2,
    quantos_possui: 1,
    estado_civil: "Casado",
    numero_familiares: 4,
    escolaridade: "Ensino medio",
    local_moradia: "Zona urbana",
    possui_registro_inss: true,
    filiado_colonia: true,
    qual_colonia: "Colonia Z-01",
    participa_associacao: true,
    qual_associacao: "Associacao Local",
    possui_carteira_pescador: true,
    orgao_emissor_carteira: "MPA",
    possui_plano_saude: false,
    atividades_renda_familia: "Comercio e servicos",
    quem_trabalha_familia: "Casal",
    tempo_atividade: 10,
    atividade_comercial: "Atacado e varejo",
    periodo_comercializacao: "Anual",
    forma_venda: "Balcao",
    transporte: "Caminhonete",
    despesas: [
      { descricao: "Gelo", quantidade: 20, custo: 150.5, frequencia: "Semanal" }
    ],
    fornecedores: [
      { nome: "Fornecedor A", tipo: "Pescador local", telefone: "83990000001" }
    ],
    pescadores_entregam: [
      { apelido: "Neto", tipoBarco: "Lancha", numeroPescadores: 3, volumeMedio: 120.5, regularidade: "Diaria" }
    ],
    especies_comerciais: [
      { especie: "Tilapia", quantidade_fresco: 300, quantidade_congelado: 100, preco_compra: 12.5, preco_venda: 18.9 }
    ],
    origens_pescado: [
      { tipo: "Total pescado", pescadores_locais: "70", outras_localidades_pb: "20", outros_estados: "10", outro: "0" }
    ],
    relacoes_trabalho: ["Familiar"],
    mercado_local: {
      volume: 500,
      valor: 9450,
      observacoes: "Teste de insercao",
      linhas: [
        { especie: "Tilapia", forma_comercializacao: "Fresco", destino: "Mercado local", volume_medio: 80, preco_venda: 18.9 }
      ]
    }
  };

  const create = await requestJson(`${API_BASE}/peixarias`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const list = await requestJson(`${API_BASE}/peixarias?page=1&limit=10&codigo=${encodeURIComponent(codigo)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const registros = Array.isArray(list?.data) ? list.data : [];
  const registro = registros.find((item) => item?.cod_peixaria === codigo) || null;

  console.log(JSON.stringify({
    success: create?.success ?? false,
    message: create?.message || null,
    codigo,
    idPeixaria: create?.data?.ID_peixaria ?? null,
    municipio: payload.municipio,
    localidade: payload.localidade,
    encontradoNaListagem: Boolean(registro),
    totalNaBusca: registros.length
  }, null, 2));
}

main().catch((error) => {
  console.error("ERRO_CREATE_PEIXARIA:", error.message);
  process.exit(1);
});
