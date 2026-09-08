# KrishiSetu (कृषिसेतु) — SIH 2026 Live Demo Script

**Problem Statement:** SIH26132 (Smart India Hackathon 2026)  
**Team:** HackOpsIndia  
**Demo URL:** [http://localhost:3000](http://localhost:3000) (or deployed URL)  

---

## 1. Demo Reset & Clean State Preparation

Before presenting to evaluators, reset the platform state to ensure 100% deterministic canonical data:

```bash
npm run demo:reset
```
*This re-seeds the Prisma database with Ramesh Kumar, Pune APMC mandates, active FPO pools, and canonical orders.*

---

## 2. Step-by-Step Evaluator Walkthrough

### Phase 1: The Problem — Why APMC Gross Rates are Misleading (Landing Page / Simulator)
1. Navigate to `/` (Landing Page).
2. Enter **18 Quintals Tomato Hybrid Grade A** in Talegaon.
3. Show evaluators the **Net Realised Price (NRP) Comparison Table**:
   - Pune APMC offers Gross ₹3,050/qtl, but after Mandi Cess, 38km transport, and handling, the **NRP is only ₹2,787/qtl**.
   - Talegaon APMC yields **₹2,622/qtl**.
   - Direct Buyer FreshMart yields **₹2,925.20/qtl** — an extra **+₹138.20/qtl in farmer profit**!

### Phase 2: Farmer Experience (`/farmer/dashboard`)
1. Click **"Quick Demo Login"** $\rightarrow$ select **Ramesh Kumar (Farmer)**.
2. View the unified dashboard showing:
   - 18 Qtl Tomato Lot (`LOT-TOM-001`).
   - Direct Buyer Match: **FreshMart (NRP ₹2,925.20/qtl, Total ₹52,653.60)**.
   - One-click negotiation counter-offer.
3. Navigate to `/farmer/fpo`:
   - Observe **AgriFresh Corporate Demand** (Minimum Order Quantity: 50 Qtl).
   - Show that Ramesh's individual 18 Qtl lot is individually *ineligible*.
   - Click **"Join Talegaon FPO Pool"**: Ramesh's 18 Qtl joins other farmers to reach **68 Qtl**, instantly unlocking AgriFresh's premium rate!

### Phase 3: Buyer Experience (`/buyer/dashboard`)
1. Switch role to **FreshMart Procurement Officer** via user menu.
2. Navigate to `/buyer/demands`:
   - View procurement demands for high-grade tomatoes and onions.
   - Inspect incoming farmer lots with verified geotagged quality certificates.
3. Navigate to `/buyer/offers`:
   - Review Ramesh's counter-offer.
   - Accept the counter-offer and initiate escrow lock-in.

### Phase 4: Administrative Governance & User Management (`/admin/users`)
1. Switch role to **Ananya Pandey (Platform Admin)**.
2. Navigate to `/admin/users`:
   - Inspect the live user roster with badges (`FARMER`, `BUYER`, `ADMIN`).
   - Demonstrate the **Promote / Demote User** modal (inspired by enterprise IAM).
   - Toggle verification badges (`KYC Verified`, `APMC Licensed`).
3. View `/admin/audit-logs` for immutable tamper-evident compliance history.

---

## 3. Verified Numerical Anchors (Single Source of Truth)

| Metric | Canonical Value |
|---|---|
| Ramesh Kumar Harvest | 18 Quintals Tomato Hybrid Grade A |
| Talegaon APMC NRP | ₹2,622.00 / Qtl |
| Pimpri APMC NRP | ₹2,656.00 / Qtl |
| Pune APMC NRP | ₹2,787.00 / Qtl |
| FreshMart Pre-Negotiation NRP | ₹2,925.20 / Qtl |
| FreshMart 18 Qtl Total Payout | ₹52,653.60 |
| Pune Veggie Direct NRP | ₹2,815.75 / Qtl |
| AgriFresh Export MOQ | 50.00 Quintals (Ineligible at 18 Qtl) |
| Talegaon FPO Combined Pool | 68.00 Quintals (Eligible!) |
