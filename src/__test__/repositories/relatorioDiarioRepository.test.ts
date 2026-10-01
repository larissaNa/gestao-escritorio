import { createDocSnapshot, createFirestoreDoc, createQuerySnapshot } from '../helpers/firestoreTestData';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const firestore = vi.hoisted(() => {
  class Timestamp {
    private _date: Date;
    constructor(date: Date) {
      this._date = date;
    }
    toDate() {
      return this._date;
    }
    static now = vi.fn(() => new Timestamp(new Date('2026-09-29T10:00:00.000Z')));
    static fromDate = vi.fn((d: Date) => new Timestamp(d));
  }

  return {
    Timestamp,
    addDoc: vi.fn(),
    collection: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    orderBy: vi.fn(),
    query: vi.fn(),
    updateDoc: vi.fn(),
    where: vi.fn(),
  };
});

vi.mock('firebase/firestore', () => firestore);
vi.mock('@/model/services/firebase', () => ({ db: {} }));

describe('RelatorioDiarioRepository', () => {
  beforeEach(() => {
    firestore.addDoc.mockReset();
    firestore.collection.mockReset();
    firestore.deleteDoc.mockReset();
    firestore.doc.mockReset();
    firestore.getDoc.mockReset();
    firestore.getDocs.mockReset();
    firestore.orderBy.mockReset();
    firestore.query.mockReset();
    firestore.updateDoc.mockReset();
    firestore.where.mockReset();
    firestore.Timestamp.now.mockClear();
    firestore.Timestamp.fromDate.mockClear();
  });

  it('create: adiciona documento com Timestamp.fromDate para data', async () => {
    const { RelatorioDiarioRepository } = await import('@/model/repositories/relatorioDiarioRepository');
    const repo = new RelatorioDiarioRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.addDoc.mockResolvedValue({ id: 'diario-1' });

    const dataRegistro = new Date('2026-09-29T00:00:00.000Z');
    const id = await repo.create({
      responsavelId: 'resp-123',
      responsavelNome: 'Estagiário João',
      data: dataRegistro,
      descricao: 'Elaboração de minutas e atendimento a clientes.',
    });

    expect(id).toBe('diario-1');
    expect(firestore.collection).toHaveBeenCalledWith({}, 'relatorios_diarios');
    expect(firestore.addDoc).toHaveBeenCalledTimes(1);
    const payload = firestore.addDoc.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload).toHaveProperty('responsavelId', 'resp-123');
    expect(payload).toHaveProperty('responsavelNome', 'Estagiário João');
    expect(payload).toHaveProperty('descricao', 'Elaboração de minutas e atendimento a clientes.');
    expect(payload).toHaveProperty('data');
    expect(payload).toHaveProperty('createdAt');
    expect(payload).toHaveProperty('updatedAt');
  });

  it('update: atualiza documento com updatedAt', async () => {
    const { RelatorioDiarioRepository } = await import('@/model/repositories/relatorioDiarioRepository');
    const repo = new RelatorioDiarioRepository();

    firestore.doc.mockReturnValue({ d: true });
    firestore.updateDoc.mockResolvedValue(undefined);

    await repo.update('diario-1', { descricao: 'Nova descrição atualizada' });

    expect(firestore.doc).toHaveBeenCalledWith({}, 'relatorios_diarios', 'diario-1');
    expect(firestore.updateDoc).toHaveBeenCalledTimes(1);
    const payload = firestore.updateDoc.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload).toHaveProperty('descricao', 'Nova descrição atualizada');
    expect(payload).toHaveProperty('updatedAt');
  });

  it('delete: remove documento pelo ID', async () => {
    const { RelatorioDiarioRepository } = await import('@/model/repositories/relatorioDiarioRepository');
    const repo = new RelatorioDiarioRepository();

    firestore.doc.mockReturnValue({ d: true });
    firestore.deleteDoc.mockResolvedValue(undefined);

    await repo.delete('diario-1');

    expect(firestore.doc).toHaveBeenCalledWith({}, 'relatorios_diarios', 'diario-1');
    expect(firestore.deleteDoc).toHaveBeenCalledTimes(1);
  });

  it('getById: retorna item quando existe e null quando não existe', async () => {
    const { RelatorioDiarioRepository } = await import('@/model/repositories/relatorioDiarioRepository');
    const repo = new RelatorioDiarioRepository();

    firestore.doc.mockReturnValue({ d: true });
    firestore.getDoc.mockResolvedValueOnce(createDocSnapshot({ id: 'diario-none', data: null }));

    const resNull = await repo.getById('diario-none');
    expect(resNull).toBeNull();

    firestore.getDoc.mockResolvedValueOnce(
      createDocSnapshot({
        id: 'diario-1',
        data: {
          responsavelId: 'user-1',
          responsavelNome: 'Maria',
          descricao: 'Atividades do dia',
          data: { toDate: () => new Date('2026-09-29') },
        },
      }),
    );

    const resDoc = await repo.getById('diario-1');
    expect(resDoc).not.toBeNull();
    expect(resDoc?.responsavelNome).toBe('Maria');
  });

  it('getAll: retorna todos os documentos ordenados por data desc', async () => {
    const { RelatorioDiarioRepository } = await import('@/model/repositories/relatorioDiarioRepository');
    const repo = new RelatorioDiarioRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.orderBy.mockReturnValue('orderBy(data)');
    firestore.query.mockReturnValue({ q: true });
    firestore.getDocs.mockResolvedValue(
      createQuerySnapshot([
        createFirestoreDoc('d1', {
          responsavelId: 'u1',
          responsavelNome: 'Ana',
          descricao: 'Pesquisa jurisprudencial',
          data: { toDate: () => new Date('2026-09-29') },
        }),
      ]),
    );

    const docs = await repo.getAll();
    expect(docs).toHaveLength(1);
    expect(docs[0].descricao).toBe('Pesquisa jurisprudencial');
  });

  it('getByResponsavel: filtra por responsavelId', async () => {
    const { RelatorioDiarioRepository } = await import('@/model/repositories/relatorioDiarioRepository');
    const repo = new RelatorioDiarioRepository();

    firestore.collection.mockReturnValue({ c: true });
    firestore.where.mockReturnValue('where(responsavelId)');
    firestore.orderBy.mockReturnValue('orderBy(data)');
    firestore.query.mockReturnValue({ q: true });
    firestore.getDocs.mockResolvedValue(
      createQuerySnapshot([
        createFirestoreDoc('d2', {
          responsavelId: 'u2',
          responsavelNome: 'Carlos',
          descricao: 'Triagem de processos',
          data: { toDate: () => new Date('2026-09-29') },
        }),
      ]),
    );

    const docs = await repo.getByResponsavel('u2');
    expect(firestore.where).toHaveBeenCalledWith('responsavelId', '==', 'u2');
    expect(docs).toHaveLength(1);
    expect(docs[0].responsavelNome).toBe('Carlos');
  });
});
