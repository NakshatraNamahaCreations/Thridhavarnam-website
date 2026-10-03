import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { productsApi, categoriesApi, backendToSaree, type BackendProduct } from '@/lib/api';
import { slugify, type Saree } from '@/lib/sarees';
import ProductDetail from '@/components/shop/ProductDetail';

// Pre-build every known product page at deploy time so they are served
// from the CDN edge rather than hitting the Next.js server on every visit.
// Unknown ids (new products added after the last deploy) still render
// on-demand via the default dynamicParams=true fallback.
export async function generateStaticParams() {
  const products = await productsApi.list().catch(() => []);
  return products.map((p) => ({ id: p.id }));
}

type Props = { params: Promise<{ id: string }> };

// Resolve a URL segment to a backend product. The segment can be either:
//   - the slugified product name ("mayura-kanjivaram")   ← new default
//   - the raw backend id ("SAR-1045")                     ← old bookmarks
// Try the direct id lookup first (one round-trip, works for old links),
// then fall back to a list scan matching slugify(name).
// Wrapped with React cache() so generateMetadata and ProductPage share
// a single backend call per segment within the same server render.
const resolveProduct = cache(async (segment: string): Promise<BackendProduct | null> => {
  try {
    return await productsApi.get(segment);
  } catch {
    // fall through to slug scan
  }
  try {
    const list = await productsApi.list();
    return list.find((p) => p.name && slugify(p.name) === segment) ?? null;
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await resolveProduct(id);
  if (!p) return { title: 'Not found · Thridha Varnam' };
  return {
    title: `${p.name ?? id} · Thridha Varnam`,
    description: p.story ?? p.description ?? undefined,
  };
}

function computeSimilar(all: BackendProduct[], current: Saree, categoryMap: Record<string, string>): Saree[] {
  const others = all.map((p) => backendToSaree(p, categoryMap)).filter((s) => s.id !== current.id);
  const sameWeave = current.weave ? others.filter((s) => s.weave === current.weave) : [];
  if (sameWeave.length > 0) return sameWeave;
  return others.filter((s) => Array.isArray(s.flags) && s.flags.includes('bestseller'));
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  // Categories are fetched alongside the product so backendToSaree can
  // resolve a product's admin-picked category id (e.g. "fancy-sarees")
  // to the display name ("Fancy Sarees"). Without the map, saree.weave
  // falls through to the raw id and the ProductDetail breadcrumb would
  // link to /shop?weave=<slug>, which no product on the catalogue matches.
  const [product, allProducts, categories] = await Promise.all([
    resolveProduct(id),
    productsApi.list().catch(() => [] as BackendProduct[]),
    categoriesApi.list().catch(() => []),
  ]);
  if (!product) notFound();
  const categoryMap: Record<string, string> = {};
  for (const c of categories) {
    if (c.id && c.name) categoryMap[c.id] = c.name;
  }
  const saree = backendToSaree(product, categoryMap);
  return (
    <ProductDetail
      saree={saree}
      backendProduct={product}
      similar={computeSimilar(allProducts, saree, categoryMap)}
    />
  );
}
