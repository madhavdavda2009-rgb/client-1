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
  { path: '/', title: 'Products for Manufacturers & Business Buyers | Toy-On', description: `Explore ${products.length} Toy-On product designs for manufacturers and business buyers, with safety, cleanliness and thoughtful material choices in mind.` },
  { path: '/products', title: 'Products | Toy-On', description: `Browse ${products.length} Toy-On product designs across ${categories.length} themed collections for manufacturers and business buyers.` },
  { path: '/categories', title: 'Product Collections | Toy-On', description: `Explore ${categories.length} themed Toy-On product collections, including festive designs, animals and characters.` },
  { path: '/about', title: 'About Toyon Industry | Toy-On', description: 'Meet Toyon Industry Pvt Ltd: products for business buyers, with safety-minded materials and clean handling as priorities.' },
  { path: '/contact', title: 'Business Enquiries | Toy-On', description: 'Prepare a product enquiry with design choices, quantities, intended use and material or handling questions. Review and send it through your preferred contact channel.' },
  ...categories.map(category => ({ path: `/categories/${category.id}`, title: `${category.title} collection | Toy-On`, description: `Explore ${category.products.length} product designs in the Toy-On ${category.title} collection for business enquiries.`, image: category.background })),
  ...products.map(product => ({ path: `/products/${product.slug}`, title: `${product.title} | Toy-On`, description: `${product.description} Part of the Toy-On foil balloon range for business enquiries.`, image: product.image })),
];

if (process.argv.includes('--prepare')) {
  const publicDir = new URL('../public/', import.meta.url);
  const urls = routes.map(route => `  <url><loc>${escape(base + route.path)}</loc></url>`).join('\n');
  await writeFile(new URL('sitemap.xml', publicDir), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  await writeFile(new URL('robots.txt', publicDir), `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
  await writeFile(new URL('llms.txt', publicDir), `# Toy-On\n\nToy-On currently showcases ${products.length} foil balloon designs presented by Toyon Industry Pvt Ltd for manufacturers and business buyers. Safety-minded materials, cleanliness and careful handling are stated priorities. Toy drones, promotional toys and keychains are future plans and are not in the current catalogue.\n\n- [Home](${base}/)\n- [All products](${base}/products)\n- [Collections](${base}/categories)\n- [About](${base}/about)\n- [Contact](${base}/contact)\n\nCollections: ${categories.map(category => `[${category.title}](${base}/categories/${category.id})`).join(', ')}.\n\nProduct pages contain visual descriptions of the supplied artwork. The contact form prepares a visitor-reviewed enquiry; it does not submit one automatically.\n`);
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
