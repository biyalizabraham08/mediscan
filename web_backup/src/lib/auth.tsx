import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { AuthState, User } from '../types';
import { supabase } from './supabase';
import { logout as sbLogout } from './mockData';

interface AuthContextType {
    authState: AuthState;
    isLoading: boolean;
    login: (user: User, token: string) => void;
    logout: () => Promise<void>;
    refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session && session.user.user_metadata?.custom_email_verified !== false) {
                setAuthState({
                    user: {
                        id: session.user.id,
                        email: session.user.email || '',
                        name: session.user.user_metadata.full_name || 'User',
                        createdAt: session.user.created_at,
                    },
                    token: session.access_token,
                    isAuthenticated: true,
                });
            } else if (session) {
                // Session exists but unverified, still consider unauthenticated in the UI
                setAuthState({ user: null, token: null, isAuthenticated: false });
            }
            setIsLoading(false);
        }).catch(err => {
            console.error("Supabase Session Error:", err);
            setIsLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session && session.user.user_metadata?.custom_email_verified !== false) {
                setAuthState({
                    user: {
                        id: session.user.id,
                        email: session.user.email || '',
                        name: session.user.user_metadata.full_name || 'User',
                        createdAt: session.user.created_at,
                    },
                    token: session.access_token,
                    isAuthenticated: true,
                });
            } else {
                setAuthState({ user: null, token: null, isAuthenticated: false });
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = useCallback((user: User, token: string) => {
        setAuthState({ user, token, isAuthenticated: true });
    }, []);

    const logout = useCallback(async () => {
        await sbLogout();
        setAuthState({ user: null, token: null, isAuthenticated: false });
    }, []);

    const refreshAuth = useCallback(async () => {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user.user_metadata?.custom_email_verified !== false) {
            setAuthState({
                user: {
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata.full_name || 'User',
                    createdAt: session.user.created_at,
                },
                token: session.access_token,
                isAuthenticated: true,
            });
        } else {
             setAuthState({ user: null, token: null, isAuthenticated: false });
        }
        setIsLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ authState, isLoading, login, logout, refreshAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
