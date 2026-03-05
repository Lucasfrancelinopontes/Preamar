'use client'

import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import Header from "../../components/Header";
import FeatureCard from "../../components/FeatureCard";
import Footer from "../../components/Footer";

export default function Inicio() {
  const router = useRouter();
  const { usuario, estaAutenticado, ehAdmin } = useAuth();

  const goAnalyticsViaRoot = async () => {
    await router.push("/");
    await router.push("/analytics");
  };

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
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow">Desembarques (Mês)<div className="mt-3 text-2xl font-bold text-slate-800">127</div></div>
          <div className="bg-white p-6 rounded-xl shadow">Total Capturado<div className="mt-3 text-2xl font-bold text-slate-800">2.450 kg</div></div>
          <div className="bg-white p-6 rounded-xl shadow">Embarcações Ativas<div className="mt-3 text-2xl font-bold text-slate-800">34</div></div>
          <div className="bg-white p-6 rounded-xl shadow">Crescimento<div className="mt-3 text-2xl font-bold text-slate-800">+12.5%</div></div>
        </div>

        {/* Charts / Content */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-4">Desembarques por Mês</h3>
            <div className="h-48 bg-slate-50 rounded" />
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-4">Captura Total (kg)</h3>
            <div className="h-48 bg-slate-50 rounded" />
          </div>
        </div>

        {/* Function buttons */}
        <div className="mt-8 max-w-md">
          <FeatureCard title="Novo Desembarque" subtitle="Registrar novo desembarque" onClick={() => router.push("/desembarque")} />
          {ehAdmin() && <FeatureCard title="Visualizar Desembarques" subtitle="Ver desembarques registrados" onClick={() => router.push("/meus-desembarques")} />}
          {ehAdmin() && <FeatureCard title="Dashboard & Análises" subtitle="" onClick={goAnalyticsViaRoot} />}
          {ehAdmin() && <FeatureCard title="Gerenciar Usuários" subtitle="" onClick={() => router.push("/usuarios")} />}
          {ehAdmin() && <FeatureCard title="Gerenciar Espécies" subtitle="" onClick={() => router.push("/especies")} />}
          {ehAdmin() && <FeatureCard title="Gerenciar Embarcações" subtitle="" onClick={() => router.push("/embarcacoes")} />}
        </div>

        <Footer />
      </main>
    </div>
  );
}
