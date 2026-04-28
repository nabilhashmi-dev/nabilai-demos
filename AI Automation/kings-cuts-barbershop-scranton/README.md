# King's Cuts Barbershop — AI Automation Plan

**Business:** King's Cuts Barbershop
**Location:** Scranton, PA
**Industry:** Barbershop / Men's Grooming

---

## Overview

This document outlines the backend automation layer that transforms the AI chatbot demo into a full client retention and booking system. The chatbot handles inbound booking requests — these automations make sure cancelled slots get filled, regulars come back, and happy clients leave reviews.

---

## Top 5 Automations

| # | Automation | Trigger | Primary Tool |
|---|---|---|---|
| 1 | Missed Call Text-Back | Missed inbound call | Twilio + n8n |
| 2 | Appointment Confirmation + Reminder | Appointment booked | n8n + Twilio |
| 3 | Last-Minute Slot Fill Broadcast | Same-day cancellation | n8n + Twilio |
| 4 | Client Rebooking Nudge | 28 days since last visit | n8n + Twilio |
| 5 | Post-Cut Review Request | Appointment end + 2 hours | n8n + Twilio |

---

## Why This Business Needs Automation

Barbershops are SMS-first businesses. Clients don't want email — they want a quick text. Missed calls during a cut are a constant problem, and without a text-back system those clients are booking at the next shop down the street. Regulars also respond well to casual, on-brand reminders — a simple "it's been a while, want to come in?" text recovers 30–40% of lapsed clients without any manual effort.

---

## Revenue Impact Estimate

- **Recovered missed call bookings:** 8–15/month
- **No-show reduction:** 25–35%
- **Cancelled slots filled:** 50–70%
- **Lapsed clients recovered:** 2–4/month
- **New Google reviews:** 4–8/month
- **Estimated additional monthly revenue:** $800–$2,000

---

## Full Details

See `automation-plan.json` for complete automation specs, tool stack, and implementation timeline.
