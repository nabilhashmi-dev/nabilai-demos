# Lead Delivery Setup
## NabilAI.Leads.Capture.v1

Workflow created: https://n8n.propclarity.cloud/workflow/FXcOlyO9lmaS9P8I

---

## How it works

```
Demo chatbot (user fills out form)
  → POST to webhook
  → Extract Lead Fields (Code node — normalizes body/flattened formats)
  → Log to Google Sheets (one row per lead)
  → SMS Alert → Nabil's phone via Twilio
```

Payload the chatbot sends:
```json
{
  "name": "Jane Smith",
  "phone": "5701234567",
  "source": "consultation",
  "business": "Luxe Aesthetics MedSpa",
  "timestamp": "2026-05-03T14:30:00.000Z",
  "treatment": "Botox",
  "date": "Saturday"
}
```

---

## One-time setup steps (in order)

### Step 1 — Create the Google Sheet

1. Go to Google Sheets and create a new spreadsheet
2. Name it: **Nabil AI — Demo Leads**
3. On Sheet1, rename the tab to **Leads**
4. Add these headers in row 1 (exact spelling):
   ```
   Timestamp | Business | Name | Phone | Source | Service | Date | Location
   ```
5. Copy the Sheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/[THIS_IS_THE_SHEET_ID]/edit`

### Step 2 — Update the workflow in n8n

Open the workflow: https://n8n.propclarity.cloud/workflow/FXcOlyO9lmaS9P8I

**In the "Log to Google Sheets" node:**
1. Replace `YOUR_GOOGLE_SHEET_ID_HERE` with your actual Sheet ID
2. The credential was auto-assigned as "Job Search Google Sheets" — change this to your correct Google Sheets credential (or create one for this project)
3. Set the Columns field to **"Auto-map input data"** in the dropdown — this maps the JSON fields automatically to sheet columns

**In the "SMS Alert — Nabil" node:**
1. Add your Twilio credential (or create one)
2. Verify `$env.TWILIO_FROM_NUMBER` and `$env.NABIL_PHONE_NUMBER` are set (see Step 3)

### Step 3 — Add environment variables to n8n

In your n8n Docker compose or .env file, add:
```env
TWILIO_FROM_NUMBER=+15701234000   # your Twilio number
NABIL_PHONE_NUMBER=+15701234567   # your personal cell phone
```

Restart n8n after adding them.

### Step 4 — Activate the workflow

Click the **Inactive** toggle at the top of the workflow to activate it.

The webhook URL will be:
```
https://n8n.propclarity.cloud/webhook/lead-capture
```

### Step 5 — Update chatbot configs

Once the workflow is active, set `lead_webhook_url` in all 5 demo configs:

```json
"lead_webhook_url": "https://n8n.propclarity.cloud/webhook/lead-capture"
```

Files to update:
- `AI Chatbot/carmines-italian-kitchen-scranton/chatbot-config.json`
- `AI Chatbot/lakewood-chiropractic-scranton/chatbot-config.json`
- `AI Chatbot/luxe-aesthetics-medspa-scranton/chatbot-config.json`
- `AI Chatbot/kings-cuts-barbershop-scranton/chatbot-config.json`
- `AI Chatbot/keystone-contracting-scranton/chatbot-config.json`

Then commit and push to redeploy on GitHub Pages.

### Step 6 — Test end-to-end

1. Open any demo (e.g., Carmine's)
2. Go through the booking flow and capture a lead with a test name
3. Check your Google Sheet — row should appear
4. Check your phone — SMS should arrive within seconds
5. Verify the console log shows `[Lead Captured]` with the right data

---

## Twilio setup (if not yet done)

1. Sign up at twilio.com (free trial gives ~$15 credit — enough for hundreds of test SMS)
2. Get a Twilio number (free on trial)
3. Note your Account SID and Auth Token
4. In n8n, create a new Twilio credential with those values

---

## SMS alert format

When a lead is captured, Nabil receives:
```
🔔 New demo lead!
Business: Luxe Aesthetics MedSpa
Name: Jane Smith
Phone: 5701234567
Source: consultation
Service: Botox
Date: Saturday
```

---

## What "source" means in the data

| Source | Means |
|---|---|
| `reservation` | Carmine's reservation flow |
| `consultation` | Luxe or Lakewood consultation flow |
| `appointment` | King's Cuts or Lakewood appointment |
| `estimate` | Keystone estimate request |
| `contact_capture` | After-hours contact form (any demo) |
| `contact` | After-hours contact (barbershop/chiro/etc) |
| `event_lead` | Carmine's private event inquiry |
