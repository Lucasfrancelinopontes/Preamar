"use client"

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import Header from "../../components/Header";
import FeatureCard from "../../components/FeatureCard";
import Footer from "../../components/Footer";
import api from '@/services/api';
import BarChart from '@/components/charts/BarChart';
import LineChart from '@/components/charts/LineChart';
import StatsCards from '@/components/dashboard/StatsCards';

export default function Inicio() {
  const router = useRouter();
  const { usuario, estaAutenticado, ehAdmin } = useAuth();

  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState({
    desembarquesMes: 0,
    totalCapturadoKg: 0,
    embarcacoesAtivas: 0,
    crescimentoPct: 0
  });

  // Navegação direta para analytics (sem delays ou rotas intermediárias)
  const goAnalytics = () => {
    router.push('/analytics');
  };

  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      try {
        setLoadingStats(true);

        // Buscar desembarques e embarcações
        const desembarquesRes = await api.listarDesembarques();
        const embarcacoesRes = await api.getEmbarcacoes();

        const desembarques = Array.isArray(desembarquesRes) ? desembarquesRes : (desembarquesRes?.data || []);
        const embarcacoes = Array.isArray(embarcacoesRes) ? embarcacoesRes : (embarcacoesRes?.data || []);

        // Calcular desembarques no mês atual
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const isSameMonth = (dateStr) => {
          if (!dateStr) return false;
          const d = new Date(dateStr);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        };

        const desembarquesMes = desembarques.filter(d => isSameMonth(d.dataColeta || d.data || d.createdAt)).length;

        // Calcular total capturado (soma de capturas/individuos, tentando campos comuns)
        let totalGramas = 0;
        for (const d of desembarques) {
          const capturas = d.capturas || d.individuos || d.Capturas || [];
          if (Array.isArray(capturas) && capturas.length > 0) {
            for (const c of capturas) {
              if (c.peso_g) totalGramas += Number(c.peso_g) || 0;
              else if (c.peso) {
                // peso possivelmente em kg
                const v = Number(c.peso) || 0;
                totalGramas += (v > 1000) ? v : v * 1000; // heurística defensiva
              } else if (c.peso_kg) totalGramas += (Number(c.peso_kg) || 0) * 1000;
            }
          }
        }

        const totalCapturadoKg = Math.round((totalGramas / 1000) * 100) / 100; // duas casas

        // Embarcações ativas (usar length como fallback)
        const embarcacoesAtivas = embarcacoes.length;

        // Crescimento: comparar com mês anterior (por número de desembarques)
        const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
        const prevMonth = prevMonthDate.getMonth();
        const prevYear = prevMonthDate.getFullYear();

        const isPrevMonth = (dateStr) => {
          if (!dateStr) return false;
          const d = new Date(dateStr);
          return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
        };

        const prevCount = desembarques.filter(d => isPrevMonth(d.dataColeta || d.data || d.createdAt)).length;
        const crescimentoPct = prevCount === 0 ? 0 : Math.round(((desembarquesMes - prevCount) / prevCount) * 1000) / 10;

        // Montar séries para últimos 3 meses
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const labels = [];
        const counts = [];
        const capturasPorMes = [];

        for (let i = 2; i >= 0; i--) {
          const d = new Date(currentYear, currentMonth - i, 1);
          const m = d.getMonth();
          const y = d.getFullYear();
          labels.push(monthNames[m]);

          let monthCount = 0;
          let monthGramas = 0;

          for (const rec of desembarques) {
            const dateStr = rec.dataColeta || rec.data || rec.createdAt;
            if (!dateStr) continue;
            const dd = new Date(dateStr);
            if (dd.getMonth() === m && dd.getFullYear() === y) {
              monthCount++;
              const capturas = rec.capturas || rec.individuos || rec.Capturas || [];
              if (Array.isArray(capturas)) {
                for (const c of capturas) {
                  if (c.peso_g) monthGramas += Number(c.peso_g) || 0;
                  else if (c.peso) {
                    const v = Number(c.peso) || 0;
                    monthGramas += (v > 1000) ? v : v * 1000;
                  } else if (c.peso_kg) monthGramas += (Number(c.peso_kg) || 0) * 1000;
                }
              }
            }
          }

          counts.push(monthCount);
          capturasPorMes.push(Math.round((monthGramas / 1000) * 100) / 100);
        }

        if (!mounted) return;

        setStats({ desembarquesMes, totalCapturadoKg, embarcacoesAtivas, crescimentoPct, labels, counts, capturasPorMes });
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
      } finally {
        if (mounted) setLoadingStats(false);
      }
    };

    fetchStats();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-60 bg-teal-900 text-white px-4 py-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-teal-700 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8c2 2 4 2 6 0s4-2 6 0 4 2 6 0"></path>
            </svg>
          </div>
          <div>
            <h2 className="font-semibold">Preamar</h2>
            <p className="text-xs opacity-80">Gestão Pesqueira</p>
          </div>
        </div>

        <nav className="flex flex-col gap-4">
          <button onClick={() => router.push("/inicio")} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-teal-600">
            <span>Dashboard</span>
          </button>
          <button onClick={() => router.push("/meus-desembarques")} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-800/50">
            Meus Desembarques
          </button>
          <button onClick={() => router.push("/embarcacoes")} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-800/50">
            Embarcações
          </button>
          {ehAdmin() && (
            <>
              <button onClick={() => router.push("/especies")} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-800/50">
                Espécies
              </button>
              <button onClick={() => router.push("/usuarios")} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-teal-800/50">
                Usuários
              </button>
            </>
          )}
        </nav>

        <div className="mt-auto pt-6">
          <button onClick={() => router.push("/")} className="text-sm opacity-80">Sair</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500">Visão geral das atividades pesqueiras</p>
          </div>

          <div>
            <button onClick={() => router.push("/desembarque")} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
              + Novo Desembarque
            </button>
          </div>
        </div>

        {/* Cards */}
        <StatsCards
          items={loadingStats ? [
            { label: 'Desembarques (Mês)', value: '—' },
            { label: 'Total Capturado', value: '—' },
            { label: 'Embarcações Ativas', value: '—' },
            { label: 'Crescimento', value: '—' }
          ] : [
            { label: 'Desembarques (Mês)', value: stats.desembarquesMes },
            { label: 'Total Capturado', value: `${stats.totalCapturadoKg.toLocaleString()} kg` },
            { label: 'Embarcações Ativas', value: stats.embarcacoesAtivas },
            { label: 'Crescimento', value: `${stats.crescimentoPct >= 0 ? '+' : ''}${stats.crescimentoPct}%`, color: stats.crescimentoPct >= 0 ? 'text-green-600' : 'text-red-600' }
          ]}
        />

        {/* Charts / Content */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-4">Desembarques por Mês</h3>
            {loadingStats ? (
              <div className="h-48 flex items-center justify-center text-slate-500">Carregando...</div>
            ) : (
              <BarChart labels={stats.labels} values={stats.counts} />
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-4">Captura Total (kg)</h3>
            {loadingStats ? (
              <div className="h-48 flex items-center justify-center text-slate-500">Carregando...</div>
            ) : (
              <LineChart labels={stats.labels} values={stats.capturasPorMes} />
            )}
          </div>
        </div>

        {/* Function buttons */}
        <div className="mt-8 max-w-md">
          <FeatureCard title="Novo Desembarque" subtitle="Registrar novo desembarque" onClick={() => router.push("/desembarque")} />
          {ehAdmin() && <FeatureCard title="Visualizar Desembarques" subtitle="Ver desembarques registrados" onClick={() => router.push("/meus-desembarques")} />}
          {ehAdmin() && <FeatureCard title="Dashboard & Análises" subtitle="" onClick={goAnalytics} />}
          {ehAdmin() && <FeatureCard title="Gerenciar Usuários" subtitle="" onClick={() => router.push("/usuarios")} />}
          {ehAdmin() && <FeatureCard title="Gerenciar Espécies" subtitle="" onClick={() => router.push("/especies")} />}
          {ehAdmin() && <FeatureCard title="Gerenciar Embarcações" subtitle="" onClick={() => router.push("/embarcacoes")} />}
        </div>

        <Footer />
      </main>
    </div>
  );
}
