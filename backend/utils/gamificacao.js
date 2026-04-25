const MARCOS_ENVIO = [1, 5, 10, 25, 50, 100];

const BADGES = {
  1: 'Primeiro Registro',
  5: 'Coletor Dedicado',
  10: 'Guardiao da Costa',
  25: 'Mestre do Desembarque',
  50: 'Capitao de Dados',
  100: 'Lenda Preamar'
};

export const getMarcosGamificacao = () => {
  return MARCOS_ENVIO.map((envios) => ({
    envios,
    badge: BADGES[envios]
  }));
};

export const calcularGamificacaoPorEnvios = (totalEnviosRaw) => {
  const totalEnvios = Number.parseInt(totalEnviosRaw, 10) || 0;
  const marcos = getMarcosGamificacao();

  const marcoAtual = [...marcos].reverse().find((marco) => totalEnvios >= marco.envios) || null;
  const proximoMarco = marcos.find((marco) => totalEnvios < marco.envios) || null;

  const nivelAtual = marcoAtual
    ? marcos.findIndex((marco) => marco.envios === marcoAtual.envios) + 2
    : 1;

  const totalMarcos = marcos.length;
  const marcosConquistados = marcos.filter((marco) => totalEnvios >= marco.envios);
  const progressoPercentual = proximoMarco
    ? Math.min(100, Math.max(0, ((totalEnvios - (marcoAtual?.envios || 0)) / (proximoMarco.envios - (marcoAtual?.envios || 0))) * 100))
    : 100;

  return {
    total_envios: totalEnvios,
    nivel_atual: nivelAtual,
    badge_atual: marcoAtual?.badge || null,
    marcos_conquistados: marcosConquistados,
    total_marcos: totalMarcos,
    progresso_percentual: Number(progressoPercentual.toFixed(2)),
    proximo_marco: proximoMarco
      ? {
          envios: proximoMarco.envios,
          badge: proximoMarco.badge,
          faltam: Math.max(0, proximoMarco.envios - totalEnvios)
        }
      : null,
    regra: {
      tipo: 'quantidade_envios',
      marcos
    }
  };
};
