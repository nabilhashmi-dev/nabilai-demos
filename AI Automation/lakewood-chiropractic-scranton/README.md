# Lakewood Chiropractic — AI Automation Plan

**Business:** Lakewood Chiropractic
**Location:** Scranton, PA
**Industry:** Chiropractic / Healthcare

---

## Overview

This document outlines the backend automation layer that transforms the AI chatbot demo into a full revenue recovery system. The chatbot captures leads — these automations make sure those leads are followed up, nurtured, and converted.

---

## Top 5 Automations

| # | Automation | Trigger | Primary Tool |
|---|---|---|---|
| 1 | Missed Call Text-Back | Missed inbound call | Twilio + n8n |
| 2 | Auto Accident Fast-Response | Chatbot flags accident intent | n8n + Twilio + Postmark |
| 3 | Appointment Confirmation + Reminder | Appointment booked | n8n + Twilio |
| 4 | No-Show Reschedule Sequence | Patient no-show | n8n + Twilio |
| 5 | Lead → CRM Sync + Owner Alert | Any new lead | n8n + Google Sheets |

---

## Why This Business Needs Automation

Auto accident cases are time-critical and high-value ($3,000–$8,000 each). A 2-hour delay in response means the patient calls another practice. Chiropractic offices also have high call volume during hours when staff are with patients — missed calls directly equal lost revenue. These automations eliminate that gap entirely.

---

## Revenue Impact Estimate

- **Recovered missed call leads:** 10–20/month
- **Auto accident cases recovered:** 1–3/month
- **No-show reduction:** 30–40%
- **Estimated additional monthly revenue:** $3,000–$10,000

---

## Full Details

See `automation-plan.json` for complete automation specs, tool stack, and implementation timeline.
