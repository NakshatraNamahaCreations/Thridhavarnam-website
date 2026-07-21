import Link from 'next/link';

const socials: { label: string; href: string; icon: React.ReactNode }[] = [
  { label: 'Instagram', href: 'https://instagram.com/tridhavarnam', icon: <IconInstagram /> },
  { label: 'Facebook', href: 'https://facebook.com/tridhavarnam', icon: <IconFacebook /> },
  { label: 'Pinterest', href: 'https://pinterest.com/tridhavarnam', icon: <IconPinterest /> },
  { label: 'YouTube', href: 'https://youtube.com/@tridhavarnam', icon: <IconYouTube /> },
  { label: 'WhatsApp', href: 'https://wa.me/919949528787', icon: <IconWhatsApp /> },
  { label: 'X', href: 'https://x.com/tridhavarnam', icon: <IconX /> },
];

export default function Footer() {
  return (
    <footer className="bg-maroon-deep text-ivory relative">
      <div className="max-w-[1480px] mx-auto px-8 lg:px-14 py-8 relative">
        {/* Brand + link columns */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-8 pb-6">
          {/* Brand block — left */}
          <div className="col-span-2 md:col-span-4">
            <img
              src="/brand/cream-logo-horizontal.svg"
              alt="Thridha Varnam"
              width={320}
              height={96}
              className="h-24 md:h-28 w-auto select-none"
              draggable={false}
            />
            <p className="mt-3 text-xs text-ivory/55 leading-relaxed max-w-xs">
              Hand-woven heirloom sarees from India&apos;s six weaving traditions,
              shipped worldwide.
            </p>

            <div className="mt-5">
              <div className="text-[0.65rem] tracking-[0.2em] uppercase text-ivory/55 mb-2">
                Follow Us
              </div>
              <div className="flex items-center gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-8 h-8 flex items-center justify-center border border-ivory/20 text-ivory/70 hover:text-ivory hover:border-ivory/60 hover:bg-ivory/5 transition-colors"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 max-w-xs text-xs">
              <div>
                <div className="text-[0.65rem] tracking-[0.2em] uppercase text-ivory/55 mb-1">
                  Get in touch
                </div>
                <a href="tel:+919949528787" className="text-ivory/75 hover:text-ivory">
                  +91 99495 28787
                </a>
              </div>
              <div>
                <div className="text-[0.65rem] tracking-[0.2em] uppercase text-ivory/55 mb-1">
                  Email us
                </div>
                <a
                  href="mailto:support@thridhavarnam.com"
                  className="text-ivory/75 hover:text-ivory break-all"
                >
                  support@thridhavarnam.com
                </a>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="text-xs font-semibold tracking-[0.18em] uppercase text-ivory mb-3">Shop</div>
            <ul className="space-y-1.5 text-xs text-ivory/65">
              <li><Link href="/shop" className="hover:text-ivory">All Sarees</Link></li>
              <li><Link href="/shop" className="hover:text-ivory">New In</Link></li>
              <li><Link href="/shop?tier=bridal" className="hover:text-ivory">Bridal</Link></li>
              <li><Link href="/shop?tier=festive" className="hover:text-ivory">Festive</Link></li>
              <li><Link href="/shop?tier=everyday" className="hover:text-ivory">Everyday</Link></li>
              <li><Link href="/bespoke" className="hover:text-ivory">Bespoke</Link></li>
              <li><Link href="/shop?sale=1" className="hover:text-ivory">Sale</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <div className="text-xs font-semibold tracking-[0.18em] uppercase text-ivory mb-3">Weaves</div>
            <ul className="space-y-1.5 text-xs text-ivory/65">
              <li><Link href="/shop?weave=Kanjivaram" className="hover:text-ivory">Kanjeevaram</Link></li>
              <li><Link href="/shop?weave=Banarasi" className="hover:text-ivory">Banarasi</Link></li>
              <li><Link href="/shop?weave=Mysore+Silk" className="hover:text-ivory">Mysore Silk</Link></li>
              <li><Link href="/shop?weave=Mangalagiri" className="hover:text-ivory">Mangalagiri</Link></li>
              <li><Link href="/shop?weave=Pochampally" className="hover:text-ivory">Pochampally</Link></li>
              <li><Link href="/shop?weave=Gadwal" className="hover:text-ivory">Gadwal</Link></li>
              <li><Link href="/shop?weave=Patola" className="hover:text-ivory">Patola</Link></li>
              <li><Link href="/shop?weave=Fancy+Sarees" className="hover:text-ivory">Fancy Sarees</Link></li>
              <li><Link href="/shop?weave=Mixed+Pattu+Sarees" className="hover:text-ivory">Mixed Pattu Sarees</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <div className="text-xs font-semibold tracking-[0.18em] uppercase text-ivory mb-3">Company</div>
            <ul className="space-y-1.5 text-xs text-ivory/65">
              <li><Link href="/about" className="hover:text-ivory">About Us</Link></li>
              <li><Link href="/account" className="hover:text-ivory">My Account</Link></li>
              <li><Link href="/account/orders" className="hover:text-ivory">My Orders</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <div className="text-xs font-semibold tracking-[0.18em] uppercase text-ivory mb-3">Help &amp; Policies</div>
            <ul className="space-y-1.5 text-xs text-ivory/65">
              <li><Link href="/shipping" className="hover:text-ivory">Shipping Policy</Link></li>
              <li><Link href="/returns" className="hover:text-ivory">Return &amp; Refund Policy</Link></li>
              <li><Link href="/care" className="hover:text-ivory">Care Guide</Link></li>
              <li><Link href="/privacy" className="hover:text-ivory">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-ivory">Terms &amp; Conditions</Link></li>
              <li><Link href="/contact" className="hover:text-ivory">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom strip — copyright (left) · developer credit (centre) ·
            Privacy/Terms (right). Stacks vertically on mobile so nothing
            overflows or truncates. */}
        <div
          data-footer-bottom
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pt-5 border-t border-ivory/10 text-[0.7rem] text-ivory/45"
        >
          <div>© {new Date().getFullYear()} Thridha Varnam · Hand-woven in India · Shipping worldwide</div>
          <div className="text-[0.7rem] text-ivory/45">
            Developed by{' '}
            <a
              href="https://www.nakshatranamahacreations.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ivory/65 hover:text-ivory transition-colors underline underline-offset-2"
            >
              Nakshatra Namaha Creations
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function IconInstagram() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13 22v-8h2.7l.4-3.1H13V8.9c0-.9.3-1.5 1.6-1.5h1.7V4.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7v3.1h2.6V22H13Z" />
    </svg>
  );
}

function IconPinterest() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9.2-.8 1.2-5.2 1.2-5.2s-.3-.6-.3-1.5c0-1.4.8-2.5 1.9-2.5.9 0 1.3.7 1.3 1.5 0 .9-.6 2.3-.9 3.6-.3 1.1.5 2 1.6 2 2 0 3.5-2.1 3.5-5.1 0-2.7-1.9-4.6-4.7-4.6-3.2 0-5.1 2.4-5.1 4.9 0 1 .4 2 .9 2.6.1.1.1.2.1.3l-.3 1.3c-.1.2-.2.3-.4.2-1.5-.7-2.5-2.9-2.5-4.7 0-3.8 2.8-7.4 8-7.4 4.2 0 7.4 3 7.4 7 0 4.2-2.6 7.5-6.3 7.5-1.2 0-2.4-.6-2.8-1.4l-.8 2.9c-.3 1.1-1 2.4-1.5 3.2A10 10 0 1 0 12 2Z" />
    </svg>
  );
}

function IconYouTube() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23 7.5a2.8 2.8 0 0 0-2-2C19.2 5 12 5 12 5s-7.2 0-9 .5a2.8 2.8 0 0 0-2 2C.5 9.3.5 12 .5 12s0 2.7.5 4.5a2.8 2.8 0 0 0 2 2c1.8.5 9 .5 9 .5s7.2 0 9-.5a2.8 2.8 0 0 0 2-2c.5-1.8.5-4.5.5-4.5s0-2.7-.5-4.5ZM10 15.3v-6.6L15.7 12 10 15.3Z" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.5 3.5A10 10 0 0 0 3.7 16.1L2 22l6.1-1.6a10 10 0 0 0 4.8 1.2 10 10 0 0 0 7.6-18.1Zm-7.6 16h-.1a8.4 8.4 0 0 1-4.3-1.2l-.3-.2-3.6 1 1-3.5-.2-.3a8.3 8.3 0 1 1 7.5 4.2Zm4.6-6.2c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.2l-.8 1c-.2.2-.3.2-.6.1A6.8 6.8 0 0 1 9.4 11c-.3-.4.3-.4.7-1.3.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.3c0 1.4 1 2.7 1.2 2.9.1.2 2 3 4.8 4.2 1.8.7 2.5.8 3.3.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.4Z" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.4 2.3h3.3L14.6 10.6l8.4 11.1h-6.6l-5.2-6.8-6 6.8H1.9l7.7-8.8L1.6 2.3h6.8l4.7 6.2 5.3-6.2Zm-1.2 17.4h1.8L7 4.1H5l12.2 15.6Z" />
    </svg>
  );
}
