# Carmine's Italian Kitchen — AI Chatbot Demo

**Business:** Carmine's Italian Kitchen
**Location:** Scranton, PA
**Industry:** Restaurant (Italian-American)

---

## How to View

Open `index.html` directly in any browser. No server or install required.

---

## What It Does

- Greets visitors immediately on open
- Answers real FAQs: hours, menu, parking, allergies, pricing, takeout, gift cards
- Detects reservation/catering intent and starts lead capture
- Collects name → phone → email with input validation
- Handles after-hours automatically (different response path)
- Simulates realistic typing delay for authenticity

## Lead Capture Triggers

Any message containing: `reserve`, `book`, `table`, `catering`, `party`, `event`, `price`, `cost`, `quote`, `appointment`, `schedule`

## Captured Lead

When lead capture completes, the lead object is stored in `window.capturedLead` and logged to the browser console. In production this would POST to an n8n webhook or CRM.

```json
{
  "name": "...",
  "phone": "...",
  "email": "...",
  "timestamp": "...",
  "source": "chatbot-demo",
  "business": "Carmine's Italian Kitchen"
}
```

---

## Customization

All business-specific content lives in `chatbot-config.json`. To adapt this demo for a different restaurant:
1. Update `business_name`, `city`, `phone`, `address`
2. Update `hours`
3. Rewrite `faq` entries
4. Update `lead_triggers` if needed
5. Update `brand_color` (hex)

---

## Files

| File | Purpose |
|---|---|
| `index.html` | Page shell and chat widget markup |
| `style.css` | All visual styling, responsive layout |
| `script.js` | Chat logic, FAQ matching, lead capture state machine |
| `chatbot-config.json` | All business data, FAQs, triggers, copy |
