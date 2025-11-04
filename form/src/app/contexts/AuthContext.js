"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

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
                setUsuario(JSON.parse(usuarioSalvo));
            }
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
        } finally {
            setCarregando(false);
        }
    };

    const login = async (email, senha) => {
        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao fazer login');
            }

            // Salvar token e usuário
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('usuario', JSON.stringify(data.data.usuario));

            setToken(data.data.token);
            setUsuario(data.data.usuario);

            return { success: true };
        } catch (error) {
            console.error('Erro no login:', error);
            return {
                success: false,
                message: error.message
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
            const response = await fetch('http://localhost:3001/api/auth/perfil', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsuario(data.data);
                localStorage.setItem('usuario', JSON.stringify(data.data));
            }
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