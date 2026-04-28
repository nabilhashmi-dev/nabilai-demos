# Lakewood Chiropractic — AI Chatbot Demo

**Business:** Lakewood Chiropractic
**Location:** Scranton, PA
**Industry:** Chiropractic / Healthcare

---

## How to View

Open `index.html` directly in any browser. No server or install required.

---

## What It Does

- Greets visitors immediately on open
- Answers real FAQs: hours, location, insurance, new patient process, X-rays
- Responds to condition-specific inquiries: back pain, neck pain, headaches, sciatica, sports injuries
- Urgency path: auto accident messages skip quick replies and immediately start contact capture
- Detects appointment intent and walks through a multi-step booking flow
- Handles after-hours automatically (contact capture with callback message)
- Simulates realistic typing delay for authenticity

## Lead Capture Triggers

- Appointment booking flow: new patient or existing patient → preferred day → name → phone
- Contact capture (after hours or auto accident): name → phone

## Quick Replies on Open

`Book an appointment` · `Do you take my insurance?` · `What's a first visit like?` · `I was in an accident`

## Captured Lead

When lead capture completes, the lead object is stored in `window.capturedLead` and logged to the browser console. In production this would POST to an n8n webhook or CRM.

```json
{
  "name": "...",
  "phone": "...",
  "type": "new patient",
  "date": "...",
  "source": "appointment",
  "business": "Lakewood Chiropractic",
  "timestamp": "..."
}
```

---

## Customization

All business-specific content lives in `chatbot-config.json`. To adapt for a different chiropractic practice:
1. Update `business_name`, `address`, `phone`
2. Update `hours` (include any half-days)
3. Update `insurance` array with accepted plans
4. Update `brand_color` (hex)
5. Adjust `intents` keywords as needed

---

## Files

| File | Purpose |
|---|---|
| `index.html` | Page shell and chat widget markup |
| `style.css` | All visual styling, responsive layout |
| `script.js` | Chat logic, intent routing, appointment state machine |
| `chatbot-config.json` | All business data, FAQs, insurance, intents, copy |
