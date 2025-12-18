const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Função para obter o token do localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Função para criar headers com autenticação
const getAuthHeaders = () => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async (response) => {
  // Se retornar 401 (não autorizado), redirecionar para login
  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login';
    throw new ApiError('Não autorizado', 401, null);
  }
  
  let data = null;
  let errorMessage = 'Erro na requisição';
  
  // Verificar se há conteúdo na resposta
  const contentType = response.headers.get('content-type');
  const hasContent = response.headers.get('content-length') !== '0';
  
  try {
    // Tentar parsear JSON se o content-type indicar JSON
    if (contentType && contentType.includes('application/json') && hasContent) {
      data = await response.json();
      errorMessage = data.message || data.error || errorMessage;
      
      // Tratamento especial para erros de banco de dados
      errorMessage = parseErrorMessage(errorMessage, data);
    } else if (hasContent) {
      // Se não for JSON, tentar ler como texto
      const text = await response.text();
      errorMessage = text || errorMessage;
      
      // Tentar parsear o texto como JSON (fallback)
      try {
        data = JSON.parse(text);
        errorMessage = data.message || data.error || errorMessage;
        errorMessage = parseErrorMessage(errorMessage, data);
      } catch {
        // Se não for JSON válido, manter o texto como mensagem
        data = { message: text };
        errorMessage = parseErrorMessage(text, data);
      }
    }
  } catch (parseError) {
    // Se falhar ao parsear, usar mensagens padrão baseadas no status
    console.error('Erro ao parsear resposta:', parseError);
    errorMessage = getErrorMessageByStatus(response.status);
  }
  
  // Se a resposta não for ok, lançar erro
  if (!response.ok) {
    throw new ApiError(
      typeof errorMessage === 'string' ? errorMessage : 'Erro na requisição',
      response.status,
      data
    );
  }
  
  return data;
};

// Função para interpretar mensagens de erro do banco de dados
const parseErrorMessage = (errorMessage, data) => {
  if (!errorMessage) return 'Erro na requisição';
  
  const errorStr = typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage);
  
  // Detectar erros de SequelizeDatabaseError ou Out of range
  if (errorStr.includes('SequelizeDatabaseError') || 
      errorStr.includes('Out of range') || 
      errorStr.includes('out of range')) {
    
    // Identificar campo específico se possível
    if (errorStr.includes('peso_g')) {
      return 'Peso muito alto ou inválido. O valor do peso excede o limite permitido pelo banco de dados (máximo: ~100 toneladas).';
    }
    if (errorStr.includes('comprimento')) {
      return 'Comprimento muito alto ou inválido. O valor excede o limite permitido pelo banco de dados (máximo: ~100 metros).';
    }
    
    return 'Um dos valores enviados excede o limite permitido pelo banco de dados. Verifique os valores de peso e comprimento.';
  }
  
  // Detectar erros de validação
  if (errorStr.includes('Validation error')) {
    return 'Erro de validação: um ou mais campos contêm valores inválidos.';
  }
  
  // Detectar erros de constraint
  if (errorStr.includes('constraint') || errorStr.includes('foreign key')) {
    return 'Erro de integridade: referência inválida a outro registro do banco de dados.';
  }
  
  return errorMessage;
};

// Função auxiliar para mensagens de erro padrão
const getErrorMessageByStatus = (status) => {
  const statusMessages = {
    400: 'Requisição inválida',
    401: 'Não autorizado',
    403: 'Acesso negado',
    404: 'Recurso não encontrado',
    500: 'Erro interno do servidor',
    502: 'Serviço indisponível',
    503: 'Serviço temporariamente indisponível'
  };
  
  return statusMessages[status] || `Erro ${status}: Falha na requisição`;
};

const api = {
  // ==================== AUTENTICAÇÃO ====================
  
  login: async (email, senha) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  },

  registrar: async (dados) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(dados)
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw error;
    }
  },

  obterPerfil: async () => {
    try {
      const response = await fetch(`${API_URL}/auth/perfil`, {
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      throw error;
    }
  },

  alterarSenha: async (senhaAtual, novaSenha) => {
    try {
      const response = await fetch(`${API_URL}/auth/senha`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ senhaAtual, novaSenha })
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      throw error;
    }
  },

  // ==================== USUÁRIOS ====================

  listarUsuarios: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros);
      const response = await fetch(`${API_URL}/usuarios?${params}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw error;
    }
  },

  criarUsuario: async (dados) => {
    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dados)
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  },

  atualizarUsuario: async (id, dados) => {
    try {
      const response = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(dados)
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  },

  deletarUsuario: async (id) => {
    try {
      const response = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  },

  // ==================== MUNICÍPIOS E ESPÉCIES ====================

  getMunicipios: async () => {
    try {
      const response = await fetch(`${API_URL}/municipios`);
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao buscar municípios:', error);
      throw error;
    }
  },

  getEspecies: async () => {
    try {
      const response = await fetch(`${API_URL}/especies`);
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao buscar espécies:', error);
      throw error;
    }
  },

  listarEspeciesAdmin: async () => {
    try {
      const response = await fetch(`${API_URL}/admin/especies`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao listar espécies (admin):', error);
      throw error;
    }
  },

  criarEspecie: async (dados) => {
    try {
      const response = await fetch(`${API_URL}/especies`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dados)
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao criar espécie:', error);
      throw error;
    }
  },

  atualizarEspecie: async (id, dados) => {
    try {
      const response = await fetch(`${API_URL}/especies/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(dados)
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao atualizar espécie:', error);
      throw error;
    }
  },

  excluirEspecie: async (id) => {
    try {
      const response = await fetch(`${API_URL}/especies/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao excluir espécie:', error);
      throw error;
    }
  },

  // ==================== DESEMBARQUE ====================

  criarDesembarque: async (dados) => {
    try {
      const response = await fetch(`${API_URL}/desembarques`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao criar desembarque:', error);
      throw error;
    }
  },

  atualizarDesembarque: async (id, dados) => {
    try {
      const response = await fetch(`${API_URL}/desembarques/${id}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao atualizar desembarque:', error);
      throw error;
    }
  },

  listarDesembarques: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros);
      const response = await fetch(`${API_URL}/desembarques?${params}`, {
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao listar desembarques:', error);
      throw error;
    }
  },

  getDesembarque: async (id) => {
    try {
      const response = await fetch(`${API_URL}/desembarques/${id}`, {
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao buscar desembarque:', error);
      throw error;
    }
  },

  deletarDesembarque: async (id) => {
    try {
      const response = await fetch(`${API_URL}/desembarques/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao deletar desembarque:', error);
      throw error;
    }
  },

  // ==================== EMBARCAÇÕES ====================

  getEmbarcacoes: async () => {
    try {
      const response = await fetch(`${API_URL}/embarcacoes`, {
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao buscar embarcações:', error);
      throw error;
    }
  },

  criarEmbarcacao: async (dados) => {
    try {
      const response = await fetch(`${API_URL}/embarcacoes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dados)
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao criar embarcação:', error);
      throw error;
    }
  },

  atualizarEmbarcacao: async (id, dados) => {
    try {
      const response = await fetch(`${API_URL}/embarcacoes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(dados)
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao atualizar embarcação:', error);
      throw error;
    }
  },

  excluirEmbarcacao: async (id) => {
    try {
      const response = await fetch(`${API_URL}/embarcacoes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao excluir embarcação:', error);
      throw error;
    }
  },

  listarEmbarcacoes: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros);
      const response = await fetch(`${API_URL}/embarcacoes?${params}`, {
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao listar embarcações:', error);
      throw error;
    }
  },

  getEmbarcacao: async (id) => {
    try {
      const response = await fetch(`${API_URL}/embarcacoes/${id}`, {
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao buscar embarcação:', error);
      throw error;
    }
  },

  // ==================== PESCADORES ====================

  criarPescador: async (dados) => {
    try {
      const response = await fetch(`${API_URL}/pescadores`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dados)
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao criar pescador:', error);
      throw error;
    }
  },

  listarPescadores: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros);
      const response = await fetch(`${API_URL}/pescadores?${params}`, {
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao listar pescadores:', error);
      throw error;
    }
  },

  getPescador: async (id) => {
    try {
      const response = await fetch(`${API_URL}/pescadores/${id}`, {
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao buscar pescador:', error);
      throw error;
    }
  }
};

export default api;