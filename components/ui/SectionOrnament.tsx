/**
 * SectionOrnament — heritage break between major page sections.
 *
 * Centred 8-point star-flower from the brand kit, flanked by two
 * thin maroon rules. Reads as a chapter break — used sparingly so
 * the page still has rhythm without feeling busy.
 */
export default function SectionOrnament({
  size = 24,
  tone = 'wine',
}: {
  size?: number;
  /** `wine` (default) for light page bgs; `cream` for dark sections. */
  tone?: 'wine' | 'cream';
}) {
  const ruleColor = tone === 'cream' ? 'bg-ivory/30' : 'bg-maroon/25';
  const markFilter =
    tone === 'cream'
      ? 'brightness(0) saturate(100%) invert(95%) sepia(15%) saturate(450%) hue-rotate(355deg)'
      : undefined;

  return (
    <div
      aria-hidden
      className="flex items-center justify-center gap-4 py-8 md:py-10 bg-ivory"
    >
      <span className={`h-px w-20 md:w-32 ${ruleColor}`} />
      <img
        src="/brand/star-flower.svg"
        alt=""
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          filter: markFilter,
          opacity: 0.85,
        }}
        draggable={false}
      />
      <span className={`h-px w-20 md:w-32 ${ruleColor}`} />
    </div>
  );
}
