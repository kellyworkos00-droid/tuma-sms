import Link from 'next/link';

import { ConsentIllustration, CtaIllustration, FormatIcon, Mark, PreviewIcon, RetryIcon, StepSend, StepUpload, StepWrite } from '@/components/Illustrations';
import { LiveCleanList, LiveComposer, LiveCost, LiveHero } from '@/components/LiveIllustrations';
import { ScrollEffects } from '@/components/ScrollEffects';
import { BRAND } from '@/lib/brand';

const STEPS = [
  { art: <StepUpload />, title: 'Add your customers', body: 'Upload a CSV from Excel or Google Sheets, or simply type the numbers in.' },
  { art: <StepWrite />, title: 'Write one message', body: 'Add {name} or any column from your list, and each customer gets a message written for them.' },
  { art: <StepSend />, title: 'Send and see results', body: 'Check the count and cost, press send, then see which numbers went through and which did not.' },
];

const FEATURES = [
  { icon: <FormatIcon />, title: 'Every Kenyan number format', body: '0712, 712, +254 and 254 all become one correct number, so nothing is missed because of how it was typed.' },
  { icon: <PreviewIcon />, title: 'See what each customer reads', body: 'Step through your list on a phone preview, with each name and detail filled in, before anything goes out.' },
  { icon: <RetryIcon />, title: 'Failed numbers, ready to fix', body: 'Download the numbers that did not go through and deal with those alone, without messaging everyone again.' },
];

export default function MarketingPage() {
  return (
    <div className="mk">
      <ScrollEffects />

      <header className="mk-nav">
        <div className="mk-nav-inner">
          <Link href="/" className="brand"><Mark /><span>{BRAND.name}</span></Link>
          <nav aria-label="Main">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <Link className="btn btn-dark btn-small" href="/login">Sign in</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mk-hero">
          <div className="mk-hero-copy">
            <p className="kicker hero-in" style={{ '--d': '0s' } as React.CSSProperties}>{BRAND.tagline}</p>
            <h1 className="hero-in" style={{ '--d': '0.08s' } as React.CSSProperties}>Reach every customer with <span className="ink-under">one message.</span></h1>
            <p className="lede hero-in" style={{ '--d': '0.18s' } as React.CSSProperties}>Add your list, write your message and send. {BRAND.name} cleans your numbers, personalises each SMS and shows the cost before anything goes out.</p>
            <div className="mk-actions hero-in" style={{ '--d': '0.28s' } as React.CSSProperties}>
              <Link className="btn btn-primary" href="/login">Start sending</Link>
              <a className="btn btn-ghost" href="#how">See how it works</a>
            </div>
          </div>
          <div className="mk-hero-art hero-in" style={{ '--d': '0.2s' } as React.CSSProperties}><LiveHero /></div>
        </section>

        <section className="mk-section" id="how">
          <div className="mk-heading" data-reveal="up">
            <p className="kicker">How it works</p>
            <h2>From a list to sent, in three steps.</h2>
          </div>
          <ol className="mk-steps">
            {STEPS.map((step, index) => (
              <li key={step.title} data-reveal="up" style={{ '--d': `${index * 0.12}s` } as React.CSSProperties}>
                <div className="mk-step-art">{step.art}</div>
                <span className="mk-step-number">Step {index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mk-section mk-personal">
          <div className="mk-heading mk-heading-center" data-reveal="up">
            <p className="kicker">Personal messages</p>
            <h2>Write it once. It reads like you wrote to each person.</h2>
          </div>
          <div data-reveal="zoom"><LiveComposer /></div>
        </section>

        <section className="mk-split" id="features">
          <div data-reveal="left"><LiveCleanList /></div>
          <div data-reveal="right">
            <p className="kicker">Clean lists</p>
            <h2>Pay for customers, not for mistakes.</h2>
            <p className="lede">Wrong numbers and duplicates waste money on every send. {BRAND.name} sets them aside before you pay and tells you why, including numbers Excel has damaged.</p>
          </div>
        </section>

        <section className="mk-split mk-split-flip">
          <div data-reveal="left">
            <p className="kicker">Clear costs</p>
            <h2>Know the cost before you press send.</h2>
            <p className="lede">Long messages quietly become two or three SMS, and one emoji can cut the limit from 160 characters to 70. You see the true count first, and what caused it.</p>
          </div>
          <div data-reveal="right"><LiveCost /></div>
        </section>

        <section className="mk-section mk-section-tight">
          <ul className="mk-features">
            {FEATURES.map((feature, index) => (
              <li key={feature.title} data-reveal="up" style={{ '--d': `${index * 0.1}s` } as React.CSSProperties}>
                {feature.icon}
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mk-split">
          <div className="mk-panel" data-reveal="left"><ConsentIllustration /></div>
          <div data-reveal="right">
            <p className="kicker">Respect your list</p>
            <h2>Built around consent.</h2>
            <p className="lede">Kenyan law expects customers to agree to marketing messages and be able to stop them. {BRAND.name} keeps an opt-out list, skips those numbers every time, and adds your opt-out line for you.</p>
          </div>
        </section>

        <section className="mk-cta" data-reveal="zoom">
          <div>
            <p className="kicker">Ready when you are</p>
            <h2>Your next message is one list away.</h2>
            <div className="mk-actions">
              <Link className="btn btn-primary" href="/login">Start sending</Link>
              <a className="btn btn-ghost" href="#how">See how it works</a>
            </div>
          </div>
          <div className="mk-cta-art"><CtaIllustration /></div>
        </section>
      </main>

      <footer className="mk-foot">
        <div className="mk-foot-top">
          <div className="mk-foot-brand">
            <span className="brand"><Mark /><span>{BRAND.name}</span></span>
            <p>{BRAND.tagline}. Clean lists, personal messages and clear costs.</p>
          </div>
          <nav aria-label="Explore">
            <h2>Explore</h2>
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
          </nav>
          <nav aria-label="Account">
            <h2>Account</h2>
            <Link href="/login">Sign in</Link>
            <Link href="/login">Start sending</Link>
          </nav>
        </div>
        <p className="mk-foot-word" aria-hidden="true" data-reveal="up">{BRAND.name}</p>
        <div className="mk-foot-base">
          <span>© {new Date().getFullYear()} {BRAND.name}</span>
          <a href="#top" className="mk-foot-up">Back to top ↑</a>
        </div>
      </footer>
    </div>
  );
}
