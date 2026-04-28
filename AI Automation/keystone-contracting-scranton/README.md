# Keystone Building & Contracting — AI Automation Plan

**Business:** Keystone Building & Contracting
**Location:** Scranton, PA
**Industry:** General Contractor / Builder / Land Surveying

---

## Overview

This document outlines the backend automation layer that transforms the AI chatbot demo into a full lead conversion and client communication system. The chatbot captures estimate requests — these automations make sure no lead goes cold, clients stay informed throughout the project, and completed jobs generate reviews and referrals.

---

## Top 5 Automations

| # | Automation | Trigger | Primary Tool |
|---|---|---|---|
| 1 | Estimate Request Fast-Response | Lead captured | n8n + Twilio + Postmark |
| 2 | Estimate Follow-Up Sequence | No contract after 3 days | n8n + Twilio + Postmark |
| 3 | Project Milestone Updates | Milestone logged | n8n + Twilio |
| 4 | Post-Project Review + Referral | Project marked complete | n8n + Twilio |
| 5 | New Lead → Owner Alert + CRM | Any new lead | n8n + Twilio + Google Sheets |

---

## Why This Business Needs Automation

Contractor leads are high-value but slow to close. The difference between winning and losing a bid is often response time — homeowners are requesting 3–5 quotes and the first contractor to follow up professionally almost always gets the job. Beyond lead conversion, referrals are the #1 source of contractor revenue. An automated post-project review + referral request generates compounding return with zero extra effort.

---

## Revenue Impact Estimate

- **Estimate response time:** Under 5 minutes (from days)
- **Non-closer conversion:** 15–25% of estimates signed from follow-up
- **New Google reviews:** 3–5/month
- **Referral projects generated:** 1–2/month
- **Estimated additional monthly revenue:** $5,000–$20,000

---

## Full Details

See `automation-plan.json` for complete automation specs, tool stack, and implementation timeline.
