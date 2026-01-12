import { initializeApp, getApp, getApps, deleteApp, FirebaseApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db, firebaseConfig } from "./firebase";

// Nome para a instância secundária do app Firebase
const SECONDARY_APP_NAME = "secondaryApp";

export const adminAuthService = {
  /**
   * Cria um novo usuário sem deslogar o usuário atual (Admin).
   * Utiliza uma instância secundária do Firebase App.
   */
  createUser: async (
    email: string, 
    password: string, 
    displayName: string, 
    role: string
  ) => {
    let secondaryApp: FirebaseApp;
    
    // Verificar se já existe uma instância com esse nome (para evitar erros de duplicidade)
    const existingApps = getApps();
    const existingApp = existingApps.find(app => app.name === SECONDARY_APP_NAME);
    
    if (existingApp) {
      secondaryApp = existingApp;
    } else {
      secondaryApp = initializeApp(firebaseConfig, SECONDARY_APP_NAME);
    }

    const secondaryAuth = getAuth(secondaryApp);

    try {
      // 1. Criar o usuário na autenticação
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const user = userCredential.user;

      // 2. Atualizar o perfil do usuário (displayName)
      await updateProfile(user, {
        displayName: displayName
      });

      // 3. Salvar dados no Firestore (usando a instância principal do db)
      // Definimos hasFilledForm como false explicitamente
      await setDoc(doc(db, 'users', user.uid), {
        displayName,
        email,
        role,
        createdAt: new Date(),
        hasFilledForm: false
      });

      // 4. Deslogar da instância secundária para não manter sessão ativa
      await signOut(secondaryAuth);

      return user;
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      throw error;
    } finally {
      // Opcional: deletar o app secundário se não for reutilizar frequentemente
      // await deleteApp(secondaryApp); 
      // Manter a instância pode ser mais performático se for criar vários usuários, 
      // mas vamos deixar assim por segurança de memória por enquanto.
      if (!existingApp) {
         // Se nós criamos, nós deletamos para limpar recursos
         await deleteApp(secondaryApp).catch(err => console.warn("Erro ao deletar app secundário", err));
      }
    }
  }
};
