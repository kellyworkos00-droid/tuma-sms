'use client';

import { useEffect, useRef, useState } from 'react';

import { countSegments, displayPhone, normalizePhone, renderMessage } from '@/lib/sms';

/**
 * Small working pictures of the product. They use the app's own number cleaning and
 * SMS counting, so what they show is what really happens. They rest when off screen,
 * and hold their finished state for anyone who prefers reduced motion.
 */

function useLoop(stepMs: number, steps: number, restAt: number) {
  const holder = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(restAt);

  useEffect(() => {
    const element = holder.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const stop = () => { if (timer) clearInterval(timer); timer = undefined; };
    const observer = new IntersectionObserver(([entry]) => {
      stop();
      if (!entry.isIntersecting) return;
      setStep(0);
      timer = setInterval(() => setStep((current) => (current + 1) % steps), stepMs);
    }, { threshold: 0.25 });
    observer.observe(element);
    return () => { stop(); observer.disconnect(); };
  }, [stepMs, steps]);

  return { holder, step };
}

const Status = ({ state }: { state: 'wait' | 'busy' | 'ok' | 'bad' }) => (
  <span className={`live-status is-${state}`} aria-hidden="true">
    {state === 'ok' ? <svg viewBox="0 0 16 16"><path d="m4 8.500 2.700 2.700L12 5.500" /></svg> : null}
    {state === 'bad' ? <svg viewBox="0 0 16 16"><path d="m5 5 6 6m0-6-6 6" /></svg> : null}
  </span>
);

const HERO_ROWS = [
  { name: 'Amina', raw: '0712 345 678', text: 'Hi Amina, your order is ready for collection.' },
  { name: 'Brian', raw: '+254 733 000 111', text: 'Hi Brian, your order is ready for collection.' },
  { name: 'Wanjiku', raw: '722 000 222', text: 'Hi Wanjiku, your order is ready for collection.' },
  { name: 'Otieno', raw: '7.12E+08', text: '' },
  { name: 'Kamau', raw: '0711 000 333', text: 'Hi Kamau, your order is ready for collection.' },
];
const HERO_GOOD = HERO_ROWS.filter((row) => normalizePhone(row.raw));

/** A list is checked row by row, then the good numbers receive their own message. */
export function LiveHero() {
  const steps = HERO_ROWS.length + HERO_GOOD.length + 7;
  const { holder, step } = useLoop(650, steps, steps - 1);
  const checked = Math.min(step, HERO_ROWS.length);
  const ready = HERO_ROWS.slice(0, checked).filter((row) => normalizePhone(row.raw)).length;
  const received = HERO_GOOD.slice(0, Math.max(0, step - HERO_ROWS.length));

  return (
    <div className="live-hero" ref={holder} role="img" aria-label="A customer list being checked, then personal text messages arriving on a phone">
      <div className="live-hero-inner">
        <span className="live-shape live-shape-sun" />
        <span className="live-shape live-shape-sky" />

        <div className="live-sheet">
          <div className="live-sheet-head"><span>customers.csv</span><b>{checked} of {HERO_ROWS.length}</b></div>
          {HERO_ROWS.map((row, index) => {
            const good = Boolean(normalizePhone(row.raw));
            const state = index < checked ? (good ? 'ok' : 'bad') : index === checked ? 'busy' : 'wait';
            return (
              <div className={`live-row${state === 'bad' ? ' is-bad' : ''}`} key={row.name}>
                <b>{row.name}</b>
                <span>{row.raw}</span>
                <Status state={state} />
              </div>
            );
          })}
        </div>

        <div className="live-phone">
          <span className="live-phone-notch" />
          <div className="live-phone-head"><span className="live-avatar">Y</span><b>Your Business</b></div>
          <div className="live-phone-body">
            {received.map((row) => <p className="live-bubble" key={row.name}>{row.text}</p>)}
          </div>
        </div>

        <div className="live-chip"><Status state="ok" /><b>{ready} ready</b></div>
      </div>
    </div>
  );
}

const TEMPLATE = 'Hi {name}, your order is ready.';
const PEOPLE = ['Amina', 'Brian', 'Wanjiku'];

/** The message is typed once, then the same words arrive personalised for each person. */
export function LiveComposer() {
  const typing = TEMPLATE.length;
  const steps = typing + 34;
  const { holder, step } = useLoop(70, steps, steps - 1);
  const typed = TEMPLATE.slice(0, step);
  const done = step >= typing;
  const shown = Math.min(PEOPLE.length, Math.max(0, Math.floor((step - typing) / 6)));
  const count = countSegments(renderMessage(typed, { name: 'Wanjiku' }));
  const parts = typed.split(/(\{name\})/);

  return (
    <div className="live-compose" ref={holder} role="img" aria-label="One message with a name field, delivered with each customer's own name">
      <div className="live-box">
        <div className="live-box-tokens"><span>Personalise</span><em>{'{name}'}</em></div>
        <p className="live-box-text">
          {parts.map((part, index) => (part === '{name}' ? <mark key={index}>{part}</mark> : <span key={index}>{part}</span>))}
          {!done ? <i className="live-caret" /> : null}
        </p>
        <div className="live-box-foot">
          <div className="live-meter"><span style={{ width: `${Math.min(100, (count.length / 160) * 100)}%` }} /></div>
          <small><b>{count.segments || 1} SMS</b> per person · {160 - count.length} characters left</small>
        </div>
      </div>
      <div className="live-arrival" aria-hidden="true">
        {PEOPLE.map((person, index) => (
          <p key={person} className={`live-bubble live-bubble-large${index < shown ? ' is-on' : ''}`}>
            {renderMessage(TEMPLATE, { name: person }).split(person).map((text, i) => (i === 0 ? <span key={i}>{text}<b>{person}</b></span> : <span key={i}>{text}</span>))}
          </p>
        ))}
      </div>
    </div>
  );
}

const MESSY = ['0712 345 678', '733000111', '0712-345-678', '7.12E+08', '+254 722 000 222', '12345'];
const CLEANED = (() => {
  const seen = new Set<string>();
  return MESSY.map((raw) => {
    const phone = normalizePhone(raw);
    if (!phone) return { raw, shown: raw, note: /e\+?\d/i.test(raw) ? 'Excel damaged' : 'Not valid', good: false };
    if (seen.has(phone)) return { raw, shown: displayPhone(phone), note: 'Duplicate', good: false };
    seen.add(phone);
    return { raw, shown: displayPhone(phone), note: 'Ready', good: true };
  });
})();

/** Messy numbers go through the app's own cleaning, one by one. */
export function LiveCleanList() {
  const steps = MESSY.length + 6;
  const { holder, step } = useLoop(800, steps, steps - 1);
  const checked = Math.min(step, MESSY.length);
  const done = CLEANED.slice(0, checked);

  return (
    <div className="live-clean" ref={holder} role="img" aria-label="Messy phone numbers being corrected, with duplicates and invalid numbers set aside">
      {CLEANED.map((row, index) => {
        const after = index < checked;
        return (
          <div className={`live-clean-row${after ? (row.good ? ' is-good' : ' is-bad') : ''}${index === checked ? ' is-now' : ''}`} key={row.raw}>
            <Status state={after ? (row.good ? 'ok' : 'bad') : index === checked ? 'busy' : 'wait'} />
            <span className="live-clean-number">{after ? row.shown : row.raw}</span>
            <span className="live-clean-note">{after ? row.note : ''}</span>
          </div>
        );
      })}
      <div className="live-clean-total">
        <div><b>{done.filter((row) => row.good).length}</b><span>Ready to send</span></div>
        <div><b>{done.filter((row) => !row.good).length}</b><span>Set aside, not paid for</span></div>
      </div>
    </div>
  );
}

const COST_FRAMES = [
  'Hi Amina, your order is ready for collection.',
  'Hi Amina, your order is ready for collection at our Westlands shop. We are open from 8am to 6pm, Monday to Saturday. Please bring your receipt and your ID so we can hand it over quickly.',
  'Hi Amina, your order is ready 🎉',
];

/** The real SMS count for three messages, including what one emoji does to the limit. */
export function LiveCost() {
  const { holder, step } = useLoop(3000, COST_FRAMES.length, 1);
  const text = COST_FRAMES[step];
  const count = countSegments(text);
  const fill = (1 - (count.segments * count.perSegment - count.length) / count.perSegment) * 100;

  return (
    <div className="live-cost" ref={holder} role="img" aria-label="A message's SMS count changing with its length and with an emoji">
      <div className="live-cost-message"><p className="live-bubble live-bubble-large is-on" key={text}>{text}</p></div>
      <div className="live-cost-numbers">
        <div className={count.segments > 1 ? 'is-warn' : ''}><b key={count.segments}>{count.segments}</b><span>SMS per person</span></div>
        <div><b>{count.length}</b><span>Characters</span></div>
        <div className={count.encoding === 'Unicode' ? 'is-warn' : ''}><b>{count.perSegment}</b><span>Limit per SMS</span></div>
      </div>
      <div className="live-meter"><span className={count.segments > 1 || count.encoding === 'Unicode' ? 'is-warn' : ''} style={{ width: `${Math.min(100, fill)}%` }} /></div>
    </div>
  );
}
