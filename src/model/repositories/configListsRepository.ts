import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  type Firestore,
} from 'firebase/firestore';
import { db } from '@/model/services/firebase';
import type { ConfigListItem, ConfigListKey } from '@/model/entities';

type ConfigListItemDoc = Omit<ConfigListItem, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

const withoutUndefined = <T extends Record<string, unknown>>(obj: T) => {
  const entries = Object.entries(obj).filter(([, v]) => v !== undefined);
  return Object.fromEntries(entries) as Partial<T>;
};

const mapItemDoc = (id: string, data: ConfigListItemDoc): ConfigListItem => {
  return {
    id,
    label: data.label,
    value: data.value,
    active: Boolean(data.active),
    order: typeof data.order === 'number' ? data.order : 0,
    pontos: typeof data.pontos === 'number' ? data.pontos : undefined,
    cidade: typeof data.cidade === 'string' ? data.cidade : undefined,
    estado: typeof data.estado === 'string' ? data.estado : undefined,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : undefined,
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined,
  };
};

export class ConfigListsRepository {
  private db: Firestore;

  constructor(firestore: Firestore = db) {
    this.db = firestore;
  }

  private itemsCollection(key: ConfigListKey) {
    return collection(this.db, 'config_lists', key, 'items');
  }

  async listItems(key: ConfigListKey, input?: { activeOnly?: boolean }) {
    const constraints = [orderBy('order', 'asc'), orderBy('label', 'asc')];
    const q = input?.activeOnly
      ? query(this.itemsCollection(key), where('active', '==', true), ...constraints)
      : query(this.itemsCollection(key), ...constraints);

    const snap = await getDocs(q);
    return snap.docs.map((d) => mapItemDoc(d.id, d.data() as ConfigListItemDoc));
  }

  subscribeItems(
    key: ConfigListKey,
    input: { activeOnly?: boolean; onData: (items: ConfigListItem[]) => void; onError?: (err: unknown) => void },
  ) {
    const constraints = [orderBy('order', 'asc'), orderBy('label', 'asc')];
    const q = input.activeOnly
      ? query(this.itemsCollection(key), where('active', '==', true), ...constraints)
      : query(this.itemsCollection(key), ...constraints);

    return onSnapshot(
      q,
      (snap) => {
        input.onData(snap.docs.map((d) => mapItemDoc(d.id, d.data() as ConfigListItemDoc)));
      },
      (err) => {
        input.onError?.(err);
      },
    );
  }

  async createItem(
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
  ) {
    const now = Timestamp.now();
    const payload: ConfigListItemDoc = {
      label: input.label,
      value: input.value ?? input.label,
      active: input.active ?? true,
      order: input.order ?? 0,
      pontos: typeof input.pontos === 'number' ? input.pontos : undefined,
      cidade: typeof input.cidade === 'string' ? input.cidade : undefined,
      estado: typeof input.estado === 'string' ? input.estado : undefined,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await addDoc(this.itemsCollection(key), withoutUndefined(payload));
    return ref.id;
  }

  async updateItem(
    key: ConfigListKey,
    itemId: string,
    patch: Partial<Pick<ConfigListItem, 'label' | 'value' | 'active' | 'order' | 'pontos' | 'cidade' | 'estado'>>,
  ) {
    const ref = doc(this.db, 'config_lists', key, 'items', itemId);
    const payload: Partial<ConfigListItemDoc> = withoutUndefined({
      ...patch,
      updatedAt: Timestamp.now(),
    });
    await updateDoc(ref, payload);
  }

  async deleteItem(key: ConfigListKey, itemId: string) {
    const ref = doc(this.db, 'config_lists', key, 'items', itemId);
    await deleteDoc(ref);
  }
}

export const configListsRepository = new ConfigListsRepository();
