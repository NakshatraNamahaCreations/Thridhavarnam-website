import Link from 'next/link';

// Shared chrome for /privacy, /terms and any future legal page.
// Matches the /shipping, /returns, /care look: white body with a light
// gray header strip (breadcrumb + title + last-updated). Two-column
// layout below on desktop — sticky table of contents on the left,
// long-form sections on the right.

export type LegalSection = {
  id: string;   // anchor / TOC slug
  title: string;
  body: React.ReactNode;
};

export default function LegalShell({
  title,
  lastUpdated,
  intro,
  sections,
}: {
  title: string;
  lastUpdated: string;
  intro: React.ReactNode;
  sections: LegalSection[];
}) {
  return (
    <main className="bg-white text-gray-900 min-h-screen">
      {/* Header strip — mirrors <PolicyHeader> used on shipping/returns/care. */}
      <header className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-8">
          <nav aria-label="Breadcrumb" className="text-[0.7rem] tracking-[0.12em] uppercase text-gray-500">
            <Link href="/home" className="hover:text-gray-900">Home</Link>
            <span className="mx-1.5">/</span>
            <span className="text-gray-900">{title}</span>
          </nav>
          <h1 className="mt-2 text-2xl md:text-3xl font-bold text-gray-900">
            {title}
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Last updated · {lastUpdated}
          </p>
        </div>
      </header>

      <section className="max-w-[1100px] mx-auto px-6 lg:px-10 py-10">
        {intro && (
          <div className="text-sm text-gray-700 leading-relaxed max-w-[68ch] mb-8">
            {intro}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 md:gap-10">
          {/* TOC */}
          <aside className="hidden md:block">
            <div className="sticky top-[200px]">
              <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                On this page
              </div>
              <ul className="space-y-1.5">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Body */}
          <article className="max-w-[68ch]">
            {sections.map((s, i) => (
              <section
                key={s.id}
                id={s.id}
                className={i > 0 ? 'mt-8 pt-8 border-t border-gray-200' : ''}
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-3 scroll-mt-[200px]">
                  {s.title}
                </h2>
                <div className="text-sm text-gray-700 leading-relaxed space-y-3">
                  {s.body}
                </div>
              </section>
            ))}

            <div className="mt-10 pt-6 border-t border-gray-200 text-xs text-gray-500">
              Questions? Email{' '}
              <a
                href="mailto:support@thridhavarnam.com"
                className="underline underline-offset-2 hover:text-gray-900"
              >
                support@thridhavarnam.com
              </a>{' '}
              or call +91 99495 28787 (Monday – Saturday · 10:00 AM – 7:00 PM (IST)).
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
