# DesignForge

> **AI-POWERED LOW-LEVEL DESIGN (LLD) PRACTICE STUDIO**  
> *"DESIGN. DEFEND. IMPROVE."*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.3-cyan.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-purple.svg)](https://vitejs.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-indigo.svg)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

---

## 1. Executive Summary & Problem Space

Low-Level Design (LLD) and Object-Oriented Domain Modeling are critical benchmarks for senior engineering hiring (L4, L5, L6+). While candidates can practice algorithm puzzles on LeetCode or study high-level distributed systems in textbooks, **evaluating Low-Level Design remains an ambiguous, opaque challenge**:

- A learner sketches a *Parking Lot*, *Elevator*, or *Vending Machine* and still does not know whether their abstractions are justified.
- Generic AI chatbots provide black-box scores (*"Score: 74/100"*) with hallucinated criteria and zero grounding in the actual classes submitted.
- Learners cannot track whether their subsequent attempts actually improved architectural health or merely added speculative complexity.
- Candidates have no mechanism to test if their architecture can survive volatile requirement changes from a staff interviewer.

**DesignForge solves this.**

DesignForge is an explainable engineering workstation where developers:
1. **Design** through a structured Low-Level Design model with live dynamic UML class diagramming.
2. **Defend** their architecture against a 12-dimension rubric grounded in concrete evidence directly referenced from their submitted classes and methods.
3. **Evolve & Diff** their designs across immutable historical attempts with Git-style architectural diffs (`+ Added`, `~ Modified`, `- Removed`, and `Dimensional Deltas`).
4. **Stress-Test Resilience** via the signature **"Break My Design"** engine to test whether their architecture survives changing requirements without collapsing.

---

## 2. Core Differentiator: Explainable Design Evolution

DesignForge treats software architecture as an **evolutionary journey**, not a single static grade.

Every submitted design attempt is **immutable**. When reviewing an iteration, DesignForge compares Attempt $N$ against Attempt $N+1$ and visually explains:
- **Coupling Progression:** $5.5 \rightarrow 7.5 \rightarrow 8.5$
- **Cohesion Progression:** $5.0 \rightarrow 7.5 \rightarrow 9.0$
- **Extensibility Progression:** $4.5 \rightarrow 7.5 \rightarrow 8.5$
- **What Changed?**
  - `+ Added Interface: PricingStrategy`
  - `+ Extracted Class: HourlyTieredPricing`
  - `~ Refined Responsibility: ParkingLot now delegates fee computation`
  - `- Removed: Direct cash calculation inside ParkingLot`
- **Did your design improve?**  
  **YES** — *Because responsibility separation improved and the pricing policy can now change independently without modifying the core parking coordinator.*

---

## 3. Signature Feature: "Break My Design"

In senior technical interviews, interviewers evaluate the **Open/Closed Principle (OCP)** by introducing an unexpected requirement twist:
> *"The parking facility has installed 50kW fast chargers. Electric vehicles now require charging-station allocation and kilowatt-hour billing upon exit."*

With **Break My Design**, candidates specify their proposed architectural mitigation (affected classes, interface modifications, trade-offs, and rationale). DesignForge computes a **Design Resilience Score (e.g. 92%)** measuring:
- **Blast Radius:** Ratio of affected classes to total classes.
- **Interface Stability:** Whether existing client contracts remain intact.
- **Open/Closed Principle:** Adherence to extension vs. invasive modification.
- **Regression Risk:** Low / Medium / High with concrete recommendations.

---

## 4. The 5 Interview Problem Challenges

DesignForge comes pre-seeded with 5 realistic, interview-grade LLD challenges:
1. **Parking Lot System** (Medium, 25 min) — Pluggable pricing strategies, spot allocation, and EV charging challenges.
2. **Elevator Control System** (Hard, 35 min) — Multiple cars, hall/car dispatching algorithms (LOOK/SCAN), State Pattern, and VIP/Fire preemption challenges.
3. **Vending Machine** (Easy, 20 min) — Coin change calculation, state lifecycle transitions, and NFC surge pricing challenges.
4. **Library Management System** (Medium, 25 min) — Book vs. BookItem separation, fine policies, and concurrent E-book DRM lending challenges.
5. **Multi-Channel Notification Engine** (Hard, 30 min) — Multi-channel dispatch (Email, SMS, Push), rate limits, and cascade fallback pipelines.

---

## 5. Technology Stack & Architecture

DesignForge is built as a **Modular Monolith** optimized for developer experience, auditability, and speed:

| Layer | Technologies | Role |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts | Engineering workstation UI, Radar charts, Dark/Light theme engine, visual progress stepper. |
| **Diagramming** | Mermaid.js | Dynamic client-side UML class diagram rendering from the structured domain model. |
| **Backend API** | Node.js (v22), Express, TypeScript | REST endpoints, Zod schema validation, authoritative identity and ownership authorization. |
| **Database** | SQLite, Prisma ORM | Embedded zero-setup relational persistence; stores problems, attempts, submissions, evaluations, and security logs. |
| **Evaluation Engines** | `DemoEvaluator` (Deterministic/Heuristic), `AiEvaluator` (OpenAI gpt-4o-mini) | Pluggable `Evaluator` interface; runs 100% offline by default (`DEMO_MODE=true`). |
| **Testing** | Vitest, Supertest | Automated unit and integration test suite for domain models, diff engine, resilience engine, and security defenses. |

---

## 6. Getting Started & Running Locally

### Prerequisites
- Node.js `v20.x` or `v22.x`
- npm `10.x` or higher

### Step 1: Clone and Install Dependencies
```bash
git clone https://github.com/example/designforge.git
cd designforge
npm install
```

### Step 2: Configure Environment Variables
Copy the template configuration:
```bash
cp .env.example .env
```
*(Default settings have `DEMO_MODE=true`, requiring **zero API keys** to run completely).*

### Step 3: Initialize Database & Seed Problems
```bash
# Push schema to SQLite database and generate Prisma Client
npm run db:push

# Seed the 5 problem challenges and realistic historical attempts
npm run db:seed
```

### Step 4: Run the Development Server
```bash
# Concurrently starts both Express API (:4000) and Vite Web Client (:5173)
npm run dev
```

Open your browser to:
👉 **`http://localhost:5173`**

---

## 7. Recruiter First-30-Seconds Demo Flow

To immediately experience the full depth of DesignForge within 30 seconds:

1. **Open Dashboard (`http://localhost:5173`):**  
   Notice the workstation metrics: *5 Problems Solved, 17 Attempts, 81% Avg Health, +24% Improvement Rate*, and the interactive 12-dimension Radar Chart.
2. **Review Parking Lot (Attempt #3):**  
   Click on the pre-selected attempt in the top navigation or recent activity. Inspect the **Senior Staff Review**, the **12 Grounded Criterion Cards**, and concrete quotes from the design.
3. **Experience Design Evolution (Git-Style Diff):**  
   Click **"Design Evolution"** in the top-right corner. Compare **Attempt #1 (Score: 61)** with **Attempt #3 (Score: 86)** to inspect structural additions (`+ PricingStrategy`, `+ HourlyTieredPricing`), removed coupling, and the narrative answering *"Did your design improve? YES"*.
4. **Execute "Break My Design":**  
   Switch to the **"Break My Design"** tab on Attempt #3. Run the EV charging stations stress test to witness real-time blast radius and resilience evaluation (92% Resilience).
5. **Inspect the Security Station:**  
   Click **"Security"** in the top navigation to verify active defense headers, Zod validation, rate limiting, and immutable audit logs.
6. **Toggle Themes:**  
   Switch between Dark, Light, and System themes using the top-right header controls.

---

## 8. Running Automated Tests

DesignForge features an automated test suite covering domain evaluators, diffing, resilience scoring, and security defenses:

```bash
# Run all Vitest unit and integration tests
npm run test

# Run security defense tests specifically (IDOR, Zod bounds, Helmet headers)
npm run test:security

# Run TypeScript typechecks across all monorepo packages
npm run typecheck
```

---

## 9. Security Architecture

DesignForge enforces enterprise-grade security:
- **Zero Committed Secrets:** Verified by security scans; no keys in Git history or client bundles.
- **Authoritative Identity & IDOR Prevention:** Server-side ownership checks verify that `attempt.userId === req.user.id` on every attempt request.
- **Input Validation:** All submissions, class names, method parameters, and identifiers are bounded by strict Zod schemas and regular expressions.
- **AI Prompt Sandboxing:** System prompts enforce passive data treatment and strict JSON output schemas; zero shell, database, or tool execution privileges.
- **Sanitized Errors:** Internal stack traces and database queries are masked; the client receives standardized `{ error: { code, message, requestId } }`.

For the complete threat model and audit results, see:  
👉 [SECURITY_AUDIT.md](SECURITY_AUDIT.md)

---

## 10. Engineering Documents Index

- [RESEARCH.md](RESEARCH.md) — Pedagogical research, existing workflow gaps, and DesignForge opportunities.
- [DESIGN.md](DESIGN.md) — System design, domain models, sequence flows, and Mermaid diagrams.
- [AI_USAGE.md](AI_USAGE.md) — 4 concrete engineering decisions made with AI assistance (accepted vs. rejected rationale).
- [SECURITY_AUDIT.md](SECURITY_AUDIT.md) — Formal security audit report with vulnerability statuses.

---

## 11. License

MIT License &copy; 2025 DesignForge Contributors.
