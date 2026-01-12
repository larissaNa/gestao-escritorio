import { useState, useEffect } from 'react';
import { beneficioService } from '@/services/beneficioService';
import { BeneficioItem } from '@/types';

export const useBeneficio = () => {
  const [beneficios, setBeneficios] = useState<BeneficioItem[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    tipo: '',
    mesAno: ''
  });

  // Carregar todos os benefícios
  const mapToItem = (beneficio: any): BeneficioItem => ({
    id: beneficio.id,
    nome: beneficio.nome,
    tipo:
      beneficio.tipo === 'percentual'
        ? 'Administrativo'
        : beneficio.tipo === 'fixo'
        ? 'Judicial'
        : (beneficio.tipo as BeneficioItem['tipo']),
    subtipo: beneficio.descricao,
    responsavelUID: beneficio.responsavelUID || '',
    responsavelNome: beneficio.responsavelNome || 'Responsável não definido',
    cliente: beneficio.cliente || 'Cliente não definido',
    data: beneficio.dataCriacao
  });

  const carregarBeneficios = async () => {
    setLoading(true);
    setError(null);
    try {
      const { beneficios: lista, lastDoc: cursor } = await beneficioService.getBeneficiosPaginated(50);
      setBeneficios(lista.map(mapToItem));
      setLastDoc(cursor || null);
      setHasMore(Boolean(cursor));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar benefícios');
      console.error('Erro ao carregar benefícios:', err);
    } finally {
      setLoading(false);
    }
  };

  const carregarMais = async () => {
    if (!hasMore || !lastDoc) return;
    try {
      setLoadingMore(true);
      const { beneficios: lista, lastDoc: cursor } = await beneficioService.getBeneficiosPaginated(50, lastDoc);
      setBeneficios(prev => [...prev, ...lista.map(mapToItem)]);
      setLastDoc(cursor || null);
      setHasMore(Boolean(cursor));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar mais benefícios');
      console.error('Erro ao carregar mais benefícios:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Criar novo benefício
  const criarBeneficio = async (dados: Omit<BeneficioItem, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      // Passar os dados completos do BeneficioItem
      const beneficioData = {
        nome: dados.nome,
        tipo: dados.tipo,
        subtipo: dados.subtipo || '',
        responsavelUID: dados.responsavelUID,
        responsavelNome: dados.responsavelNome,
        cliente: dados.cliente,
        data: dados.data
      };
      await beneficioService.createBeneficio(beneficioData);
      await carregarBeneficios(); // Recarrega a primeira página
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar benefício');
      console.error('Erro ao criar benefício:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar benefício
  const atualizarBeneficio = async (id: string, dados: Partial<BeneficioItem>) => {
    setLoading(true);
    setError(null);
    try {
      // Passar os dados completos do BeneficioItem
      const beneficioData: any = {};
      if (dados.nome) beneficioData.nome = dados.nome;
      if (dados.subtipo) beneficioData.subtipo = dados.subtipo;
      if (dados.tipo) beneficioData.tipo = dados.tipo;
      if (dados.responsavelUID) beneficioData.responsavelUID = dados.responsavelUID;
      if (dados.responsavelNome) beneficioData.responsavelNome = dados.responsavelNome;
      if (dados.cliente) beneficioData.cliente = dados.cliente;
      if (dados.data) beneficioData.data = dados.data;
      
      await beneficioService.updateBeneficio(id, beneficioData);
      await carregarBeneficios(); // Recarrega a primeira página
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar benefício');
      console.error('Erro ao atualizar benefício:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Excluir benefício
  const excluirBeneficio = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await beneficioService.deleteBeneficio(id);
      await carregarBeneficios(); // Recarrega a primeira página
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir benefício');
      console.error('Erro ao excluir benefício:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const aplicarFiltros = (novosFiltros: Partial<typeof filtros>) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  };

  // Limpar filtros
  const limparFiltros = () => {
    setFiltros({
      tipo: '',
      mesAno: ''
    });
  };

  // Obter benefícios filtrados
  const beneficiosFiltrados = beneficios.filter(beneficio => {
    if (filtros.tipo && beneficio.tipo !== filtros.tipo) return false;
    if (filtros.mesAno) {
      const [ano, mes] = filtros.mesAno.split('-').map(Number);
      const beneficioAno = beneficio.data.getFullYear();
      const beneficioMes = beneficio.data.getMonth() + 1;
      if (beneficioAno !== ano || beneficioMes !== mes) return false;
    }
    return true;
  });

  // Obter opções para filtros
  const obterOpcoesFiltros = () => {
    const tipos = [...new Set(beneficios.map(b => b.tipo))];
    const mesesAno = [...new Set(beneficios.map(b => 
      `${b.data.getFullYear()}-${String(b.data.getMonth() + 1).padStart(2, '0')}`
    ))].sort();

    return {
      tipos,
      mesesAno
    };
  };

  // Carregar dados iniciais
  useEffect(() => {
    carregarBeneficios();
  }, []);

  return {
    beneficios: beneficiosFiltrados,
    loading,
    loadingMore,
    error,
    filtros,
    criarBeneficio,
    atualizarBeneficio,
    excluirBeneficio,
    aplicarFiltros,
    limparFiltros,
    obterOpcoesFiltros,
    carregarBeneficios,
    carregarMais,
    hasMore
  };
};
