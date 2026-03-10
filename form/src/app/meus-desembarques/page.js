"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.js';
import { Button } from '@/components/ui/Button.js';
import { Input } from '@/components/ui/Input.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.js';
import { Badge } from '@/components/ui/badge.js';
import { Plus, Eye, Edit, Trash2, Search, ArrowLeft } from 'lucide-react';

function MeusDesembarquesContent() {
    const router = useRouter();
    const { user } = useAuth();
    const [desembarques, setDesembarques] = useState([]);
    const [pesquisaCodigoColeta, setPesquisaCodigoColeta] = useState('');
    const [desembarqueSelecionado, setDesembarqueSelecionado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { resolvedTheme, mounted } = useTheme();
    const [temaEscuro, setTemaEscuro] = useState(false);

    useEffect(() => {
        if (!mounted) return; 
        setTemaEscuro(resolvedTheme === 'dark');
    }, [resolvedTheme, mounted]);





    const desembarquesFiltrados = desembarques.filter((desembarque) => {
        const termo = (pesquisaCodigoColeta || '').trim().toLowerCase();
        if (!termo) return true;

        const codigo = (desembarque?.cod_desembarque || '').toString().toLowerCase();
        return codigo.includes(termo);
    });

    useEffect(() => {
        carregarDesembarques();
    }, []);

    const carregarDesembarques = async () => {
        try {
            const data = await api.listarDesembarques();
            
            if (data.data && data.data.length > 0) {
                // Ordenar por data mais recente
                const desembarquesOrdenados = [...data.data].sort((a, b) => 
                    new Date(b.data_coleta) - new Date(a.data_coleta)
                );
                setDesembarques(desembarquesOrdenados);
            } else {
                setDesembarques([]);
            }
            
            setLoading(false);
        } catch (err) {
            console.error('Erro ao carregar desembarques:', err);
            setError(err.message || 'Erro ao carregar desembarques');
            setLoading(false);
        }
    };

    const formatarData = (dataString) => {
        if (!dataString) return '-';
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    };

    const formatarDataHora = (dataString) => {
        if (!dataString) return '-';
        const data = new Date(dataString);
        return data.toLocaleString('pt-BR');
    };

    const formatarValor = (valor) => {
        if (!valor) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!confirm('Tem certeza que deseja excluir este desembarque? Esta ação não pode ser desfeita.')) return;
        
        try {
            await api.deletarDesembarque(id);
            setDesembarques(prev => prev.filter(d => d.ID_desembarque !== id));
            alert('Desembarque excluído com sucesso!');
        } catch (err) {
            console.error(err);
            alert('Erro ao excluir desembarque: ' + (err.message || 'Erro desconhecido'));
        }
    };

    const abrirDetalhes = (desembarque) => {
        setDesembarqueSelecionado(desembarque);
    };

    const fecharDetalhes = () => {
        setDesembarqueSelecionado(null);
    };

    return (
        <div className={`min-h-screen p-4 ${temaEscuro ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/')}
                            className="h-10 w-10"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Meus Desembarques
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Histórico de registros de desembarque
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => router.push('/desembarque')}
                        className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white h-12 px-6"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Novo Desembarque
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto">
                {loading && (
                    <Card className="border-0 shadow-sm">
                        <CardContent className="text-center py-16">
                            <div className="animate-spin w-8 h-8 border-4 border-[#FF6B35] border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-600">Carregando desembarques...</p>
                        </CardContent>
                    </Card>
                )}

                {error && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-medium text-red-800">Erro ao carregar dados</h3>
                                    <p className="text-red-600 text-sm mt-1">{error}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!loading && !error && desembarques.length === 0 && (
                    <Card className="border-0 shadow-sm">
                        <CardContent className="text-center py-16">
                            <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Nenhum desembarque registrado ainda
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Comece registrando seu primeiro desembarque de pesca
                            </p>
                            <Button
                                onClick={() => router.push('/desembarque')}
                                className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Registrar Primeiro Desembarque
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {!loading && !error && desembarques.length > 0 && (
                    <>
                        {/* Search Bar */}
                        <Card className="mb-6 border-0 shadow-sm">
                            <CardContent className="pt-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        type="text"
                                        placeholder="Pesquisar por código de coleta..."
                                        value={pesquisaCodigoColeta}
                                        onChange={(e) => setPesquisaCodigoColeta(e.target.value)}
                                        className="pl-10 h-12"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Table */}
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Código</TableHead>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Município</TableHead>
                                            <TableHead>Localidade</TableHead>
                                            <TableHead>Pescador</TableHead>
                                            <TableHead className="text-right">Valor Total</TableHead>
                                            <TableHead className="text-center">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {desembarquesFiltrados.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                                                    Nenhum desembarque encontrado para este código de coleta.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            desembarquesFiltrados.map((desembarque) => (
                                                <TableRow key={desembarque.cod_desembarque}>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="font-mono">
                                                            {desembarque.cod_desembarque}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {formatarData(desembarque.data_coleta)}
                                                    </TableCell>
                                                    <TableCell>{desembarque.municipio || '-'}</TableCell>
                                                    <TableCell>{desembarque.localidade || '-'}</TableCell>
                                                    <TableCell>{desembarque.pescador?.nome || '-'}</TableCell>
                                                    <TableCell className="text-right font-semibold text-green-600">
                                                        {formatarValor(desembarque.total_desembarque)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => router.push(`/meus-desembarques/${desembarque.ID_desembarque}`)}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => abrirDetalhes(desembarque)}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            {user?.funcao === 'admin' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => handleDelete(desembarque.ID_desembarque, e)}
                                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Modal de Detalhes */}
            {desembarqueSelecionado && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={fecharDetalhes}>
                    <div 
                        className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
                            temaEscuro ? 'bg-gray-800' : 'bg-white'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header do Modal */}
                        <div className={`sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between ${
                            temaEscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                            <h2 className={`text-xl font-bold ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                Detalhes do Desembarque
                            </h2>
                            <button 
                                onClick={fecharDetalhes}
                                className={`p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500 ${
                                    temaEscuro ? 'text-gray-300' : 'text-gray-600'
                                }`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>

                        {/* Conteúdo do Modal */}
                        <div className="p-6 space-y-6">
                            {/* Código e Data */}
                            <div className={`p-4 rounded-lg ${
                                temaEscuro ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm ${temaEscuro ? 'text-blue-300' : 'text-blue-700'}`}>
                                            Código de Desembarque
                                        </p>
                                        <p className={`text-lg font-mono font-bold ${temaEscuro ? 'text-blue-200' : 'text-blue-900'}`}>
                                            {desembarqueSelecionado.cod_desembarque}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm ${temaEscuro ? 'text-blue-300' : 'text-blue-700'}`}>
                                            Data de Coleta
                                        </p>
                                        <p className={`text-lg font-semibold ${temaEscuro ? 'text-blue-200' : 'text-blue-900'}`}>
                                            {formatarData(desembarqueSelecionado.data_coleta)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Local */}
                            <div>
                                <h3 className={`text-lg font-semibold mb-3 ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                    📍 Local
                                </h3>
                                <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${
                                    temaEscuro ? 'bg-gray-700' : 'bg-gray-50'
                                }`}>
                                    <div>
                                        <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Município</p>
                                        <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                            {desembarqueSelecionado.municipio || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Localidade</p>
                                        <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                            {desembarqueSelecionado.localidade || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Data de Saída</p>
                                        <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                            {formatarDataHora(desembarqueSelecionado.data_saida)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Data de Chegada</p>
                                        <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                            {formatarDataHora(desembarqueSelecionado.data_chegada)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Pescador */}
                            {desembarqueSelecionado.pescador && (
                                <div>
                                    <h3 className="heading-secondary">
                                        👤 Pescador
                                    </h3>
                                    <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${
                                        temaEscuro ? 'bg-gray-700' : 'bg-gray-50'
                                    }`}>
                                        <div>
                                            <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Nome</p>
                                            <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                {desembarqueSelecionado.pescador.nome || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>CPF</p>
                                            <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                {desembarqueSelecionado.pescador.cpf || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Apelido</p>
                                            <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                {desembarqueSelecionado.pescador.apelido || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Nascimento</p>
                                            <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                {formatarData(desembarqueSelecionado.pescador.nascimento)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Embarcação */}
                            {desembarqueSelecionado.embarcacao && (
                                <div>
                                    <h3 className="heading-secondary">
                                        ⛵ Embarcação
                                    </h3>
                                    <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${
                                        temaEscuro ? 'bg-gray-700' : 'bg-gray-50'
                                    }`}>
                                        <div>
                                            <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Nome</p>
                                            <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                {desembarqueSelecionado.embarcacao.nome_embarcacao || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Código</p>
                                            <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                {desembarqueSelecionado.embarcacao.codigo_embarcacao || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Tipo</p>
                                            <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                {desembarqueSelecionado.embarcacao.tipo || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Comprimento</p>
                                            <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                {desembarqueSelecionado.embarcacao.comprimento ? `${desembarqueSelecionado.embarcacao.comprimento}m` : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Proprietário</p>
                                            <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                {desembarqueSelecionado.proprietario || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Tripulantes</p>
                                            <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                {desembarqueSelecionado.numero_tripulantes || '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quadrantes */}
                            {(desembarqueSelecionado.quadrante1 || desembarqueSelecionado.quadrante2 || desembarqueSelecionado.quadrante3) && (
                                <div>
                                    <h3 className="heading-secondary">
                                        🗺️ Quadrantes de Pesca
                                    </h3>
                                    <div className={`flex gap-4 p-4 rounded-lg ${
                                        temaEscuro ? 'bg-gray-700' : 'bg-gray-50'
                                    }`}>
                                        {desembarqueSelecionado.quadrante1 && (
                                            <div className="badge-brand font-mono">
                                                {desembarqueSelecionado.quadrante1}
                                            </div>
                                        )}
                                        {desembarqueSelecionado.quadrante2 && (
                                            <div className="badge-brand font-mono">
                                                {desembarqueSelecionado.quadrante2}
                                            </div>
                                        )}
                                        {desembarqueSelecionado.quadrante3 && (
                                            <div className="badge-brand font-mono">
                                                {desembarqueSelecionado.quadrante3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Artes de Pesca */}
                            {desembarqueSelecionado.artes && desembarqueSelecionado.artes.length > 0 && (
                                <div>
                                    <h3 className="heading-secondary">
                                        🎣 Artes de Pesca
                                    </h3>
                                    <div className={`p-4 rounded-lg ${
                                        temaEscuro ? 'bg-gray-700' : 'bg-gray-50'
                                    }`}>
                                        {desembarqueSelecionado.artes.map((arte, index) => (
                                            <div key={index} className={`py-2 ${index > 0 ? 'border-t border-gray-600' : ''}`}>
                                                <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                    • {arte.arte} - Tamanho: {arte.tamanho}m
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Capturas */}
                            {desembarqueSelecionado.capturas && desembarqueSelecionado.capturas.length > 0 && (
                                <div>
                                    <h3 className="heading-secondary">
                                        🐟 Espécies Capturadas
                                    </h3>
                                    <div className={`p-4 rounded-lg space-y-3 ${
                                        temaEscuro ? 'bg-gray-700' : 'bg-gray-50'
                                    }`}>
                                        {desembarqueSelecionado.capturas.map((captura, index) => (
                                            <div key={index} className={`p-3 rounded ${
                                                temaEscuro ? 'bg-gray-600' : 'bg-white'
                                            }`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className={`font-semibold ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                                        {captura.especie?.Nome_popular || `Espécie #${captura.ID_especie}`}
                                                    </p>
                                                    <p className={`font-bold text-lg ${temaEscuro ? 'text-green-400' : 'text-green-600'}`}>
                                                        {formatarValor(captura.preco_total)}
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 text-sm">
                                                    <div>
                                                        <p className={temaEscuro ? 'text-gray-400' : 'text-gray-500'}>Peso</p>
                                                        <p className={temaEscuro ? 'text-gray-200' : 'text-gray-700'}>
                                                            {captura.peso_kg} kg
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className={temaEscuro ? 'text-gray-400' : 'text-gray-500'}>Preço/kg</p>
                                                        <p className={temaEscuro ? 'text-gray-200' : 'text-gray-700'}>
                                                            {formatarValor(captura.preco_kg)}
                                                        </p>
                                                    </div>
                                                    {captura.comprimento_cm && (
                                                        <div>
                                                            <p className={temaEscuro ? 'text-gray-400' : 'text-gray-500'}>Comprimento</p>
                                                            <p className={temaEscuro ? 'text-gray-200' : 'text-gray-700'}>
                                                                {captura.comprimento_cm} cm
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Despesas */}
                            <div>
                                <h3 className="heading-secondary">
                                    💰 Despesas
                                </h3>
                                <div className={`grid grid-cols-3 gap-4 p-4 rounded-lg ${
                                    temaEscuro ? 'bg-gray-700' : 'bg-gray-50'
                                }`}>
                                    <div>
                                        <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Combustível</p>
                                        <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                            {desembarqueSelecionado.litros ? `${desembarqueSelecionado.litros}L` : '-'}
                                        </p>
                                        <p className={`text-xs ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {desembarqueSelecionado.desp_diesel ? 'Diesel' : desembarqueSelecionado.desp_gasolina ? 'Gasolina' : ''}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Gelo</p>
                                        <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                            {desembarqueSelecionado.gelo_kg ? `${desembarqueSelecionado.gelo_kg} kg` : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={`text-sm ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>Rancho</p>
                                        <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                            {formatarValor(desembarqueSelecionado.rancho_valor)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Destino do Pescado */}
                            {desembarqueSelecionado.destino_pescado && (
                                <div>
                                    <h3 className="heading-secondary">
                                        🎯 Destino do Pescado
                                    </h3>
                                    <div className={`p-4 rounded-lg ${
                                        temaEscuro ? 'bg-gray-700' : 'bg-gray-50'
                                    }`}>
                                        <p className={`font-medium ${temaEscuro ? 'text-white' : 'text-gray-900'}`}>
                                            {desembarqueSelecionado.destino_pescado.charAt(0).toUpperCase() + desembarqueSelecionado.destino_pescado.slice(1)}
                                        </p>
                                        {desembarqueSelecionado.destino_apelido && (
                                            <p className={`text-sm mt-1 ${temaEscuro ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Apelido: {desembarqueSelecionado.destino_apelido}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Total */}
                            <div className="alert-success">
                                <div className="flex items-center justify-between">
                                    <p className={`text-lg font-semibold ${temaEscuro ? 'text-green-300' : 'text-green-800'}`}>
                                        Total do Desembarque:
                                    </p>
                                    <p className={`text-3xl font-bold ${temaEscuro ? 'text-green-400' : 'text-green-600'}`}>
                                        {formatarValor(desembarqueSelecionado.total_desembarque)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer do Modal */}
                        <div className={`sticky bottom-0 px-6 py-4 border-t ${
                            temaEscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                            <button
                                onClick={fecharDetalhes}
                                className="btn-primary w-full"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function MeusDesembarques() {
    return (
        <ProtectedRoute>
            <MeusDesembarquesContent />
        </ProtectedRoute>
    );
}
