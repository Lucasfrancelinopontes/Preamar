"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, Home, FileText } from 'lucide-react';

export default function Sucesso() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-preamar-sand dark:bg-preamar-ocean-deep flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <Card className="border-0 shadow-lg text-center">
                    <CardContent className="p-12">
                        <div className="flex justify-center mb-6">
                            <div className="bg-preamar-success/10 p-6 rounded-full">
                                <CheckCircle className="w-16 h-16 text-preamar-success" />
                            </div>
                        </div>

                        <h1 className="text-preamar-ocean-deep dark:text-white mb-4 text-2xl font-bold">Desembarque Registrado com Sucesso!</h1>

                        <p className="text-preamar-ocean-deep/70 dark:text-white/70 mb-8 text-lg">
                            Seu registro de desembarque foi salvo e está disponível para consulta. Todas as informações foram armazenadas com segurança no sistema Preamar.
                        </p>

                        <div className="bg-preamar-sand dark:bg-preamar-ocean-deep/50 rounded-lg p-6 mb-8">
                            <div className="flex items-center justify-center gap-3 mb-3">
                                <FileText className="w-5 h-5 text-preamar-teal" />
                                <p className="text-preamar-ocean-deep dark:text-white">Número do Registro</p>
                            </div>
                            <h2 className="text-preamar-teal text-xl font-bold">#D-2026-0127</h2>
                            <p className="text-sm text-preamar-ocean-deep/70 dark:text-white/70 mt-2">
                                Data: 05/03/2026 às 14:32
                            </p>
                        </div>

                        <div className="flex gap-4 justify-center flex-col sm:flex-row">
                            <Button
                                onClick={() => router.push('/')}
                                className="h-12 px-8"
                            >
                                <Home className="w-5 h-5 mr-2" />
                                Voltar ao Início
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => router.push('/meus-desembarques')}
                                className="h-12 px-8"
                            >
                                <FileText className="w-5 h-5 mr-2" />
                                Ver Registro
                            </Button>
                        </div>

                        <div className="mt-8 pt-8 border-t border-preamar-ocean-deep/10 dark:border-white/10">
                            <p className="text-sm text-preamar-ocean-deep/70 dark:text-white/70">
                                Você pode acessar este e outros registros a qualquer momento através do menu "Meus Desembarques"
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}