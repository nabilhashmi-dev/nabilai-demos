# Personalized Demo Guide
## How to build a prospect-specific demo in under 45 minutes

---

## When to use this

A prospect has seen your industry demo and shown interest — OR you want to do cold outreach with a demo that uses their real business name, address, and services. Personalized demos close at a much higher rate because it doesn't feel like a generic template.

---

## Step 1 — Gather intel (10 min)

Before touching any files, collect from the prospect's website / Google listing:

| Field | Where to find it |
|---|---|
| Business name (exact) | Google Business or website header |
| Address | Google Maps |
| Phone | Website / Google listing |
| Hours (all 7 days) | Google listing hours |
| Services / menu items | Website services page |
| 2–3 selling points | About page or reviews |
| Any FAQs they answer | Website FAQ or reviews |
| Brand color (hex) | Use Chrome DevTools eyedropper on logo |

Fill in the **Prospect Intake Sheet** below before starting.

---

## Step 2 — Clone the right demo folder (2 min)

Pick the industry template that matches the prospect:

| Industry | Source folder |
|---|---|
| Restaurant / food | `AI Chatbot/carmines-italian-kitchen-scranton/` |
| Chiropractic / PT / wellness | `AI Chatbot/lakewood-chiropractic-scranton/` |
| MedSpa / aesthetics | `AI Chatbot/luxe-aesthetics-medspa-scranton/` |
| Barbershop / salon | `AI Chatbot/kings-cuts-barbershop-scranton/` |
| Contractor / builder / remodeler | `AI Chatbot/keystone-contracting-scranton/` |

Copy the folder and rename it using the slug format:
```
business-name-city/
```
Example: `tonys-pizza-scranton/` or `northeast-chiro-clarks-summit/`

---

## Step 3 — Edit chatbot-config.json (20–25 min)

This is the only file you need to edit. `script.js` reads everything from config.

**Required fields — always update:**
```json
"business_name": "Tony's Pizza",
"city": "Scranton, PA",
"phone": "(570) 555-1234",
"address": "123 Main St, Scranton, PA 18503",
"hours": { ... all 7 days ... },
"brand_color": "#c0392b"
```

**Hours format:**
```json
"Monday": "11:00 AM – 9:00 PM",
"Tuesday": "11:00 AM – 9:00 PM",
"Sunday": "Closed"
```

**Selling points — rewrite with their actual differentiators:**
```json
"selling_points": [
  "Family-owned since 1987 — same recipes, same hands.",
  "Voted Best Pizza in NEPA three years running.",
  "Fresh-made dough daily, never frozen."
]
```

**Services / menu — use their actual items:**
```json
"services": ["Neapolitan Pizza", "Stromboli", "Calzones", ...]
```

**Greeting — personalize it:**
```json
"greeting": "Hey there! Welcome to Tony's Pizza 🍕 I can help you with our menu, hours, or reservations. What can I do for you?"
```

**After-hours message:**
```json
"after_hours_message": "We're closed right now, but leave your name and number and we'll call you back!"
```

**Lead captured message:**
```json
"lead_captured_message": "Thanks, {name}! We'll give you a call to confirm your reservation. See you soon!"
```

**Fields you can leave as-is from the template:**
- `intents` — keyword lists work across most similar businesses
- `fallback_message` — generic enough to keep
- `faq` — update the most important ones, rest can stay

---

## Step 4 — Update index.html (3 min)

Change these 4 things in `index.html`:

1. `<title>` tag — `Tony's Pizza — AI Assistant Demo`
2. `<h1>` — Business name
3. `.subtitle` paragraph — Address / tagline
4. `.demo-info` block — Update hours summary and any key info shown on the card
5. `.demo-logo` emoji — Pick something fitting (🍕 🏥 💆 ✂️ 🏗️)
6. `.demo-cta` button text — e.g. "Make a Reservation or Ask a Question"
7. `agency-footer` — leave as-is (Nabil AI branding)

---

## Step 5 — Also update isAfterHours() in script.js (5 min)

The after-hours check is hardcoded in `script.js` for the template business. You need to update it to match the real business hours.

Find this function and update the time map and closed-day checks:

```js
function isAfterHours() {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const day = days[new Date().getDay()];
  if (day === 'Sunday') return true;  // <-- update closed days
  const hm = new Date().getHours() * 60 + new Date().getMinutes();
  const map = {
    Monday:    [660, 1260],  // 11am–9pm = 660–1260
    Tuesday:   [660, 1260],
    Wednesday: [660, 1260],
    Thursday:  [660, 1260],
    Friday:    [660, 1320],  // 11am–10pm
    Saturday:  [660, 1320],
  };
  const [open, close] = map[day] || [660, 1260];
  return hm < open || hm >= close;
}
```

**Minutes conversion:** multiply hour by 60 and add minutes.
- 9:00 AM = 540, 10:00 AM = 600, 11:00 AM = 660
- 5:00 PM = 1020, 6:00 PM = 1080, 7:00 PM = 1140, 8:00 PM = 1200, 9:00 PM = 1260

---

## Step 6 — Test locally (5 min)

Open `index.html` directly in a browser (double-click or drag-drop).

Test these scenarios:
- [ ] Chat opens, greeting shows the correct business name
- [ ] Ask "what are your hours?" → correct hours
- [ ] Ask "where are you located?" → correct address
- [ ] Ask about a service → correct service info
- [ ] Say "book an appointment" → booking flow starts
- [ ] Complete the full booking flow (service → date → name → phone) → lead captured
- [ ] Check browser console: `[Lead Captured]` log shows correct data

---

## Step 7 — Deploy (5 min)

**Option A — GitHub Pages (recommended for multi-client management)**

Add the new folder to the nabilai-demos repo:
```bash
cd "c:\Users\nabil\Documents\Projects\Local Business AI"
git add "AI Chatbot/tonys-pizza-scranton/"
git commit -m "Add personalized demo: Tony's Pizza"
git push
```
Live URL: `https://nabilhashmi-dev.github.io/nabilai-demos/tonys-pizza-scranton/`

**Option B — Netlify Drop (fastest, one-off)**
Go to `drop.netlify.com`, drag-drop the folder. Get a URL like `https://random-name.netlify.app`. Takes 30 seconds.

**Option C — Local file (for in-person demos only)**
No deploy needed. Open `index.html` on your laptop and demo it in person.

---

## Step 8 — Send the prospect

Use the personalized outreach template:

> Hi [Name], I put together a quick demo of what an AI assistant could look like for [Business Name]. No pitch, just built it:
>
> [URL]
>
> Takes 2 minutes to try. Happy to walk you through it over the phone if you'd like.
>
> — Nabil

---

## Prospect Intake Sheet (copy one per prospect)

```
Business Name:
Industry:
City:
Phone:
Address:
Hours:
  Monday:
  Tuesday:
  Wednesday:
  Thursday:
  Friday:
  Saturday:
  Sunday:
Services (list):
Selling Points (3):
Brand Color:
FAQ notes:
Source folder to clone:
Output folder name:
Demo URL:
Status: [ ] built [ ] tested [ ] sent [ ] interested [ ] closed
```

---

## Time Budget Per Demo

| Task | Time |
|---|---|
| Gather intel | 10 min |
| Clone + rename folder | 2 min |
| Edit chatbot-config.json | 20 min |
| Update index.html | 3 min |
| Update isAfterHours() | 5 min |
| Test locally | 5 min |
| Deploy + send | 5 min |
| **Total** | **~50 min** |

First one will take longer. By demo 3 you'll be under 30 minutes.
