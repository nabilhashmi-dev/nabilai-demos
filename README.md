# Local Business AI — Demo-Driven Sales System

## What This Is

A system for generating custom AI demos for real local businesses.

The demos are sent cold to business owners to show them exactly how an AI Customer Assistant would work for their specific business — answering questions, capturing leads, and booking jobs 24/7.

---

## Folder Structure

```
Local Business AI/
├── AI Chatbot/
│   └── {business-name-slug}/
│       ├── index.html          ← Open this in a browser to see the demo
│       ├── script.js
│       ├── style.css
│       ├── chatbot-config.json ← All business-specific content lives here
│       └── README.md
│
├── AI Automation/
│   └── {business-name-slug}/
│       ├── automation-plan.json ← Backend automation recommendations
│       └── README.md
│
├── templates/
│   ├── base-system-prompt.md   ← Reusable chatbot behavior rules
│   └── lead-capture-flow.md    ← Lead capture sequence template
│
├── outreach/
│   ├── cold-message.txt        ← First outreach message
│   └── follow-up.txt           ← Follow-up nudge
│
└── README.md                   ← This file
```

---

## How to Use

### 1. View a Demo
Open any `index.html` file directly in a browser. No server needed.

### 2. Send the Demo
Share the demo by sending the business owner a link (e.g., hosted on GitHub Pages or a simple CDN). Use the outreach templates in `/outreach/`.

### 3. Add a New Business
When given a new business name and type:
- Create a new folder in `AI Chatbot/` and `AI Automation/`
- Copy the structure from an existing demo
- Update `chatbot-config.json` with real business data
- Tailor FAQs and lead triggers to the industry

---

## Primary Offer

**AI Customer Assistant** — what the demo shows:
- Answers customer questions 24/7
- Captures leads (name, phone, email)
- Books appointments or inquiry requests
- Handles after-hours traffic automatically

## Secondary Upsell (sold after closing)

**AI Automation Services:**
- Missed call text-back
- Review request automation
- Lead follow-up sequences (SMS + email)
- CRM sync
- Appointment reminders

---

## Businesses Built So Far

| Business | Type | Folder |
|---|---|---|
| Carmine's Italian Kitchen | Restaurant | `carmines-italian-kitchen-scranton` |
