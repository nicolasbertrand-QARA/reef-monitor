import { createContext, useContext } from 'react';
import { SQLiteDatabase } from 'expo-sqlite';

export const DatabaseContext = createContext<SQLiteDatabase | null>(null);

export function useDatabase(): SQLiteDatabase {
  const db = useContext(DatabaseContext);
  if (!db) throw new Error('useDatabase must be used within DatabaseProvider');
  return db;
}
