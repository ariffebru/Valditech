import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Revert href={`${import.meta.env.BASE_URL}...`} back to href="/..."
    content = content.replace(/href=\{`\$\{import\.meta\.env\.BASE_URL\}(.*?)`\}/g, (match, p1) => {
        return `href="/${p1}"`;
    });

    // Revert src={`${import.meta.env.BASE_URL}...`} back to src="/..."
    content = content.replace(/src=\{`\$\{import\.meta\.env\.BASE_URL\}(.*?)`\}/g, (match, p1) => {
        return `src="/${p1}"`;
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Reverted ${filePath}`);
}

const files = [
    'src/layouts/Layout.astro',
    'src/components/Navbar.astro',
    'src/pages/index.astro',
    'src/pages/ugreen/index.astro'
];

files.forEach(f => processFile(path.join(__dirname, f)));
console.log('Done!');
