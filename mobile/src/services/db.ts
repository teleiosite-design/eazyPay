import * as SQLite from 'expo-sqlite';
import { Transaction } from '../types';
import { CryptoService } from './crypto';

let dbInstance: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('eazypay_offline.db');
    await dbInstance.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        amount REAL NOT NULL,
        isDebit INTEGER NOT NULL,
        syncStatus TEXT NOT NULL,
        hash TEXT NOT NULL,
        prevHash TEXT NOT NULL,
        signature TEXT NOT NULL,
        txRef TEXT NOT NULL,
        nonce INTEGER,
        customerId TEXT,
        vendorId TEXT,
        payerId TEXT,
        payeeId TEXT,
        deviceId TEXT,
        nfcCardId TEXT,
        fee REAL,
        campusId TEXT,
        idempotencyKey TEXT
      );
    `);
  }
  return dbInstance;
}

export const DatabaseService = {
  async getAllTransactions(): Promise<Transaction[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<any>('SELECT * FROM transactions ORDER BY timestamp DESC');
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      timestamp: r.timestamp,
      amount: r.amount,
      isDebit: r.isDebit === 1,
      syncStatus: r.syncStatus,
      hash: r.hash,
      prevHash: r.prevHash,
      signature: r.signature,
      txRef: r.txRef,
      nonce: r.nonce,
      customerId: r.customerId,
      vendorId: r.vendorId,
      payerId: r.payerId,
      payeeId: r.payeeId,
      deviceId: r.deviceId,
      nfcCardId: r.nfcCardId,
      fee: r.fee,
      campusId: r.campusId,
      idempotencyKey: r.idempotencyKey,
    }));
  },

  async getPendingTransactions(): Promise<Transaction[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<any>("SELECT * FROM transactions WHERE syncStatus = 'Pending'");
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      timestamp: r.timestamp,
      amount: r.amount,
      isDebit: r.isDebit === 1,
      syncStatus: r.syncStatus,
      hash: r.hash,
      prevHash: r.prevHash,
      signature: r.signature,
      txRef: r.txRef,
      nonce: r.nonce,
      customerId: r.customerId,
      vendorId: r.vendorId,
    }));
  },

  async insertTransaction(tx: Omit<Transaction, 'id' | 'hash' | 'prevHash' | 'signature' | 'txRef'> & { providedSignature?: string }): Promise<Transaction> {
    const db = await getDb();
    const all = await this.getAllTransactions();
    const prevHash = all.length > 0 ? all[0].hash : 'GENESIS';
    const timestamp = tx.timestamp || Date.now();
    const hash = await CryptoService.calculateBlockHash(prevHash, tx.title, tx.amount, timestamp);
    const signature = tx.providedSignature || (await CryptoService.signPayload(`${tx.title}|${tx.amount}|${timestamp}|${tx.isDebit}`));
    const txRef = `TXN-${tx.category.toUpperCase()}-${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`;

    await db.runAsync(
      `INSERT INTO transactions (
        title, category, timestamp, amount, isDebit, syncStatus, hash, prevHash, signature, txRef, nonce, customerId, vendorId, payerId, payeeId, deviceId, nfcCardId, fee, campusId, idempotencyKey
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        tx.title,
        tx.category,
        timestamp,
        tx.amount,
        tx.isDebit ? 1 : 0,
        tx.syncStatus,
        hash,
        prevHash,
        signature,
        txRef,
        tx.nonce || 0,
        tx.customerId || '',
        tx.vendorId || '',
        tx.payerId || '',
        tx.payeeId || '',
        tx.deviceId || 'DEV-BU-MOBILE',
        tx.nfcCardId || 'NFC-BU-10482',
        tx.fee || 0,
        tx.campusId || 'Babcock-Main',
        tx.idempotencyKey || `${Date.now()}-${Math.random()}`,
      ]
    );

    return {
      title: tx.title,
      category: tx.category,
      timestamp,
      amount: tx.amount,
      isDebit: tx.isDebit,
      syncStatus: tx.syncStatus,
      hash,
      prevHash,
      signature,
      txRef,
    };
  },

  async markPendingAsSynced(): Promise<void> {
    const db = await getDb();
    await db.runAsync("UPDATE transactions SET syncStatus = 'Synced' WHERE syncStatus = 'Pending'");
  },

  async verifyLedgerIntegrity(): Promise<boolean> {
    const list = (await this.getAllTransactions()).reverse();
    if (list.length === 0) return true;

    let expectedPrevHash = 'GENESIS';
    for (const tx of list) {
      if (tx.prevHash !== expectedPrevHash) return false;
      const computedHash = await CryptoService.calculateBlockHash(tx.prevHash, tx.title, tx.amount, tx.timestamp || Date.now());
      if (tx.hash !== computedHash) return false;
      expectedPrevHash = tx.hash;
    }
    return true;
  },

  async seedInitialDataIfEmpty(): Promise<void> {
    const list = await this.getAllTransactions();
    if (list.length === 0) {
      await this.insertTransaction({
        title: 'Wallet Top-up',
        category: 'topup',
        timestamp: Date.now() - 7200000,
        amount: 5000,
        isDebit: false,
        syncStatus: 'Synced',
      });
      await this.insertTransaction({
        title: "Mama Tee's Kitchen",
        category: 'food',
        timestamp: Date.now() - 3600000,
        amount: 650,
        isDebit: true,
        syncStatus: 'Synced',
      });
      await this.insertTransaction({
        title: 'Campus Print Hub',
        category: 'print',
        timestamp: Date.now() - 1800000,
        amount: 150,
        isDebit: true,
        syncStatus: 'Synced',
      });
    }
  },
};
