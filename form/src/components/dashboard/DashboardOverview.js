"use client";

import { useEffect, useState } from 'react';
import api from '@/services/api';
import StatsCards from './StatsCards';
import BarChart from '@/components/charts/BarChart';
import LineChart from '@/components/charts/LineChart';

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [desembarques, setDesembarques] = useState([]);
  const [embarcacoes, setEmbarcacoes] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    let mounted = true;

    const carregar = async () => {
      try {
        setLoading(true);
        const dRes = await api.listarDesembarques();
        const eRes = await api.getEmbarcacoes();
        const d = Array.isArray(dRes) ? dRes : (dRes?.data || []);
        const e = Array.isArray(eRes) ? eRes : (eRes?.data || []);
        if (!mounted) return;
        setDesembarques(d);
        setEmbarcacoes(e);

        // Estatisticas gerais
        const total = d.length;
        const receita = d.reduce((s, r) => s + (parseFloat(r.total_desembarque) || 0), 0);
        const pesoTotal = d.reduce((s, r) => {
          if (Array.isArray(r.capturas)) return s + r.capturas.reduce((a, c) => a + (parseFloat(c.peso_kg) || 0), 0);
          return s;
        }, 0);
        const pescadoresUnicos = new Set(d.map(x => x.ID_pescador).filter(Boolean)).size;
        const embarcacoesUnicas = new Set(d.map(x => x.ID_embarcacao).filter(Boolean)).size;
        const ticketMedio = total > 0 ? receita / total : 0;

        // Desembarques por município (top 6)
        const byMun = {};
        d.forEach(r => {
          const m = r.municipio || 'Não informado';
          byMun[m] = (byMun[m] || 0) + 1;
        });
        const municipios = Object.entries(byMun).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([nome, qtd])=>({ nome, qtd }));

        // Séries últimos 3 meses
        const now = new Date();
        const labels = [];
        const counts = [];
        const capturasPorMes = [];
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        for (let i = 2; i >= 0; i--) {
          const dt = new Date(now.getFullYear(), now.getMonth()-i, 1);
          const m = dt.getMonth();
          const y = dt.getFullYear();
          labels.push(monthNames[m]);

          let monthCount = 0;
          let monthGramas = 0;
          d.forEach(rec => {
            const dateStr = rec.dataColeta || rec.data || rec.createdAt || rec.data_coleta;
            if (!dateStr) return;
            const dd = new Date(dateStr);
            if (dd.getMonth() === m && dd.getFullYear() === y) {
              monthCount++;
              const caps = rec.capturas || rec.individuos || [];
              if (Array.isArray(caps)) caps.forEach(c => {
                if (c.peso_kg) monthGramas += Number(c.peso_kg) || 0;
                else if (c.peso) { const v = Number(c.peso)||0; monthGramas += (v>1000? v: v*1000); }
              });
            }
          });
          counts.push(monthCount);
          capturasPorMes.push(Math.round((monthGramas/1000)*100)/100);
        }

        if (!mounted) return;
        setStats({ total, receita, pesoTotal, pescadoresUnicos, embarcacoesUnicas, ticketMedio, municipios, labels, counts, capturasPorMes });
      } catch (err) {
        console.error('Erro carregar dashboard:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    carregar();
    return ()=> mounted=false;
  }, []);

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500">Visão geral das atividades pesqueiras</p>
          </div>
        </div>

        <StatsCards items={loading ? [
          { label: 'Desembarques (Mês)', value: '—' },
          { label: 'Total Capturado', value: '—' },
          { label: 'Embarcações Ativas', value: '—' },
          { label: 'Crescimento', value: '—' }
        ] : [
          { label: 'Total Desembarques', value: stats.total },
          { label: 'Receita Total', value: stats.receita ? new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(stats.receita) : '—', color: 'text-green-600' },
          { label: 'Peso Total', value: stats.pesoTotal ? `${stats.pesoTotal.toFixed(2)} kg` : '—' },
          { label: 'Pescadores', value: stats.pescadoresUnicos }
        ]} />

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-4">Desembarques por Mês</h3>
            {loading ? <div className="h-48 flex items-center justify-center text-slate-500">Carregando...</div> : <BarChart labels={stats.labels} values={stats.counts} />}
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-4">Captura Total (kg)</h3>
            {loading ? <div className="h-48 flex items-center justify-center text-slate-500">Carregando...</div> : <LineChart labels={stats.labels} values={stats.capturasPorMes} />}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Desembarques por Município</h3>
          {loading ? (
            <div className="h-32 flex items-center justify-center text-slate-500">Carregando...</div>
          ) : (
            <div className="space-y-3">
              {stats.municipios && stats.municipios.map((m, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="w-full mr-4">
                    <div className="text-sm text-slate-600 mb-1">{m.nome}</div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${Math.min(100, (m.qtd / (stats.municipios[0]?.qtd || 1))*100)}%` }} />
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 ml-4">{m.qtd}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
