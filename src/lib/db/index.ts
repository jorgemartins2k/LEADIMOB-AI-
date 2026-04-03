import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Em ambiente serverless (Vercel), cada função tem vida curta.
// max: 1 evita esgotar o pool de conexões do Supabase.
const client = postgres(connectionString, { max: 1 });

export const db = drizzle(client, { schema });
