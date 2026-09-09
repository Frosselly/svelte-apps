import { drizzle } from 'drizzle-orm/libsql';
// import { createClient } from '@libsql/client';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
// import type { SQLiteTransaction } from 'drizzle-orm/sqlite-core';
import { relations } from './relations';
import type { SQLiteAsyncTransaction } from 'drizzle-orm/sqlite-core';
import type { ExtractTablesWithRelations } from 'drizzle-orm';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// const client = createClient({ url: env.DATABASE_URL });

export const db = drizzle(env.DATABASE_URL, { relations });

type SchemaType = ExtractTablesWithRelations<any, typeof schema>;

type TxCallback = Parameters<typeof db.transaction>[0];
export type Transaction = Parameters<TxCallback>[0];

export type DbClient = typeof db | Transaction;

// 2. Create your clean union type
// export type DbClient =
// 	| typeof db
// 	| SQLiteAsyncTransaction<'async', any, SchemaType>;

// SQLiteAsyncTransaction<"async", ResultSet, ExtractTablesWithRelations
//   ExtractTablesFromSchema<typeof import("$lib/server/db/schema")>>>;
