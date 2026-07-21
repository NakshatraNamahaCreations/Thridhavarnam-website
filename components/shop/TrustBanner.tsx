'use client';

export default function TrustBanner() {
  return (
    <div className="col-span-2 md:col-span-3 xl:col-span-4 my-2">
      <div className="grid grid-cols-1 md:grid-cols-3 border border-gray-200 bg-gray-50">
        <Cell icon={<HandIcon />} title="Handcrafted" body="Hand-woven by master weavers" />
        <Cell icon={<DiamondIcon />} title="Premium Quality" body="Pure silk, real silver-gold zari" />
        <Cell icon={<TruckIcon />} title="Free Shipping" body="Across India on every order" />
      </div>
    </div>
  );
}

function Cell({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex items-center gap-3 p-4 border-b md:border-b-0 md:border-r last:border-r-0 last:border-b-0 border-gray-200">
      <div className="shrink-0 text-[#75001F]">{icon}</div>
      <div>
        <div className="text-sm font-bold text-gray-900">{title}</div>
        <div className="text-xs text-gray-600">{body}</div>
      </div>
    </div>
  );
}

function HandIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 11V5a2 2 0 1 1 4 0v6" /><path d="M13 11V4a2 2 0 1 1 4 0v9" /><path d="M17 13V7a2 2 0 1 1 4 0v9a6 6 0 0 1-6 6h-3a8 8 0 0 1-8-8v-2a2 2 0 1 1 4 0v2" />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 3h12l4 6-10 12L2 9l4-6Z" /><path d="M2 9h20" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 7h11v9H3zM14 11h4l3 3v2h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17.5" cy="18" r="1.6" />
    </svg>
  );
}
