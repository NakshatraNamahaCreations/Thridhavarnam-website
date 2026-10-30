'use client';

// Single context that fetches all home-page data in two parallel requests:
//   1. productsApi.list()       — product catalog (for Hero, BestSellers, Featured)
//   2. storefrontInitApi.get()  — categories, occasions, banners, coupons
//
// Without this, the home page was making 8 independent API calls (Hero,
// BestSellers, Featured, and WeaveRail each fetching on their own). Now every
// component reads from the same in-flight fetch via context.
import { createContext, useContext, useEffect, useState } from 'react';
import {
  productsApi,
  storefrontInitApi,
  categoriesApi,
  occasionsApi,
  bannersApi,
  priceBucketsApi,
  couponsApi,
  type BackendProduct,
  type BackendCategory,
  type BackendOccasion,
  type BackendBanner,
  type BackendPriceBucket,
  type BackendCoupon,
} from './api';

export type HomeData = {
  // null = still loading; [] = loaded but empty / errored
  products: BackendProduct[] | null;
  categories: BackendCategory[];
  occasions: BackendOccasion[];
  banners: BackendBanner[];
  priceBuckets: BackendPriceBucket[];
  coupons: BackendCoupon[];
};

const EMPTY: HomeData = {
  products: null,
  categories: [],
  occasions: [],
  banners: [],
  priceBuckets: [],
  coupons: [],
};

const HomeDataContext = createContext<HomeData>(EMPTY);

export function HomeDataProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial?: HomeData;
}) {
  const [data, setData] = useState<HomeData>(initial ?? EMPTY);

  useEffect(() => {
    // When the server component has already supplied data via ISR, skip
    // the client-side fetch — the next hard navigation / revalidate will
    // refresh it. Prevents a double round-trip on first paint of /home.
    if (initial && initial.products) return;

    let cancelled = false;

    // Try the batch endpoint first — one round-trip for all static data.
    // If it fails (e.g. backend not yet updated), fall back to individual
    // calls so banners, categories, and occasions still load.
    const fetchInit = () =>
      storefrontInitApi.get().catch(() =>
        Promise.all([
          categoriesApi.list().catch(() => [] as BackendCategory[]),
          occasionsApi.list().catch(() => [] as BackendOccasion[]),
          bannersApi.list().catch(() => [] as BackendBanner[]),
          priceBucketsApi.list().catch(() => [] as BackendPriceBucket[]),
          couponsApi.list().catch(() => [] as BackendCoupon[]),
        ]).then(([categories, occasions, banners, priceBuckets, coupons]) => ({
          categories, occasions, banners, priceBuckets, coupons,
        })),
      );

    Promise.all([
      productsApi.list().catch(() => [] as BackendProduct[]),
      fetchInit(),
    ]).then(([products, init]) => {
      if (cancelled) return;
      setData({
        products,
        categories: init.categories,
        occasions: init.occasions,
        banners: init.banners,
        priceBuckets: init.priceBuckets,
        coupons: init.coupons,
      });
    });
    return () => { cancelled = true; };
  }, [initial]);

  return (
    <HomeDataContext.Provider value={data}>
      {children}
    </HomeDataContext.Provider>
  );
}

export function useHomeData() {
  return useContext(HomeDataContext);
}
