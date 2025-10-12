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

export const formatarCPF = (cpf) => {
  cpf = cpf.replace(/\D/g, '');
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return cpf;
};

export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validarData = (data) => {
  if (!data) return false;
  const dataObj = new Date(data);
  return dataObj instanceof Date && !isNaN(dataObj);
};

export const validarDataSaidaChegada = (dataSaida, dataChegada) => {
  if (!dataSaida || !dataChegada) return true;
  const saida = new Date(dataSaida);
  const chegada = new Date(dataChegada);
  return chegada >= saida;
};

export const gerarCodigoDesembarque = (municipio, localidade, data, consecutivo) => {
  if (!municipio || !localidade || !data || !consecutivo) return '';
  
  const dataObj = new Date(data + 'T00:00:00');
  const dia = String(dataObj.getDate()).padStart(2, '0');
  const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
  const ano = String(dataObj.getFullYear()).slice(-2);
  const consec = String(consecutivo).padStart(2, '0');
  
  return `${municipio}-${localidade}-${dia}-${mes}-${ano}-${consec}`;
};

export const validarNumeroPositivo = (valor) => {
  const num = parseFloat(valor);
  return !isNaN(num) && num > 0;
};

export const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

export const formatarPeso = (valor) => {
  return `${parseFloat(valor).toFixed(2)} kg`;
};