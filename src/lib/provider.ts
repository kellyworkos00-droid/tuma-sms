import type { SendItem, SendResult } from './sms';

/**
 * The SMS supplier, kept behind one function so changing supplier touches only this file.
 *
 * With no supplier configured this is demo mode. It sends nothing, and the app says
 * so on every screen, so a demo can never be mistaken for a real campaign.
 */

export type Mode = 'demo' | 'sandbox' | 'live';

export function providerMode(): Mode {
  if (process.env.SMS_PROVIDER !== 'africastalking' || !process.env.AT_USERNAME || !process.env.AT_API_KEY) return 'demo';
  return process.env.AT_SANDBOX === 'true' || process.env.AT_USERNAME === 'sandbox' ? 'sandbox' : 'live';
}

export const senderId = () => process.env.AT_SENDER_ID?.trim() || null;

function demoSend(items: SendItem[]): SendResult[] {
  // About 1 in 25 fails, so the failed-number screens can be seen in a demo.
  return items.map(({ to }) =>
    Number(to.slice(-2)) % 25 === 7 ? { to, status: 'failed', reason: 'Demo failure' } : { to, status: 'sent', cost: 'Demo' }
  );
}

const SUCCESS = new Set([100, 101, 102]);

async function africasTalking(numbers: string[], message: string, sandbox: boolean): Promise<SendResult[]> {
  const base = process.env.AT_BASE_URL || `https://api.${sandbox ? 'sandbox.' : ''}africastalking.com`;
  const body = new URLSearchParams({
    username: process.env.AT_USERNAME!,
    to: numbers.map((n) => `+${n}`).join(','),
    message,
    bulkSMSMode: '1',
    enqueue: '1',
  });
  const from = senderId();
  if (from) body.set('from', from);

  let response: Response;
  try {
    response = await fetch(`${base}/version1/messaging`, {
      method: 'POST',
      headers: { apiKey: process.env.AT_API_KEY!, Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(30000),
    });
  } catch (error) {
    // We cannot know whether it went out, so it must not be retried automatically.
    console.error('[sms] no answer from Africa\'s Talking:', error instanceof Error ? error.message : error);
    return numbers.map((to) => ({ to, status: 'unknown', reason: 'No answer from the SMS supplier' }));
  }

  const text = await response.text();
  if (!response.ok) {
    console.error('[sms] Africa\'s Talking refused:', response.status, text.slice(0, 300));
    if (response.status >= 500) return numbers.map((to) => ({ to, status: 'unknown', reason: 'SMS supplier error' }));
    return numbers.map((to) => ({ to, status: 'failed', reason: response.status === 401 ? 'The SMS supplier rejected our API key' : text.slice(0, 120) || `Refused (${response.status})` }));
  }

  try {
    const recipients = (JSON.parse(text).SMSMessageData?.Recipients ?? []) as { number: string; status: string; statusCode: number; cost?: string }[];
    const byNumber = new Map(recipients.map((r) => [r.number.replace(/^\+/, ''), r]));
    return numbers.map((to) => {
      const recipient = byNumber.get(to);
      if (!recipient) return { to, status: 'failed', reason: 'Not accepted by the SMS supplier' };
      return SUCCESS.has(recipient.statusCode)
        ? { to, status: 'sent', cost: recipient.cost }
        : { to, status: 'failed', reason: recipient.status };
    });
  } catch {
    console.error('[sms] unreadable answer:', text.slice(0, 300));
    return numbers.map((to) => ({ to, status: 'unknown', reason: 'Unreadable answer from the SMS supplier' }));
  }
}

/** Identical messages go together in one call, which is far quicker and cheaper than one call each. */
export async function sendMessages(items: SendItem[]): Promise<SendResult[]> {
  const mode = providerMode();
  if (mode === 'demo') return demoSend(items);

  const groups = new Map<string, string[]>();
  for (const { to, message } of items) groups.set(message, [...(groups.get(message) ?? []), to]);

  const queue = [...groups.entries()];
  const results: SendResult[] = [];
  const worker = async () => {
    for (let next = queue.shift(); next; next = queue.shift()) {
      results.push(...(await africasTalking(next[1], next[0], mode === 'sandbox')));
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  return results;
}
