# Keystone Building & Contracting — AI Chatbot Demo

**Business:** Keystone Building & Contracting
**Location:** Scranton, PA
**Industry:** General Contractor / Builder / Land Surveying

---

## How to View

Open `index.html` directly in any browser. No server or install required.

---

## What It Does

- Greets visitors immediately on open
- Answers project-specific questions: additions, remodels, new home builds, roofing, decks, land surveying
- Handles licensing, insurance, timeline, and permitting questions
- Shows service area and office location
- Starts a multi-step estimate request flow on intent or affirmative response
- Handles after-hours automatically (contact capture with callback message)
- Simulates realistic typing delay for authenticity

## Lead Capture Triggers

- Estimate flow: project type → location/address → name → phone
- Contact capture (after hours): name → phone

## Quick Replies on Open

`Get a free estimate` · `Kitchen or bath remodel` · `Home addition` · `Are you licensed?`

## Captured Lead

When lead capture completes, the lead object is stored in `window.capturedLead` and logged to the browser console. In production this would POST to an n8n webhook or CRM.

```json
{
  "name": "...",
  "phone": "...",
  "project_type": "Home addition",
  "location": "Clarks Summit, PA",
  "source": "estimate",
  "business": "Keystone Building & Contracting",
  "timestamp": "..."
}
```

---

## Customization

All business-specific content lives in `chatbot-config.json`. To adapt for a different contractor:
1. Update `business_name`, `address`, `phone`
2. Update `hours`
3. Update `service_area` array with covered areas
4. Update `project_types` with your scopes and pricing notes
5. Update `brand_color` (hex)

---

## Files

| File | Purpose |
|---|---|
| `index.html` | Page shell and chat widget markup |
| `style.css` | All visual styling, responsive layout |
| `script.js` | Chat logic, project responses, estimate state machine |
| `chatbot-config.json` | All business data, project types, FAQs, intents, copy |
