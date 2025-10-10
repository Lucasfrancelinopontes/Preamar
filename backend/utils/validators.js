// Validar CPF
export const validarCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  let soma = 0;
  let resto;
  
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;
  
  return true;
};

// Gerar código de desembarque
export const gerarCodigoDesembarque = (municipio, localidade, data, consecutivo) => {
  const dataObj = new Date(data);
  const dia = String(dataObj.getDate()).padStart(2, '0');
  const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
  const ano = String(dataObj.getFullYear()).slice(-2);
  const consec = String(consecutivo).padStart(2, '0');
  
  return `${municipio}-${localidade}-${dia}-${mes}-${ano}-${consec}`;
};

// Validar coordenadas
export const validarCoordenadas = (graus, minutos, segundos, tipo) => {
  const limiteGraus = tipo === 'lat' ? 90 : 180;
  
  if (graus < -limiteGraus || graus > limiteGraus) return false;
  if (minutos < 0 || minutos >= 60) return false;
  if (segundos < 0 || segundos >= 60) return false;
  
  return true;
};

// Converter coordenadas DMS para decimal
export const dmsParaDecimal = (graus, minutos, segundos) => {
  const decimal = Math.abs(graus) + (minutos / 60) + (segundos / 3600);
  return graus < 0 ? -decimal : decimal;
};

// Converter coordenadas decimal para DMS
export const decimalParaDMS = (decimal) => {
  const abs = Math.abs(decimal);
  const graus = Math.floor(abs);
  const minutosDecimal = (abs - graus) * 60;
  const minutos = Math.floor(minutosDecimal);
  const segundos = (minutosDecimal - minutos) * 60;
  
  return {
    graus: decimal < 0 ? -graus : graus,
    minutos,
    segundos: Math.round(segundos * 100) / 100
  };
};

// Validar dados de desembarque
export const validarDesembarque = (dados) => {
  const erros = [];
  
  if (!dados.municipio) erros.push('Município é obrigatório');
  if (!dados.localidade) erros.push('Localidade é obrigatória');
  if (!dados.data_coleta) erros.push('Data de coleta é obrigatória');
  if (!dados.consecutivo) erros.push('Consecutivo é obrigatório');
  
  // Validar datas
  if (dados.data_saida && dados.data_chegada) {
    const saida = new Date(dados.data_saida);
    const chegada = new Date(dados.data_chegada);
    if (chegada < saida) {
      erros.push('Data de chegada não pode ser anterior à data de saída');
    }
  }
  
  // Validar coordenadas se fornecidas
  if (dados.lat_deg1 !== undefined) {
    if (!validarCoordenadas(dados.lat_deg1, dados.lat_min1 || 0, dados.lat_sec1 || 0, 'lat')) {
      erros.push('Coordenadas de latitude inválidas');
    }
  }
  
  if (dados.long_deg1 !== undefined) {
    if (!validarCoordenadas(dados.long_deg1, dados.long_min1 || 0, dados.long_sec1 || 0, 'long')) {
      erros.push('Coordenadas de longitude inválidas');
    }
  }
  
  return {
    valido: erros.length === 0,
    erros
  };
};