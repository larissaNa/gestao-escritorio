import { describe, it, expect, vi, beforeEach } from "vitest";

const repoMock = vi.hoisted(() => {
  return {
    listItems: vi.fn(),
    subscribeItems: vi.fn(),
    createItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
  };
});

vi.mock('@/model/repositories/configListsRepository', () => ({
  configListsRepository: repoMock,
}));

describe('configListsService', () => {
  beforeEach(() => {
    repoMock.listItems.mockReset();
    repoMock.subscribeItems.mockReset();
    repoMock.createItem.mockReset();
    repoMock.updateItem.mockReset();
    repoMock.deleteItem.mockReset();
  });

  it('listItems: delega para repository e retorna resultado', async () => {
    const { configListsService } = await import('@/model/services/configListsService');
    repoMock.listItems.mockResolvedValue([{ id: '1' }]);

    const out = await configListsService.listItems('categoria' as any, { activeOnly: true });

    expect(repoMock.listItems).toHaveBeenCalledWith('categoria', { activeOnly: true });
    expect(out).toEqual([{ id: '1' }]);
  });

  it('createItem: valida label obrigatório e normaliza label/value', async () => {
    const { configListsService } = await import('@/model/services/configListsService');
    repoMock.createItem.mockResolvedValue('new-id');

    await expect(
      configListsService.createItem('categoria' as any, { label: '   ' }),
    ).rejects.toThrow('Nome é obrigatório');

    const id = await configListsService.createItem('categoria' as any, { label: '  A  ', value: '  V  ' });

    expect(id).toBe('new-id');
    expect(repoMock.createItem).toHaveBeenCalledWith('categoria', { label: 'A', value: 'V' });
  });

  it('createItem: quando value não é informado, usa label normalizado', async () => {
    const { configListsService } = await import('@/model/services/configListsService');
    repoMock.createItem.mockResolvedValue('new-id');

    await configListsService.createItem('categoria' as any, { label: '  A  ' });

    expect(repoMock.createItem).toHaveBeenCalledWith('categoria', { label: 'A', value: 'A' });
  });

  it('updateItem: normaliza campos string e delega', async () => {
    const { configListsService } = await import('@/model/services/configListsService');
    repoMock.updateItem.mockResolvedValue(undefined);

    await configListsService.updateItem('categoria' as any, 'id-1', { label: '  L ', value: '  V ' } as any);

    expect(repoMock.updateItem).toHaveBeenCalledWith('categoria', 'id-1', { label: 'L', value: 'V' });
  });

  it('deleteItem: delega para repository', async () => {
    const { configListsService } = await import('@/model/services/configListsService');
    repoMock.deleteItem.mockResolvedValue(undefined);

    await configListsService.deleteItem('categoria' as any, 'id-1');

    expect(repoMock.deleteItem).toHaveBeenCalledWith('categoria', 'id-1');
  });

  it('subscribeItems: delega e retorna unsubscribe', async () => {
    const { configListsService } = await import('@/model/services/configListsService');
    const unsubscribe = vi.fn();
    repoMock.subscribeItems.mockReturnValue(unsubscribe);

    const out = configListsService.subscribeItems('categoria' as any, { onData: vi.fn() });

    expect(out).toBe(unsubscribe);
    expect(repoMock.subscribeItems).toHaveBeenCalledTimes(1);
  });
});

