import { applyCatalog, fallbackCatalog, type CatalogData, type Category, type Product, type Road, type RoadTheme } from './catalog';
import { CATALOG_TAG, supabaseKey, supabaseUrl } from './supabase-config';
import { cleanScene } from './road-scene';

type Row = Record<string, unknown>;
async function get<T = Row>(path: string): Promise<T[]> {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: { apikey: supabaseKey, Accept: 'application/json' },
    next: { revalidate: 300, tags: [CATALOG_TAG] },
  });
  if (!res.ok) throw new Error(`Supabase ${path}: ${res.status}`);
  return res.json();
}

// Loads the live catalogue (published rows only, enforced by RLS). Falls back to the bundled catalogue on any error.
export async function loadCatalog(): Promise<CatalogData> {
  try {
    const [cats, prods, roadRows, links] = await Promise.all([
      get('categories?select=id,title,sky,ground,road,ink,background,cloud,sort_order&is_published=eq.true&order=sort_order.asc,title.asc'),
      get('products?select=id,slug,title,description,category_id,image,thumb,sort_order&is_published=eq.true&order=sort_order.asc,title.asc'),
      get('roads?select=id,label,description,category_id,theme,scene,sort_order&is_published=eq.true&order=sort_order.asc'),
      get('road_products?select=road_id,product_id,position&order=position.asc'),
    ]);
    const catIds = new Set(cats.map(c => String(c.id)));
    const products: Product[] = prods.filter(p => catIds.has(String(p.category_id))).map(p => ({
      id: String(p.id), slug: String(p.slug), title: String(p.title), description: String(p.description ?? ''),
      category: String(p.category_id), image: String(p.image), thumb: String(p.thumb || p.image),
    }));
    const categories: Category[] = cats.map(c => ({
      id: String(c.id), title: String(c.title), sky: String(c.sky), ground: String(c.ground), road: String(c.road), ink: String(c.ink),
      background: String(c.background || ''), cloud: String(c.cloud || ''),
      products: products.filter(p => p.category === c.id).map(p => p.id),
    }));
    const roads: Road[] = roadRows.map(r => ({
      id: String(r.id), label: String(r.label), description: String(r.description ?? ''), category: String(r.category_id), theme: String(r.theme) as RoadTheme, scene: cleanScene(r.scene),
      products: links.filter(l => l.road_id === r.id).map(l => String(l.product_id)),
    }));
    if (!products.length || !categories.length) return fallbackCatalog;
    return { products, categories, roads };
  } catch (error) {
    console.error('Catalogue fallback in use:', error);
    return fallbackCatalog;
  }
}

export async function ensureCatalog() {
  const data = await loadCatalog();
  applyCatalog(data);
  return data;
}
