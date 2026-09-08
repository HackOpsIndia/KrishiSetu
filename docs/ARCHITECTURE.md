# KrishiSetu (कृषिसेतु) System Architecture

**SIH 2026 Problem Statement:** SIH26132 — Market-Decision & Net Realised Price (NRP) Platform  
**Team:** HackOpsIndia  
**Repository:** [HackOpsIndia/KrishiSetu](https://github.com/HackOpsIndia/KrishiSetu)  

---

## 1. Monorepo Structure

```
KrishiSetu/
├── apps/
│   ├── api/                    # NestJS REST & WebSocket API
│   │   ├── src/
│   │   │   ├── auth/           # AuthController, AuthService, JwtStrategy, GoogleStrategy, OtpService
│   │   │   ├── email/          # EmailModule, EmailService (SMTP / Nodemailer / Mock fallback)
│   │   │   ├── lots/           # Agricultural lot management & quality grading
│   │   │   ├── markets/        # APMC mandi data feeds & distance matrix
│   │   │   ├── demands/        # Corporate buyer demand listings & bidding
│   │   │   ├── negotiation/    # Counter-offer state machine & price discovery
│   │   │   ├── pooling/        # FPO lot aggregation & logistics consolidation
│   │   │   ├── transactions/   # Escrow payments, milestone releases & invoicing
│   │   │   ├── users/          # User management, role promotion & RBAC
│   │   │   └── prisma/         # Prisma schema, migrations, seed.ts
│   └── web/                    # Next.js 14+ (App Router, Tailwind/Vanilla CSS, Lucide icons)
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/     # /login, /register, /forgot-password, /verify-otp
│       │   │   ├── farmer/     # /farmer/dashboard, /markets, /lots, /fpo, /transactions
│       │   │   ├── buyer/      # /buyer/dashboard, /demands, /offers, /transactions
│       │   │   ├── admin/      # /admin/dashboard, /buyers, /users, /audit-logs
│       │   │   └── page.tsx    # Landing page & interactive NRP simulator
│       │   └── components/     # High-contrast, accessible UI components
└── packages/
    └── shared/                 # Universal TypeScript types, DTOs & Domain Engines
        ├── src/
        │   ├── engines/        # 7 Pure mathematical domain engines
        │   ├── types/          # Contract definitions shared between frontend & backend
        │   └── constants/      # Mandi locations, freight rates, crop shelf-life
```

---

## 2. Seven Core Domain Engines (`packages/shared/src/engines/`)

All market intelligence and pricing math is server-authoritative and shared directly with the frontend client:

1. **Net Realised Price (NRP) Engine**:
   $$\text{NRP} = \text{Gross Price} - \text{Freight Cost} - \text{Handling/Unloading} - \text{Mandi Cess} - \text{Spoilage/Risk}$$
   Ranks every destination (mandi vs corporate buyer) by net in-pocket earnings per quintal.
2. **Quality Degradation Engine**:
   Calculates shelf-life decay, transit temperature impact, and grade deductions during transit.
3. **Aggregation Engine**:
   Pools sub-threshold farmer harvests into institutional minimum-order-quantity (MOQ) lots (e.g. 18 Qtl Ramesh Kumar + 50 Qtl pool = 68 Qtl).
4. **Logistics & Freight Engine**:
   Calculates route-optimized dynamic freight using distance matrix, vehicle type, and fuel surcharge.
5. **Dynamic Pricing & Counter-Offer Engine**:
   Calculates fair market corridor, recommends counter-offers, and enforces guardrails against distressed distress selling.
6. **Escrow & Settlement Engine**:
   Enforces milestone-based escrow payouts (e.g. 20% on dispatch, 80% on delivery inspection).
7. **Dispute Resolution Engine**:
   Automates evidence collection (geotagged inspection, photos, weight slips) and arbitrates grade mismatches.

---

## 3. Canonical Golden Scenario Verification

KrishiSetu is rigorously verified against the canonical dataset for SIH judging:

- **Farmer:** Ramesh Kumar (Talegaon, Pune District)
- **Produce:** 18 Quintals Tomato Hybrid Grade A
- **Distance to Pune APMC:** ~38 km
- **APMC Mandi Benchmarks:**
  - **Talegaon APMC:** Gross ₹2,800/qtl $\rightarrow$ **NRP: ₹2,622.00/qtl**
  - **Pimpri APMC:** Gross ₹2,850/qtl $\rightarrow$ **NRP: ₹2,656.00/qtl**
  - **Pune APMC:** Gross ₹3,050/qtl $\rightarrow$ **NRP: ₹2,787.00/qtl**
- **Direct Institutional Buyers:**
  - **FreshMart:** Gross ₹3,100/qtl $\rightarrow$ **NRP: ₹2,925.20/qtl** (Total payout: **₹52,653.60**)
  - **Pune Veggie:** Gross ₹3,000/qtl $\rightarrow$ **NRP: ₹2,815.75/qtl**
  - **AgriFresh Exports:** Minimum lot threshold 50 Qtl (Individually ineligible at 18 Qtl; unlocked via FPO aggregation to 68 Qtl at ₹3,200/qtl).

---

## 4. Production Authentication & Security

- **Dual-Method Auth:** Email/Password + Google OAuth resolving to single canonical email.
- **Enterprise RBAC:** `FARMER`, `BUYER`, `ADMIN`, `FPO_MANAGER`.
- **OTP Verification:** Production-grade email delivery via NestJS `EmailModule` with auto-failover to demo sandbox console mode.
- **Role Elevation:** Protected `/admin/users` interface with instant role switching, verification status toggling, and audit logging.
