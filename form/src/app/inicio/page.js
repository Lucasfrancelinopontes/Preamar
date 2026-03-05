"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";
import FeatureCard from "../components/FeatureCard";
import Footer from "../components/Footer";

export default function Inicio() {
  const router = useRouter();
  const { usuario, estaAutenticado, ehAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <Header />

      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white">
              <h2 className="text-3xl font-bold mb-2">Bem-vindo</h2>
              <p className="text-lg opacity-90">
                {estaAutenticado() 
                  ? `Olá, ${usuario?.nome}! Escolha uma das funcionalidades abaixo.`
                  : 'Faça login para acessar o sistema completo.'}
              </p>
            </div>

            <div className="p-8">
              {estaAutenticado() ? (
                <>
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Funcionalidades</h3>
                  </div>

                  <div className="flex flex-col gap-4 max-w-md mx-auto">
                    <FeatureCard
                      title="Novo Desembarque"
                      subtitle="Registrar novo desembarque"
                      onClick={() => router.push('/desembarque')}
                    />

                    {ehAdmin() && (
                      <FeatureCard
                        title="Visualizar Desembarques"
                        subtitle="Ver desembarques registrados"
                        onClick={() => router.push('/meus-desembarques')}
                      />
                    )}

                    {ehAdmin() && (
                      <FeatureCard
                        title="Dashboard & Análises"
                        subtitle=""
                        onClick={() => router.push('/analytics')}
                      />
                    )}

                    {ehAdmin() && (
                      <FeatureCard
                        title="Gerenciar Usuários"
                        subtitle=""
                        onClick={() => router.push('/usuarios')}
                      />
                    )}

                    {ehAdmin() && (
                      <FeatureCard
                        title="Gerenciar Espécies"
                        subtitle=""
                        onClick={() => router.push('/especies')}
                      />
                    )}

                    {ehAdmin() && (
                      <FeatureCard
                        title="Gerenciar Embarcações"
                        subtitle=""
                        onClick={() => router.push('/embarcacoes')}
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="mb-6">
                    <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h3>
                    <p className="text-gray-600 mb-6">Faça login para acessar o sistema de registro de desembarques.</p>
                  </div>
                  <button
                    onClick={() => router.push('/login')}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    Fazer Login
                  </button>
                </div>
              )}
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
}
