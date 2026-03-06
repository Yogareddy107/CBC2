import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

async function inspect() {
    console.log('--- Database Inspection ---');
    try {
        const tables = await db.run(sql`SELECT name FROM sqlite_master WHERE type='table'`);
        console.log('Tables:', JSON.stringify(tables, null, 2));

        const conversationsInfo = await db.run(sql`PRAGMA table_info(conversations)`);
        console.log('Conversations Table Info:', JSON.stringify(conversationsInfo, null, 2));

        const messagesInfo = await db.run(sql`PRAGMA table_info(messages)`);
        console.log('Messages Table Info:', JSON.stringify(messagesInfo, null, 2));

    } catch (error) {
        console.error('Inspection failed:', error);
    }
}

inspect();
