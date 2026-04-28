# Luxe Aesthetics MedSpa — AI Automation Plan

**Business:** Luxe Aesthetics MedSpa
**Location:** Scranton, PA
**Industry:** Medical Spa / Aesthetics

---

## Overview

This document outlines the backend automation layer that transforms the AI chatbot demo into a full client acquisition and retention system. The chatbot captures consultation requests — these automations ensure fast follow-up, nurture cold leads, and bring clients back for repeat treatments.

---

## Top 5 Automations

| # | Automation | Trigger | Primary Tool |
|---|---|---|---|
| 1 | Consultation Inquiry Fast-Follow | Lead captured | n8n + Twilio + Postmark |
| 2 | Lead Nurture Sequence (Non-Bookers) | No booking within 24hrs | n8n + Twilio + Postmark |
| 3 | Post-Treatment Rebooking Sequence | Treatment completion + interval | n8n + Twilio + Postmark |
| 4 | Post-Treatment Review Request | Treatment completion + 2 days | n8n + Twilio |
| 5 | Monthly Promotions Broadcast | Scheduled (monthly) | n8n + Twilio + Postmark |

---

## Why This Business Needs Automation

Aesthetics clients shop multiple providers before committing. Speed of response after a consultation inquiry is the #1 conversion factor — a same-minute SMS reply vs a same-day reply is often the difference between a booking and a lost client. Retention is equally critical: Botox clients return every 3–4 months on a predictable schedule. A hands-off rebooking sequence turns one-time clients into annual revenue.

---

## Revenue Impact Estimate

- **Consultation show rate improvement:** 25–35%
- **Repeat visit increase:** 2–4/month
- **New Google reviews:** 4–8/month
- **Leads converted from nurture:** 3–6/month
- **Estimated additional monthly revenue:** $2,500–$6,000

---

## Full Details

See `automation-plan.json` for complete automation specs, tool stack, and implementation timeline.
