'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAddresses, type Address, type AddressInput } from '@/lib/addresses';
import { useScrollLock } from '@/lib/scroll-lock';

const EMPTY: AddressInput = {
  fullName: '',
  phone: '',
  email: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
};

type View = 'list' | 'form';

type PinStatus =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'ok'; city: string; state: string }
  | { kind: 'notfound' }
  | { kind: 'error' };

// Indian city alt-spellings, all mapped to a single canonical form. Lets us
// accept "Bengaluru" when the API returns "Bangalore" without ALSO
// accepting unrelated cities like "Mysore" for a Bangalore pincode.
const CITY_ALIASES: Record<string, string> = {
  bengaluru: 'bangalore',
  mumbai: 'bombay',
  chennai: 'madras',
  kolkata: 'calcutta',
  kochi: 'cochin',
  puducherry: 'pondicherry',
  mysuru: 'mysore',
  thiruvananthapuram: 'trivandrum',
  tiruchirappalli: 'trichy',
  tiruchchirappalli: 'trichy',
  visakhapatnam: 'vizag',
  vadodara: 'baroda',
  gurugram: 'gurgaon',
  prayagraj: 'allahabad',
  varanasi: 'banaras',
};

const STATE_ALIASES: Record<string, string> = {
  tamilnadu: 'tamil nadu',
  pondicherry: 'puducherry',
  orissa: 'odisha',
  uttaranchal: 'uttarakhand',
};

function normalize(name: string, aliases: Record<string, string>): string {
  const lower = name.toLowerCase().trim();
  return aliases[lower] ?? lower;
}

// Substring-tolerant comparison applied AFTER alias normalisation. So
// "Bengaluru" + "Bangalore" → both normalise to "bangalore" → match.
// "Bangalore" + "Bangalore Urban" → substring match. "Mysore" + "Bangalore"
// → no alias overlap, no substring → no match (correct rejection).
function matchesCity(userInput: string, apiResult: string): boolean {
  const x = normalize(userInput, CITY_ALIASES);
  const y = normalize(apiResult, CITY_ALIASES);
  if (!x || !y) return false;
  return x === y || x.includes(y) || y.includes(x);
}

function matchesState(userInput: string, apiResult: string): boolean {
  const x = normalize(userInput, STATE_ALIASES);
  const y = normalize(apiResult, STATE_ALIASES);
  if (!x || !y) return false;
  return x === y || x.includes(y) || y.includes(x);
}

export default function AddressModal() {
  const router = useRouter();
  const {
    addresses,
    selectedId,
    selected,
    modalOpen,
    modalNextRoute,
    closeAddressModal,
    addAddress,
    updateAddress,
    removeAddress,
    selectAddress,
  } = useAddresses();

  const [view, setView] = useState<View>('list');
  const [draft, setDraft] = useState<AddressInput>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pin, setPin] = useState<PinStatus>({ kind: 'idle' });
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  // Reset to the right view each time the modal opens. If there are no
  // saved addresses, go straight to the form — the user has nothing to
  // pick from yet.
  useEffect(() => {
    if (!modalOpen) return;
    if (addresses.length === 0) {
      setView('form');
      setDraft(EMPTY);
      setEditingId(null);
    } else {
      setView('list');
    }
    setError(null);
  }, [modalOpen, addresses.length]);

  useScrollLock(modalOpen);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAddressModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen, closeAddressModal]);

  useEffect(() => {
    if (modalOpen && view === 'form') {
      const t = setTimeout(() => firstFieldRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [modalOpen, view]);

  // India Post pincode lookup. Debounced 400ms after the field hits 6 digits.
  // On success: auto-fill city + state IF empty (we never overwrite user
  // input — auto-fill is convenience, validate() catches mismatches). On
  // network failure: keep status 'error' but validate() still allows save,
  // so an API outage doesn't block legitimate addresses.
  useEffect(() => {
    if (draft.country !== 'India') {
      setPin({ kind: 'idle' });
      return;
    }
    const code = draft.pincode.trim();
    if (!/^[1-9]\d{5}$/.test(code)) {
      setPin({ kind: 'idle' });
      return;
    }
    setPin({ kind: 'checking' });
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${code}`);
        const json = await res.json();
        if (cancelled) return;
        const entry = Array.isArray(json) ? json[0] : null;
        if (entry?.Status === 'Success' && entry?.PostOffice?.length) {
          const po = entry.PostOffice[0];
          const city = String(po.District ?? '').trim();
          const state = String(po.State ?? '').trim();
          if (!city || !state) {
            setPin({ kind: 'notfound' });
            return;
          }
          setPin({ kind: 'ok', city, state });
          setDraft((d) => {
            if (d.pincode.trim() !== code) return d;
            return {
              ...d,
              city: d.city.trim() ? d.city : city,
              state: d.state.trim() ? d.state : state,
            };
          });
        } else {
          setPin({ kind: 'notfound' });
        }
      } catch {
        if (!cancelled) setPin({ kind: 'error' });
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [draft.pincode, draft.country]);

  if (!modalOpen) return null;

  const beginAdd = () => {
    setDraft(EMPTY);
    setEditingId(null);
    setError(null);
    setView('form');
  };

  const beginEdit = (a: Address) => {
    const { id: _id, ...rest } = a;
    setDraft(rest);
    setEditingId(a.id);
    setError(null);
    setView('form');
  };

  const validate = (d: AddressInput): string | null => {
    if (!d.fullName.trim()) return 'Enter the recipient name.';
    if (!/^[6-9]\d{9}$/.test(d.phone.replace(/\D/g, ''))) {
      return 'Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) return 'Enter a valid email address.';
    if (!d.line1.trim()) return 'Enter the address line.';
    if (d.city.trim().length < 2) return 'Enter a valid city name.';
    if (d.state.trim().length < 2) return 'Enter a valid state name.';

    if (d.country === 'India') {
      if (!/^[1-9]\d{5}$/.test(d.pincode.trim())) {
        return 'Enter a valid 6-digit Indian pincode.';
      }
      if (pin.kind === 'checking') return 'Verifying pincode — please wait.';
      if (pin.kind === 'notfound') return 'Pincode not recognised. Please check.';
      // pin.kind === 'error' → API outage; allow save so a flaky network
      // doesn't block a legitimate address.
      if (pin.kind === 'ok') {
        if (!matchesCity(d.city, pin.city)) {
          return `Pincode ${d.pincode} belongs to ${pin.city}, not ${d.city}.`;
        }
        if (!matchesState(d.state, pin.state)) {
          return `Pincode ${d.pincode} is in ${pin.state}, not ${d.state}.`;
        }
      }
    } else {
      if (!/^[A-Za-z0-9\s-]{3,12}$/.test(d.pincode.trim())) {
        return 'Enter a valid postal code.';
      }
    }
    return null;
  };

  const handleSaveForm = (e: FormEvent) => {
    e.preventDefault();
    const err = validate(draft);
    if (err) {
      setError(err);
      return;
    }
    if (editingId) {
      updateAddress(editingId, draft);
      selectAddress(editingId);
    } else {
      addAddress(draft);
    }
    setView('list');
  };

  const handleContinue = () => {
    if (!selectedId) {
      setError('Select an address to continue.');
      return;
    }
    closeAddressModal();
    if (modalNextRoute) router.push(modalNextRoute);
  };

  const headerTitle = view === 'form'
    ? (editingId ? 'Edit address' : 'Add a new address')
    : 'Delivery address';

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center px-3 py-4 sm:px-4 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-title"
      data-lenis-prevent
    >
      <button
        type="button"
        aria-label="Close"
        onClick={closeAddressModal}
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-[560px] max-h-[92vh] flex flex-col bg-ivory no-pattern shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 lg:px-5 py-3 border-b border-ink/10 bg-bone/30">
          {view === 'form' && addresses.length > 0 && (
            <button
              type="button"
              onClick={() => setView('list')}
              aria-label="Back to address list"
              className="shrink-0 w-8 h-8 flex items-center justify-center text-ink hover:text-maroon"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold tracking-widest text-ink/50">CHECKOUT</div>
            <h2 id="address-title" className="text-sm font-bold text-ink uppercase tracking-wide leading-tight">
              {headerTitle}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={closeAddressModal}
            className="shrink-0 w-8 h-8 flex items-center justify-center text-ink hover:text-maroon"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {view === 'list' && (
            <div className="p-4 lg:p-5">
              <ul className="space-y-2">
                {addresses.map((a) => (
                  <li key={a.id}>
                    <label
                      className={`block border p-3 lg:p-4 cursor-pointer transition-colors ${
                        selectedId === a.id
                          ? 'border-ink bg-bone/40'
                          : 'border-ink/15 hover:border-ink/40'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedId === a.id}
                          onChange={() => selectAddress(a.id)}
                          className="mt-1 accent-ink"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-ink">{a.fullName}</div>
                          <div className="text-xs text-ink/75 mt-1 leading-relaxed">
                            {a.line1}
                            {a.line2 && <>, {a.line2}</>}
                            <br />
                            {a.city}, {a.state} {a.pincode}, {a.country}
                          </div>
                          <div className="text-[11px] text-ink/55 mt-1.5 tabular-nums">
                            {a.phone} · {a.email}
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                beginEdit(a);
                              }}
                              className="text-[11px] font-semibold text-ink/70 hover:text-maroon underline underline-offset-2"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                removeAddress(a.id);
                              }}
                              className="text-[11px] font-semibold text-ink/70 hover:text-maroon underline underline-offset-2"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={beginAdd}
                className="mt-3 w-full border border-dashed border-ink/30 px-4 py-3 text-sm font-semibold text-ink hover:border-ink hover:bg-bone/30 transition-colors flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add a new address
              </button>

              {error && (
                <p className="mt-3 text-xs text-maroon font-medium" role="alert">{error}</p>
              )}
            </div>
          )}

          {view === 'form' && (
            <form onSubmit={handleSaveForm} className="p-4 lg:p-5 space-y-3" id="address-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field
                  label="Full name"
                  value={draft.fullName}
                  onChange={(v) => setDraft({ ...draft, fullName: v })}
                  autoComplete="name"
                  inputRef={firstFieldRef}
                  required
                />
                <div>
                  <Field
                    label="Phone"
                    type="tel"
                    value={draft.phone}
                    onChange={(v) =>
                      // Strip non-digits and cap at 10 — mirrors the
                      // pincode field. The Indian-mobile rule (must
                      // start with 6/7/8/9) is enforced inline via the
                      // hint below and again at submit-time.
                      setDraft({ ...draft, phone: v.replace(/\D/g, '').slice(0, 10) })
                    }
                    autoComplete="tel"
                    placeholder="9876543210"
                    inputMode="numeric"
                    required
                  />
                  <PhoneHint value={draft.phone} />
                </div>
              </div>

              <div>
                <Field
                  label="Email"
                  type="email"
                  value={draft.email}
                  onChange={(v) => setDraft({ ...draft, email: v })}
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                />
                <EmailHint value={draft.email} />
              </div>

              <Field
                label="Address line 1"
                value={draft.line1}
                onChange={(v) => setDraft({ ...draft, line1: v })}
                autoComplete="address-line1"
                placeholder="House / flat number, street"
                required
              />
              <Field
                label="Address line 2"
                value={draft.line2}
                onChange={(v) => setDraft({ ...draft, line2: v })}
                autoComplete="address-line2"
                placeholder="Apartment, landmark (optional)"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field
                  label="City"
                  value={draft.city}
                  onChange={(v) => setDraft({ ...draft, city: v })}
                  autoComplete="address-level2"
                  required
                />
                <Field
                  label="State"
                  value={draft.state}
                  onChange={(v) => setDraft({ ...draft, state: v })}
                  autoComplete="address-level1"
                  required
                />
                <div>
                  <Field
                    label="Pincode"
                    value={draft.pincode}
                    onChange={(v) =>
                      setDraft({
                        ...draft,
                        pincode:
                          draft.country === 'India'
                            ? v.replace(/\D/g, '').slice(0, 6)
                            : v.slice(0, 12),
                      })
                    }
                    autoComplete="postal-code"
                    inputMode={draft.country === 'India' ? 'numeric' : 'text'}
                    required
                  />
                  {draft.country === 'India' && (
                    <PinHint pin={pin} userCity={draft.city} userState={draft.state} />
                  )}
                </div>
              </div>

              <Select
                label="Country"
                value={draft.country}
                onChange={(v) => setDraft({ ...draft, country: v })}
                options={['India', 'United States', 'United Kingdom', 'Singapore', 'United Arab Emirates', 'Australia', 'Canada']}
              />

              {error && (
                <p className="text-xs text-maroon font-medium" role="alert">{error}</p>
              )}
            </form>
          )}
        </div>

        {/* Footer (sticky) */}
        <div className="border-t border-ink/10 bg-ivory no-pattern px-4 lg:px-5 py-3">
          {view === 'list' ? (
            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedId}
              className="w-full bg-maroon-deep text-ivory py-3 text-sm font-semibold tracking-wide hover:bg-maroon transition-colors disabled:bg-ink/40 disabled:cursor-not-allowed"
            >
              {modalNextRoute ? 'Deliver here · Continue' : 'Use this address'}
            </button>
          ) : (
            <button
              type="submit"
              form="address-form"
              className="w-full bg-maroon-deep text-ivory py-3 text-sm font-semibold tracking-wide hover:bg-maroon transition-colors"
            >
              {editingId ? 'Save changes' : 'Save address'}
            </button>
          )}

          <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-ink/55">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 3 4 6v6c0 5 4 8 8 9 4-1 8-4 8-9V6z" />
            </svg>
            Addresses are stored on this device only.
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  autoComplete,
  placeholder,
  inputMode,
  inputRef,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  inputMode?: 'numeric' | 'text' | 'tel' | 'email';
  inputRef?: React.MutableRefObject<HTMLInputElement | null>;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink/65 mb-1">
        {label}
        {required && <span className="text-maroon ml-0.5">*</span>}
      </span>
      <input
        ref={(el) => {
          if (inputRef) inputRef.current = el;
        }}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full border border-ink/20 px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-ink bg-ivory"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink/65 mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-ink/20 px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink bg-ivory"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function EmailHint({ value }: { value: string }) {
  const v = value.trim();
  if (!v) return null;
  if (!v.includes('@')) {
    return (
      <p className="mt-1 text-[10px] text-ink/55">
        Add an @ to continue (e.g. you@example.com).
      </p>
    );
  }
  const [local, domain = ''] = v.split('@');
  if (!local) {
    return (
      <p className="mt-1 text-[10px] text-maroon font-medium">
        Add the name before the @.
      </p>
    );
  }
  if (!domain.includes('.')) {
    return (
      <p className="mt-1 text-[10px] text-ink/55">
        Add a domain (e.g. gmail.com).
      </p>
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
    return (
      <p className="mt-1 text-[10px] text-maroon font-medium">
        Enter a valid email address.
      </p>
    );
  }
  return null;
}

function PhoneHint({ value }: { value: string }) {
  if (!value) return null;
  // Empty is fine — the "Required" red asterisk already prompts the
  // user. The hint only fires once they've typed something.
  if (value.length < 10) {
    return (
      <p className="mt-1 text-[10px] text-ink/55">
        {10 - value.length} more digit{10 - value.length === 1 ? '' : 's'} to go.
      </p>
    );
  }
  if (!/^[6-9]/.test(value)) {
    return (
      <p className="mt-1 text-[10px] text-maroon font-medium">
        Indian mobile numbers start with 6, 7, 8 or 9.
      </p>
    );
  }
  return null;
}

function PinHint({
  pin,
  userCity,
  userState,
}: {
  pin: PinStatus;
  userCity: string;
  userState: string;
}) {
  if (pin.kind === 'idle') return null;
  if (pin.kind === 'checking') {
    return <p className="mt-1 text-[10px] text-ink/55">Verifying pincode…</p>;
  }
  if (pin.kind === 'notfound') {
    return <p className="mt-1 text-[10px] text-maroon font-medium">Pincode not recognised.</p>;
  }
  if (pin.kind === 'error') {
    return <p className="mt-1 text-[10px] text-ink/55">Could not verify pincode.</p>;
  }
  // pin.kind === 'ok' — compare against what the user typed.
  const cityOk = !userCity.trim() || matchesCity(userCity, pin.city);
  const stateOk = !userState.trim() || matchesState(userState, pin.state);
  if (cityOk && stateOk) {
    return (
      <p className="mt-1 text-[10px] text-peacock font-medium">
        ✓ {pin.city}, {pin.state}
      </p>
    );
  }
  return (
    <div className="mt-1 text-[10px] text-maroon font-medium leading-snug">
      <p>⚠ Pincode is for {pin.city}, {pin.state}</p>
      {!cityOk && <p className="text-ink/70 font-normal">City does not match.</p>}
      {!stateOk && <p className="text-ink/70 font-normal">State does not match.</p>}
    </div>
  );
}
