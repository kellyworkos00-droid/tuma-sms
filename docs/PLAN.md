# Tuma: product plan

"Tuma" is a working name. Change it in `src/lib/brand.ts`.

## Screens

**Marketing page, `/`.** It answers three questions in order: what is this, how does it work, can I trust it.

1. Header: logo, How it works, Features, Sign in.
2. Hero: headline, one sentence, Start sending, and the sheet-to-phone illustration.
3. Made for: shops, schools, saccos and others.
4. How it works: upload, write, send, one illustration each.
5. Clean lists: the money argument.
6. Features: number formats, cost, preview, failed numbers.
7. Consent: the trust argument.
8. Closing call to action, then footer.

Still needed from the client: real testimonials, pricing and a contact number. None were invented.

**Sign in, `/login`.** One password, because this version has one business using it.

**App, `/app`.** One page with three numbered steps, and a phone preview that stays in view.

1. Your customers: upload a CSV, confirm the phone column, see ready, duplicate, invalid and opted-out counts.
2. Your message: write, insert columns, opt-out line, SMS count and warnings.
3. Check and send: people, SMS, sender, cost, consent, then a confirmation before anything goes out.

Tabs for History and Opt-outs.

## What this version does not do

| Gap | Why it matters | Fix |
|---|---|---|
| History and opt-outs live in one browser | Another device will not know who opted out | Database |
| No delivery reports | "Accepted" does not prove it reached the phone | Supplier callback plus database |
| STOP replies are not processed | Opt-outs must be added by hand | Two-way shortcode plus callback |
| No scheduling | Sending happens while the page is open | Background job |
| One shared password | No separate staff or customers | User accounts |
| Page must stay open during a send | Closing it stops the remaining batches | Server-side queue |

## Phases

1. **Now:** this version, in demo mode.
2. **Go live:** supplier account, sender ID, test in sandbox, one small real send.
3. **Database:** Supabase for contacts, lists, opt-outs and history across devices.
4. **Reports:** delivery callbacks, STOP handling, scheduling, server-side sending.
5. **Selling it to many businesses:** accounts, prepaid credit, M-Pesa top-up, a sender ID per customer. This is a much larger project, and the operator takes on reseller and data protection duties, so get advice first.

## Going live

Set these on the server:

```
APP_PASSWORD=
AUTH_SECRET=            at least 32 random characters
SMS_PROVIDER=africastalking
AT_USERNAME=
AT_API_KEY=
AT_SENDER_ID=           only once approved
AT_SANDBOX=true         remove for real sending
```

Before the first real send:

1. Test in the sandbox with `AT_SANDBOX=true`.
2. Send to two or three of your own phones.
3. Confirm the status codes and costs match the supplier's dashboard.
4. Confirm how opt-outs reach the business, then correct the opt-out line.
5. Have a Kenyan advocate or the ODPC guidance confirm consent, registration and sending-hour duties.

The supplier code was tested against a local stand-in built from Africa's Talking's official SDK, not their real service.
