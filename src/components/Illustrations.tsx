/**
 * Drawn for this product. They use real-looking names, numbers and messages, so each
 * picture shows what the app does. Decorative: the words beside them say the same.
 */

const INK = '#101322';
const BLUE = '#2540ff';
const SKY = '#e6eaff';
const SUN = '#ffc933';
const CORAL = '#ff6b4a';
const MINT = '#2fd08a';
const LINE = '#e7e9f1';
const SOFT = '#6b7084';

export function Mark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill={BLUE} />
      <path d="M14 20a6 6 0 0 1 6-6h24a6 6 0 0 1 6 6v17a6 6 0 0 1-6 6H29l-9 8v-8a6 6 0 0 1-6-6Z" fill="#fff" />
      <path d="M24 28.500h16m-6-6 6 6-6 6" fill="none" stroke={BLUE} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Tick({ x, y, r = 12, fill = MINT }: { x: number; y: number; r?: number; fill?: string }) {
  const s = r / 12;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={fill} />
      <path d={`M${x - 5 * s} ${y} l${3.500 * s} ${3.500 * s} l${6.500 * s} ${-7 * s}`} fill="none" stroke={INK} strokeWidth={2.500 * s} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function Cross({ x, y, r = 12 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={CORAL} />
      <path d={`M${x - 4} ${y - 4} l8 8 m0 -8 l-8 8`} stroke={INK} strokeWidth="2.500" strokeLinecap="round" />
    </g>
  );
}

function Bubble({ x, y, w, lines, fill = SKY, delay }: { x: number; y: number; w: number; lines: string[]; fill?: string; delay?: 1 | 2 | 3 }) {
  const h = 18 + lines.length * 17;
  return (
    <g className={delay ? `pop-${delay}` : undefined}>
      <rect x={x} y={y} width={w} height={h} rx="14" fill={fill} />
      <path d={`M${x + 3} ${y + h - 16}v24l18 -16Z`} fill={fill} />
      <text className="svg-t" fontSize="13.500" fill={INK}>
        {lines.map((line, i) => <tspan key={line} x={x + 14} y={y + 22 + i * 17}>{line}</tspan>)}
      </text>
    </g>
  );
}

/** A real list on the left becomes real messages on a phone on the right. */
export function HeroIllustration() {
  const rows: [string, string, 'ok' | 'bad'][] = [
    ['Amina', '0712 345 678', 'ok'],
    ['Brian', '+254 733 000 111', 'ok'],
    ['Wanjiku', '722 000 222', 'ok'],
    ['Otieno', '7.12E+08', 'bad'],
    ['Kamau', '0711 000 333', 'ok'],
  ];
  return (
    <svg className="illo illo-hero" viewBox="0 0 640 560" role="img" aria-label="A customer list becoming personal text messages on a phone">
      <path d="M322 34c114-20 262 42 292 174 28 124-46 280-186 318-136 36-290-30-318-166-26-132 84-306 212-326Z" fill={SKY} />
      <circle cx="84" cy="96" r="30" fill={SUN} className="float-b" />
      <path d="M36 492c46-22 86 12 128-8" fill="none" stroke={SUN} strokeWidth="7" strokeLinecap="round" />

      {/* The list */}
      <g className="float-a">
        <rect x="14" y="150" width="306" height="286" rx="18" fill="#fff" stroke={INK} strokeWidth="2.500" />
        <path d="M14 168a18 18 0 0 1 18-18h270a18 18 0 0 1 18 18v28H14Z" fill={BLUE} stroke={INK} strokeWidth="2.500" />
        <text className="svg-d" x="34" y="179" fill="#fff" fontWeight="700" fontSize="16">customers.csv</text>
        {rows.map(([name, phone, state], i) => {
          const y = 226 + i * 41;
          return (
            <g key={name}>
              <text className="svg-t" x="34" y={y} fontSize="14" fontWeight="600" fill={INK}>{name}</text>
              <text className="svg-t" x="106" y={y} fontSize="14" fill={state === 'bad' ? '#c43c1c' : SOFT}>{phone}</text>
              {state === 'ok' ? <Tick x={292} y={y - 5} r={10} /> : <Cross x={292} y={y - 5} r={10} />}
              {i < rows.length - 1 ? <path d={`M34 ${y + 17}h268`} stroke={LINE} strokeWidth="1.500" /> : null}
            </g>
          );
        })}
      </g>

      <path className="flow" d="M322 276c26-6 28-46 58-52" fill="none" stroke={INK} strokeWidth="2.500" strokeDasharray="2 9" strokeLinecap="round" />

      {/* The phone */}
      <g>
        <rect x="364" y="30" width="250" height="500" rx="40" fill={INK} />
        <rect x="376" y="42" width="226" height="476" rx="30" fill="#fff" />
        <rect x="452" y="54" width="74" height="16" rx="8" fill={INK} />
        <circle cx="489" cy="106" r="21" fill={BLUE} />
        <path d="M480 98h18a2.500 2.500 0 0 1 2.500 2.500v9a2.500 2.500 0 0 1-2.500 2.500h-10l-5 4.500V112h-3a2.500 2.500 0 0 1-2.500-2.500v-9A2.500 2.500 0 0 1 480 98Z" fill="#fff" />
        <text className="svg-d" x="489" y="146" textAnchor="middle" fontSize="15" fontWeight="700" fill={INK}>Your Business</text>
        <path d="M376 160h226" stroke={LINE} strokeWidth="1.500" />
        <Bubble x={392} y={176} w={196} lines={['Hi Amina, your order', 'is ready for collection.']} delay={1} />
        <Bubble x={392} y={262} w={196} lines={['Hi Brian, our offer', 'starts this Friday.']} delay={2} />
        <Bubble x={392} y={348} w={196} lines={['Hi Wanjiku, thank you', 'for shopping with us.']} delay={3} />
      </g>

      <g className="float-b">
        <rect x="498" y="446" width="136" height="50" rx="25" fill="#fff" stroke={INK} strokeWidth="2.500" />
        <Tick x={526} y={471} r={13} />
        <text className="svg-d" x="546" y="477" fontSize="16" fontWeight="700" fill={INK}>4 ready</text>
      </g>
    </svg>
  );
}

export function StepUpload() {
  return (
    <svg className="illo" viewBox="0 0 320 200" aria-hidden="true">
      <rect x="66" y="26" width="188" height="148" rx="14" fill="#fff" stroke={INK} strokeWidth="2.500" />
      <path d="M66 40a14 14 0 0 1 14-14h160a14 14 0 0 1 14 14v12H66Z" fill={SUN} stroke={INK} strokeWidth="2.500" />
      <text className="svg-d" x="82" y="45" fontSize="12.500" fontWeight="700" fill={INK}>customers.csv</text>
      {['Amina   0712 345 678', 'Brian   0733 000 111', 'Kamau   0711 000 333'].map((row, i) => (
        <g key={row}>
          <text className="svg-t" x="82" y={78 + i * 27} fontSize="12" fill={INK}>{row}</text>
          {i < 2 ? <path d={`M82 ${87 + i * 27}h156`} stroke={LINE} strokeWidth="1.500" /> : null}
        </g>
      ))}
      <g className="float-b">
        <circle cx="254" cy="160" r="27" fill={BLUE} stroke={INK} strokeWidth="2.500" />
        <path d="M254 173v-26m-10 10 10-10 10 10" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function StepWrite() {
  return (
    <svg className="illo" viewBox="0 0 320 200" aria-hidden="true">
      <rect x="40" y="34" width="228" height="112" rx="18" fill="#fff" stroke={INK} strokeWidth="2.500" />
      <path d="M70 145l-6 25 28-24" fill="#fff" stroke={INK} strokeWidth="2.500" strokeLinejoin="round" />
      <path d="M71 143h20" stroke="#fff" strokeWidth="4" />
      <text className="svg-d" x="60" y="76" fontSize="21" fontWeight="700" fill={INK}>Hi</text>
      <rect className="art-pulse" x="88" y="54" width="84" height="30" rx="9" fill={BLUE} />
      <text className="svg-d" x="130" y="75" textAnchor="middle" fontSize="17" fontWeight="700" fill="#fff">{'{name}'}</text>
      <text className="svg-t" x="60" y="112" fontSize="14" fill={INK}>your order is ready.</text>
      <g className="float-b">
        <path d="m222 150 46-46 17 17-46 46-24 7Z" fill={CORAL} stroke={INK} strokeWidth="2.500" strokeLinejoin="round" />
        <path d="m258 114 17 17" stroke={INK} strokeWidth="2.500" />
      </g>
    </svg>
  );
}

export function StepSend() {
  return (
    <svg className="illo" viewBox="0 0 320 200" aria-hidden="true">
      <path d="M38 158c34 6 62-4 86-26" fill="none" stroke={INK} strokeWidth="2.500" strokeDasharray="2 9" strokeLinecap="round" className="flow" />
      <g className="float-a">
        <path d="M112 96 288 28l-56 138-40-48Z" fill="#fff" stroke={INK} strokeWidth="2.500" strokeLinejoin="round" />
        <path d="m192 118 96-90-86 118Z" fill={BLUE} stroke={INK} strokeWidth="2.500" strokeLinejoin="round" />
      </g>
      <g className="art-pop" style={{ animationDelay: '0.45s' }}><Tick x={60} y={66} r={17} /></g>
      <g className="art-pop" style={{ animationDelay: '0.7s' }}><Tick x={118} y={38} r={12} /></g>
      <g className="art-pop" style={{ animationDelay: '0.95s' }}><Tick x={258} y={166} r={13} /></g>
    </svg>
  );
}

/** What actually happens to a messy list. */
export function CleanListIllustration() {
  const rows: { raw: string; note: string; state: 'ok' | 'bad' }[] = [
    { raw: '0712 345 678', note: 'Ready', state: 'ok' },
    { raw: '733000111', note: 'Fixed', state: 'ok' },
    { raw: '0712-345-678', note: 'Duplicate', state: 'bad' },
    { raw: '7.12E+08', note: 'Excel damaged', state: 'bad' },
    { raw: '+254 722 000 222', note: 'Ready', state: 'ok' },
  ];
  return (
    <svg className="illo" viewBox="0 0 460 300" aria-hidden="true">
      <rect x="30" y="18" width="400" height="264" rx="20" fill="#fff" stroke={INK} strokeWidth="2.500" />
      {rows.map((row, i) => {
        const y = 62 + i * 48;
        const good = row.state === 'ok';
        return (
          <g key={row.raw}>
            {good ? <Tick x={62} y={y - 5} /> : <Cross x={62} y={y - 5} />}
            <text className="svg-t" x="88" y={y} fontSize="16" fontWeight="600" fill={good ? INK : SOFT} textDecoration={good ? undefined : 'line-through'}>{row.raw}</text>
            <rect x={402 - (row.note.length * 7.600 + 22)} y={y - 20} width={row.note.length * 7.600 + 22} height="28" rx="14" fill={good ? '#dcf8ea' : '#ffeeea'} />
            <text className="svg-t" x={402 - (row.note.length * 7.600 + 22) / 2} y={y - 1} textAnchor="middle" fontSize="13" fontWeight="600" fill={good ? '#0b6b43' : '#a42b12'}>{row.note}</text>
            {i < rows.length - 1 ? <path d={`M50 ${y + 18}h360`} stroke={LINE} strokeWidth="1.500" /> : null}
          </g>
        );
      })}
    </svg>
  );
}

export function ConsentIllustration() {
  return (
    <svg className="illo" viewBox="0 0 460 300" aria-hidden="true">
      <rect x="34" y="42" width="270" height="104" rx="18" fill="#fff" stroke={INK} strokeWidth="2.500" />
      <text className="svg-t" fontSize="15" fill={INK}>
        <tspan x="54" y="78">Hi Amina, our offer starts</tspan>
        <tspan x="54" y="100">on Friday.</tspan>
      </text>
      <rect className="art-pulse" x="54" y="110" width="164" height="24" rx="12" fill={SUN} />
      <text className="svg-t" x="136" y="127" textAnchor="middle" fontSize="13" fontWeight="600" fill={INK}>Reply STOP to opt out</text>

      <rect x="176" y="172" width="250" height="100" rx="18" fill="#fff" stroke={INK} strokeWidth="2.500" />
      <text className="svg-d" x="196" y="202" fontSize="15" fontWeight="700" fill={INK}>Opt-outs</text>
      {['0733 000 111', '0722 000 222'].map((number, i) => (
        <g key={number}>
          <text className="svg-t" x="196" y={228 + i * 26} fontSize="14" fill={SOFT}>{number}</text>
          <text className="svg-t art-pop" style={{ animationDelay: `${0.5 + i * 0.35}s` }} x="406" y={228 + i * 26} textAnchor="end" fontSize="13" fontWeight="600" fill="#a42b12">Skipped</text>
        </g>
      ))}

      <g className="float-b">
        <path d="M384 34 436 54v36c0 32-22 50-52 62-30-12-52-30-52-62V54Z" fill={MINT} stroke={INK} strokeWidth="2.500" strokeLinejoin="round" />
        <path d="m362 90 16 16 28-32" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function CostIcon() {
  return (
    <svg className="mk-icon" viewBox="0 0 48 48" aria-hidden="true">
      <rect x="4" y="8" width="40" height="32" rx="9" fill={SUN} />
      <path d="M13 24h22M27 16l8 8-8 8" fill="none" stroke={INK} strokeWidth="3.500" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FormatIcon() {
  return (
    <svg className="mk-icon" viewBox="0 0 48 48" aria-hidden="true">
      <rect x="13" y="3" width="22" height="42" rx="6" fill={SKY} stroke={INK} strokeWidth="3" />
      <path d="m18 25 5 5 8-10" fill="none" stroke={BLUE} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PreviewIcon() {
  return (
    <svg className="mk-icon" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M8 6h32a5 5 0 0 1 5 5v20a5 5 0 0 1-5 5H21l-11 8v-8H8a5 5 0 0 1-5-5V11a5 5 0 0 1 5-5Z" fill="#dcf8ea" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M13 17h22M13 25h13" stroke={INK} strokeWidth="3.500" strokeLinecap="round" />
    </svg>
  );
}

export function RetryIcon() {
  return (
    <svg className="mk-icon" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M12 3h17l11 11v31H12Z" fill="#ffeeea" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M26 17v16m-7-7 7 7 7-7" fill="none" stroke={CORAL} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Closing picture: a paper plane leaving a trail of delivered messages. */
export function CtaIllustration() {
  return (
    <svg className="illo" viewBox="0 0 420 260" aria-hidden="true">
      <path className="flow" d="M18 214c62 22 124-4 170-66" fill="none" stroke={INK} strokeWidth="3" strokeDasharray="2 11" strokeLinecap="round" />
      <g className="float-a">
        <path d="M168 134 400 28l-72 192-58-66Z" fill="#fff" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="m270 154 130-126-116 166Z" fill={BLUE} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      </g>
      <g className="art-pop" style={{ animationDelay: '0.3s' }}><Tick x={66} y={118} r={20} /></g>
      <g className="art-pop" style={{ animationDelay: '0.6s' }}><Tick x={134} y={54} r={14} /></g>
    </svg>
  );
}
