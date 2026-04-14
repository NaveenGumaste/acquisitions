import 'dotenv/config';

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

if (process.env.NEON_LOCAL === 'true') {
  neonConfig.fetchEndpoint =
    process.env.NEON_LOCAL_SQL_ENDPOINT || 'http://neon-local:5432/sql';
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

const sql = neon(databaseUrl);

const db = drizzle(sql);

export { db, sql };
