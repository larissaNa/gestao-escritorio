import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/model/services/firebase';
import { User, AuthContextType, UserPermission } from '@/model/entities';
import { colaboradorService } from '@/model/services/colaboradorService';
import { userRepository } from '@/model/repositories/userRepository';
import type { ColaboradorData } from '@/model/services/colaboradorService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasFilledForm, setHasFilledForm] = useState(false);
  const [colaboradorName, setColaboradorName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  type UserDoc = {
    displayName?: string;
    role?: User['role'];
    permissions?: UserPermission[];
    email?: string;
    createdAt?: unknown;
    hasFilledForm?: boolean;
  };

  const canAccessPath = (pathname: string) => {
    if (!pathname) return true;
    if (pathname === '/perfil' || pathname === '/formulario') return true;
    if (pathname.startsWith('/admin-')) return isAdmin;
    if (isAdmin) return true;

    const permissions = user?.permissions;
    if (!permissions) return true;

    const hasPrefix = (prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

    const permissionMatchers: Record<UserPermission, () => boolean> = {
      dashboard: () => pathname === '/',
      atendimentos: () => hasPrefix('/atendimentos'),
      relatorios: () => hasPrefix('/relatorio'),
      servicos: () => hasPrefix('/servicos'),
      cadastro: () => hasPrefix('/beneficios') || hasPrefix('/concessoes'),
      acoes_advogados: () => hasPrefix('/acoes-advogados'),
      processos_advogados: () => hasPrefix('/processos-advogados'),
      financeiro: () => hasPrefix('/financeiro'),
      idas_banco: () => hasPrefix('/idas-banco'),
    };

    return permissions.some((p) => permissionMatchers[p]?.() ?? false);
  };

  const updateUserData = async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      try {
        // Buscar dados do usuário (users collection)
        let userData: UserDoc | null = null;
        try {
          userData = await userRepository.getById(firebaseUser.uid);
        } catch (e) {
          console.warn('Erro ao buscar dados básicos do usuário (users):', e);
        }

        // Tentar buscar dados do colaborador, mas sem falhar se não tiver permissão/não existir
        let colaboradorData: ColaboradorData | null = null;
        let formFilled = false;
        let nomeCompleto = '';
        let adminStatus = false;

        try {
          // Usamos Promise.allSettled para que uma falha não derrube as outras
          const results = await Promise.allSettled([
            colaboradorService.getColaboradorByUserId(firebaseUser.uid),
            colaboradorService.hasFilledForm(firebaseUser.uid),
            colaboradorService.getNomeCompleto(firebaseUser.uid),
            colaboradorService.isAdmin(firebaseUser.uid)
          ]);

          colaboradorData = results[0].status === 'fulfilled' ? results[0].value : null;
          formFilled = results[1].status === 'fulfilled' ? results[1].value : false;
          nomeCompleto = results[2].status === 'fulfilled' ? results[2].value : '';
          adminStatus = results[3].status === 'fulfilled' ? results[3].value : false;
        } catch (e) {
          console.warn('Erro ao buscar dados do colaboradorService:', e);
        }

        // Prioridade para dados do colaborador, fallback para dados do usuário (criados pelo admin)
        // Se o usuário foi criado pelo Admin, ele tem role em userData.role
        // Mas se ele ainda não preencheu o formulário, colaboradorData será null
        
        const role = colaboradorData?.role || userData?.role || 'recepcao';

        // Se o usuário tem flag hasFilledForm no userData, respeitar (para evitar query extra se possível, mas aqui já fizemos)
        // O adminAuthService define hasFilledForm: false no userData

        const userWithRole: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || userData?.displayName || nomeCompleto,
          role: role,
          permissions: userData?.permissions
        };
        
        setUser(userWithRole);
        setHasFilledForm(formFilled);
        setColaboradorName(nomeCompleto || userData?.displayName || '');
        setIsAdmin(adminStatus || role === 'admin');
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        // Se não conseguir buscar dados do Firestore, usar dados básicos do Firebase Auth
        const userWithRole: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || undefined,
          role: 'recepcao',
          permissions: undefined
        };
        setUser(userWithRole);
        setHasFilledForm(false);
        setColaboradorName('');
        setIsAdmin(false);
      }
    } else {
      setUser(null);
      setHasFilledForm(false);
      setColaboradorName('');
      setIsAdmin(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      await updateUserData(firebaseUser);
    });

    return unsubscribe;
  }, []);

  const refreshUser = async () => {
    await updateUserData(auth.currentUser);
  };

  const login = async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const register = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await userRepository.save(user.uid, {
      displayName,
      email,
      role: 'recepcao',
      createdAt: new Date()
    });
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const value: AuthContextType = {
    user,
    loading,
    hasFilledForm,
    colaboradorName,
    isAdmin,
    canAccessPath,
    login,
    logout,
    register,
    refreshUser,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


