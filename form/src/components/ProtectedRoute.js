"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

export default function ProtectedRoute({ children, requiredRole = null }) {
    const router = useRouter();
    const { estaAutenticado, usuario, carregando } = useAuth();

    useEffect(() => {
        if (!carregando) {
            // Se não está autenticado, redirecionar para login
            if (!estaAutenticado()) {
                router.push('/login');
                return;
            }

            // Se uma role específica é requerida e o usuário não tem, redirecionar
            if (requiredRole && usuario?.funcao !== requiredRole) {
                router.push('/');
                return;
            }
        }
    }, [carregando, estaAutenticado, usuario, requiredRole, router]);

    // Mostrar loading enquanto verifica autenticação
    if (carregando) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verificando autenticação...</p>
                </div>
            </div>
        );
    }

    // Se não está autenticado ou não tem a role necessária, não renderizar nada
    // (o useEffect vai redirecionar)
    if (!estaAutenticado() || (requiredRole && usuario?.funcao !== requiredRole)) {
        return null;
    }

    return children;
}