# 🌾 KrishiSetu (कृषिसेतु)
### Next-Generation Agricultural Market Intelligence & Direct Transaction Platform

[![SIH 2026](https://img.shields.io/badge/SIH-2026-10b981.svg?style=for-the-badge&logo=target)](https://sih.gov.in)
[![Problem Statement](https://img.shields.io/badge/Problem%20Statement-SIH26132-3b82f6.svg?style=for-the-badge)](https://sih.gov.in)
[![Production](https://img.shields.io/badge/Production-Live%20Vercel-059669.svg?style=for-the-badge&logo=vercel)](https://krishisetu-lemon.vercel.app)
[![Demo](https://img.shields.io/badge/Demo%20Staging-Active-ef4d23.svg?style=for-the-badge&logo=vercel)](https://krishisetu-demo.vercel.app)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20(Neon)-00e599.svg?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![Team](https://img.shields.io/badge/Team-HackOps-f59e0b.svg?style=for-the-badge)](https://github.com/HackOpsIndia)

> **KrishiSetu** bridges the critical information gap for Indian farmers by shifting agricultural selling decisions from deceptive **Gross Mandi Prices** to true **Net Realised Price (NRP)** — factoring in real-time freight, APMC mandi fees, loading/unloading costs, and temperature-sensitive transit spoilage risk.

---

## 🌐 Quick Links & Live Deployments

| Environment | URL | Deployment Status | Notes |
|:---|:---|:---:|:---|
| **Production Platform** | [**https://krishisetu-lemon.vercel.app**](https://krishisetu-lemon.vercel.app) | `● Ready (200 OK)` | Primary production release tracking `main` |
| **Demo Staging Platform** | [**https://krishisetu-demo.vercel.app**](https://krishisetu-demo.vercel.app) | `● Ready (200 OK)` | Evaluation & live testing instance tracking `develop` |
| **API Documentation** | `http://localhost:4000/api/docs` | `● Active` | Interactive Swagger / OpenAPI Specification |

---

## 📸 Visual Tour of KrishiSetu

Explore the high-resolution screenshots capturing every module of the platform:

### 1. 🌟 Public Discovery & Motion Landing
> Modern, interactive landing page educating farmers on Net Realised Price vs Gross Mandi Rates, featuring live commodity ticker and interactive cost simulator.

![KrishiSetu Public Landing Page](docs/screenshots/01_landing.png)

---

### 2. 🌾 Seller & Farmer Command Center
> Real-time farmer overview with harvest lot statuses, MSP alerts, nearby APMC benchmark prices, and 1-click access to verified corporate buyers.

![Farmer Dashboard](docs/screenshots/02_farmer_dashboard.png)

---

### 3. 📊 Net Realised Price (NRP) Decision Engine
> Server-authoritative comparison engine analyzing 7 distinct selling channels simultaneously. Quantifies direct buyers vs APMC mandis to highlight true take-home earnings.

![Market Intelligence & Net Realised Price](docs/screenshots/03_markets_decision.png)

---

### 4. 📦 Harvest Lot Lifecycle Management
> Digital lot registration with variety classification, quantity in quintals, quality grading parameters, and real-time counter-offer indicators.

![Farmer Lots Management](docs/screenshots/04_farmer_lots.png)

---

### 5. 🚜 FPO Logistics Pooling & Aggregation
> Clusters smallholder harvests within a 15 km radius into unified bulk shipments, unlocking corporate buyer Minimum Order Quantities (MOQs) and cutting freight by up to 38%.

![FPO Collective Pooling](docs/screenshots/05_fpo_pooling.png)

---

### 6. 🏢 Institutional Buyer Dashboard
> Comprehensive procurement hub for food processors, retail supermarket chains, and exporters to track active contracts, delivery schedules, and quality inspections.

![Buyer Dashboard](docs/screenshots/06_buyer_dashboard.png)

---

### 7. 📋 Buyer Demand Broadcasting
> Institutional procurement interface allowing verified buyers to publish commodity requirements, target grades, delivery timelines, and price bands.

![Buyer Demands](docs/screenshots/07_buyer_demand.png)

---

### 8. 🤝 Bilateral Offer Negotiation & Contracts
> Algorithmic counter-offer corridor with anti-predatory guardrails protecting farmers from distress sales below Minimum Support Price (MSP).

![Buyer Offers & Negotiations](docs/screenshots/08_buyer_offers.png)

---

### 9. 🛡️ Platform Administration & Oversight
> State-level governance dashboard tracking real-time trading volumes, market trends, dispute arbitration, and platform health metrics.

![Platform Admin Dashboard](docs/screenshots/09_admin_dashboard.png)

---

### 10. 👥 RBAC User Management & Role Governance
> Centralized directory powered by PostgreSQL for promoting users to Administrator or Staff roles, managing account statuses, and inspecting audit trails.

![Admin User Directory](docs/screenshots/10_admin_users.png)

---

### 11. 👤 Dynamic Profile & Vercel Blob Photo Upload
> Unified user identity allowing seamless 1-click switching between **Seller (Farmer)** and **Buyer (Procurement)** modes, with custom photo uploads via Vercel Blob storage.

![User Profile & Role Switcher](docs/screenshots/11_user_profile.png)

---

## 🧠 The Core Innovation: Net Realised Price (NRP)

Indian smallholders frequently travel 40–80 km to distant APMC mandis lured by higher gross rates, only to lose substantial margins to hidden deductions. KrishiSetu solves this mathematically:

$$\text{NRP} = \text{Gross Price} - \left( \text{Freight} + \text{APMC Cess} + \text{Loading/Weighing} + \text{Transit Loss} \right)$$

### Cost Breakdown Comparison (18 Quintals Tomato Hybrid A)

| Cost Component | Local APMC Mandi | Direct Buyer (FreshMart Foods) | Advantage with KrishiSetu |
|:---|:---:|:---:|:---|
| **Gross Advertised Rate** | ₹3,050 / qtl | ₹2,960 / qtl | Mandi appears +₹90 higher |
| **Transportation Freight** | -₹280 / qtl (65 km) | **₹0** (Farmgate Pickup) | **+₹280 / qtl saved** |
| **APMC Cess & Commission** | -₹152.50 / qtl (5%) | **₹0** (Exempt Direct Trade) | **+₹152.50 / qtl saved** |
| **Handling & Loading** | -₹35 / qtl | -₹20 / qtl | **+₹15 / qtl saved** |
| **Transit Spoilage Loss** | -₹61 / qtl (2%) | -₹15 / qtl (0.5% Cold-Chain) | **+₹46 / qtl saved** |
| **Net Realised Price (NRP)** | **₹2,521.50 / qtl** | **₹2,925.00 / qtl** | **+₹403.50 / qtl net gain** |
| **Total Realized (18 Qtl)** | ₹45,387 | **₹52,650** | **+₹7,263 More Cash in Hand!** |

---

## 🔒 Security, Privacy & Role Architecture

- **Zero Hardcoded Personal Data:** In compliance with strict privacy standards, no personal or administrator email addresses are hardcoded in source code.
- **Dynamic Administrator Governance:** Platform administrators are configured via the secure `ADMIN_EMAILS` environment variable in Vercel.
- **Role-Based Access Control (RBAC):**
  - **Seller (Farmer/FPO):** Manage lots, analyze NRP opportunities, participate in pooling clusters.
  - **Buyer (Procurement):** Publish procurement demands, negotiate contracts, fund milestone escrows.
  - **Self-Service Switcher:** Registered users can effortlessly toggle between Seller and Buyer modes without creating multiple accounts.
  - **Admin:** Promoted exclusively by system administrators to govern access, monitor trades, and audit logs.

---

## 🏗️ Architecture & Technology Stack

```mermaid
graph TD
    Client[Next.js 14 App Router / React 18 / TailwindCSS]
    VercelEdge[Vercel Serverless & Edge API Routes]
    VercelBlob[Vercel Blob Storage - Avatars]
    NeonDB[(Neon Serverless PostgreSQL Database)]
    PrismaORM[Prisma ORM Client]

    Client -->|HTTPS REST / JSON| VercelEdge
    Client -->|Direct Media Upload| VercelBlob
    VercelEdge -->|Connection Pool| PrismaORM
    PrismaORM -->|SQL Queries| NeonDB
    VercelBlob -.->|Public CDN URL| Client
```

- **Frontend & App Gateway:** Next.js 14, React 18, TailwindCSS, Lucide Icons, Recharts
- **Database & Persistence:** PostgreSQL via Neon Serverless, Prisma ORM
- **Object Storage:** Vercel Blob (`@vercel/blob`) for cloud-hosted user profile photos
- **Authentication:** Inclusive 3-way auth (Google OAuth 2.0, 6-Digit Email OTP via Gmail SMTP, Encrypted Credentials)
- **Monorepo Management:** Turborepo, TypeScript 5.5

---

## 🚀 Quick Start & Local Development

### Prerequisites
- Node.js `v20+` or `v22+`
- npm `v10+`
- PostgreSQL instance (or Neon database connection string)

### 1. Clone the Repository
```bash
git clone https://github.com/HackOpsIndia/KrishiSetu.git
cd KrishiSetu
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create `.env` in `apps/web/` and `apps/api/`:
```env
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"
ADMIN_EMAILS="krishisetu.in@gmail.com"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_token_here"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your_google_client_id"
```

### 4. Run Database Migrations
```bash
npx prisma generate --schema=apps/api/prisma/schema.prisma
```

### 5. Launch Development Server
```bash
npm run dev --workspace=@krishisetu/web
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Team HackOps — Smart India Hackathon 2026

| Team Member | Core Focus Areas | GitHub Profile |
|:---|:---|:---:|
| **Ananya Pandey** | Team Lead • Monorepo Architecture • CI/CD & Deployments | [@Ananyapandey-dev](https://github.com/Ananyapandey-dev) |
| **Rama** | Farmer & FPO Experience • NRP Optimization Engine | [@ramako7777-spec](https://github.com/ramako7777-spec) |
| **Aman Kesarwani** | Institutional Buyer Portal • Contract & Escrow Workflows | [@amankesarwani01](https://github.com/amankesarwani01) |
| **Jatin Joshi** | Backend & Database • Prisma ORM & State Machine | [@jatinjoshi200803-stack](https://github.com/jatinjoshi200803-stack) |
| **Bhavishya Gangola** | Security & Auth • RBAC Governance & Admin System | [@bhavishyagangola-dev](https://github.com/bhavishyagangola-dev) |
| **Riya Adhikari** | UI/UX Design System • Responsive Layouts & Accessibility | [@Nurizz07](https://github.com/Nurizz07) |

---

<div align="center">
  <sub>Built with ❤️ for Indian Farmers by <b>Team HackOps</b> • Smart India Hackathon 2026</sub>
</div>
