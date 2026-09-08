# KrishiSetu (कृषिसेतु) — Team HackOps Organization

**SIH 2026 • Problem Statement SIH26132**  
**Repository:** [https://github.com/HackOpsIndia/KrishiSetu](https://github.com/HackOpsIndia/KrishiSetu)  
**Organization:** [HackOpsIndia](https://github.com/HackOpsIndia)

---

## Team Roster & Ownership Matrix

| Member | GitHub Username | Email | Assigned Branch | Primary Responsibility Area | Current Status |
|---|---|---|---|---|---|
| **Ananya Pandey** | [`Ananyapandey-dev`](https://github.com/Ananyapandey-dev) | `ananyapandey.dev.in@gmail.com` | `feature/integration-release` | **Team Leader:** Repository Admin, System Architecture, Final Integration, PR Merge Authority, Release Management, Final SIH Demo | **Active** |
| **Rama** | [`ramako7777-spec`](https://github.com/ramako7777-spec) | `ramako7777@gmail.com` | `feature/farmer-fpo` | **Farmer & FPO Experience:** Farmer Dashboard, Markets & Buyers, My Lots, FPO Pooling, Ramesh 18 Qtl Golden Scenario Verification | **Active** |
| **Aman Kesarwani** | [`amankesarwani01`](https://github.com/amankesarwani01) | `amankesarwani516@gmail.com` | `feature/buyer` | **Buyer Experience:** Buyer Dashboard, Corporate Demand, Offers & Negotiation UI, Buyer Transactions, Order Milestones | **Active** |
| **Jatin Joshi** | [`jatinjoshi200803-stack`](https://github.com/jatinjoshi200803-stack) | `jatinjoshi200803@gmail.com` | `feature/backend` | **Backend & APIs:** NestJS API, Server-Authoritative State Machine, Logistics Booking, Escrow Payment Settlement, Domain Engine Invariants | **Active** |
| **Bhavishya Gangola** | [`bhavishyagangola-dev`](https://github.com/bhavishyagangola-dev) | `bhavishyagangola12@gmail.com` | `feature/auth-admin` | **Auth, Security & Governance:** Email OTP, Password Reset, Google OAuth, RBAC, Admin Users & Access (`/admin/users`), Role Promotion, Audit Logs | **Active** |
| **Riya Adhikari** | [`Nurizz07`](https://github.com/Nurizz07) | `riyaadhikari361@gmail.com` | `feature/ui-qa-docs` | **UI/UX & QA Readiness:** Visual Polish, Responsive Layout, Loading/Error States, Accessibility Checks, Cross-Browser Testing, Presentation Assets | **Active** |

---

## Role Boundaries & Collaboration Rules

1. **Single Source of Truth:** All 6 members work on the single shared repository `HackOpsIndia/KrishiSetu`.
2. **Branch Hygiene:** Never commit directly to `main` or `develop`. Work on your assigned `feature/*` branch.
3. **No Artificial Silos:** We do NOT maintain separate repos. Every feature branch merges to `develop` via pull request.
4. **Integration Gatekeeper:** Ananya Pandey holds final merge authority to `develop` and `main`. Every PR must pass `npm test`, `npm run build`, and `npm run demo:reset`.
5. **Canonical Data Integrity:** Financial math is server-authoritative. Never hardcode contradictory numbers against the verified 7 domain engines.
