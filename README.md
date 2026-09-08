# KrishiSetu (कृषिसेतु) — Market-Decision & Net Realised Price Platform

[![SIH 2026](https://img.shields.io/badge/SIH-2026-green.svg)](https://sih.gov.in)
[![Problem Statement](https://img.shields.io/badge/Problem%20Statement-SIH26132-blue.svg)](https://sih.gov.in)
[![Production](https://img.shields.io/badge/Production-Live%20Vercel-brightgreen.svg)](https://krishisetu-lemon.vercel.app)
[![Demo](https://img.shields.io/badge/Demo%20Staging-Active-emerald.svg)](https://krishisetu-demo.vercel.app)
[![Tests](https://img.shields.io/badge/Tests-142%2F142%20Passing-brightgreen.svg)]()
[![Team](https://img.shields.io/badge/Team-HackOps-orange.svg)](https://github.com/HackOpsIndia)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)]()

> **KrishiSetu** bridges the critical information gap for Indian farmers by shifting market decisions from deceptive **Gross Mandi Prices** to true **Net Realised Price (NRP)** — factoring in real-time freight, mandi cess, loading/unloading fees, and shelf-life degradation risk.

---

## 🌐 Live Deployments (Evaluation Ready)

| Environment | Live URL | Deployment Status | Purpose |
|---|---|:---:|---|
| **Production** | [**https://krishisetu-lemon.vercel.app**](https://krishisetu-lemon.vercel.app) | `● Ready (HTTP 200)` | Primary evaluation build tracking `main` |
| **Demo / Staging** | [**https://krishisetu-demo.vercel.app**](https://krishisetu-demo.vercel.app) | `● Ready (HTTP 200)` | Fast-preview staging build tracking `develop` |
| **Backend API (Local/Cloud)** | `http://localhost:4000/api` | `● Active` | NestJS 10 REST & State Machine Gateway |
| **API Swagger Docs** | `http://localhost:4000/api/docs` | `● Active` | Interactive OpenAPI / Swagger documentation |

---

## 🌟 The Core Problem (SIH26132)

Indian farmers often travel to distant APMC mandis attracted by higher advertised gross rates (e.g. ₹3,050/qtl at Pune APMC vs ₹2,800/qtl at local Talegaon), only to discover that after deducting transportation costs, APMC commission/cess, unloading charges, and in-transit spoilage, their actual **take-home earnings are significantly lower**. Furthermore, smallholder farmers with sub-threshold harvests cannot access lucrative corporate buyers (like FreshMart or AgriFresh) that enforce minimum order quantities (MOQs).

### The KrishiSetu Solution
1. **Real-Time Net Realised Price (NRP) Engine**: Instantly computes actual in-pocket income across all nearby APMC mandis and verified institutional buyers.
2. **FPO Harvest Aggregation**: Dynamically clusters small lots from nearby farmers into single institutional-grade shipments, unlocking bulk premium contracts (e.g. 50Q MOQ unlocked via 68Q cluster).
3. **Transparent Price Discovery & Counter-Offers**: Algorithmic negotiation with buyer counter-offer guardrails to prevent distressed sales.
4. **Milestone Escrow Settlements**: Guaranteed payments with transparent deduction audits and dispute arbitration (20% advance, 60% weigh-in, 20% quality QC).
5. **Inclusive 3-in-1 Authentication**: Passwordless 6-digit Email OTP for rural farmers, Google OAuth 2.0 Web Client, and encrypted password authentication.

---

## 👥 Team HackOps — Roles & Member Study Guides

Every member of Team HackOps has a comprehensive, beginner-to-advanced study guide with architectural diagrams and hackathon viva defense Q&A.

| Member | Role & Workstream | GitHub | Assigned Branch | In-Depth Study Guides |
|---|---|---|---|:---:|
| **Ananya Pandey** | **Team Leader:** Monorepo Architecture, Turborepo Pipeline, Vercel Production Deployments, CI/CD Gatekeeping | [`Ananyapandey-dev`](https://github.com/Ananyapandey-dev) | `feature/integration-release` | [Study Guide](docs/members/ananya-pandey/README.md) |
| **Rama** | **Farmer & FPO Experience:** Command Center, Markets & Buyers, My Lots, FPO Pooling, Ramesh 18Q Tomato Scenario | [`ramako7777-spec`](https://github.com/ramako7777-spec) | `feature/farmer-fpo` | [Study Guide](docs/members/rama/README.md) |
| **Aman Kesarwani** | **Buyer Experience:** Corporate Procurement, Demand Matching, Counter-Offer Corridor, Milestone Escrow | [`amankesarwani01`](https://github.com/amankesarwani01) | `feature/buyer` | [Study Guide](docs/members/aman-kesarwani/README.md) |
| **Jatin Joshi** | **Backend & APIs:** NestJS 10, Server-Authoritative State Machine, Prisma ORM / PostgreSQL, 142 Passing Tests | [`jatinjoshi200803-stack`](https://github.com/jatinjoshi200803-stack) | `feature/backend` | [Study Guide](docs/members/jatin-joshi/README.md) |
| **Bhavishya Gangola** | **Auth, Security & Governance:** Email OTP (Gmail SMTP), Google OAuth 2.0, RBAC Guards, Admin Panel (`/admin/users`) | [`bhavishyagangola-dev`](https://github.com/bhavishyagangola-dev) | `feature/auth-admin` | [Study Guide](docs/members/bhavishya-gangola/README.md) |
| **Riya Adhikari** | **UI/UX & QA:** MotionSites Hero, Emerald Glassmorphism, React Portals (`createPortal`), Responsive Design | [`Nurizz07`](https://github.com/Nurizz07) | `feature/ui-qa-docs` | [Study Guide](docs/members/riya-adhikari/README.md) |

*Full team roster and collaboration matrix are documented in [`docs/TEAM.md`](docs/TEAM.md) and [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md).*

---

## 🏛️ System Architecture & Monorepo Layout

```
KrishiSetu/
├── apps/
│   ├── web/                    # Next.js 14 frontend (App Router, Glassmorphism, React Portals)
│   └── api/                    # NestJS 10 backend with Prisma ORM & PostgreSQL
├── packages/
│   └── shared/                 # 7 Server-authoritative domain engines, types & canonical data
├── docs/                       # Architecture, deployment, evaluator demo scripts, member guides
│   └── members/                # Comprehensive beginner-to-advanced study guides for all 6 members
├── turbo.json                  # Turborepo task pipeline definition
├── package.json                # Workspaces root configuration
└── scripts/                    # Canonical demo scenario reset & test scripts
```

### The 7 Mathematical Domain Engines (`packages/shared/src/engines/`)
1. **NRP Calculation Engine**: Computes true net cash in hand factoring freight, cess, loading fees, and shelf-life decay.
   $$\text{NRP} = \text{Gross Price} - \text{Freight} - \text{Handling} - \text{Cess} - \text{Spoilage Risk}$$
2. **Quality Degradation Engine**: Exponential shelf-life decay modeling based on temperature and transit duration.
3. **Aggregation Engine**: Dynamic geospatial harvest clustering to unlock institutional Minimum Order Quantities (MOQs).
4. **Logistics & Freight Engine**: Distance matrix dynamic freight routing with LCV capacity optimization.
5. **Dynamic Pricing Engine**: Automated corridor calculation & bilateral counter-offer bounds.
6. **Escrow & Settlement Engine**: 3-stage milestone release (20% dispatch, 60% weigh-in, 20% quality acceptance).
7. **Dispute Resolution Engine**: Pro-rata quality deduction matrix eliminating unfair produce rejection.

---

## 🔐 Comprehensive Authentication Suite

KrishiSetu supports three frictionless, production-configured authentication methods:
1. **Email OTP (Passwordless):**
   - 6-digit cryptographically generated OTP with 10-minute TTL.
   - Dispatched via enterprise Gmail SMTP transport with automated whitespace sanitization.
2. **Google OAuth 2.0:**
   - Powered by Google Identity Services Web Client (`1005466312619-t60vu0m5323j3cbv4ujb493s82q0s40a.apps.googleusercontent.com`).
   - Server-side cryptographic token signature verification on NestJS.
3. **Password & JWT:**
   - Bcrypt-hashed credentials (10 rounds) + HS256 stateless JWT bearer tokens.
   - Declarative `@Roles()` decorators and `RolesGuard` enforcing access across `FARMER`, `BUYER`, `FPO_ADMIN`, and `ADMIN`.

---

## 🎯 Verified Canonical Demo Walkthrough

KrishiSetu is pre-loaded with the official SIH canonical scenario:
- **Farmer:** Ramesh Kumar, Talegaon
- **Harvest:** 18 Quintals Tomato Hybrid Grade A
- **Talegaon APMC:** NRP ₹2,622/qtl (Total ₹47,196)
- **Pimpri APMC:** NRP ₹2,656/qtl (Total ₹47,808)
- **Pune APMC:** Gross ₹3,050/qtl $\rightarrow$ **NRP ₹2,787/qtl (Total ₹50,166)**
- **FreshMart Direct:** Gross ₹3,100/qtl $\rightarrow$ **NRP ₹2,925.20/qtl (Total ₹52,653.60 — +₹2,487.60 Profit!)**
- **AgriFresh Corporate Demand:** Minimum 50 Qtl (Individually ineligible; unlocked via FPO pool at 68 Qtl with 38% logistics savings)

To reset demo state at any time:
```bash
npm run demo:reset
```

See [`docs/DEMO.md`](docs/DEMO.md) for the complete evaluator presentation script.

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL (or automated mock fallback mode)

### 2. Installation & Run
```bash
# Clone the repository
git clone https://github.com/HackOpsIndia/KrishiSetu.git
cd KrishiSetu

# Install monorepo dependencies
npm install

# Setup environment variables
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Run automated tests across entire platform (142/142 passing)
npm test

# Build all applications and shared packages
npm run build

# Start both frontend and backend concurrently
npm run dev
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:4000/api](http://localhost:4000/api)
- **API Swagger Docs:** [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 📄 License & Attribution

Curated and developed by **Team HackOps** for the Smart India Hackathon (SIH) 2026.  
Released under the MIT License.
