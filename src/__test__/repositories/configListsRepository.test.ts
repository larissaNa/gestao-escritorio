import { createFirestoreDoc, createQuerySnapshot } from '../helpers/firestoreTestData';
import { describe, it, expect, vi, beforeEach } from "vitest";

const firestore = vi.hoisted(() => {
  class Timestamp {
    private _date: Date;
    constructor(date: Date) {
      this._date = date;
    }
    toDate() {
      return this._date;
    }
    static now = vi.fn(() => new Timestamp(new Date('2024-01-01T00:00:00.000Z')));
    static fromDate = vi.fn((d: Date) => new Timestamp(d));
  }

  return {
    Timestamp,
    addDoc: vi.fn(),
    collection: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
    getDocs: vi.fn(),
    onSnapshot: vi.fn(),
    orderBy: vi.fn(),
    query: vi.fn(),
    updateDoc: vi.fn(),
    where: vi.fn(),
  };
});

vi.mock('firebase/firestore', () => firestore);
vi.mock('@/model/services/firebase', () => ({ db: {} }));

describe('ConfigListsRepository', () => {
  beforeEach(() => {
    firestore.addDoc.mockReset();
    firestore.collection.mockReset();
    firestore.deleteDoc.mockReset();
    firestore.doc.mockReset();
    firestore.getDocs.mockReset();
    firestore.onSnapshot.mockReset();
    firestore.orderBy.mockReset();
    firestore.query.mockReset();
    firestore.updateDoc.mockReset();
    firestore.where.mockReset();
    firestore.Timestamp.now.mockClear();
    firestore.Timestamp.fromDate.mockClear();
  });

  it('listItems: retorna itens mapeados e ordena por order/label', async () => {
    const { ConfigListsRepository } = await import('@/model/repositories/configListsRepository');
    const db = {};
    const repo = new ConfigListsRepository(db as any);

    const collectionRef = { c: 'items' };
    const q = { q: true };

    firestore.collection.mockReturnValue(collectionRef);
    firestore.orderBy.mockReturnValueOnce('orderBy(order)').mockReturnValueOnce('orderBy(label)');
    firestore.query.mockReturnValue(q);

    const createdAt = new firestore.Timestamp(new Date('2024-01-01T00:00:00.000Z'));
    const updatedAt = new firestore.Timestamp(new Date('2024-02-01T00:00:00.000Z'));
    firestore.getDocs.mockResolvedValue(
      createQuerySnapshot([
        createFirestoreDoc('id-1', {
          label: ' A ',
          value: 'V',
          active: 1,
          order: 3,
          pontos: 10,
          cidade: 'BH',
          estado: 'MG',
          createdAt,
          updatedAt,
        }),
      ]),
    );

    const items = await repo.listItems('categoria' as any);

    expect(firestore.collection).toHaveBeenCalledWith(db, 'config_lists', 'categoria', 'items');
    expect(firestore.orderBy).toHaveBeenCalledWith('order', 'asc');
    expect(firestore.orderBy).toHaveBeenCalledWith('label', 'asc');
    expect(firestore.query).toHaveBeenCalledWith(collectionRef, 'orderBy(order)', 'orderBy(label)');
    expect(items).toEqual([
      {
        id: 'id-1',
        label: ' A ',
        value: 'V',
        active: true,
        order: 3,
        pontos: 10,
        cidade: 'BH',
        estado: 'MG',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-02-01T00:00:00.000Z'),
      },
    ]);
  });

  it('listItems: com activeOnly adiciona filtro active == true', async () => {
    const { ConfigListsRepository } = await import('@/model/repositories/configListsRepository');
    const repo = new ConfigListsRepository({} as any);

    firestore.collection.mockReturnValue({ c: 'items' });
    firestore.where.mockReturnValue('where(active==true)');
    firestore.orderBy.mockReturnValueOnce('orderBy(order)').mockReturnValueOnce('orderBy(label)');
    firestore.query.mockReturnValue({ q: true });
    firestore.getDocs.mockResolvedValue(createQuerySnapshot([]));

    const items = await repo.listItems('categoria' as any, { activeOnly: true });

    expect(firestore.where).toHaveBeenCalledWith('active', '==', true);
    expect(items).toEqual([]);
  });

  it('createItem: remove undefined e retorna id do documento', async () => {
    const { ConfigListsRepository } = await import('@/model/repositories/configListsRepository');
    const repo = new ConfigListsRepository({} as any);

    firestore.collection.mockReturnValue({ c: 'items' });
    firestore.addDoc.mockResolvedValue({ id: 'new-id' });

    const id = await repo.createItem('escritorios' as any, {
      label: 'Escritório X',
      value: undefined,
      pontos: undefined,
      cidade: undefined,
      estado: 'SP',
    });

    expect(id).toBe('new-id');
    expect(firestore.addDoc).toHaveBeenCalledTimes(1);
    const payload = firestore.addDoc.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload.label).toBe('Escritório X');
    expect(payload.value).toBe('Escritório X');
    expect(payload.active).toBe(true);
    expect(payload.order).toBe(0);
    expect(payload).not.toHaveProperty('pontos');
    expect(payload).not.toHaveProperty('cidade');
    expect(payload.estado).toBe('SP');
    expect(payload).toHaveProperty('createdAt');
    expect(payload).toHaveProperty('updatedAt');
  });

  it('updateItem: remove undefined e inclui updatedAt', async () => {
    const { ConfigListsRepository } = await import('@/model/repositories/configListsRepository');
    const db = {};
    const repo = new ConfigListsRepository(db as any);

    const docRef = { d: true };
    firestore.doc.mockReturnValue(docRef);
    firestore.updateDoc.mockResolvedValue(undefined);

    await repo.updateItem('categoria' as any, 'item-1', { label: 'Novo', pontos: undefined });

    expect(firestore.doc).toHaveBeenCalledWith(db, 'config_lists', 'categoria', 'items', 'item-1');
    expect(firestore.updateDoc).toHaveBeenCalledTimes(1);
    const payload = firestore.updateDoc.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload.label).toBe('Novo');
    expect(payload).not.toHaveProperty('pontos');
    expect(payload).toHaveProperty('updatedAt');
  });

  it('deleteItem: remove o documento esperado', async () => {
    const { ConfigListsRepository } = await import('@/model/repositories/configListsRepository');
    const db = {};
    const repo = new ConfigListsRepository(db as any);

    const docRef = { d: true };
    firestore.doc.mockReturnValue(docRef);
    firestore.deleteDoc.mockResolvedValue(undefined);

    await repo.deleteItem('categoria' as any, 'item-1');

    expect(firestore.doc).toHaveBeenCalledWith(db, 'config_lists', 'categoria', 'items', 'item-1');
    expect(firestore.deleteDoc).toHaveBeenCalledWith(docRef);
  });

  it('subscribeItems: chama onData com itens mapeados e retorna unsubscribe', async () => {
    const { ConfigListsRepository } = await import('@/model/repositories/configListsRepository');
    const repo = new ConfigListsRepository({} as any);

    const unsubscribe = vi.fn();
    firestore.collection.mockReturnValue({ c: 'items' });
    firestore.orderBy.mockReturnValueOnce('orderBy(order)').mockReturnValueOnce('orderBy(label)');
    firestore.query.mockReturnValue({ q: true });
    firestore.onSnapshot.mockImplementation((_q: unknown, onNext: (s: any) => void) => {
      onNext(
        createQuerySnapshot([
          createFirestoreDoc('id-1', {
            label: 'A',
            value: 'A',
            active: true,
            order: 1,
          }),
        ]),
      );
      return unsubscribe;
    });

    const onData = vi.fn();
    const out = repo.subscribeItems('categoria' as any, { onData });

    expect(out).toBe(unsubscribe);
    expect(onData).toHaveBeenCalledWith([
      {
        id: 'id-1',
        label: 'A',
        value: 'A',
        active: true,
        order: 1,
        pontos: undefined,
        cidade: undefined,
        estado: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      },
    ]);
  });

  it('subscribeItems: chama onError quando snapshot falha', async () => {
    const { ConfigListsRepository } = await import('@/model/repositories/configListsRepository');
    const repo = new ConfigListsRepository({} as any);

    firestore.collection.mockReturnValue({ c: 'items' });
    firestore.orderBy.mockReturnValueOnce('orderBy(order)').mockReturnValueOnce('orderBy(label)');
    firestore.query.mockReturnValue({ q: true });

    firestore.onSnapshot.mockImplementation((_q: unknown, _onNext: unknown, onErr: (e: any) => void) => {
      onErr(new Error('boom'));
      return vi.fn();
    });

    const onError = vi.fn();
    repo.subscribeItems('categoria' as any, { onData: vi.fn(), onError });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
  });
});

