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
Open any `index.html` file directly in a browser, or visit the live GitHub Pages links below.

### 2. Send the Demo
Share the demo link with the business owner. Use the outreach templates in `/outreach/`.

### 3. Add a New Business
When given a new business name and type:
- Create a new folder in `AI Chatbot/` and `AI Automation/`
- Copy the structure from an existing demo in the same industry
- Update `chatbot-config.json` with real business data
- Tailor intents and response copy to the specific business

---

## Primary Offer

**AI Customer Assistant** — what the demo shows:
- Answers customer questions 24/7
- Captures leads (name + phone)
- Books appointments or estimate requests
- Handles after-hours traffic automatically

## Secondary Upsell (sold after closing)

**AI Automation Services:**
- Missed call text-back
- Review request automation
- Lead follow-up sequences (SMS + email)
- CRM sync and owner alerts
- Appointment and project reminders

---

## Businesses Built

| Business | Type | Folder | Live Demo |
|---|---|---|---|
| Carmine's Italian Kitchen | Restaurant | `carmines-italian-kitchen-scranton` | [View](https://nabilhashmi-dev.github.io/nabilai-demos/AI%20Chatbot/carmines-italian-kitchen-scranton/) |
| Lakewood Chiropractic | Chiropractic | `lakewood-chiropractic-scranton` | [View](https://nabilhashmi-dev.github.io/nabilai-demos/AI%20Chatbot/lakewood-chiropractic-scranton/) |
| Luxe Aesthetics MedSpa | Medical Spa | `luxe-aesthetics-medspa-scranton` | [View](https://nabilhashmi-dev.github.io/nabilai-demos/AI%20Chatbot/luxe-aesthetics-medspa-scranton/) |
| King's Cuts Barbershop | Barbershop | `kings-cuts-barbershop-scranton` | [View](https://nabilhashmi-dev.github.io/nabilai-demos/AI%20Chatbot/kings-cuts-barbershop-scranton/) |
| Keystone Building & Contracting | Contractor | `keystone-contracting-scranton` | [View](https://nabilhashmi-dev.github.io/nabilai-demos/AI%20Chatbot/keystone-contracting-scranton/) |

---

## Pricing (Nabil AI)

| Tier | What They Get | Price |
|---|---|---|
| Setup | Custom chatbot, configured + deployed | $497–$997 one-time |
| Monthly | Hosting, updates, minor changes | $197–$297/month |
| Automation Add-On | Missed call text-back, reviews, follow-ups | $397–$697/month |

---

*AI assistant demos built by [Nabil AI](mailto:nabil.hashmi@gmail.com)*
