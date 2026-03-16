import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { ConfigListItem, ConfigListKey } from '@/model/entities';
import { configListsService } from '@/model/services/configListsService';

type SelectOption = { value: string; label: string; pontos?: number };

export const useConfigListOptions = (
  key: ConfigListKey,
  input?: { activeOnly?: boolean },
) => {
  const [items, setItems] = useState<ConfigListItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = configListsService.subscribeItems(key, {
      activeOnly: input?.activeOnly ?? true,
      onData: (data) => {
        setItems(data);
        setLoading(false);
      },
      onError: (err) => {
        console.error('Erro ao carregar lista:', key, err);
        toast.error('Erro ao carregar opções do sistema');
        setItems([]);
        setLoading(false);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [key, input?.activeOnly]);

  const options = useMemo<SelectOption[]>(() => {
    if (items && items.length > 0) {
      return items.map((i) => ({ value: i.value, label: i.label, pontos: i.pontos }));
    }
    return [];
  }, [items]);

  const demandaPoints = useMemo(() => {
    const map = new Map<string, number>();
    options.forEach((o) => {
      if (typeof o.pontos === 'number') map.set(o.value, o.pontos);
    });
    return map;
  }, [options]);

  return { options, loading, demandaPoints };
};

export type { SelectOption };
