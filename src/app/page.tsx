import Link from 'next/link';

import {
  CleanListIllustration,
  ConsentIllustration,
  HeroIllustration,
  Mark,
  StepSend,
  StepUpload,
  StepWrite,
} from '@/components/Illustrations';
import { BRAND } from '@/lib/brand';

const STEPS = [
  { art: <StepUpload />, title: 'Upload your list', body: 'Drop in a CSV from Excel, Google Sheets or your till system. We find the phone column for you.' },
  { art: <StepWrite />, title: 'Write one message', body: 'Add {name} or any column from your sheet, and every customer gets a message written for them.' },
  { art: <StepSend />, title: 'Send and see results', body: 'Check the count and cost, press send, then see which numbers went through and which did not.' },
];

const FEATURES = [
  { title: 'Every Kenyan number format', body: '0712, 712, +254 and 254 all become one correct number, so nothing is missed because of how it was typed.' },
  { title: 'Costs before you press send', body: 'Long messages and emojis quietly become two or three SMS. We show the true count first and point out what caused it.' },
  { title: 'A phone preview', body: 'See exactly what your first customer will read, with their name and details filled in.' },
  { title: 'Failed numbers, ready to fix', body: 'Download the numbers that did not go through and deal with those alone, without messaging everyone again.' },
];

const AUDIENCES = ['Shops', 'Schools', 'Saccos', 'Churches', 'Clinics', 'Salons', 'Landlords', 'Delivery services'];

export default function MarketingPage() {
  return (
    <div className="mk">
      <header className="mk-nav">
        <Link href="/" className="brand"><Mark /><span>{BRAND.name}</span></Link>
        <nav aria-label="Main">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <Link className="btn btn-dark btn-small" href="/login">Sign in</Link>
        </nav>
      </header>

      <main>
        <section className="mk-hero">
          <div className="mk-hero-copy">
            <p className="kicker">{BRAND.tagline}</p>
            <h1>Reach every customer with <span className="ink-under">one message.</span></h1>
            <p className="lede">Upload your list, write your message and send. {BRAND.name} cleans your numbers, personalises each SMS and shows the cost before anything goes out.</p>
            <div className="mk-actions">
              <Link className="btn btn-primary" href="/login">Start sending</Link>
              <a className="btn btn-ghost" href="#how">See how it works</a>
            </div>
          </div>
          <div className="mk-hero-art"><HeroIllustration /></div>
        </section>

        <section className="mk-audience" aria-label="Who it is for">
          <p>Made for</p>
          <ul>{AUDIENCES.map((name) => <li key={name}>{name}</li>)}</ul>
        </section>

        <section className="mk-section" id="how">
          <p className="kicker">How it works</p>
          <h2>From a spreadsheet to sent, in three steps.</h2>
          <ol className="mk-steps">
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <div className="mk-step-art">{step.art}</div>
                <span className="mk-step-number">Step {index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mk-split" id="features">
          <div className="mk-split-art"><CleanListIllustration /></div>
          <div>
            <p className="kicker">Clean lists</p>
            <h2>Pay for customers, not for mistakes.</h2>
            <p className="lede">Wrong numbers and duplicates waste money on every send. {BRAND.name} sets them aside before you pay and tells you why, including numbers Excel has damaged.</p>
          </div>
        </section>

        <section className="mk-section mk-section-tight">
          <ul className="mk-features">
            {FEATURES.map((feature) => (
              <li key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mk-split mk-split-flip">
          <div>
            <p className="kicker">Respect your list</p>
            <h2>Built around consent.</h2>
            <p className="lede">Kenyan law expects customers to agree to marketing messages and be able to stop them. {BRAND.name} keeps an opt-out list, skips those numbers every time, and adds your stop message for you.</p>
          </div>
          <div className="mk-split-art mk-sun"><ConsentIllustration /></div>
        </section>

        <section className="mk-cta">
          <h2>Your next message is one upload away.</h2>
          <Link className="btn btn-white" href="/login">Start sending</Link>
        </section>
      </main>

      <footer className="mk-foot">
        <span className="brand"><Mark size={24} /><span>{BRAND.name}</span></span>
        <span>{BRAND.tagline}</span>
      </footer>
    </div>
  );
}
