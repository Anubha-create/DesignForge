# AI USAGE & ARCHITECTURAL DECISIONS

**Project:** DesignForge — AI-Powered LLD Practice Studio  
**Date:** March 2025  

In accordance with the assignment guidelines, this document articulates **4 meaningful engineering decisions** where AI assistance was evaluated, detailing what was suggested, what was accepted, what was rejected, and the technical rationale behind those decisions.

---

### Decision 1: AI Evaluation Guardrails & Schema Defense

* **The Problem:** How to structure AI evaluation so that feedback is grounded in the candidate's actual design rather than producing hallucinations or arbitrary scores.
* **AI Suggestion:**  
  The AI suggested allowing the model to return free-form Markdown containing a numeric score (e.g. `Score: 82/100`) followed by bulleted critique paragraphs, arguing this would make the model's evaluation more natural and fluid.
* **What Was Accepted:**  
  We accepted the system prompt role persona as a Staff Software Architect and the requirement for a conversational Senior Review Summary.
* **What Was Rejected:**  
  We **firmly rejected** free-form Markdown output and unconstrained numeric generation.
* **Why:**  
  Treating AI output as untrusted input is a fundamental application security requirement. Free-form text cannot be verified against business logic, prevents building structured radar charts, and allows hallucinated class references. Instead, we implemented **Strict Zod Schema Enforcement (`evaluationResultSchema`)**: the model must return rigid JSON covering exactly the 12 specified dimensions with explicit `evidence`, `concern`, `suggestion`, and `confidence` fields. If schema validation fails, the system safely falls back to the deterministic `DemoEvaluator`.

---

### Decision 2: Architectural Representation for Live UML Diagramming

* **The Problem:** How to represent the learner's Low-Level Design in memory, in the database, and on the visual canvas.
* **AI Suggestion:**  
  The AI suggested having the frontend directly manage raw Mermaid.js text strings in a textarea and storing raw Mermaid markdown in SQLite.
* **What Was Accepted:**  
  We accepted using Mermaid.js as the MVP client-side graphical renderer for class diagrams.
* **What Was Rejected:**  
  We **rejected** storing raw Mermaid text as the primary domain model.
* **Why:**  
  Coupling the persistence model to a third-party diagramming syntax violates domain-driven design. If the domain model is just Mermaid markdown:
  1. Automated deterministic structural validation (e.g., verifying duplicate class names or orphan interfaces) would require writing brittle regex parsers over diagram text.
  2. Algorithmic Git-style diffing across iterations would devolve into text line diffing rather than semantic architectural comparison.
  3. AI evaluation would be forced to parse graphical syntax rather than clear structural entities.  
  Instead, we designed a first-class `StructuredDesign` domain model (`classes`, `interfaces`, `attributes`, `methods`, `relationships`, `patterns`). The `UmlGenerator` service maps this domain model polymorphically into Mermaid syntax on-the-fly.

---

### Decision 3: "Break My Design" Resilience Scoring Algorithm

* **The Problem:** How to quantify whether an architecture survived an evolving requirement change.
* **AI Suggestion:**  
  The AI suggested making another round-trip call to OpenAI during the "Break My Design" flow, asking the LLM: *"Rate how well this change survived from 1 to 100."*
* **What Was Accepted:**  
  We accepted the concept of measuring blast radius (the ratio of modified classes to total classes) and interface contract preservation.
* **What Was Rejected:**  
  We **rejected** delegating resilience scoring entirely to an external LLM prompt.
* **Why:**  
  Relying on a second LLM prompt for resilience scoring would:
  1. Break the `DEMO_MODE=true` offline requirement, making the hiring evaluator unable to test the studio without an OpenAI key.
  2. Introduce non-deterministic scoring variances (the same mitigation might score 94% on one run and 71% on another).
  3. Introduce additional network latency and cost vulnerabilities.  
  Instead, we engineered the deterministic `ResilienceEngine`. It computes an explainable **blast radius ratio** ($\text{affected classes} / \text{total classes}$), inspects interface contract stability, evaluates adherence to the Open/Closed Principle (extension vs. modification), and scores resilience deterministically while providing grounded architectural recommendations.

---

### Decision 4: Error Handling & Security Telemetry Shape

* **The Problem:** How the backend should report runtime exceptions, database constraints, and validation rejections.
* **AI Suggestion:**  
  The AI suggested forwarding the raw error object (including stack traces in development mode) in the API response JSON to simplify frontend debugging.
* **What Was Accepted:**  
  We accepted logging detailed technical diagnostics on the server console with correlation identifiers.
* **What Was Rejected:**  
  We **rejected** transmitting internal stack traces, SQL error strings, or file paths over the wire to the client.
* **Why:**  
  Leaking internal stack traces or SQLite exceptions to the browser is an OWASP Top 10 Information Disclosure vulnerability that reveals database schemas, directory paths, and library versions to potential attackers. We enforced a strict error masking policy via our centralized `errorHandler`: every client error adheres to `{ error: { code, message, requestId } }`. The internal technical error and stack trace are logged server-side strictly alongside the unique `requestId`.
