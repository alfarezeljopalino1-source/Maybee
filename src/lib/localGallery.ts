import type { LocalStrip } from '../types'

const DB_NAME = 'maybee'
const DB_VERSION = 1
const STORE = 'strips'
const MAX_STRIPS = 40

function openDb(): Promise<IDBDatabase> {
  const { promise, resolve, reject } = Promise.withResolvers<IDBDatabase>()
  const request = indexedDB.open(DB_NAME, DB_VERSION)
  request.onupgradeneeded = () => {
    const db = request.result
    if (!db.objectStoreNames.contains(STORE)) {
      db.createObjectStore(STORE, { keyPath: 'id' })
    }
  }
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error ?? new Error('IndexedDB gagal dibuka'))
  return promise
}

async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb()
  const { promise, resolve, reject } = Promise.withResolvers<T>()
  const tx = db.transaction(STORE, mode)
  const request = fn(tx.objectStore(STORE))
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error ?? new Error('Operasi galeri lokal gagal'))
  tx.oncomplete = () => db.close()
  return promise
}

interface StoredStrip extends LocalStrip {
  blob: Blob
}

export async function saveLocalStrip(strip: LocalStrip): Promise<void> {
  await withStore('readwrite', (store) => store.put(strip) as IDBRequest<IDBValidKey>)
  const all = await listLocalStrips()
  if (all.length > MAX_STRIPS) {
    for (const old of all.slice(MAX_STRIPS)) await deleteLocalStrip(old.id)
  }
}

export async function listLocalStrips(): Promise<LocalStrip[]> {
  const all = await withStore<StoredStrip[]>('readonly', (store) => store.getAll() as IDBRequest<StoredStrip[]>)
  return all.sort((a, b) => b.createdAt - a.createdAt)
}

export async function deleteLocalStrip(id: string): Promise<void> {
  await withStore('readwrite', (store) => store.delete(id) as IDBRequest<undefined>)
}

/** Simpan preferensi ringan (mis. nama pengunjung) tanpa backend. */
export function rememberCaption(caption: string): void {
  try {
    localStorage.setItem('maybee:caption', caption)
  } catch {
    /* storage penuh / private mode — abaikan */
  }
}

export function recallCaption(): string {
  try {
    return localStorage.getItem('maybee:caption') ?? ''
  } catch {
    return ''
  }
}

export function hasSeenSplash(): boolean {
  try {
    return sessionStorage.getItem('maybee:splash') === 'seen'
  } catch {
    return false
  }
}

export function markSplashSeen(): void {
  try {
    sessionStorage.setItem('maybee:splash', 'seen')
  } catch {
    /* abaikan */
  }
}
