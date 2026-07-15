import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env variables manually
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value.trim();
    }
  });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: Supabase VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in .env");
  process.exit(1);
}

console.log(`Connecting to Supabase at: ${supabaseUrl}...`);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const newPacks = {
  geek: [
    { civilian: "Console", undercover: "PC" },
    { civilian: "Clavier", undercover: "Souris" },
    { civilian: "Nintendo", undercover: "Sega" },
    { civilian: "Zelda", undercover: "Link" },
    { civilian: "Minecraft", undercover: "Roblox" },
    { civilian: "Fortnite", undercover: "PUBG" },
    { civilian: "Pokémon", undercover: "Digimon" },
    { civilian: "PlayStation", undercover: "Xbox" },
    { civilian: "Steve Jobs", undercover: "Bill Gates" },
    { civilian: "Google", undercover: "Apple" },
    { civilian: "Netflix", undercover: "Disney+" },
    { civilian: "Instagram", undercover: "TikTok" },
    { civilian: "YouTube", undercover: "Twitch" },
    { civilian: "Écran OLED", undercover: "Écran LCD" },
    { civilian: "Casque VR", undercover: "Lunettes AR" },
    { civilian: "Cyborg", undercover: "Robot" },
    { civilian: "Hacker", undercover: "Pirate" },
    { civilian: "Intelligence Artificielle", undercover: "Robotique" },
    { civilian: "Disquette", undercover: "Clé USB" },
    { civilian: "Code source", undercover: "Algorithme" }
  ],
  travel: [
    { civilian: "Paris", undercover: "Londres" },
    { civilian: "France", undercover: "Italie" },
    { civilian: "Espagne", undercover: "Portugal" },
    { civilian: "Plage", undercover: "Piscine" },
    { civilian: "Montagne", undercover: "Campagne" },
    { civilian: "Métro", undercover: "Tramway" },
    { civilian: "Avion", undercover: "Train" },
    { civilian: "Valise", undercover: "Sac à dos" },
    { civilian: "Hôtel", undercover: "Camping" },
    { civilian: "Passeport", undercover: "Carte d'identité" },
    { civilian: "Carte", undercover: "Boussole" },
    { civilian: "Valise", undercover: "Bagage à main" },
    { civilian: "Randonnée", undercover: "Escalade" },
    { civilian: "Tour Eiffel", undercover: "Arc de Triomphe" },
    { civilian: "Désert", undercover: "Savane" },
    { civilian: "Île", undercover: "Presqu'île" },
    { civilian: "Croisière", undercover: "Voilier" },
    { civilian: "Guide touristique", undercover: "GPS" },
    { civilian: "Souvenir", undercover: "Carte postale" },
    { civilian: "Valise à roulettes", undercover: "Sac de voyage" }
  ],
  food: [
    { civilian: "Pizza", undercover: "Lasagne" },
    { civilian: "Hamburger", undercover: "Hot-dog" },
    { civilian: "Frites", undercover: "Chips" },
    { civilian: "Sushi", undercover: "Sashimi" },
    { civilian: "Chocolat noir", undercover: "Chocolat au lait" },
    { civilian: "Crêpe", undercover: "Gaufre" },
    { civilian: "Croissant", undercover: "Pain au chocolat" },
    { civilian: "Coca-Cola", undercover: "Pepsi" },
    { civilian: "Café", undercover: "Thé" },
    { civilian: "Sel", undercover: "Poivre" },
    { civilian: "Beurre", undercover: "Margarine" },
    { civilian: "Miel", undercover: "Sirop d'érable" },
    { civilian: "Fromage", undercover: "Yaourt" },
    { civilian: "Kebab", undercover: "Tacos" },
    { civilian: "Crème brûlée", undercover: "Flan" },
    { civilian: "Pâtes", undercover: "Riz" },
    { civilian: "Bière", undercover: "Cidre" },
    { civilian: "Soupe", undercover: "Velouté" },
    { civilian: "Pomme", undercover: "Poire" },
    { civilian: "Orange", undercover: "Clémentine" }
  ],
  fun: [
    { civilian: "Chaussette", undercover: "Caleçon" },
    { civilian: "Dentifrice", undercover: "Mayonnaise" },
    { civilian: "Licorne", undercover: "Pégase" },
    { civilian: "Slip", undercover: "Boxer" },
    { civilian: "Pyjama", undercover: "Chemise de nuit" },
    { civilian: "Perruque", undercover: "Postiche" },
    { civilian: "Clown", undercover: "Mime" },
    { civilian: "Poubelle", undercover: "Benne" },
    { civilian: "Aspirateur", undercover: "Balai" },
    { civilian: "Brosse à dents", undercover: "Cure-dent" },
    { civilian: "Crayon", undercover: "Stylo" },
    { civilian: "Gomme", undercover: "Correcteur" },
    { civilian: "Papier toilette", undercover: "Essuie-tout" },
    { civilian: "Bonnet de douche", undercover: "Casque de vélo" },
    { civilian: "Chausson", undercover: "Pantoufle" },
    { civilian: "Moustache", undercover: "Barbe" },
    { civilian: "Salade", undercover: "Épinard" },
    { civilian: "Escargot", undercover: "Limace" },
    { civilian: "Grenouille", undercover: "Crapaud" },
    { civilian: "Coussin", undercover: "Oreiller" }
  ]
};

async function seed() {
  try {
    // 1. Read existing local words from src/data/wordPacks.js
    const wordPacksFilePath = path.resolve(process.cwd(), 'src/data/wordPacks.js');
    console.log(`Reading existing word packs from ${wordPacksFilePath}...`);
    
    // We import or dynamically parse the file. Since it's ES Module, we can read and parse/execute it or simply require it if we transform it.
    // To make it easy, we read the content and parse it as a JS object or we read the keys we already know.
    // Let's write a script to append the new packs to the JS file first!
    let wordPacksContent = fs.readFileSync(wordPacksFilePath, 'utf8');
    
    // Check if new packs are already in wordPacks.js
    if (!wordPacksContent.includes('geek: [')) {
      console.log("Updating local wordPacks.js file with new themes...");
      // We will inject the new themes inside the export const wordPacks object.
      // The object ends with "};\n". Let's insert the new packs before the closing "};".
      const closingBracketIndex = wordPacksContent.lastIndexOf('};');
      if (closingBracketIndex !== -1) {
        const toInsert = `,\n    geek: ${JSON.stringify(newPacks.geek, null, 8)},\n    travel: ${JSON.stringify(newPacks.travel, null, 8)},\n    food: ${JSON.stringify(newPacks.food, null, 8)},\n    fun: ${JSON.stringify(newPacks.fun, null, 8)}\n`;
        wordPacksContent = wordPacksContent.substring(0, closingBracketIndex) + toInsert + wordPacksContent.substring(closingBracketIndex);
        fs.writeFileSync(wordPacksFilePath, wordPacksContent, 'utf8');
        console.log("wordPacks.js file updated successfully!");
      }
    } else {
      console.log("Local wordPacks.js already contains the new themes.");
    }

    // Now let's extract all words from the updated wordPacks.js to seed Supabase
    // To do it safely without complex parsing, we can just rebuild the whole structure or import it.
    // Let's dynamically import it. Since node supports ES Module imports, we can use dynamic import().
    const { wordPacks } = await import(`file://${wordPacksFilePath}`);
    
    console.log("Preparing database seeding...");
    const rowsToInsert = [];
    
    for (const [packName, wordPairs] of Object.entries(wordPacks)) {
      console.log(`- Packing: ${packName} (${wordPairs.length} pairs)`);
      wordPairs.forEach(pair => {
        rowsToInsert.push({
          civilian: pair.civilian,
          undercover: pair.undercover,
          pack_name: packName
        });
      });
    }

    console.log(`Inserting ${rowsToInsert.length} word pairs into Supabase 'spymals_words' table...`);
    
    // Delete existing rows first to avoid duplicates if re-seeding
    console.log("Cleaning up old database words...");
    const { error: deleteError } = await supabase
      .from('spymals_words')
      .delete()
      .neq('id', 0); // deletes all rows

    if (deleteError) {
      console.error("Warning: failed to clear table (it might not exist yet):", deleteError.message);
      console.log("Please make sure you created the 'spymals_words' table in the Supabase SQL Editor first!");
      process.exit(1);
    }
    
    // Insert in batches of 100 to avoid limits
    const batchSize = 100;
    for (let i = 0; i < rowsToInsert.length; i += batchSize) {
      const batch = rowsToInsert.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('spymals_words')
        .insert(batch);
        
      if (insertError) {
        console.error(`Error inserting batch starting at index ${i}:`, insertError.message);
        process.exit(1);
      }
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(rowsToInsert.length / batchSize)}`);
    }

    console.log("🎉 Seeding completed successfully! All words are live on Supabase!");
  } catch (error) {
    console.error("Unexpected seeding error:", error);
    process.exit(1);
  }
}

seed();
