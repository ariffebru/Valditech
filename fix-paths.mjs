import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace href="/..." with href={`${import.meta.env.BASE_URL}...`}
    // Skip external URLs (http, https, #)
    content = content.replace(/href="\/((?!http|https|#)[^"]*?)"/g, (match, p1) => {
        return `href={\`\${import.meta.env.BASE_URL}${p1}\`}`;
    });

    // Replace src="/..." with src={`${import.meta.env.BASE_URL}...`}
    // Skip external URLs
    content = content.replace(/src="\/((?!http|https)[^"]*?)"/g, (match, p1) => {
        return `src={\`\${import.meta.env.BASE_URL}${p1}\`}`;
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
}

const files = [
    'src/layouts/Layout.astro',
    'src/components/Navbar.astro',
    'src/pages/index.astro',
    'src/pages/ugreen/index.astro'
];

files.forEach(f => processFile(path.join(__dirname, f)));
console.log('Done!');
