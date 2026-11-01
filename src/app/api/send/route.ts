import { NextResponse } from 'next/server';

import { providerMode, sendMessages } from '@/lib/provider';
import { normalizePhone, type SendItem, type SendResponse } from '@/lib/sms';

const MAX_PER_REQUEST = 200;
const MAX_MESSAGE_LENGTH = 1600;

export async function POST(request: Request) {
  const mode = providerMode();
  const refuse = (error: string, status: number) => NextResponse.json({ results: [], mode, error } satisfies SendResponse, { status });

  const body = (await request.json().catch(() => null)) as { items?: unknown } | null;
  if (!body || !Array.isArray(body.items) || body.items.length === 0) return refuse('Nothing to send.', 400);
  if (body.items.length > MAX_PER_REQUEST) return refuse('Too many messages in one request.', 400);

  const items: SendItem[] = [];
  for (const item of body.items as Partial<SendItem>[]) {
    const to = typeof item?.to === 'string' ? normalizePhone(item.to) : null;
    const message = typeof item?.message === 'string' ? item.message.trim() : '';
    if (!to || !message || message.length > MAX_MESSAGE_LENGTH) return refuse('A message or number in this batch is not valid.', 400);
    items.push({ to, message });
  }

  try {
    return NextResponse.json({ results: await sendMessages(items), mode } satisfies SendResponse);
  } catch (error) {
    console.error('[sms] send failed:', error);
    return NextResponse.json({ results: items.map(({ to }) => ({ to, status: 'unknown' as const, reason: 'Server error while sending' })), mode } satisfies SendResponse);
  }
}
