import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { productsApi, backendToSaree, type BackendProduct } from '@/lib/api';
import { slugify } from '@/lib/sarees';
import ProductDetail from '@/components/shop/ProductDetail';

type Props = { params: Promise<{ id: string }> };

// Enumerate every product URL at build time so `output: 'export'` can emit
// a static HTML file per product. We emit both the slug (new default) and
// the raw backend id (SAR-1045) so old bookmarks keep resolving.
export async function generateStaticParams() {
  try {
    const list = await productsApi.list();
    const params = new Set<string>();
    for (const p of list) {
      if (p.name) params.add(slugify(p.name));
      if (p.id) params.add(p.id);
    }
    return Array.from(params, (id) => ({ id }));
  } catch {
    return [];
  }
}

// Resolve a URL segment to a backend product. The segment can be either:
//   - the slugified product name ("mayura-kanjivaram")   ← new default
//   - the raw backend id ("SAR-1045")                     ← old bookmarks
// Try the direct id lookup first (one round-trip, works for old links),
// then fall back to a list scan matching slugify(name).
async function resolveProduct(segment: string): Promise<BackendProduct | null> {
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
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await resolveProduct(id);
  if (!p) return { title: 'Not found · Thridha Varnam' };
  return {
    title: `${p.name ?? id} · Thridha Varnam`,
    description: p.story ?? p.description ?? undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await resolveProduct(id);
  if (!product) notFound();
  return <ProductDetail saree={backendToSaree(product)} />;
}
