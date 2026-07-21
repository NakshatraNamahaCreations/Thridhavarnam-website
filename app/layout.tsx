import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import localFont from 'next/font/local';
import SmoothScroll from '@/components/SmoothScroll';
import AudioProvider from '@/components/AudioProvider';
import SiteShell from '@/components/SiteShell';
import Toaster from '@/components/shop/Toaster';
import { ShopProvider } from '@/lib/shop-store';
import { AuthProvider } from '@/lib/auth';
import './globals.css';

// ── Brand typography (per official Thridha Varnam kit, 2026-06-15) ────────
//
// Black Mango — primary display / headline face. Luxury contemporary serif.
// Loaded locally from public/fonts (it's not a Google Font). The kit
// shipped six weight files but only 400/500/600/700 are actually used
// across the codebase (extrabold was used once, black not at all) — so
// the heavier weight files are intentionally not loaded to keep first
// paint fast. If you ever do need 800/900, re-add the entries here and
// drop the matching .otf/.ttf back into public/fonts.
const blackMango = localFont({
  src: [
    { path: '../public/fonts/BlackMango-Regular.otf', weight: '400', style: 'normal' },
    { path: '../public/fonts/BlackMango-Medium.otf', weight: '500', style: 'normal' },
    { path: '../public/fonts/BlackMango-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../public/fonts/BlackMango-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
});

// Plus Jakarta Sans — secondary body / UI face. Clean geometric sans.
// Loaded via next/font/google for the optimal subset + self-hosting
// pipeline. Only weights with real usage in the codebase are pulled —
// 300 (light) has 13 occurrences and falls back gracefully to 400 if
// dropped, but we keep it for the few atelier-prose passages that need
// it. Larger weights (800/900) aren't requested anywhere.
const sans = Plus_Jakarta_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Thridha Varnam — Heirloom Sarees, Hand-Woven',
  description:
    'A house of heirloom silk sarees — Kanjeevaram, Banarasi, Mysore Silk, Mangalagiri, Pochampally, Gadwal, Patola, Fancy Sarees and Mixed Pattu drapes. Hand-woven, hand-finished, shipped worldwide.',
};

export const viewport: Viewport = {
  // `width` and `initialScale` are required for mobile responsiveness.
  // When `viewport` is exported, Next.js generates the <meta name="viewport">
  // tag from ONLY the properties listed here — omitting these falls back to
  // the browser's default 980px layout viewport, which renders the desktop
  // layout on phones and breaks every breakpoint.
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F7EAD9',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${blackMango.variable} ${sans.variable}`}
    >
      <body className="bg-ivory text-ink">
        <ShopProvider>
          <AuthProvider>
            <AudioProvider>
              <SmoothScroll>
                <SiteShell>{children}</SiteShell>
              </SmoothScroll>
            </AudioProvider>
            <Toaster />
          </AuthProvider>
        </ShopProvider>
      </body>
    </html>
  );
}
