import { createClient } from '@supabase/supabase-js';
import { wordPacks } from '../src/data/wordPacks.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env manually
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        env[key] = value;
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials in .env!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function syncWords() {
    console.log("🚀 Syncing all word packs from wordPacks.js to Supabase 'spymals_words' table...");

    const rowsToInsert = [];
    const validPackKeys = ['standard', 'pop-culture', 'abstract', 'animals', 'geek', 'travel', 'food', 'fun', 'spicy'];

    for (const packKey of validPackKeys) {
        const list = wordPacks[packKey];
        if (!list) continue;

        for (const item of list) {
            rowsToInsert.push({
                civilian: item.civilian,
                undercover: item.undercover,
                pack_name: packKey
            });
        }
    }

    console.log(`Prepared ${rowsToInsert.length} word pairs to sync...`);

    const chunkSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < rowsToInsert.length; i += chunkSize) {
        const chunk = rowsToInsert.slice(i, i + chunkSize);
        const { data, error } = await supabase
            .from('spymals_words')
            .insert(chunk);

        if (error) {
            console.error(`Error inserting chunk starting at index ${i}:`, error.message);
        } else {
            insertedCount += chunk.length;
            console.log(`Inserted ${insertedCount}/${rowsToInsert.length} words...`);
        }
    }

    console.log("✅ Successfully synced all word packs to Supabase!");
}

syncWords().catch(console.error);
