'use client';

const promises = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 7h13l3 4v6h-3" />
        <path d="M3 7v10h3" />
        <circle cx="8" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
    title: 'Free Shipping Across India',
    body: 'On every order, no minimum',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 22s8-4 8-12V5l-8-3-8 3v5c0 8 8 12 8 12Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    title: 'Insured Worldwide Delivery',
    body: 'Every parcel tracked and signed for',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <path d="M3 10h18M7 15h2M12 15h2" />
      </svg>
    ),
    title: 'Secure Checkout',
    body: 'All major cards · UPI · COD',
  },
];

export default function Worldwide() {
  return (
    <section className="bg-ivory no-pattern border-t border-ink/10">
      {/* Thin trust bar */}
      <div className="max-w-[1720px] mx-auto px-6 lg:px-10 py-7 md:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-4">
          {promises.map((p, i) => (
            <div
              key={p.title}
              className={`flex items-center gap-3 px-2 ${
                i < promises.length - 1 ? 'md:border-r md:border-ink/10' : ''
              }`}
            >
              <div className="text-maroon shrink-0">{p.icon}</div>
              <div className="min-w-0">
                <div className="text-[0.78rem] font-semibold text-ink leading-tight">
                  {p.title}
                </div>
                <div className="text-[0.65rem] text-ink/60 mt-0.5">{p.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
