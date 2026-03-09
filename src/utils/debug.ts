import { auth, db } from '@/model/services/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('Testando conexão com Firebase...');
    
    // Verificar se o usuário está autenticado
    const currentUser = auth.currentUser;
    console.log('Usuário atual:', currentUser);
    
    if (!currentUser) {
      console.error('Usuário não está autenticado!');
      return false;
    }
    
    // Testar acesso à coleção de relatórios
    const relatoriosRef = collection(db, 'relatorios');
    const snapshot = await getDocs(relatoriosRef);
    console.log('Relatórios encontrados:', snapshot.size);
    
    // Testar criação de um documento de teste
    const testDoc = await addDoc(collection(db, 'test'), {
      test: true,
      timestamp: new Date(),
      userId: currentUser.uid
    });
    console.log('Documento de teste criado:', testDoc.id);
    
    return true;
  } catch (error) {
    console.error('Erro no teste de conexão:', error);
    return false;
  }
};

export const logFirebaseError = (error: unknown, context: string) => {
  const err = error as { message?: string; code?: string; stack?: string };
  console.error(`Erro no ${context}:`, {
    message: err.message,
    code: err.code,
    stack: err.stack,
    context
  });
};

