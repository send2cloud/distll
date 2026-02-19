This document describes the guiding philosophy for how code, data, and design
should be approached. It favors adaptability, durability, and real-world
shipping speed over rigid structure or architectural purity.

==================================================
CODING PHILOSOPHY
(Portable Core, Practical Boundaries, Replaceable Dependencies)
==================================================

## 1) Core idea
- Build around a portable core and replaceable UI layers.
- The same core logic should be usable across:
  - Web (PWA)
  - Future UI implementations (React Native, native, etc.)
- UI changes should not require rewriting core logic.

The goal is not abstraction for its own sake, but keeping future options open.

---

## 2) A practical way to think about boundaries
A healthy system naturally separates into conceptual zones.
These are boundaries of intent, not rigid layers.

### Core logic
- Represents what the application fundamentally allows, forbids, or decides.
- Encodes rules, constraints, workflows, and state transitions.
- Produces structured outcomes (success, failure, reason).

A useful mental check:
If this logic could run in a command-line program with no UI,
it likely belongs in the core.

### UI logic
- Interprets core outcomes for presentation and interaction.
- Handles formatting, emphasis, feedback, and transient UI state.
- Decides how something appears or behaves right now,
  not whether it is valid.

The UI is allowed to be expressive and stateful.
That expressiveness should not leak back into the core.

### Integration logic
- Handles communication with databases, APIs, SDKs, and platforms.
- Absorbs vendor quirks, SDK shapes, and environmental differences.
- Shields the rest of the system from lock-in.

---

## 3) A note on state (avoiding the no-man’s land)
Some state represents application meaning
(e.g. authentication status, current user, workflow progress).
Other state exists only to support interaction or presentation
(e.g. open/closed, focused, loading indicators).

As a guideline:
- State that affects what the app can or cannot do
  should not depend on UI frameworks.
- State that affects how things look or feel
  may live in the UI.

This helps prevent important behavior from becoming trapped
inside UI-specific constructs.

---

## 4) UI as a shell
- UI is responsible for layout, interaction, navigation, and feedback.
- UI expresses intent to the core and receives structured results back.
- Important decisions should not depend on UI state or component structure.

The UI should be easy to change without destabilizing meaning.

---

## 5) Databases and external services
- Avoid unnecessary lock-in to specific database vendors or platforms.
- Data access should go through an application-owned boundary.
- Feature code should interact with app-level data concepts,
  not vendor libraries directly.

As a general principle, integration logic should translate
vendor-specific data shapes into application-owned concepts
before they are used elsewhere.

At the same time:
- Do not artificially limit capabilities.
- If a database or service offers advanced features,
  adapters may expose them.
- If another provider lacks those features,
  the adapter should degrade predictably rather than break the app.

The aim is swap-ability without lowest-common-denominator design.

---

## 6) Portability mindset
When adding logic or features, keep asking:
- Would this still make sense if the UI changed?
- Would this still make sense if the database or service changed?
- Is this tied to what the app does, or how it’s currently built?

Perfect separation is not required.
Avoiding unnecessary entanglement is.

==================================================
SHARED INTENT
==================================================

- Favor flexibility over rigidity.
- Keep core logic durable and portable.
- Let UI be expressive without polluting meaning.
- Treat databases and vendors as replaceable.
- Redesign for small screens; do not shrink.
- Optimize for real-world iteration, not architectural purity.
