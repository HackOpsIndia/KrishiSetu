# KrishiSetu (कृषिसेतु) — Market-Decision & Net Realised Price Platform

[![SIH 2026](https://img.shields.io/badge/SIH-2026-green.svg)](https://sih.gov.in)
[![Problem Statement](https://img.shields.io/badge/Problem%20Statement-SIH26132-blue.svg)](https://sih.gov.in)
[![Tests](https://img.shields.io/badge/Tests-142%2F142%20Passing-brightgreen.svg)]()
[![Team](https://img.shields.io/badge/Team-HackOps-orange.svg)](https://github.com/HackOpsIndia)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)]()

> **KrishiSetu** bridges the critical information gap for Indian farmers by shifting market decisions from deceptive **Gross Mandi Prices** to true **Net Realised Price (NRP)** — factoring in real-time freight, mandi cess, loading/unloading fees, and shelf-life degradation risk.

---

## 🌟 The Core Problem (SIH26132)

Indian farmers often travel to distant APMC mandis attracted by higher advertised gross rates (e.g. ₹3,050/qtl at Pune APMC vs ₹2,800/qtl at local Talegaon), only to discover that after deducting transportation costs, APMC commission/cess, unloading charges, and in-transit spoilage, their actual **take-home earnings are significantly lower**. Furthermore, smallholder farmers with sub-threshold harvests cannot access lucrative corporate buyers (like FreshMart or AgriFresh) that enforce minimum order quantities (MOQs).

### The KrishiSetu Solution
1. **Real-Time Net Realised Price (NRP) Engine**: Instantly computes actual in-pocket income across all nearby APMC mandis and verified institutional buyers.
2. **FPO Harvest Aggregation**: Dynamically clusters small lots from nearby farmers into single institutional-grade shipments, unlocking bulk premium contracts.
3. **Transparent Price Discovery & Counter-Offers**: Algorithmic negotiation with buyer counter-offer guardrails to prevent distressed sales.
4. **Milestone Escrow Settlements**: Guaranteed payments with transparent deduction audits and dispute arbitration.

---

## 👥 Team HackOps — Roles & Branch Ownership

| Member | GitHub Username | Assigned Branch | Primary Responsibility |
|---|---|---|---|
| **Ananya Pandey** | [`Ananyapandey-dev`](https://github.com/Ananyapandey-dev) | `feature/integration-release` | **Team Leader:** Repository Admin, Architecture, Final Integration & Release |
| **Rama** | [`ramako7777-spec`](https://github.com/ramako7777-spec) | `feature/farmer-fpo` | **Farmer & FPO Experience:** Mandi comparison, My Lots, FPO pooling |
| **Aman Kesarwani** | [`amankesarwani01`](https://github.com/amankesarwani01) | `feature/buyer` | **Buyer Experience:** Corporate demand, counter-offers, escrow tracking |
| **Jatin Joshi** | [`jatinjoshi200803-stack`](https://github.com/jatinjoshi200803-stack) | `feature/backend` | **Backend & APIs:** NestJS, domain engine invariants, logistics & settlements |
| **Bhavishya Gangola** | [`bhavishyagangola-dev`](https://github.com/bhavishyagangola-dev) | `feature/auth-admin` | **Auth & Admin:** OTP verification, OAuth, RBAC, Admin user management |
| **Riya Adhikari** | [`Nurizz07`](https://github.com/Nurizz07) | `feature/ui-qa-docs` | **UI/UX & QA:** Visual polish, accessibility, performance, test reporting |

*Detailed collaboration instructions are available in [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md).*

---

## 🏛️ System Architecture & Monorepo Layout

```
KrishiSetu/
├── apps/
│   ├── api/                    # NestJS 10 backend with Prisma ORM & PostgreSQL
│   └── web/                    # Next.js 14 frontend (App Router, Responsive UI)
├── packages/
│   └── shared/                 # 7 Server-authoritative domain engines & types
└── docs/                       # Architecture, demo scripts, deployment & Git guides
```

### The 7 Mathematical Domain Engines
- **NRP Calculation Engine**: $\text{NRP} = \text{Gross Price} - \text{Freight} - \text{Handling} - \text{Cess} - \text{Spoilage Risk}$
- **Quality Degradation Engine**: Temperature and transit time shelf-life decay modeling.
- **Aggregation Engine**: Dynamic FPO pooling algorithms for bulk order thresholds.
- **Logistics & Freight Engine**: Distance matrix dynamic freight routing.
- **Dynamic Pricing Engine**: Automated corridor calculation & counter-offer recommendations.
- **Escrow & Settlement Engine**: Milestone-based release & payment protection.
- **Dispute Resolution Engine**: Geotagged photo inspection & grade deduction arbitration.

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL (optional if using mock demo mode)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/HackOpsIndia/KrishiSetu.git
cd KrishiSetu

# Install monorepo dependencies
npm install

# Setup environment
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Run tests across entire platform
npm test

# Build all applications
npm run build

# Start both frontend and backend
npm run dev
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:4000/api](http://localhost:4000/api)
- **API Swagger Docs:** [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 🎯 Verified Canonical Demo Walkthrough

KrishiSetu is pre-loaded with the official SIH canonical scenario:
- **Farmer:** Ramesh Kumar, Talegaon
- **Harvest:** 18 Quintals Tomato Hybrid Grade A
- **Talegaon APMC:** NRP ₹2,622/qtl
- **Pimpri APMC:** NRP ₹2,656/qtl
- **Pune APMC:** Gross ₹3,050/qtl $\rightarrow$ **NRP ₹2,787/qtl**
- **FreshMart Direct:** Gross ₹3,100/qtl $\rightarrow$ **NRP ₹2,925.20/qtl (Total ₹52,653.60)**
- **AgriFresh Corporate Demand:** Minimum 50 Qtl (Individually ineligible; unlocked via FPO pool at 68 Qtl)

To reset demo state at any time:
```bash
npm run demo:reset
```

See [docs/DEMO.md](docs/DEMO.md) for the complete evaluator script.

---

## 📄 License & Attribution

Curated and developed by **Team HackOps** for the Smart India Hackathon (SIH) 2026.  
Released under the MIT License.
