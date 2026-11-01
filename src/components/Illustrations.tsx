/** Drawn for this product, so every picture shows what it actually does. Decorative: the words beside them say the same. */

const INK = '#101322';
const BLUE = '#2540ff';
const SKY = '#e6eaff';
const SUN = '#ffc933';
const CORAL = '#ff6b4a';
const MINT = '#2fd08a';

export function Mark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill={BLUE} />
      <path d="M14 20a6 6 0 0 1 6-6h24a6 6 0 0 1 6 6v17a6 6 0 0 1-6 6H29l-9 8v-8a6 6 0 0 1-6-6Z" fill="#fff" />
      <path d="M24 28.500h16m-6-6 6 6-6 6" fill="none" stroke={BLUE} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const Bubble = ({ x, y, w, fill = '#fff', lines = 2, tone = '#c9cfe4', tail = 'left' }: { x: number; y: number; w: number; fill?: string; lines?: number; tone?: string; tail?: 'left' | 'right' }) => {
  const h = 18 + lines * 13;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="14" fill={fill} stroke={INK} strokeWidth="2.500" />
      <path d={tail === 'left' ? `M${x + 14} ${y + h - 1} l-7 11 15 -9` : `M${x + w - 14} ${y + h - 1} l7 11 -15 -9`} fill={fill} stroke={INK} strokeWidth="2.500" strokeLinejoin="round" />
      {Array.from({ length: lines }, (_, i) => (
        <rect key={i} x={x + 14} y={y + 13 + i * 13} width={(w - 28) * (i === lines - 1 && lines > 1 ? 0.62 : 1)} height="6" rx="3" fill={tone} />
      ))}
    </g>
  );
};

/** A sheet of numbers on the left becomes messages landing on phones on the right. */
export function HeroIllustration() {
  return (
    <svg className="illo illo-hero" viewBox="0 0 620 520" role="img" aria-label="A spreadsheet of customer numbers turning into text messages on a phone">
      <circle cx="372" cy="262" r="218" fill={SKY} />
      <circle cx="296" cy="74" r="26" fill={SUN} className="float-b" />
      <path d="M36 410c70-18 118 8 150-16" fill="none" stroke={SUN} strokeWidth="6" strokeLinecap="round" />

      {/* The sheet */}
      <g className="float-a">
        <rect x="26" y="112" width="228" height="268" rx="16" fill="#fff" stroke={INK} strokeWidth="3" />
        <path d="M26 128a16 16 0 0 1 16-16h196a16 16 0 0 1 16 16v28H26Z" fill={BLUE} stroke={INK} strokeWidth="3" />
        <text x="46" y="141" fill="#fff" fontFamily="var(--display)" fontWeight="700" fontSize="17">customers.csv</text>
        {[0, 1, 2, 3, 4].map((row) => (
          <g key={row}>
            <rect x="46" y={176 + row * 38} width={[66, 52, 74, 58, 62][row]} height="10" rx="5" fill="#c9cfe4" />
            <rect x="134" y={176 + row * 38} width="84" height="10" rx="5" fill={row === 2 ? CORAL : INK} opacity={row === 2 ? 1 : 0.85} />
            {row < 4 ? <path d={`M46 ${200 + row * 38}h188`} stroke="#e9ebf3" strokeWidth="2" /> : null}
          </g>
        ))}
      </g>

      {/* The path between them */}
      <path d="M254 248c34 0 42-44 86-44" fill="none" stroke={INK} strokeWidth="3" strokeDasharray="3 10" strokeLinecap="round" />
      <path d="M254 292c40 0 44 40 92 40" fill="none" stroke={INK} strokeWidth="3" strokeDasharray="3 10" strokeLinecap="round" />

      {/* The phone */}
      <g>
        <rect x="346" y="42" width="222" height="440" rx="36" fill={INK} />
        <rect x="358" y="56" width="198" height="412" rx="26" fill="#fff" />
        <rect x="424" y="66" width="66" height="14" rx="7" fill={INK} />
        <circle cx="457" cy="118" r="20" fill={BLUE} />
        <path d="M447 112h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-9l-5 4v-4h-2a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" fill="#fff" />
        <rect x="412" y="146" width="90" height="8" rx="4" fill="#c9cfe4" />
        <g className="pop-1"><Bubble x={372} y={176} w={160} lines={3} fill={SKY} tone="#7f8df5" /></g>
        <g className="pop-2"><Bubble x={372} y={272} w={134} lines={2} fill={SKY} tone="#7f8df5" /></g>
        <g className="pop-3"><Bubble x={372} y={350} w={156} lines={3} fill="#fff" /></g>
      </g>

      {/* A delivered tick */}
      <g className="float-b">
        <circle cx="560" cy="376" r="33" fill={MINT} stroke={INK} strokeWidth="3" />
        <path d="m546 376 10 10 18-20" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function StepUpload() {
  return (
    <svg className="illo" viewBox="0 0 260 180" aria-hidden="true">
      <circle cx="130" cy="92" r="82" fill={SKY} />
      <path d="M92 28h58l28 28v98H92a0 0 0 0 1 0 0Z" fill="#fff" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M150 28v28h28" fill={SUN} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      {[74, 94, 114, 134].map((y, i) => (
        <g key={y}>
          <rect x="106" y={y} width="24" height="7" rx="3.500" fill="#c9cfe4" />
          <rect x="136" y={y} width="30" height="7" rx="3.500" fill={i === 1 ? BLUE : INK} />
        </g>
      ))}
      <circle cx="196" cy="138" r="24" fill={BLUE} stroke={INK} strokeWidth="3" />
      <path d="M196 150v-23m-9 9 9-9 9 9" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StepWrite() {
  return (
    <svg className="illo" viewBox="0 0 260 180" aria-hidden="true">
      <circle cx="130" cy="92" r="82" fill="#fff4cf" />
      <rect x="42" y="42" width="176" height="84" rx="18" fill="#fff" stroke={INK} strokeWidth="3" />
      <path d="M72 125l-7 21 25-20" fill="#fff" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <text x="60" y="76" fontFamily="var(--display)" fontWeight="700" fontSize="20" fill={INK}>Hi</text>
      <rect x="86" y="58" width="82" height="26" rx="8" fill={BLUE} />
      <text x="127" y="77" textAnchor="middle" fontFamily="var(--display)" fontWeight="700" fontSize="17" fill="#fff">{'{name}'}</text>
      <rect x="60" y="98" width="140" height="8" rx="4" fill="#c9cfe4" />
      <path d="m186 132 34-34 13 13-34 34-18 5Z" fill={CORAL} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

export function StepSend() {
  return (
    <svg className="illo" viewBox="0 0 260 180" aria-hidden="true">
      <circle cx="130" cy="92" r="82" fill="#dcf8ea" />
      <path d="M50 92 214 30l-52 124-30-44Z" fill="#fff" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="m132 110 82-80-68 96Z" fill={BLUE} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M36 134h44M22 156h34M70 158h22" stroke={INK} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function CleanListIllustration() {
  const rows = [
    { y: 34, w: 74, ok: true },
    { y: 76, w: 58, ok: false },
    { y: 118, w: 82, ok: true },
    { y: 160, w: 64, ok: false },
    { y: 202, w: 70, ok: true },
  ];
  return (
    <svg className="illo" viewBox="0 0 420 270" aria-hidden="true">
      <rect x="44" y="14" width="332" height="242" rx="20" fill="#fff" stroke={INK} strokeWidth="3" />
      {rows.map((row) => (
        <g key={row.y} opacity={row.ok ? 1 : 0.55}>
          <circle cx="78" cy={row.y + 8} r="13" fill={row.ok ? MINT : CORAL} stroke={INK} strokeWidth="2.500" />
          <path d={row.ok ? `m72 ${row.y + 8} 5 5 8-9` : `m73 ${row.y + 3} 10 10m0-10-10 10`} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="106" y={row.y + 2} width={row.w} height="12" rx="6" fill="#c9cfe4" />
          <rect x="206" y={row.y + 2} width="136" height="12" rx="6" fill={INK} />
          {!row.ok ? <path d={`M198 ${row.y + 8}h152`} stroke={CORAL} strokeWidth="3.500" strokeLinecap="round" /> : null}
        </g>
      ))}
    </svg>
  );
}

export function ConsentIllustration() {
  return (
    <svg className="illo" viewBox="0 0 420 270" aria-hidden="true">
      <circle cx="210" cy="135" r="118" fill="#fff" stroke={INK} strokeWidth="3" />
      <path d="M210 52 288 82v52c0 46-32 74-78 92-46-18-78-46-78-92V82Z" fill={SUN} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="m176 136 24 24 44-50" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
