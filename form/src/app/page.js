'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./contexts/AuthContext";
import Button from '@/components/ui/Button';
import LogoMark from '@/components/LogoMark';

export default function Home() {
  const router = useRouter();
  const { estaAutenticado } = useAuth();

  useEffect(() => {
    if (estaAutenticado()) {
      router.push("/inicio");
    }
  }, [estaAutenticado, router]);

  return (
    <main className="min-h-screen bg-[#F7F9FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-[#0B3B60] p-4 rounded-2xl">
            <LogoMark className="w-12 h-12 text-[#00A896]" />
          </div>
        </div>

        <h1 className="text-[#0B3B60] text-3xl font-semibold mb-2">Preamar</h1>
        <p className="text-[#5A7A92]">Sistema de Gestão Pesqueira</p>

        <p className="mt-6 text-sm text-[#5A7A92]">Bem-vindo ao sistema. Faça login para continuar.</p>

        <div className="mt-6">
          <Button
            onClick={() => router.push('/login')}
            className="w-full h-12 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
          >
            Entrar
          </Button>
        </div>
      </div>
    </main>
  );
}
