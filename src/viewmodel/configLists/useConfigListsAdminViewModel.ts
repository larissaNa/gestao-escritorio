import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { ConfigListItem, ConfigListKey } from '@/model/entities';
import { configListsService } from '@/model/services/configListsService';

export type ConfigListDefinition = {
  key: ConfigListKey;
  label: string;
  supportsPontos?: boolean;
  supportsCidadeEstado?: boolean;
};

export const CONFIG_LIST_DEFINITIONS: ConfigListDefinition[] = [
  { key: 'tipo_acao', label: 'Tipo de ação' },
  { key: 'setor', label: 'Setor' },
  { key: 'demanda', label: 'Demanda', supportsPontos: true },
  { key: 'area', label: 'Área' },
  { key: 'categoria', label: 'Categoria (Financeiro)' },
  { key: 'escritorios', label: 'Escritórios', supportsCidadeEstado: true },
];

export const useConfigListsAdminViewModel = () => {
  const [activeKey, setActiveKey] = useState<ConfigListKey>('tipo_acao');
  const [items, setItems] = useState<ConfigListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = configListsService.subscribeItems(activeKey, {
      activeOnly: false,
      onData: (data) => {
        setItems(data);
        setLoading(false);
      },
      onError: (err) => {
        console.error('Erro ao carregar lista admin:', activeKey, err);
        toast.error('Erro ao carregar lista');
        setItems([]);
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [activeKey]);

  const activeDefinition = useMemo(() => {
    return CONFIG_LIST_DEFINITIONS.find((d) => d.key === activeKey) ?? CONFIG_LIST_DEFINITIONS[0];
  }, [activeKey]);

  const createItem = useCallback(
    async (input: { label?: string; pontos?: number; cidade?: string; estado?: string }) => {
      const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.order ?? 0)) + 1 : 1;

      if (activeKey === 'escritorios') {
        const cidade = (input.cidade ?? '').trim();
        const estado = (input.estado ?? '').trim().toUpperCase();
        if (!cidade) throw new Error('Cidade é obrigatória');
        if (!estado) throw new Error('Estado é obrigatório');
        const label = `${cidade} - ${estado}`;
        await configListsService.createItem(activeKey, {
          label,
          value: label,
          active: true,
          order: nextOrder,
          cidade,
          estado,
        });
        toast.success('Opção criada com sucesso');
        return;
      }

      await configListsService.createItem(activeKey, {
        label: input.label ?? '',
        value: input.label ?? '',
        active: true,
        order: nextOrder,
        pontos: typeof input.pontos === 'number' ? input.pontos : undefined,
      });
      toast.success('Opção criada com sucesso');
    },
    [activeKey, items],
  );

  const updateItem = useCallback(
    async (
      itemId: string,
      patch: Partial<Pick<ConfigListItem, 'label' | 'active' | 'order' | 'pontos' | 'cidade' | 'estado'>>,
    ) => {
      if (activeKey === 'escritorios') {
        const current = items.find((i) => i.id === itemId);
        const cidade = (patch.cidade ?? current?.cidade ?? '').trim();
        const estado = (patch.estado ?? current?.estado ?? '').trim().toUpperCase();

        if ((patch.cidade !== undefined || patch.estado !== undefined) && (!cidade || !estado)) {
          throw new Error('Cidade e estado são obrigatórios');
        }

        const nextPatch = { ...patch } as typeof patch & { value?: string };
        if (cidade && estado) {
          const label = `${cidade} - ${estado}`;
          nextPatch.cidade = cidade;
          nextPatch.estado = estado;
          nextPatch.label = label;
          nextPatch.value = label;
        }

        await configListsService.updateItem(activeKey, itemId, nextPatch);
        toast.success('Opção atualizada com sucesso');
        return;
      }

      await configListsService.updateItem(activeKey, itemId, patch);
      toast.success('Opção atualizada com sucesso');
    },
    [activeKey, items],
  );

  const deleteItem = useCallback(
    async (itemId: string) => {
      await configListsService.deleteItem(activeKey, itemId);
      toast.success('Opção excluída com sucesso');
    },
    [activeKey],
  );

  return {
    activeKey,
    setActiveKey,
    activeDefinition,
    definitions: CONFIG_LIST_DEFINITIONS,
    items,
    loading,
    createItem,
    updateItem,
    deleteItem,
  };
};
