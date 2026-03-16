export type FirestoreDoc<T> = {
  id: string;
  data: () => T;
};

export const createFirestoreDoc = <T>(id: string, data: T): FirestoreDoc<T> => {
  return { id, data: () => data };
};

export const createQuerySnapshot = <T>(docs: Array<FirestoreDoc<T>>) => {
  return { docs, size: docs.length, empty: docs.length === 0 };
};

export const createDocSnapshot = <T>(input: { id: string; data: T | null }) => {
  return {
    id: input.id,
    exists: () => input.data !== null,
    data: () => input.data as T,
  };
};

