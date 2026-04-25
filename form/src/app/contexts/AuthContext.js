"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

const AuthContext = createContext();

const GAMIFICACAO_INICIAL = {
    total_envios: 0,
    nivel_atual: 1,
    badge_atual: null,
    marcos_conquistados: [],
    total_marcos: 0,
    progresso_percentual: 0,
    proximo_marco: null
};

const normalizarUsuario = (usuario) => {
    if (!usuario) return null;

    const gamificacao = usuario.gamificacao || {};

    return {
        ...usuario,
        gamificacao: {
            ...GAMIFICACAO_INICIAL,
            ...gamificacao,
            marcos_conquistados: Array.isArray(gamificacao.marcos_conquistados)
                ? gamificacao.marcos_conquistados
                : []
        }
    };
};

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [token, setToken] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const router = useRouter();

    // Carregar dados do usuário ao iniciar
    useEffect(() => {
        carregarUsuario();
    }, []);

    const carregarUsuario = () => {
        try {
            const tokenSalvo = localStorage.getItem('token');
            const usuarioSalvo = localStorage.getItem('usuario');

            if (tokenSalvo && usuarioSalvo) {
                setToken(tokenSalvo);
                setUsuario(normalizarUsuario(JSON.parse(usuarioSalvo)));
            }
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
        } finally {
            setCarregando(false);
        }
    };

    const login = async (email, senha) => {
        try {
            const data = await api.login(email, senha);

            // Salvar token e usuário
            localStorage.setItem('token', data.data.token);
            const usuarioNormalizado = normalizarUsuario(data.data.usuario);

            localStorage.setItem('usuario', JSON.stringify(usuarioNormalizado));

            setToken(data.data.token);
            setUsuario(usuarioNormalizado);

            return { success: true };
        } catch (error) {
            console.error('Erro no login:', error);
            return {
                success: false,
                message: error.message || 'Erro ao fazer login'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setToken(null);
        setUsuario(null);
        router.push('/login');
    };

    const atualizarPerfil = async () => {
        try {
            const data = await api.obterPerfil();
            const usuarioNormalizado = normalizarUsuario(data.data);
            setUsuario(usuarioNormalizado);
            localStorage.setItem('usuario', JSON.stringify(usuarioNormalizado));
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
        }
    };

    const estaAutenticado = () => {
        return !!token && !!usuario;
    };

    const ehAdmin = () => {
        return usuario?.funcao === 'Administrador';
    };

    const temPermissao = (funcoesPermitidas) => {
        if (!usuario) return false;
        return funcoesPermitidas.includes(usuario.funcao);
    };

    const value = {
        usuario,
        token,
        carregando,
        login,
        logout,
        atualizarPerfil,
        estaAutenticado,
        ehAdmin,
        temPermissao
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}