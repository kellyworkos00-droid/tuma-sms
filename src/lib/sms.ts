/** Rules for numbers, lists and message length. No browser or server APIs, so both sides share one answer. */

export type Contact = { phone: string; fields: Record<string, string> };
export type Rejected = { line: number; value: string; reason: string };

export type ParsedSheet = { headers: string[]; rows: string[][]; hadHeader: boolean };
export type CleanList = { contacts: Contact[]; duplicates: number; optedOut: number; rejected: Rejected[] };

export const MAX_ROWS = 50000;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

/** Any Kenyan way of writing a mobile number becomes 2547XXXXXXXX or 2541XXXXXXXX. Anything else is null. */
export function normalizePhone(raw: string): string | null {
  const value = raw.trim();
  if (!value || /e\+?\d/i.test(value)) return null;
  let digits = value.replace(/[\s\-().]/g, '');
  if (!/^\+?\d+$/.test(digits)) return null;
  digits = digits.replace(/^\+/, '').replace(/^00/, '');
  if (digits.startsWith('0')) digits = `254${digits.slice(1)}`;
  else if (/^[71]\d{8}$/.test(digits)) digits = `254${digits}`;
  return /^254[71]\d{8}$/.test(digits) ? digits : null;
}

export const displayPhone = (phone: string) => `0${phone.slice(3, 6)} ${phone.slice(6, 9)} ${phone.slice(9)}`;

function detectDelimiter(firstLine: string) {
  const counts = [',', ';', '\t'].map((d) => [d, firstLine.split(d).length] as const);
  return counts.sort((a, b) => b[1] - a[1])[0][0];
}

/** Handles quoted cells, commas inside quotes, Excel's byte-order mark and semicolon or tab separators. */
export function parseCsv(text: string): ParsedSheet {
  const source = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const delimiter = detectDelimiter(source.split('\n', 1)[0] ?? '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') { cell += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"' && cell === '') quoted = true;
    else if (char === delimiter) { row.push(cell.trim()); cell = ''; }
    else if (char === '\n') { row.push(cell.trim()); rows.push(row); row = []; cell = ''; }
    else cell += char;
  }
  if (cell !== '' || row.length) { row.push(cell.trim()); rows.push(row); }

  const filled = rows.filter((r) => r.some(Boolean));
  if (!filled.length) return { headers: [], rows: [], hadHeader: false };

  const width = Math.max(...filled.map((r) => r.length));
  const hadHeader = !filled[0].some((value) => normalizePhone(value));
  const headers = hadHeader
    ? Array.from({ length: width }, (_, i) => filled[0][i]?.trim() || `Column ${i + 1}`)
    : Array.from({ length: width }, (_, i) => `Column ${i + 1}`);
  return { headers, rows: hadHeader ? filled.slice(1) : filled, hadHeader };
}

/**
 * Numbers typed or pasted by hand. Each line can be a number, a number then a name,
 * or several numbers separated by commas or semicolons.
 */
export function parseTyped(text: string): ParsedSheet {
  const rows: string[][] = [];
  for (const line of text.split(/\r?\n/)) {
    const parts = line.split(/[,;\t]/).map((part) => part.trim()).filter(Boolean);
    if (!parts.length) continue;
    if (parts.length > 1 && parts.every((part) => normalizePhone(part))) parts.forEach((part) => rows.push([part, '']));
    else rows.push([parts[0], parts.slice(1).join(' ')]);
  }
  return { headers: ['phone', 'name'], rows, hadHeader: false };
}

/** The column most likely to hold numbers: the header says so, or the values look like phones. */
export function guessPhoneColumn(sheet: ParsedSheet): number {
  const byName = sheet.headers.findIndex((h) => /phone|mobile|msisdn|simu|number|contact|tel/i.test(h));
  if (byName >= 0) return byName;
  const sample = sheet.rows.slice(0, 50);
  let best = 0;
  let bestScore = -1;
  sheet.headers.forEach((_, i) => {
    const score = sample.filter((r) => normalizePhone(r[i] ?? '')).length;
    if (score > bestScore) { best = i; bestScore = score; }
  });
  return best;
}

export function cleanList(sheet: ParsedSheet, phoneColumn: number, optOuts: Set<string>): CleanList {
  const seen = new Set<string>();
  const contacts: Contact[] = [];
  const rejected: Rejected[] = [];
  let duplicates = 0;
  let optedOut = 0;
  const firstLine = sheet.hadHeader ? 2 : 1;

  sheet.rows.forEach((row, index) => {
    const value = row[phoneColumn] ?? '';
    const phone = normalizePhone(value);
    if (!phone) {
      rejected.push({
        line: index + firstLine,
        value,
        reason: !value ? 'No number' : /e\+?\d/i.test(value) ? 'Excel changed this number to scientific format' : 'Not a Kenyan mobile number',
      });
      return;
    }
    if (seen.has(phone)) { duplicates += 1; return; }
    seen.add(phone);
    if (optOuts.has(phone)) { optedOut += 1; return; }
    const fields: Record<string, string> = {};
    sheet.headers.forEach((header, i) => { fields[fieldKey(header)] = row[i] ?? ''; });
    contacts.push({ phone, fields });
  });

  return { contacts, duplicates, optedOut, rejected };
}

export const fieldKey = (header: string) => header.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

/** Fills {name}-style fields. A blank field never leaves "Hello ," behind. */
export function renderMessage(template: string, fields: Record<string, string>): string {
  return template
    .replace(/\{([a-z0-9_]+)\}/gi, (match, key: string) => {
      const value = fields[key.toLowerCase()];
      return value === undefined ? match : value;
    })
    .replace(/ +([,.!?])/g, '$1')
    .replace(/ {2,}/g, ' ')
    .trim();
}

export function unknownFields(template: string, known: string[]): string[] {
  const found = [...template.matchAll(/\{([a-z0-9_]+)\}/gi)].map((m) => m[1].toLowerCase());
  return [...new Set(found)].filter((key) => !known.includes(key));
}

const GSM_BASIC = "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM_EXTENDED = '^{}\\[~]|€\f';

export type Segments = { encoding: 'GSM' | 'Unicode'; length: number; segments: number; perSegment: number; culprits: string[] };

/**
 * How many SMS one message costs. One character outside the GSM alphabet, often a
 * curly quote pasted from Word or an emoji, drops a message from 160 characters to 70.
 */
export function countSegments(text: string): Segments {
  const culprits = new Set<string>();
  let units = 0;
  for (const char of text) {
    if (GSM_BASIC.includes(char)) units += 1;
    else if (GSM_EXTENDED.includes(char)) units += 2;
    else culprits.add(char);
  }
  if (culprits.size) {
    const length = [...text].reduce((sum, char) => sum + (char.codePointAt(0)! > 0xffff ? 2 : 1), 0);
    return { encoding: 'Unicode', length, segments: length <= 70 ? (length ? 1 : 0) : Math.ceil(length / 67), perSegment: length <= 70 ? 70 : 67, culprits: [...culprits] };
  }
  return { encoding: 'GSM', length: units, segments: units <= 160 ? (units ? 1 : 0) : Math.ceil(units / 153), perSegment: units <= 160 ? 160 : 153, culprits: [] };
}

export function toCsv(rows: string[][]): string {
  const cell = (value: string) => {
    // A leading =, +, - or @ would run as a formula when the file is opened in Excel.
    const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return rows.map((row) => row.map(cell).join(',')).join('\r\n');
}

export type SendItem = { to: string; message: string };
export type SendStatus = 'sent' | 'failed' | 'unknown';
export type SendResult = { to: string; status: SendStatus; reason?: string; cost?: string };
export type SendResponse = { results: SendResult[]; mode: 'demo' | 'sandbox' | 'live'; error?: string };
