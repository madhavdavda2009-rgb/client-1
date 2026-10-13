import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';

const svg = await readFile(new URL('../assets/brand/toyon-hierarchy.svg', import.meta.url), 'utf8');
await writeFile(new URL('../src/logo-inline.ts', import.meta.url), `// Generated from the supplied Toy-On SVG; do not edit by hand.\nexport const suppliedLogo = ${JSON.stringify(svg)};\n`);
await mkdir(new URL('../public/assets/brand/', import.meta.url), { recursive: true });
await copyFile(new URL('../assets/brand/toyon-hierarchy.svg', import.meta.url), new URL('../public/assets/brand/toyon-hierarchy.svg', import.meta.url));
