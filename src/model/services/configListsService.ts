import type { ConfigListItem, ConfigListKey } from '@/model/entities';
import { configListsRepository } from '@/model/repositories/configListsRepository';

const normalize = (value: string) => value.trim();

export const configListsService = {
  listItems: async (key: ConfigListKey, input?: { activeOnly?: boolean }) => {
    return await configListsRepository.listItems(key, input);
  },

  subscribeItems: (
    key: ConfigListKey,
    input: { activeOnly?: boolean; onData: (items: ConfigListItem[]) => void; onError?: (err: unknown) => void },
  ) => {
    return configListsRepository.subscribeItems(key, input);
  },

  createItem: async (
    key: ConfigListKey,
    input: {
      label: string;
      value?: string;
      active?: boolean;
      order?: number;
      pontos?: number;
      cidade?: string;
      estado?: string;
    },
  ) => {
    const label = normalize(input.label);
    if (!label) throw new Error('Nome é obrigatório');
    return await configListsRepository.createItem(key, { ...input, label, value: normalize(input.value ?? label) });
  },

  updateItem: async (
    key: ConfigListKey,
    itemId: string,
    patch: Partial<Pick<ConfigListItem, 'label' | 'value' | 'active' | 'order' | 'pontos' | 'cidade' | 'estado'>>,
  ) => {
    const normalizedPatch: Partial<
      Pick<ConfigListItem, 'label' | 'value' | 'active' | 'order' | 'pontos' | 'cidade' | 'estado'>
    > = {
      ...patch,
    };
    if (typeof patch.label === 'string') normalizedPatch.label = normalize(patch.label);
    if (typeof patch.value === 'string') normalizedPatch.value = normalize(patch.value);
    await configListsRepository.updateItem(key, itemId, normalizedPatch);
  },

  deleteItem: async (key: ConfigListKey, itemId: string) => {
    await configListsRepository.deleteItem(key, itemId);
  },
};
