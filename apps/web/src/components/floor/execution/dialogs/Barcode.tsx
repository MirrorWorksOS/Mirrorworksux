/**
 * Code-128-style SVG barcode used in label previews. Renders a deterministic
 * pseudo-random bar pattern derived from the input string. Not a real Code-128
 * encode — for demos only — but visually convincing.
 */
interface BarcodeProps {
  value: string;
  height?: number;
  className?: string;
  showValue?: boolean;
}

export function Barcode({ value, height = 44, className, showValue = false }: BarcodeProps) {
  const bars = generateBars(value);
  const width = bars.reduce((acc, b) => acc + b.w, 0);

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        width="100%"
        height={height}
        role="img"
        aria-label={`Barcode for ${value}`}
      >
        <rect x={0} y={0} width={width} height={height} fill="#FFFFFF" />
        {bars.map((bar, i) => {
          if (!bar.dark) return null;
          return (
            <rect
              key={i}
              x={bar.x}
              y={0}
              width={bar.w}
              height={height}
              fill="#0F172A"
            />
          );
        })}
      </svg>
      {showValue ? (
        <div className="mt-1 text-center text-[10px] font-medium tracking-[0.16em] text-[var(--neutral-700)]">
          {value}
        </div>
      ) : null}
    </div>
  );
}

interface Bar {
  x: number;
  w: number;
  dark: boolean;
}

function generateBars(value: string): Bar[] {
  // Deterministic PRNG seeded by the value.
  let seed = 0;
  for (let i = 0; i < value.length; i++) {
    seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
  }
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };

  const widths = [1, 2, 3]; // Code-128 module widths look like this
  const bars: Bar[] = [];
  let x = 0;

  // Quiet zone start
  bars.push({ x, w: 8, dark: false });
  x += 8;

  // Start guard (dark · light · dark dark)
  for (const w of [2, 1, 4, 1]) {
    bars.push({ x, w, dark: bars.length % 2 === 1 });
    x += w;
  }

  // Body — 90 modules of pseudo-random alternating bars
  for (let i = 0; i < 90; i++) {
    const w = widths[Math.floor(rand() * widths.length)];
    bars.push({ x, w, dark: i % 2 === 0 });
    x += w;
  }

  // Stop guard
  for (const w of [3, 1, 1, 1, 4, 1]) {
    bars.push({ x, w, dark: bars.length % 2 === 1 });
    x += w;
  }

  // Quiet zone end
  bars.push({ x, w: 8, dark: false });

  return bars;
}
