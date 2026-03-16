import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { colaboradorService, ColaboradorData } from '@/model/services/colaboradorService';
import { formularioService } from '@/model/services/formularioService';
import { useAuth } from '@/contexts/AuthContext';
import { userRepository } from '@/model/repositories/userRepository';
import type { UserPermission } from '@/model/entities';
import { deleteField } from 'firebase/firestore';

export function useEditarColaboradorViewModel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ColaboradorData | null>(null);

  const allPermissions: UserPermission[] = [
    'dashboard',
    'atendimentos',
    'relatorios',
    'servicos',
    'cadastro',
    'acoes_advogados',
    'processos_advogados',
    'financeiro',
    'idas_banco',
  ];

  const [userType, setUserType] = useState<'comum' | 'admin'>('comum');
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>(allPermissions);

  const togglePermission = (permission: UserPermission) => {
    setUserPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    );
  };

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Acesso negado.');
      setError('Acesso negado.');
      setLoading(false);
      return;
    }

    if (id) {
      loadColaborador(id);
    }
  }, [id, isAdmin]);

  const loadColaborador = async (userId: string) => {
    try {
      setLoading(true);
      const [data, userDoc] = await Promise.all([
        colaboradorService.getColaboradorByUserId(userId),
        userRepository.getById(userId),
      ]);
      if (data) {
        const emailFromUserDoc = typeof userDoc?.email === 'string' ? userDoc.email : undefined;
        const emailFromForm = typeof data.email === 'string' ? data.email : undefined;
        const emailFromPersonal = typeof data.emailPessoal === 'string' ? data.emailPessoal : undefined;
        setFormData({
          ...data,
          email: emailFromForm || emailFromUserDoc || emailFromPersonal,
        });
        const role = (userDoc?.role as string | undefined) || data.role || 'recepcao';
        setUserType(role === 'admin' ? 'admin' : 'comum');
        const existingPermissions = userDoc?.permissions as UserPermission[] | undefined;
        setUserPermissions(existingPermissions && existingPermissions.length > 0 ? existingPermissions : allPermissions);
      } else {
        toast.error('Colaborador não encontrado.');
        setError('Colaborador não encontrado.');
      }
    } catch (err) {
      console.error('Erro ao carregar colaborador:', err);
      toast.error('Erro ao carregar dados do colaborador');
      setError('Erro ao carregar dados do colaborador');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ColaboradorData, value: ColaboradorData[keyof ColaboradorData]) => {
    if (!formData) return;
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSave = async () => {
    if (!formData || !id) return;

    if (userType === 'comum' && userPermissions.length === 0) {
      toast.warning('Selecione pelo menos uma permissão');
      setError('Selecione pelo menos uma permissão');
      return;
    }

    setSaving(true);
    try {
      const roleToSave = userType === 'admin' ? 'admin' : 'recepcao';
      const existingUserDoc = await userRepository.getById(id);
      const existingUserEmail = typeof existingUserDoc?.email === 'string' ? existingUserDoc.email : '';

      const emailFromForm = (formData.email || '').trim();
      const emailFromPersonal = (formData.emailPessoal || '').trim();
      const emailToSave = emailFromForm || emailFromPersonal || existingUserEmail.trim();

      const updatedFormData = {
        ...formData,
        role: roleToSave,
        email: emailToSave || undefined,
      };

      await formularioService.salvarFormulario(id, updatedFormData);

      const displayName = `${updatedFormData.primeiroNome || ''} ${updatedFormData.sobreNome || ''}`.trim();
      const hasFilledForm =
        Boolean(updatedFormData.primeiroNome && String(updatedFormData.primeiroNome).trim()) &&
        Boolean(updatedFormData.sobreNome && String(updatedFormData.sobreNome).trim()) &&
        Boolean(updatedFormData.cpf && String(updatedFormData.cpf).trim()) &&
        Boolean(updatedFormData.funcaoCargo && String(updatedFormData.funcaoCargo).trim()) &&
        Boolean(updatedFormData.departamento && String(updatedFormData.departamento).trim());

      await userRepository.update(id, {
        displayName: displayName || undefined,
        email: emailToSave || undefined,
        role: roleToSave,
        hasFilledForm,
        createdAt: existingUserDoc ? undefined : new Date(),
        permissions: userType === 'comum' ? userPermissions : deleteField(),
      });
      toast.success('Dados salvos com sucesso!');
      navigate('/admin-colaboradores');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar dados');
      setError('Erro ao salvar dados');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin-colaboradores');
  };

  return {
    loading,
    saving,
    error,
    formData,
    userType,
    setUserType,
    userPermissions,
    togglePermission,
    handleInputChange,
    handleSave,
    handleCancel
  };
}
