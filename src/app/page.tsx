import Link from 'next/link';

import {
  CleanListIllustration,
  ConsentIllustration,
  CostIcon,
  CtaIllustration,
  FormatIcon,
  HeroIllustration,
  Mark,
  PreviewIcon,
  RetryIcon,
  StepSend,
  StepUpload,
  StepWrite,
} from '@/components/Illustrations';
import { BRAND } from '@/lib/brand';

const STEPS = [
  { art: <StepUpload />, tone: 'tone-sky', title: 'Add your customers', body: 'Upload a CSV from Excel or Google Sheets, or simply type the numbers in.' },
  { art: <StepWrite />, tone: 'tone-sun', title: 'Write one message', body: 'Add {name} or any column from your list, and each customer gets a message written for them.' },
  { art: <StepSend />, tone: 'tone-mint', title: 'Send and see results', body: 'Check the count and cost, press send, then see which numbers went through and which did not.' },
];

const PEOPLE = [
  { name: 'Amina', detail: 'KES 1,200' },
  { name: 'Brian', detail: 'KES 450' },
  { name: 'Wanjiku', detail: 'KES 3,000' },
];

const FEATURES = [
  { icon: <FormatIcon />, title: 'Every Kenyan number format', body: '0712, 712, +254 and 254 all become one correct number, so nothing is missed because of how it was typed.' },
  { icon: <CostIcon />, title: 'Costs before you press send', body: 'Long messages and emojis quietly become two or three SMS. You see the true count first, and what caused it.' },
  { icon: <PreviewIcon />, title: 'See what each customer reads', body: 'Step through your list on a phone preview, with each name and detail filled in, before anything goes out.' },
  { icon: <RetryIcon />, title: 'Failed numbers, ready to fix', body: 'Download the numbers that did not go through and deal with those alone, without messaging everyone again.' },
];

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
            <p className="lede">Add your list, write your message and send. {BRAND.name} cleans your numbers, personalises each SMS and shows the cost before anything goes out.</p>
            <div className="mk-actions">
              <Link className="btn btn-primary" href="/login">Start sending</Link>
              <a className="btn btn-ghost" href="#how">See how it works</a>
            </div>
          </div>
          <div className="mk-hero-art"><HeroIllustration /></div>
        </section>

        <section className="mk-section" id="how">
          <div className="mk-heading">
            <p className="kicker">How it works</p>
            <h2>From a list to sent, in three steps.</h2>
          </div>
          <ol className="mk-steps">
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <div className={`mk-step-art ${step.tone}`}>{step.art}</div>
                <span className="mk-step-number">Step {index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mk-personal">
          <div className="mk-heading mk-heading-center">
            <p className="kicker">Personal messages</p>
            <h2>Write it once. It reads like you wrote to each person.</h2>
          </div>
          <div className="mk-personal-flow">
            <div className="mk-template">
              <span className="mk-template-label">You write</span>
              <p>Hi <mark>{'{name}'}</mark>, your balance is <mark>{'{balance}'}</mark>. Thank you for choosing us.</p>
            </div>
            <span className="mk-arrow" aria-hidden="true">→</span>
            <ul className="mk-bubbles">
              {PEOPLE.map((person) => (
                <li key={person.name}>Hi <b>{person.name}</b>, your balance is <b>{person.detail}</b>. Thank you for choosing us.</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mk-split" id="features">
          <div className="mk-split-art tone-sky"><CleanListIllustration /></div>
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
                {feature.icon}
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
            <p className="lede">Kenyan law expects customers to agree to marketing messages and be able to stop them. {BRAND.name} keeps an opt-out list, skips those numbers every time, and adds your opt-out line for you.</p>
          </div>
          <div className="mk-split-art tone-sun"><ConsentIllustration /></div>
        </section>

        <section className="mk-cta">
          <div>
            <h2>Your next message is one list away.</h2>
            <Link className="btn btn-white" href="/login">Start sending</Link>
          </div>
          <div className="mk-cta-art"><CtaIllustration /></div>
        </section>
      </main>

      <footer className="mk-foot">
        <span className="brand"><Mark size={24} /><span>{BRAND.name}</span></span>
        <span>{BRAND.tagline}</span>
      </footer>
    </div>
  );
}
