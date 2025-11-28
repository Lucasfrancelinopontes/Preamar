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

// Validar coordenadas decimais
export const validarCoordenadasDecimal = (lat, long) => {
  if (lat !== undefined && lat !== null) {
    if (lat < -90 || lat > 90) return false;
  }
  if (long !== undefined && long !== null) {
    if (long < -180 || long > 180) return false;
  }
  return true;
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
  
  // Validar coordenadas decimais
  if (dados.lat_ida !== undefined || dados.long_ida !== undefined) {
    if (!validarCoordenadasDecimal(dados.lat_ida, dados.long_ida)) {
      erros.push('Coordenadas de ida inválidas (Latitude: -90 a 90, Longitude: -180 a 180)');
    }
  }

  if (dados.lat_volta !== undefined || dados.long_volta !== undefined) {
    if (!validarCoordenadasDecimal(dados.lat_volta, dados.long_volta)) {
      erros.push('Coordenadas de volta inválidas (Latitude: -90 a 90, Longitude: -180 a 180)');
    }
  }
  
  return {
    valido: erros.length === 0,
    erros
  };
};