import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand palette (official kit, 2026-06-15) ───────────────────
        // Tokens keep their existing names so every `bg-ink`,
        // `text-maroon`, `bg-ivory`, etc. across the codebase picks
        // up the new brand colours without any per-component edits.
        ivory: '#F7EAD9',        // Cream — primary page background
        parchment: '#F7EAD9',    // Alias for ivory (kept for back-compat)
        bone: '#F9F9F9',         // Off-white — alt surface (cards on cream)
        ink: '#3F3F3F',          // Charcoal — body text on light
        ash: '#5D3E14',          // Espresso brown — rare accent
        whisper: '#6E5B4F',      // Quiet mid-tone, kept

        // Wine / maroon scale
        maroon: {
          DEFAULT: '#75001F',    // Deep wine — primary brand, logo, CTAs
          deep: '#4D0015',       // Deepest wine — display headings
          soft: '#A3002C',       // Mid maroon — accents, hover, badges
        },

        // Gold / bronze scale (warm accent)
        gold: {
          DEFAULT: '#E0AE6D',    // Tan
          deep: '#A66D23',       // Bronze
          soft: '#F2C99E',       // Lighter tan (derived for soft chips)
        },

        // ── System / semantic (NOT in brand kit) ───────────────────────
        // Kept so success states remain visually distinct from the
        // brand maroon used by errors / cancellations. If the brand
        // ever adds a success colour, update these to match.
        peacock: '#1F5E3B',      // Deep emerald — success ("Order placed", "Authorised")
        indigo: '#1E1B3A',       // Cool dark accent — legacy, used by intro illustrations
      },
      fontFamily: {
        // Brand typography per Thridha Varnam kit:
        //   display / serif → Black Mango (local, public/fonts/)
        //   sans            → Plus Jakarta Sans (Google Fonts)
        // `Black Mango` is the explicit @font-face name registered in
        // globals.css. The `var(--font-display)` is the next/font/local
        // variable from app/layout.tsx — kept as a fallback in case
        // Next.js's font pipeline is preferred. Either resolves to
        // the same font files.
        display: ['"Black Mango"', 'var(--font-display)', 'Georgia', 'serif'],
        serif: ['"Black Mango"', 'var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.3em',
        tightest: '-0.04em',
      },
      animation: {
        'shimmer': 'shimmer 8s ease-in-out infinite',
        'float': 'float 12s ease-in-out infinite',
        'fade-up': 'fadeUp 1.2s ease-out forwards',
        // Navbar icon micro-interactions
        'icon-bounce': 'iconBounce 0.55s cubic-bezier(.36,.07,.19,.97) both',
        'icon-heartbeat': 'iconHeartbeat 0.7s cubic-bezier(.4,0,.2,1) both',
        'badge-pop': 'badgePop 0.45s cubic-bezier(.34,1.56,.64,1) both',
        'menu-in': 'menuIn 0.18s cubic-bezier(.16,1,.3,1) both',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Bag — quick lift + tilt + settle. Reads as the bag being
        // tossed open when an item lands in it.
        iconBounce: {
          '0%':   { transform: 'translateY(0) rotate(0)' },
          '20%':  { transform: 'translateY(-4px) rotate(-8deg)' },
          '45%':  { transform: 'translateY(-2px) rotate(6deg)' },
          '70%':  { transform: 'translateY(-1px) rotate(-3deg)' },
          '100%': { transform: 'translateY(0) rotate(0)' },
        },
        // Heart — two soft beats. Used when an item is added to wishlist.
        iconHeartbeat: {
          '0%':   { transform: 'scale(1)' },
          '15%':  { transform: 'scale(1.22)' },
          '30%':  { transform: 'scale(1)' },
          '45%':  { transform: 'scale(1.16)' },
          '60%':  { transform: 'scale(1)' },
          '100%': { transform: 'scale(1)' },
        },
        // Badge — a confident overshoot when the count changes.
        badgePop: {
          '0%':   { transform: 'scale(0.4)', opacity: '0' },
          '60%':  { transform: 'scale(1.25)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        // Account dropdown — fade + soft drop from the trigger origin.
        menuIn: {
          '0%':   { opacity: '0', transform: 'translateY(-4px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
