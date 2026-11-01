'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react';

import { Mark } from '@/components/Illustrations';
import { BRAND } from '@/lib/brand';
import {
  cleanList,
  countSegments,
  displayPhone,
  fieldKey,
  guessPhoneColumn,
  MAX_FILE_BYTES,
  MAX_ROWS,
  normalizePhone,
  parseCsv,
  renderMessage,
  toCsv,
  unknownFields,
  type ParsedSheet,
  type SendResponse,
  type SendResult,
} from '@/lib/sms';

type Mode = 'demo' | 'sandbox' | 'live';
type Tab = 'send' | 'history' | 'optouts';
type Campaign = { id: string; at: string; file: string; message: string; total: number; sent: number; failed: number; unknown: number; segments: number; mode: Mode; problems: SendResult[] };

const HISTORY_KEY = 'tuma_history_v1';
const OPTOUT_KEY = 'tuma_optouts_v1';
const PRICE_KEY = 'tuma_price_v1';
const OPTOUT_LINE_KEY = 'tuma_optout_line_v1';
const BATCH = 100;

const read = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Could not save to this browser:', error);
  }
};

function download(name: string, rows: string[][]) {
  const url = URL.createObjectURL(new Blob(['﻿' + toCsv(rows)], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

const money = (value: number) => `KES ${value.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function Dashboard({ mode, sender }: { mode: Mode; sender: string | null }) {
  const [tab, setTab] = useState<Tab>('send');
  const [history, setHistory] = useState<Campaign[]>([]);
  const [optOuts, setOptOuts] = useState<string[]>([]);

  useEffect(() => {
    setHistory(read<Campaign[]>(HISTORY_KEY, []));
    setOptOuts(read<string[]>(OPTOUT_KEY, []));
  }, []);

  const saveOptOuts = (next: string[]) => { setOptOuts(next); write(OPTOUT_KEY, next); };
  const addCampaign = (campaign: Campaign) => setHistory((current) => {
    const next = [campaign, ...current].slice(0, 50);
    write(HISTORY_KEY, next);
    return next;
  });

  const signOut = async () => {
    await fetch('/api/login', { method: 'DELETE' }).catch(() => undefined);
    window.location.assign('/login');
  };

  return (
    <div className="app">
      <header className="app-top">
        <span className="brand"><Mark /><span>{BRAND.name}</span></span>
        <nav className="app-tabs" aria-label="Sections">
          {([['send', 'Send'], ['history', 'History'], ['optouts', 'Opt-outs']] as [Tab, string][]).map(([key, label]) => (
            <button type="button" key={key} className={tab === key ? 'is-on' : ''} aria-current={tab === key ? 'page' : undefined} onClick={() => setTab(key)}>{label}</button>
          ))}
        </nav>
        <button type="button" className="link-btn" onClick={() => void signOut()}>Sign out</button>
      </header>

      {mode !== 'live' ? (
        <p className={`mode-note mode-${mode}`} role="status">
          {mode === 'demo'
            ? 'Demo mode. Nothing is really sent and nothing is charged. Connect an SMS supplier to go live.'
            : 'Test mode. Messages go to the supplier’s simulator, not to real phones.'}
        </p>
      ) : null}

      <main className="app-main">
        {/* Hidden rather than removed, so looking at History never loses a list or a half-written message. */}
        <div hidden={tab !== 'send'}><SendTab mode={mode} sender={sender} optOuts={optOuts} onDone={addCampaign} /></div>
        {tab === 'history' ? <HistoryTab history={history} /> : null}
        {tab === 'optouts' ? <OptOutTab optOuts={optOuts} onChange={saveOptOuts} /> : null}
      </main>
    </div>
  );
}

function SendTab({ mode, sender, optOuts, onDone }: { mode: Mode; sender: string | null; optOuts: string[]; onDone: (campaign: Campaign) => void }) {
  const [fileName, setFileName] = useState('');
  const [sheet, setSheet] = useState<ParsedSheet | null>(null);
  const [phoneColumn, setPhoneColumn] = useState(0);
  const [fileError, setFileError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [template, setTemplate] = useState('');
  const [addStop, setAddStop] = useState(true);
  const [stopLine, setStopLine] = useState('Reply STOP to opt out.');
  const [price, setPrice] = useState('');
  const [consent, setConsent] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [outcome, setOutcome] = useState<Campaign | null>(null);
  const [sendError, setSendError] = useState('');
  const stopRequested = useRef(false);
  const box = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setPrice(read<string>(PRICE_KEY, ''));
    setStopLine(read<string>(OPTOUT_LINE_KEY, 'Reply STOP to opt out.'));
  }, []);

  const optOutSet = useMemo(() => new Set(optOuts), [optOuts]);
  const list = useMemo(() => (sheet ? cleanList(sheet, phoneColumn, optOutSet) : null), [sheet, phoneColumn, optOutSet]);
  const fieldKeys = useMemo(() => (sheet ? sheet.headers.map(fieldKey).filter((key, i) => i !== phoneColumn && key && !/^column_\d+$/.test(key)) : []), [sheet, phoneColumn]);
  const known = useMemo(() => (sheet ? sheet.headers.map(fieldKey) : []), [sheet]);
  const missing = useMemo(() => unknownFields(template, known), [template, known]);

  const compose = useCallback((fields: Record<string, string>) => {
    const body = renderMessage(template, fields);
    return addStop && stopLine.trim() ? `${body} ${stopLine.trim()}`.trim() : body;
  }, [addStop, stopLine, template]);

  const first = list?.contacts[0];
  const previewText = first ? compose(first.fields) : compose({});

  /** The longest personalised message decides the warning, and the real total is added up per person. */
  const totals = useMemo(() => {
    if (!list || !template.trim()) return { sms: 0, worst: countSegments(previewText) };
    let sms = 0;
    let worst = countSegments('');
    for (const contact of list.contacts) {
      const count = countSegments(compose(contact.fields));
      sms += count.segments;
      if (count.segments > worst.segments || (count.segments === worst.segments && count.length > worst.length)) worst = count;
    }
    return { sms, worst };
  }, [compose, list, previewText, template]);

  const rate = Number(price);
  const cost = rate > 0 ? totals.sms * rate : null;
  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Africa/Nairobi' }).format(new Date()));
  const offHours = hour < 8 || hour >= 19;
  const ready = Boolean(list?.contacts.length && template.trim() && !missing.length && consent);

  const loadFile = async (file: File | undefined) => {
    if (!file) return;
    setFileError('');
    setOutcome(null);
    setSendError('');
    if (file.size > MAX_FILE_BYTES) { setFileError('That file is over 5 MB. Split it into smaller lists.'); return; }
    if (!/\.(csv|txt)$/i.test(file.name)) { setFileError('Please upload a .csv file. In Excel, choose Save As, then CSV.'); return; }
    const parsed = parseCsv(await file.text());
    if (!parsed.rows.length) { setFileError('We could not find any rows in that file.'); return; }
    if (parsed.rows.length > MAX_ROWS) { setFileError(`That list has ${parsed.rows.length.toLocaleString()} rows. The limit is ${MAX_ROWS.toLocaleString()} at a time.`); return; }
    setSheet(parsed);
    setPhoneColumn(guessPhoneColumn(parsed));
    setFileName(file.name);
    setConsent(false);
  };

  const insertField = (key: string) => {
    const element = box.current;
    const token = `{${key}}`;
    const start = element?.selectionStart ?? template.length;
    const end = element?.selectionEnd ?? template.length;
    setTemplate(template.slice(0, start) + token + template.slice(end));
    requestAnimationFrame(() => {
      element?.focus();
      element?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const send = async () => {
    if (!list) return;
    setConfirming(false);
    setSendError('');
    stopRequested.current = false;
    write(PRICE_KEY, price);
    write(OPTOUT_LINE_KEY, stopLine);
    const items = list.contacts.map((contact) => ({ to: contact.phone, message: compose(contact.fields) }));
    const results: SendResult[] = [];
    // What the server says it did outranks what this page was told when it loaded.
    let actualMode: Mode = mode;
    setProgress({ done: 0, total: items.length });

    for (let i = 0; i < items.length && !stopRequested.current; i += BATCH) {
      const batch = items.slice(i, i + BATCH);
      try {
        const response = await fetch('/api/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: batch }) });
        const data = (await response.json()) as SendResponse;
        if (data.mode) actualMode = data.mode;
        if (!response.ok) {
          // Refused outright, so nothing in this batch went out. Stop rather than repeat it.
          setSendError(data.error ?? 'The server refused this send.');
          results.push(...batch.map(({ to }) => ({ to, status: 'failed' as const, reason: data.error ?? 'Refused' })));
          break;
        }
        results.push(...data.results);
      } catch {
        // The request may have reached the supplier. Stop, and never resend on our own: that could charge twice.
        setSendError('The connection dropped. We stopped so nobody gets the message twice. Check the results below.');
        results.push(...batch.map(({ to }) => ({ to, status: 'unknown' as const, reason: 'Connection dropped' })));
        break;
      }
      setProgress({ done: results.length, total: items.length });
    }

    const notReached = items.length - results.length;
    const campaign: Campaign = {
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
      file: fileName,
      message: template,
      total: items.length,
      sent: results.filter((r) => r.status === 'sent').length,
      failed: results.filter((r) => r.status === 'failed').length,
      unknown: results.filter((r) => r.status === 'unknown').length,
      segments: totals.sms,
      mode: actualMode,
      problems: [
        ...results.filter((r) => r.status !== 'sent'),
        ...items.slice(results.length).map(({ to }) => ({ to, status: 'failed' as const, reason: 'Not sent, stopped before this number' })),
      ],
    };
    if (notReached > 0) campaign.failed += notReached;
    setProgress(null);
    setOutcome(campaign);
    onDone(campaign);
    setConsent(false);
  };

  if (progress) {
    const percent = Math.round((progress.done / Math.max(1, progress.total)) * 100);
    return (
      <section className="panel center-panel" aria-live="polite">
        <h1>Sending…</h1>
        <p className="muted">{progress.done.toLocaleString()} of {progress.total.toLocaleString()} done. Keep this page open.</p>
        <div className="bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }} /></div>
        <button type="button" className="btn btn-ghost" onClick={() => { stopRequested.current = true; }}>Stop after this batch</button>
      </section>
    );
  }

  if (outcome) {
    return (
      <section className="panel center-panel">
        <h1>{outcome.mode === 'demo' ? 'Demo finished' : outcome.mode === 'sandbox' ? 'Test finished' : 'Campaign accepted'}</h1>
        {sendError ? <p className="alert alert-bad" role="alert">{sendError}</p> : null}
        <div className="result-grid">
          <div><strong>{outcome.sent.toLocaleString()}</strong><span>{outcome.mode === 'live' ? 'Accepted by supplier' : 'Would be sent'}</span></div>
          <div><strong>{outcome.failed.toLocaleString()}</strong><span>Failed</span></div>
          <div><strong>{outcome.unknown.toLocaleString()}</strong><span>Not sure</span></div>
        </div>
        <p className="muted">{outcome.mode === 'demo' ? 'No real SMS was sent.' : 'Accepted means the supplier took the message. It does not yet confirm it reached the phone.'}</p>
        {outcome.unknown ? <p className="alert alert-warn">“Not sure” numbers may have received the message. Check your supplier’s report before sending to them again.</p> : null}
        <div className="row">
          {outcome.problems.length ? (
            <button type="button" className="btn btn-ghost" onClick={() => download('numbers-to-check.csv', [['phone', 'status', 'reason'], ...outcome.problems.map((p) => [`0${p.to.slice(3)}`, p.status, p.reason ?? ''])])}>
              Download {outcome.problems.length.toLocaleString()} numbers to check
            </button>
          ) : null}
          <button type="button" className="btn btn-primary" onClick={() => { setOutcome(null); setSendError(''); }}>Back to message</button>
        </div>
      </section>
    );
  }

  const drop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    void loadFile(event.dataTransfer.files[0]);
  };

  return (
    <div className="send-grid">
      <div className="send-steps">
        <section className="panel">
          <header className="panel-head"><span className="step-dot">1</span><h2>Your customers</h2></header>
          {fileError ? <p className="alert alert-bad" role="alert">{fileError}</p> : null}

          {!sheet ? (
            <label className={`drop${dragging ? ' is-over' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}>
              <strong>Drop your CSV here, or tap to choose</strong>
              <span>A phone column is all you need. Names and other columns can go into your message.</span>
              <input type="file" accept=".csv,.txt,text/csv" className="visually-hidden" onChange={(event) => { void loadFile(event.target.files?.[0]); event.target.value = ''; }} />
            </label>
          ) : (
            <>
              <div className="file-row">
                <span className="file-name">{fileName}</span>
                <label className="link-btn">Change file
                  <input type="file" accept=".csv,.txt,text/csv" className="visually-hidden" onChange={(event) => { void loadFile(event.target.files?.[0]); event.target.value = ''; }} />
                </label>
              </div>
              <label className="field"><span>Which column has the phone numbers?</span>
                <select value={phoneColumn} onChange={(event) => setPhoneColumn(Number(event.target.value))}>
                  {sheet.headers.map((header, i) => <option value={i} key={`${header}-${i}`}>{header}{sheet.rows[0]?.[i] ? ` (e.g. ${sheet.rows[0][i]})` : ''}</option>)}
                </select>
              </label>
              {list ? (
                <>
                  <ul className="stats">
                    <li className="is-good"><strong>{list.contacts.length.toLocaleString()}</strong><span>Ready to send</span></li>
                    <li><strong>{list.duplicates.toLocaleString()}</strong><span>Duplicates removed</span></li>
                    <li><strong>{list.rejected.length.toLocaleString()}</strong><span>Not valid</span></li>
                    <li><strong>{list.optedOut.toLocaleString()}</strong><span>Opted out</span></li>
                  </ul>
                  {list.rejected.length ? (
                    <div className="note-row">
                      <span>First problem: line {list.rejected[0].line}. {list.rejected[0].reason}.</span>
                      <button type="button" className="link-btn" onClick={() => download('numbers-not-valid.csv', [['line', 'value', 'reason'], ...list.rejected.map((r) => [String(r.line), r.value, r.reason])])}>Download all</button>
                    </div>
                  ) : null}
                </>
              ) : null}
            </>
          )}
          {!sheet ? (
            <button type="button" className="link-btn sample-link" onClick={() => download('sample-customers.csv', [['name', 'phone', 'balance'], ['Amina', '0712 345 678', '1200'], ['Brian', '+254 733 000 111', '450']])}>Download a sample CSV</button>
          ) : null}
        </section>

        <section className="panel">
          <header className="panel-head"><span className="step-dot">2</span><h2>Your message</h2></header>
          <label className="field"><span className="visually-hidden">Message</span>
            <textarea ref={box} rows={5} value={template} placeholder="Hi {name}, our December offer starts on Friday…" onChange={(event) => setTemplate(event.target.value)} />
          </label>
          {fieldKeys.length ? (
            <div className="tokens" aria-label="Insert a column">
              <span>Insert:</span>
              {fieldKeys.map((key) => <button type="button" key={key} onClick={() => insertField(key)}>{`{${key}}`}</button>)}
            </div>
          ) : null}
          {missing.length ? <p className="alert alert-bad" role="alert">Your list has no column called {missing.map((m) => `{${m}}`).join(', ')}. Fix it, or customers would see those brackets.</p> : null}
          <label className="check"><input type="checkbox" checked={addStop} onChange={(event) => setAddStop(event.target.checked)} /><span>Add an opt-out line to every message</span></label>
          {addStop ? (
            <label className="field"><span>Opt-out line</span>
              <input value={stopLine} onChange={(event) => setStopLine(event.target.value)} />
            </label>
          ) : <p className="alert alert-warn">Marketing messages should always include a way to opt out.</p>}
          <div className={`counter${totals.worst.encoding === 'Unicode' ? ' is-warn' : ''}`}>
            <span>{totals.worst.length} characters · {totals.worst.segments} SMS per person{sheet ? ' at most' : ''}</span>
            {totals.worst.culprits.length ? <span>Special characters ({totals.worst.culprits.slice(0, 6).join(' ')}) cut each SMS to {totals.worst.perSegment} characters and raise the cost.</span> : null}
          </div>
        </section>

        <section className="panel">
          <header className="panel-head"><span className="step-dot">3</span><h2>Check and send</h2></header>
          <div className="summary">
            <div><span>Sending to</span><strong>{(list?.contacts.length ?? 0).toLocaleString()} people</strong></div>
            <div><span>Total SMS</span><strong>{totals.sms.toLocaleString()}</strong></div>
            <div><span>From</span><strong>{sender ?? 'Supplier default'}</strong></div>
            <div><span>Estimated cost</span><strong>{cost !== null ? money(cost) : 'Add your rate'}</strong></div>
          </div>
          <label className="field field-short"><span>Your price per SMS, in KES</span>
            <input inputMode="decimal" placeholder="0.80" value={price} onChange={(event) => setPrice(event.target.value)} />
          </label>
          {offHours ? <p className="alert alert-warn">It is outside normal hours in Kenya. Promotional messages are best sent between 8am and 7pm.</p> : null}
          <label className="check"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>These customers agreed to hear from us, and we will honour opt-outs.</span></label>
          <button type="button" className="btn btn-primary btn-wide" disabled={!ready} onClick={() => setConfirming(true)}>Review and send</button>
        </section>
      </div>

      <aside className="preview" aria-label="Message preview">
        <div className="phone">
          <div className="phone-notch" />
          <p className="phone-from">{sender ?? BRAND.name}</p>
          {previewText ? <p className="phone-bubble">{previewText}</p> : <p className="phone-empty">Your message will appear here.</p>}
        </div>
        {first ? <p className="muted preview-note">Preview for {displayPhone(first.phone)}</p> : null}
      </aside>

      {confirming ? (
        <div className="scrim">
          <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <h2 id="confirm-title">{mode === 'live' ? 'Send this now?' : mode === 'demo' ? 'Run this demo?' : 'Send this test?'}</h2>
            <p>
              {mode === 'live' ? <>This sends <b>{totals.sms.toLocaleString()} SMS</b> to <b>{(list?.contacts.length ?? 0).toLocaleString()} real people</b>{cost !== null ? <>, about <b>{money(cost)}</b></> : null}. It cannot be undone.</> : <>Nothing reaches a real phone. It runs through <b>{(list?.contacts.length ?? 0).toLocaleString()} numbers</b>.</>}
            </p>
            <div className="row">
              <button type="button" className="btn btn-ghost" autoFocus onClick={() => setConfirming(false)}>Go back</button>
              <button type="button" className="btn btn-primary" onClick={() => void send()}>{mode === 'live' ? 'Yes, send' : 'Yes, run it'}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function HistoryTab({ history }: { history: Campaign[] }) {
  return (
    <section className="panel panel-wide">
      <h1>History</h1>
      <p className="muted">Saved in this browser only.</p>
      {history.length === 0 ? <p className="empty">Nothing sent yet.</p> : (
        <ul className="history">
          {history.map((campaign) => (
            <li key={campaign.id}>
              <div className="history-main">
                <strong>{campaign.message.slice(0, 90)}{campaign.message.length > 90 ? '…' : ''}</strong>
                <small>{new Date(campaign.at).toLocaleString('en-KE')} · {campaign.file}{campaign.mode !== 'live' ? ` · ${campaign.mode === 'demo' ? 'Demo' : 'Test'}` : ''}</small>
              </div>
              <div className="history-numbers"><b>{campaign.sent.toLocaleString()}</b> of {campaign.total.toLocaleString()}</div>
              {campaign.problems.length ? (
                <button type="button" className="link-btn" onClick={() => download('numbers-to-check.csv', [['phone', 'status', 'reason'], ...campaign.problems.map((p) => [`0${p.to.slice(3)}`, p.status, p.reason ?? ''])])}>{campaign.problems.length} to check</button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function OptOutTab({ optOuts, onChange }: { optOuts: string[]; onChange: (next: string[]) => void }) {
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');

  const add = () => {
    const entries = text.split(/[\n,;]+/).map((value) => value.trim()).filter(Boolean);
    const good = entries.map(normalizePhone).filter((value): value is string => Boolean(value));
    onChange([...new Set([...optOuts, ...good])]);
    setText('');
    setMessage(`${good.length} added.${entries.length - good.length ? ` ${entries.length - good.length} not valid.` : ''}`);
  };

  return (
    <section className="panel panel-wide">
      <h1>Opt-outs</h1>
      <p className="muted">These numbers are skipped on every send. They are saved in this browser only, so use the same device.</p>
      <label className="field"><span>Add numbers, one on each line</span>
        <textarea rows={4} value={text} onChange={(event) => setText(event.target.value)} />
      </label>
      <button type="button" className="btn btn-primary" disabled={!text.trim()} onClick={add}>Add to opt-outs</button>
      {message ? <p className="muted" role="status">{message}</p> : null}
      {optOuts.length === 0 ? <p className="empty">No opt-outs yet.</p> : (
        <ul className="optouts">
          {optOuts.map((phone) => (
            <li key={phone}><span>{displayPhone(phone)}</span><button type="button" className="link-btn" aria-label={`Remove ${displayPhone(phone)}`} onClick={() => onChange(optOuts.filter((value) => value !== phone))}>Remove</button></li>
          ))}
        </ul>
      )}
    </section>
  );
}
