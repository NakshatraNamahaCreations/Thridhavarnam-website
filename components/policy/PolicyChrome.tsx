import Link from 'next/link';

export function PolicyHeader({
  title,
  breadcrumb,
  updated = '1 June 2026',
}: {
  title: string;
  breadcrumb: string;
  updated?: string;
}) {
  return (
    <header className="border-b border-gray-200 bg-gray-50">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-8">
        <div className="text-[0.7rem] tracking-[0.12em] uppercase text-gray-500">{breadcrumb}</div>
        <h1 className="mt-2 text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-xs text-gray-500">Last updated · {updated}</p>
      </div>
    </header>
  );
}

export function PolicyBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4 uppercase tracking-wide">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function PolicyTable({
  head,
  rows,
}: {
  head: string[];
  rows: (readonly string[])[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {head.map((h) => (
              <th
                key={h}
                className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-900 border-b border-gray-200"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-gray-100 last:border-b-0">
              {r.map((cell, j) => (
                <td
                  key={j}
                  className={`px-4 py-2.5 text-gray-700 align-top ${
                    j === 0 ? 'font-semibold text-gray-900' : ''
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PolicyContactStrip({
  title = 'Still have a question?',
  subtitle = 'Our care team replies within one working day.',
}: {
  title?: string;
  subtitle?: string;
} = {}) {
  return (
    <div className="mt-10 border border-gray-200 bg-gray-50 p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-5 md:gap-8">
      <div className="md:max-w-md">
        <div className="text-sm font-bold text-gray-900">{title}</div>
        <div className="text-xs text-gray-600 mt-0.5 leading-relaxed">{subtitle}</div>
        <div className="text-xs text-gray-700 mt-1.5">
          <span className="font-semibold">Business Hours:</span> Monday – Saturday · 10:00 AM – 7:00 PM (IST)
        </div>
      </div>
      <div className="flex flex-col items-stretch md:items-end gap-2 text-xs shrink-0">
        <div className="flex flex-wrap gap-2 md:justify-end">
          <a
            href="mailto:support@thridhavarnam.com"
            className="bg-gray-900 text-white px-4 py-2 font-semibold tracking-wide hover:bg-[#75001F] transition-colors text-center"
          >
            support@thridhavarnam.com
          </a>
          <a
            href="tel:+919949528787"
            className="border border-gray-900 text-gray-900 px-4 py-2 font-semibold tracking-wide hover:bg-gray-900 hover:text-white transition-colors text-center"
          >
            +91 99495 28787
          </a>
        </div>
        <Link
          href="/contact"
          className="text-[#75001F] font-semibold underline underline-offset-2 md:text-right"
        >
          Contact form →
        </Link>
      </div>
    </div>
  );
}
