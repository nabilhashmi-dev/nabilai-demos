# Luxe Aesthetics MedSpa — AI Chatbot Demo

**Business:** Luxe Aesthetics MedSpa
**Location:** Scranton, PA
**Industry:** Medical Spa / Aesthetics

---

## How to View

Open `index.html` directly in any browser. No server or install required.

---

## What It Does

- Greets visitors immediately on open
- Answers treatment-specific questions: Botox, fillers, laser hair removal, HydraFacial, microneedling, chemical peels
- Handles pricing and downtime questions without committing to exact numbers (directs to free consultation)
- Detects skin concern intent and routes to appropriate treatment
- Starts a multi-step consultation booking flow on intent or affirmative response
- Handles after-hours automatically (contact capture with callback message)
- Simulates realistic typing delay for authenticity

## Lead Capture Triggers

- Consultation flow: treatment/concern → preferred day → name → phone
- Contact capture (after hours): name → phone

## Quick Replies on Open

`Book a consultation` · `Botox & fillers` · `What's good for wrinkles?` · `Pricing`

## Captured Lead

When lead capture completes, the lead object is stored in `window.capturedLead` and logged to the browser console. In production this would POST to an n8n webhook or CRM.

```json
{
  "name": "...",
  "phone": "...",
  "treatment": "Botox",
  "date": "...",
  "source": "consultation",
  "business": "Luxe Aesthetics MedSpa",
  "timestamp": "..."
}
```

---

## Customization

All business-specific content lives in `chatbot-config.json`. To adapt for a different medspa:
1. Update `business_name`, `address`, `phone`
2. Update `hours` (Mon/Sun typically closed)
3. Update `services` object with your treatment menu and pricing
4. Update `brand_color` (hex)
5. Adjust `intents` keywords to match offered services

---

## Files

| File | Purpose |
|---|---|
| `index.html` | Page shell and chat widget markup |
| `style.css` | All visual styling, responsive layout |
| `script.js` | Chat logic, treatment responses, consultation state machine |
| `chatbot-config.json` | All business data, services, FAQs, intents, copy |
