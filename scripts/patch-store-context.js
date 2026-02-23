const fs = require('fs');
const path = require('path');

const filePath = 'c:\\B4 websie\\src\\context\\StoreContext.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Flexible Regex for LOAD logic
const loadRegex = /useEffect\s*\(\(\)\s*=>\s*\{[\s\S]*?const\s*savedGames\s*=\s*localStorage\.getItem\('clic7_games'\);[\s\S]*?if\s*\(savedGames\)\s*setGames\(JSON\.parse\(savedGames\)\);/m;

const newLoad = `useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products');
                if (response.ok) {
                    const data = await response.json();
                    if (data && Array.isArray(data)) {
                        setGames(data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch products from DB:', error);
                const savedGames = localStorage.getItem('clic7_games');
                if (savedGames) setGames(JSON.parse(savedGames));
            }
        };
        fetchProducts();`;

// Flexible Regex for CRUD functions
const crudRegex = /const\s*addGame\s*=\s*\(game:\s*Game\)\s*=>\s*setGames\(\(prev\)\s*=>\s*\[game,\s*\.\.\.prev\]\);[\s\S]*?const\s*updateGame\s*=\s*\(id:\s*string,\s*updates:\s*Partial<Game>\)\s*=>\s*\{[\s\S]*?setGames\(\(prev\)\s*=>\s*prev\.map\(\(g\)\s*=>\s*\(g\.id\s*===\s*id\s*\?\s*\{\s*\.\.\.g,\s*\.\.\.updates\s*\}\s*:\s*g\)\)\);[\s\S]*?\};[\s\S]*?const\s*deleteGame\s*=\s*\(id:\s*string\)\s*=>\s*setGames\(\(prev\)\s*=>\s*prev\.filter\(\(g\)\s*=>\s*g\.id\s*!==\s*id\)\);/m;

const newCRUD = `const addGame = async (game: Game) => {
        setGames((prev) => [game, ...prev]);
        try {
            await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(game)
            });
        } catch (error) { console.error('Sync failed', error); }
    };

    const updateGame = async (id: string, updates: Partial<Game>) => {
        setGames((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
        try {
            await fetch(\`/api/products/\${id}\`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (error) { console.error('Sync failed', error); }
    };

    const deleteGame = async (id: string) => {
        setGames((prev) => prev.filter((g) => g.id !== id));
        try {
            await fetch(\`/api/products/\${id}\`, {
                method: 'DELETE'
            });
        } catch (error) { console.error('Sync failed', error); }
    };`;

if (loadRegex.test(content)) {
    content = content.replace(loadRegex, newLoad);
    console.log('Load patch replaced');
} else {
    console.log('Load regex failed to match');
}

if (crudRegex.test(content)) {
    content = content.replace(crudRegex, newCRUD);
    console.log('CRUD patch replaced');
} else {
    console.log('CRUD regex failed to match');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('File saved');
