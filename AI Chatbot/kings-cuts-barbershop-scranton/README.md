# King's Cuts Barbershop — AI Chatbot Demo

**Business:** King's Cuts Barbershop
**Location:** Scranton, PA
**Industry:** Barbershop / Men's Grooming

---

## How to View

Open `index.html` directly in any browser. No server or install required.

---

## What It Does

- Greets visitors with casual, on-brand tone
- Answers service questions: haircuts, fades, beard trims, hot towel shaves, kids cuts
- Provides clear pricing for each service upfront
- Handles walk-in and wait time inquiries
- Starts a multi-step appointment booking flow on intent or affirmative response
- Handles after-hours automatically (contact capture)
- Simulates realistic typing delay for authenticity

## Lead Capture Triggers

- Appointment flow: service → preferred day/time → name → phone
- Contact capture (after hours): name → phone

## Quick Replies on Open

`Book a haircut` · `Walk-in wait time` · `Services & pricing` · `Kids cuts`

## Captured Lead

When lead capture completes, the lead object is stored in `window.capturedLead` and logged to the browser console. In production this would POST to an n8n webhook or booking system.

```json
{
  "name": "...",
  "phone": "...",
  "service": "Fade",
  "date": "Thursday afternoon",
  "source": "appointment",
  "business": "King's Cuts Barbershop",
  "timestamp": "..."
}
```

---

## Customization

All business-specific content lives in `chatbot-config.json`. To adapt for a different barbershop:
1. Update `business_name`, `address`, `phone`
2. Update `hours` (note closed day)
3. Update `services` object with your service names and prices
4. Update `brand_color` (hex)
5. Adjust tone in script responses to match shop personality

---

## Files

| File | Purpose |
|---|---|
| `index.html` | Page shell and chat widget markup |
| `style.css` | All visual styling, responsive layout |
| `script.js` | Chat logic, service responses, appointment state machine |
| `chatbot-config.json` | All business data, services, pricing, intents, copy |
