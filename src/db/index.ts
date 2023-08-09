import fs from 'fs';
import { Pool } from 'pg';
import { Kysely, Migrator, PostgresDialect } from 'kysely';
import { DatabaseSchema } from './schema';
import { migrationProvider } from './migrations';
import { Config } from '../config';

export function createDb(cfg: Config): Database {
  return new Kysely<DatabaseSchema>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: cfg.POSTGRES_CONNECTION_STRING,
        ssl: cfg.POSTGRES_CA_CERT_FILEPATH
          ? {
              rejectUnauthorized: true,
              ca: fs.readFileSync(cfg.POSTGRES_CA_CERT_FILEPATH),
            }
          : true,
      }),
    }),
  });
}

export async function migrateToLatest(db: Database) {
  const migrator = new Migrator({ db, provider: migrationProvider });
  const { error } = await migrator.migrateToLatest();
  if (error) throw error;
}

export type Database = Kysely<DatabaseSchema>;
