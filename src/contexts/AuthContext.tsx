import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import { User, AuthContextType } from '@/types';
import { colaboradorService } from '@/services/colaboradorService';

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

  const updateUserData = async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      try {
        // Buscar dados do usuário (users collection)
        let userData: any = null;
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            userData = userDoc.data();
          }
        } catch (e) {
          console.warn('Erro ao buscar dados básicos do usuário (users):', e);
        }

        // Tentar buscar dados do colaborador, mas sem falhar se não tiver permissão/não existir
        let colaboradorData = null;
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
          role: role
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
          role: 'recepcao'
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
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // O onAuthStateChanged vai ser chamado automaticamente e vai atualizar o estado
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // O onAuthStateChanged vai ser chamado automaticamente e vai limpar o estado
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Criar documento do usuário no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        displayName,
        email,
        role: 'recepcao',
        createdAt: new Date()
      });
      
      // O onAuthStateChanged vai ser chamado automaticamente
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    hasFilledForm,
    colaboradorName,
    isAdmin,
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
