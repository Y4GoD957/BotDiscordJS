import { Low, JSONFile } from 'lowdb';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const adapter = new JSONFile(join(__dirname, '..', 'discord-bank.json'));
const db = new Low(adapter);

export async function initDB() {
    await db.read();
    db.data = db.data || {};
    return db;
}

export async function writeDB() {
    await db.write();
}

export default db;