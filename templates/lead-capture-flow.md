# Lead Capture Flow — AI Customer Assistant

This is the exact sequence used when a user shows booking or inquiry intent.

---

## Trigger Conditions

Start lead capture when the user's message contains any of:
- "book", "reserve", "reservation", "appointment"
- "quote", "estimate", "price", "cost", "how much"
- "available", "availability", "schedule"
- "catering", "event", "party", "private"
- Any keyword listed in `lead_triggers` inside `chatbot-config.json`

---

## Step-by-Step Flow

### Step 1 — Acknowledge + Ask Name
> "I'd love to help with that! Can I start with your name?"

State: `awaiting_name`

### Step 2 — Confirm Name + Ask Phone
> "Nice to meet you, [NAME]! What's the best phone number to reach you at?"

State: `awaiting_phone`

### Step 3 — Confirm Phone + Ask Email
> "Got it. And what's your email address so we can send you a confirmation?"

State: `awaiting_email`

### Step 4 — Confirm + Close
> "Perfect, [NAME]! We've got your info and someone from [BUSINESS_NAME] will be in touch shortly. Is there anything else I can help with in the meantime?"

State: `lead_captured`

Store in memory:
```json
{
  "name": "[NAME]",
  "phone": "[PHONE]",
  "email": "[EMAIL]",
  "timestamp": "[ISO TIMESTAMP]",
  "source": "chatbot"
}
```

---

## Validation Rules

- **Name**: Must be at least 2 characters. If blank or invalid, re-ask once: "Just want to make sure I get your name right — could you type it again?"
- **Phone**: Must contain at least 10 digits. Strip non-numeric chars before storing. If invalid: "Could you double-check that number? We want to make sure we can reach you."
- **Email**: Must contain @ and a dot. If invalid: "That email doesn't look quite right — could you re-enter it?"

---

## Drop-off Handling

If the user stops responding mid-flow, do not re-prompt more than once.
After 60 seconds of inactivity during capture, show:
> "No worries — whenever you're ready, I'm here. You can also call us directly at [PHONE]."

---

## After Capture

- Log the lead object to `window.capturedLead` (browser memory)
- Log to browser console for demo visibility
- In production: POST to n8n webhook or CRM endpoint
