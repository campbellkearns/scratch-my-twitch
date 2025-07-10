/**
 * IndexedDB wrapper for Scratch My Twitch
 * Provides a clean interface for local data storage
 */

export class IndexedDBWrapper {
  private dbName: string
  private version: number
  private db: IDBDatabase | null = null

  constructor(dbName: string, version: number = 1) {
    this.dbName = dbName
    this.version = version
  }

  /**
   * Initialize the database connection
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error?.message}`))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create profiles store
        if (!db.objectStoreNames.contains('profiles')) {
          const profileStore = db.createObjectStore('profiles', { keyPath: 'id' })
          profileStore.createIndex('name', 'name', { unique: false })
          profileStore.createIndex('createdAt', 'createdAt', { unique: false })
        }

        // Create auth store
        if (!db.objectStoreNames.contains('auth')) {
          db.createObjectStore('auth', { keyPath: 'key' })
        }
      }
    })
  }

  /**
   * Get a transaction for the specified stores
   */
  private getTransaction(storeNames: string[], mode: IDBTransactionMode = 'readonly'): IDBTransaction {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.')
    }
    return this.db.transaction(storeNames, mode)
  }

  /**
   * Get all records from a store
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction([storeName])
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  /**
   * Get a record by key
   */
  async get<T>(storeName: string, key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction([storeName])
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  /**
   * Add a record to a store
   */
  async add<T>(storeName: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.add(data)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  /**
   * Update a record in a store
   */
  async put<T>(storeName: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  /**
   * Delete a record from a store
   */
  async delete(storeName: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  /**
   * Clear all records from a store
   */
  async clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.getTransaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

// Singleton instance
let dbInstance: IndexedDBWrapper | null = null

/**
 * Get the database instance
 */
export const getDB = async (): Promise<IndexedDBWrapper> => {
  if (!dbInstance) {
    dbInstance = new IndexedDBWrapper('scratch-my-twitch', 1)
    await dbInstance.init()
  }
  return dbInstance
}
