import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = 'https://toy-on.vercel.app';
const source = await readFile(new URL('../src/catalog.ts', import.meta.url), 'utf8');
const match = source.match(/^const data = (\{.*\});$/m);
if (!match) throw new Error('Could not read the approved product catalogue');
const { products, categories } = JSON.parse(match[1]);
const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const routes = [
  { path: '/', title: 'Toy-On | A world of shapes', description: `Explore Toy-On's collection of ${products.length} playful designs, from festive shapes to dinosaurs, vehicles and more.` },
  { path: '/products', title: 'All products | Toy-On', description: `Browse all ${products.length} Toy-On designs across ${categories.length} collections.` },
  { path: '/categories', title: 'Collections | Toy-On', description: `Explore ${categories.length} Toy-On collections and find shapes for celebrations, characters, animals and more.` },
  { path: '/about', title: 'About Toy-On | Toyon Industry Pvt Ltd', description: 'Meet Toy-On and explore a colourful world of shapes and product designs.' },
  { path: '/contact', title: 'Contact Toy-On', description: 'Prepare an enquiry about a Toy-On design. Review and send your message using your preferred contact channel.' },
  ...categories.map(category => ({ path: `/categories/${category.id}`, title: `${category.title} collection | Toy-On`, description: `Explore ${category.products.length} designs in the Toy-On ${category.title} collection.`, image: category.background })),
  ...products.map(product => ({ path: `/products/${product.slug}`, title: `${product.title} | Toy-On`, description: product.description, image: product.image })),
];

if (process.argv.includes('--prepare')) {
  const publicDir = new URL('../public/', import.meta.url);
  const urls = routes.map(route => `  <url><loc>${escape(base + route.path)}</loc></url>`).join('\n');
  await writeFile(new URL('sitemap.xml', publicDir), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  await writeFile(new URL('robots.txt', publicDir), `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
  await writeFile(new URL('llms.txt', publicDir), `# Toy-On\n\nToy-On is a collection of ${products.length} designs presented by Toyon Industry Pvt Ltd.\n\n- [Home](${base}/)\n- [All products](${base}/products)\n- [Collections](${base}/categories)\n- [About](${base}/about)\n- [Contact](${base}/contact)\n\nCollections: ${categories.map(category => `[${category.title}](${base}/categories/${category.id})`).join(', ')}.\n\nProduct pages contain visual descriptions of the supplied artwork. The contact form prepares a visitor-reviewed enquiry; it does not submit one automatically.\n`);
}

if (process.argv.includes('--pages')) {
  const dist = new URL('../dist/', import.meta.url);
  const distPath = fileURLToPath(dist);
  const template = await readFile(new URL('index.html', dist), 'utf8');
  for (const route of routes) {
    if (route.path === '/') continue;
    const destination = join(distPath, route.path.slice(1), 'index.html');
    await mkdir(join(distPath, route.path.slice(1)), { recursive: true });
    const page = template
      .replace(/<title>.*?<\/title>/, `<title>${escape(route.title)}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escape(route.description)}" />`)
      .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${escape(base + route.path)}" />`)
      .replace('</head>', `    <meta property="og:title" content="${escape(route.title)}" />\n    <meta property="og:description" content="${escape(route.description)}" />\n    <meta property="og:url" content="${escape(base + route.path)}" />\n    <meta property="og:type" content="${route.path.startsWith('/products/') ? 'product' : 'website'}" />${route.image ? `\n    <meta property="og:image" content="${escape(base + route.image)}" />` : ''}\n  </head>`);
    await writeFile(destination, page);
  }
  console.log(`Generated metadata pages for ${routes.length - 1} routes.`);
}
