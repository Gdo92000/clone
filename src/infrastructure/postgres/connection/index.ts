import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export interface DbConfig {
  databaseUrl: string;
  maxConnections?: number;
}

let _client: ReturnType<typeof postgres> | null = null;
let _db: PostgresJsDatabase | null = null;

export function createConnection(config: DbConfig): PostgresJsDatabase {
  if (_db) return _db;

  _client = postgres(config.databaseUrl, {
    prepare: false,
    max: config.maxConnections ?? 10,
  });

  _db = drizzle(_client);

  return _db;
}

export function getConnection(): PostgresJsDatabase {
  if (!_db) {
    throw new Error(
      'Database connection not initialized. Call createConnection() first.',
    );
  }
  return _db;
}

export async function closeConnection(): Promise<void> {
  if (_client) {
    await _client.end();
    _client = null;
    _db = null;
  }
}
