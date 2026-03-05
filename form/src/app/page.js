'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { estaAutenticado } = useAuth();

  useEffect(() => {
    if (estaAutenticado()) {
      router.push("/inicio");
    }
  }, [estaAutenticado, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-900 dark:bg-dark-bg dark:text-white">
      <div className="w-full max-w-md text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 mx-auto">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-9 w-9 text-brand-light">
            <path d="M3 8c2 2 4 2 6 0s4-2 6 0 4 2 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M3 12c2 2 4 2 6 0s4-2 6 0 4 2 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M3 16c2 2 4 2 6 0s4-2 6 0 4 2 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Preamar</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
          Sistema de Gestão Pesqueira
        </p>

        <p className="mt-6 text-sm text-slate-700">Bem-vindo ao sistema. Faça login para continuar.</p>

        <div className="mt-6">
          <button
            onClick={() => router.push("/login")}
            className="inline-flex w-full items-center justify-center rounded-md bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
          >
            Entrar
          </button>
        </div>
      </div>
    </main>
  );
}
