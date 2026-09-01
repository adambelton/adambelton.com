---
type: capability-profile
eyebrow: Professional profile
title: Engineering capability profile
classificationGuide:
  eyebrow: Capability profile
  title: Classification guide
sections:
  - engineering-practice
  - systems-and-architecture
  - leadership
views:
  - overview
  - evidence-basis
  - development-trajectory
  - leverage-profile
---

# Overview

```yaml
key: overview
```

This profile shows the capabilities I already practise, the areas I am actively developing, and the skills I think create the most leverage in product engineering.

The aim is not to grade myself. It is to make my current profile and direction visible at the same time: what I have evidence for today, where I am investing next, and the kind of engineer I am deliberately building toward.

# Evidence basis

```yaml
key: evidence_basis
```

Every capability here has concrete evidence behind it. The distinction is about where that evidence comes from and how much responsibility I have had for applying it.

## Commercial ownership

```yaml
key: commercial_ownership
order: 1
```

I have had meaningful responsibility for this capability in paid, real-world product work: shaping decisions, applying the capability directly, and owning the consequences of those decisions in production.

## Commercial exposure

```yaml
key: commercial_exposure
order: 2
```

I have worked with this capability professionally and can point to real production experience, but it was not an area I primarily owned or led.

## Applied

```yaml
key: applied
order: 3
```

I have practised this capability meaningfully through personal products, deliberate exercises, study projects, or experimentation, but do not yet have enough professional evidence to describe it as commercial experience.

# Development trajectory

```yaml
key: development_trajectory
```

This shows the difference between stable parts of my practice and the capabilities where I am deliberately increasing depth, rigour, or direct exposure.

## Maintaining

```yaml
key: maintaining
order: 1
```

The capability is already a stable part of how I work. I continue to exercise and reinforce it, but it is not currently one of my main development priorities.

## Deepening

```yaml
key: deepening
order: 2
```

I already have a practical foundation and am deliberately strengthening it through work, projects, study, experimentation, or by seeking more demanding responsibility.

## Learning

```yaml
key: learning
order: 3
```

I am actively building the mental model and foundations through concrete study or practice. I use this only where there is already enough evidence to justify including the capability in the profile.

# Leverage profile

```yaml
key: leverage_profile
```

Every capability here matters. This view separates the capabilities I see as foundational to effective product engineering from the areas where I think my own judgement or way of working can create disproportionate value.

## Core competency

```yaml
key: core_competency
order: 1
```

A capability I think strong product engineers need in order to build serious software well. These form the technical, product, and delivery foundation of effective practice.

## Strategic leverage

```yaml
key: strategic_leverage
order: 2
```

A capability I believe can become part of my personal competitive advantage: the areas that increase the scope, quality, or influence of my work and define the kind of engineer I am deliberately building toward.

# Engineering practice

## Full-stack engineering

```yaml
evidence_basis: commercial_ownership
development_trajectory: maintaining
leverage_profile: core_competency
order: 1
```

The ability to follow a product problem across the technical stack and take responsibility for how the whole feature or capability works, rather than treating frontend, backend, data, and APIs as separate concerns.

### Evidence basis: [Commercial ownership]

At INDY, I owned substantial product work across frontend, Rails backend logic, APIs, relational data, and user-facing workflows. Inventory and activity booking both required me to follow the problem across system layers rather than treating frontend and backend as separate responsibilities.

### Development trajectory: [Maintaining]

Working across the stack is already an established part of how I operate. I am maintaining that breadth while putting more of my deliberate development effort into architecture, domain modelling, distributed systems, and broader technical judgement.

### Leverage profile: [Core competency]

Core competency because product ownership often crosses technical layers. Being able to follow the problem through interface, application logic, APIs, data, and production behaviour makes end-to-end decisions more coherent and reduces handoff friction.

## User agency & experience design

```yaml
evidence_basis: commercial_ownership
development_trajectory: deepening
leverage_profile: strategic_leverage
order: 2
```

Designing software around what users are trying to achieve, with an emphasis on clarity, autonomy, accessibility, control, and helping people act confidently rather than forcing them to adapt to the system.

### Evidence basis: [Commercial ownership]

I have designed and built operational interfaces used in live venue environments, including inventory, booking, administration, and reusable interface systems. That work required balancing clarity, flexibility, accessibility, and control around what users were actually trying to achieve.

### Development trajectory: [Deepening]

I am making this more explicit as a product-design principle: software should preserve meaningful user control, reduce unnecessary cognitive burden, and help people act confidently. I am also deepening my accessibility practice and applying the same thinking to AI-enabled products where authority and inspectability matter.

### Leverage profile: [Strategic leverage]

Strategic leverage because the quality of a product depends on how well it supports the user’s goals, judgement, and control. Stronger decisions here improve accessibility, trust, adoption, and the usefulness of the software itself.

## Problem framing & trade-off analysis

```yaml
evidence_basis: commercial_ownership
development_trajectory: deepening
leverage_profile: strategic_leverage
order: 3
```

Identifying the real problem behind a request, then evaluating the product and technical trade-offs involved in solving it rather than jumping directly to implementation.

### Evidence basis: [Commercial ownership]

At INDY, I regularly worked from customer or operational requests rather than finished specifications. The clearest example is activity booking, where I reframed a bowling-specific request into a generic capability that could support bowling, laser tag, and mixed-use venues without embedding activity-specific product logic.

### Development trajectory: [Deepening]

I am developing a more deliberate method for connecting problem framing with explicit product and technical trade-offs. The goal is to make good judgement less dependent on accumulated intuition and easier to apply in unfamiliar domains.

### Leverage profile: [Strategic leverage]

Strategic leverage because solving the wrong problem well is still failure. Strong framing and explicit trade-off analysis improve both product direction and technical decision quality before implementation cost accumulates.

## Workflow & state modelling

```yaml
evidence_basis: commercial_ownership
development_trajectory: deepening
leverage_profile: core_competency
order: 4
```

Making feature-level behaviour explicit by modelling states, transitions, rules, invariants, and the sequence of actions that move a workflow from one condition to another.

### Evidence basis: [Commercial ownership]

I have modelled production workflows and state across inventory, booking, configuration, and operational interfaces. That includes stocktakes, movements, variance, derived balances, asynchronous recomputation, and user-facing flows where state transitions directly affected product behaviour.

### Development trajectory: [Deepening]

I am making state, transitions, invariants, authority, and temporal behaviour more explicit in how I design features. I want to move from modelling these well by instinct toward a repeatable discipline that holds up as workflows become more complex.

### Leverage profile: [Core competency]

Core competency because most non-trivial product behaviour depends on state, transitions, rules, and temporal flow. Making those explicit reduces ambiguity and creates a firmer basis for implementation and testing.

## Iterative delivery & tight feedback loops

```yaml
evidence_basis: commercial_ownership
development_trajectory: deepening
leverage_profile: core_competency
order: 5
```

Reducing the size of delivery steps, getting useful work into real use quickly, and using qualitative and quantitative feedback to shape the next iteration.

### Evidence basis: [Commercial ownership]

I have delivered major product and platform changes incrementally rather than treating release as a single event. INDY's administration redesign, for example, was de-risked through staged production releases so each part could be validated before expanding the new information architecture.

### Development trajectory: [Deepening]

I am strengthening the feedback side of that loop: defining intended outcomes earlier, using qualitative feedback and instrumentation more deliberately, and treating post-release learning as part of the engineering work rather than something that happens informally afterwards.

### Leverage profile: [Core competency]

Core competency because product engineering depends on learning from real use, not only shipping code. Smaller delivery steps and faster feedback reduce risk and improve the quality of subsequent decisions.

## Coherence & cognition

```yaml
evidence_basis: commercial_ownership
development_trajectory: maintaining
leverage_profile: strategic_leverage
order: 6
```

Designing software so its concepts, responsibilities, and abstractions fit together coherently while keeping the amount of context an engineer must hold in their head as low as possible.

### Evidence basis: [Commercial ownership]

My commercial work has repeatedly focused on making complex software easier to reason about: introducing clearer boundaries, building reusable primitives and patterns, reducing accidental complexity, and creating structures that let engineers work locally without needing the whole system in their heads.

### Development trajectory: [Maintaining]

This is already an established part of how I design software. I continue to apply the same principles in day-to-day work: clear boundaries, local reasoning, progressive disclosure of complexity, and abstractions that earn their place.

### Leverage profile: [Strategic leverage]

Strategic leverage because coherent systems reduce the amount of context engineers must hold at once. That compounds across maintainability, architecture, onboarding, collaboration, and the quality of technical decisions.

## Testing & verification

```yaml
evidence_basis: commercial_ownership
development_trajectory: maintaining
leverage_profile: core_competency
order: 7
```

Treating verification as part of design: defining expected behaviour, failure modes, and acceptance criteria early enough that they shape implementation rather than merely checking it afterwards.

### Evidence basis: [Commercial ownership]

Testing has been a consistent part of my commercial engineering practice across Jest, Testing Library, Cypress, Playwright, and RSpec. I favour testing user-visible behaviour and defining expected behaviour early enough that verification influences the implementation rather than being added at the end.

### Development trajectory: [Maintaining]

This is already an established part of how I work. I continue to maintain it through implementation, review, production support, and explicit verification criteria, while extending the same discipline into AI-assisted development and higher-risk product contexts.

### Leverage profile: [Core competency]

Core competency because reliable product engineering requires evidence that intended behaviour holds under change. Verification built into the design makes systems safer to evolve and failures easier to reason about.

## AI-assisted engineering

```yaml
evidence_basis: commercial_ownership
development_trajectory: deepening
leverage_profile: core_competency
order: 8
```

Using AI tools as engineering leverage while keeping architecture, judgement, validation, and responsibility with the engineer.

### Evidence basis: [Commercial ownership]

I used AI-assisted development commercially at INDY, particularly during the frontend architecture work, and helped establish rules and reusable skills for the wider development team. My own workflow uses AI across exploration, implementation, debugging, review, and documentation while keeping architecture, judgement, and verification with the engineer.

### Development trajectory: [Deepening]

I am actively refining how I use AI as engineering leverage: deciding what should remain human-owned, how much autonomy is appropriate for the risk, how decisions stay inspectable, and how agent-authored work is verified and kept maintainable.

### Leverage profile: [Core competency]

Core competency because AI changes the implementation workflow without removing the need for engineering judgement. Clear specifications, boundaries, and verification become more important as more work is delegated to agents.

## AI product design

```yaml
evidence_basis: applied
development_trajectory: deepening
leverage_profile: core_competency
order: 9
```

Designing AI-enabled products where model behaviour, prompts, context, structured outputs, human correction, and authority boundaries are treated as first-class product and architecture concerns.

### Evidence basis: [Applied]

My personal product work includes AI-enabled systems where prompts, context, structured outputs, human correction, and tool boundaries are part of the product architecture. ThoughtForm preserves user authority over meaning, while The Blackout integrates generative outputs inside a wider deterministic and moderated system.

### Development trajectory: [Deepening]

I am developing a clearer practice for deciding what AI should be allowed to infer or decide, how its behaviour remains inspectable, and how products can use AI to extend capability without unnecessarily reducing user judgement or control.

### Leverage profile: [Core competency]

Core competency because AI-enabled products introduce product and engineering questions around authority, uncertainty, inspectability, and human control. Engineers working with these systems need to be able to reason about those boundaries rather than treating model behaviour as an implementation detail.

## Written technical communication

```yaml
evidence_basis: commercial_ownership
development_trajectory: maintaining
leverage_profile: strategic_leverage
order: 10
```

Making technical intent, assumptions, constraints, trade-offs, and decisions explicit enough that other engineers — or AI agents — can act on them reliably without requiring constant synchronous explanation.

### Evidence basis: [Commercial ownership]

I have used written technical communication to document decisions, explain architecture, raise concerns, align remote collaborators, and give other engineers enough context to act independently. Written clarity has been especially important in small teams where decisions often need to outlive the conversation that produced them.

### Development trajectory: [Maintaining]

Written reasoning is already an established part of how I work, particularly in remote and asynchronous teams. I continue to use clear specifications, assumptions, boundaries, trade-offs, and verification criteria so that decisions remain inspectable and other people or agents can act without constant synchronous coordination.

### Leverage profile: [Strategic leverage]

Strategic leverage because clear written reasoning scales across remote collaboration, architecture, delegation, and AI-assisted engineering. It makes decisions inspectable and allows others to act with less synchronous coordination.

# Systems & architecture

## Context building & domain discovery

```yaml
evidence_basis: commercial_ownership
development_trajectory: deepening
leverage_profile: strategic_leverage
order: 1
```

Building a reliable mental model of the wider domain before shaping the software: understanding actors, responsibilities, workflows, constraints, unknowns, and the real-world context in which the product operates.

### Evidence basis: [Commercial ownership]

At INDY, I built detailed operational context around cinema workflows and used it to shape product and engineering decisions across a large product surface. That included working from customer problems, product knowledge, operational realities, and the behaviour of existing systems rather than relying on assumptions alone.

### Development trajectory: [Deepening]

I am making that context-building process more systematic for unfamiliar domains: separating evidence from assumptions, identifying unknowns, mapping actors and responsibilities, understanding existing workflows, and working directly with users and domain experts before shaping the software model.

### Leverage profile: [Strategic leverage]

Strategic leverage because better technical decisions depend on a reliable model of the real domain. Strong discovery reduces assumption-driven design and improves the quality of modelling, architecture, and product direction.

## Domain modelling

```yaml
evidence_basis: commercial_ownership
development_trajectory: deepening
leverage_profile: strategic_leverage
order: 2
```

Making the important concepts, language, rules, relationships, responsibilities, and boundaries of a domain explicit so the software can reflect them coherently.

### Evidence basis: [Commercial ownership]

I have modelled domain concepts, rules, relationships, and responsibilities in production systems, particularly where product complexity required reusable abstractions. Much of this work was intuition-driven rather than based on formal DDD practice.

### Development trajectory: [Deepening]

I am formalising that existing instinct through deliberate DDD study and modelling practice, with particular attention to subdomains, bounded contexts, entities, value objects, invariants, ubiquitous language, and the relationship between domain structure and software boundaries.

### Leverage profile: [Strategic leverage]

Strategic leverage because explicit domain models turn complex business knowledge into software structures that are easier to reason about and evolve. Strong modelling improves the quality of boundaries, workflows, and architectural decisions.

## Product architecture & system design

```yaml
evidence_basis: commercial_ownership
development_trajectory: deepening
leverage_profile: strategic_leverage
order: 3
```

Translating domain and product understanding into a coherent software structure, then reasoning about how that structure should be realised technically across components, data, communication, storage, and failure handling.

### Evidence basis: [Commercial ownership]

I have shaped production software around product and domain needs, including generic activity booking, configurable event models, APIs, relational data, asynchronous workflows, and the boundaries between reusable capabilities. I then carried those decisions through into implementation across the stack.

### Development trajectory: [Deepening]

I am building a repeatable discipline for translating domain structure into product architecture, then reasoning from that model into system design through architectural characteristics, components, data flows, failure modes, storage, communication patterns, and explicit trade-offs.

### Leverage profile: [Strategic leverage]

Strategic leverage because this is where domain understanding becomes durable technical structure. Strong decisions here increase the scale of problems that can be solved coherently and reduce the cost of future change.

## Boundaries & contracts

```yaml
evidence_basis: commercial_ownership
development_trajectory: deepening
leverage_profile: strategic_leverage
order: 4
```

Deciding where responsibilities belong and making the interactions between parts of a system explicit, dependable, and easy to reason about.

### Evidence basis: [Commercial ownership]

I have designed and worked with boundaries across modules, APIs, product areas, and supporting services, with a recurring emphasis on explicit responsibilities and interfaces that contain complexity. My design-system work and product architecture both relied on making boundaries clearer so individual parts could be reasoned about independently.

### Development trajectory: [Deepening]

I am developing more rigorous thinking around ownership, coupling, bounded contexts, internal service contracts, and the consequences of moving responsibilities across boundaries. I want boundaries to emerge from the domain and change patterns rather than from arbitrary technical decomposition.

### Leverage profile: [Strategic leverage]

Strategic leverage because clear responsibility boundaries contain complexity and reduce coupling. Good contracts make systems easier to change, teams easier to coordinate, and failures easier to isolate.

## Distributed systems

```yaml
evidence_basis: commercial_exposure
development_trajectory: learning
leverage_profile: core_competency
order: 5
```

Understanding the constraints that appear when computation and state are spread across processes or network boundaries, including latency, consistency, coordination, partial failure, and recovery.

### Evidence basis: [Commercial exposure]

INDY ran as a cloud-hosted production application with separately running web, Sidekiq, and MySQL processes, so I worked in a system where computation, persistence, and asynchronous work crossed process boundaries. My experience was with a relatively simple distributed architecture rather than large-scale microservice ownership.

### Development trajectory: [Learning]

I am building the mental model behind the distributed behaviour I have encountered in production: partial failure, latency, consistency, coordination, state ownership, replication, and recovery. The aim is to reason about those constraints explicitly rather than only meeting them through implementation details.

### Leverage profile: [Core competency]

Core competency because modern production systems routinely cross process and network boundaries. Product engineers need enough fluency in latency, consistency, coordination, and partial failure to make sound system-level decisions.

## Asynchronous & event-driven architecture

```yaml
evidence_basis: commercial_exposure
development_trajectory: deepening
leverage_profile: core_competency
order: 6
```

Designing workflows that coordinate work over time through jobs, events, messaging, retries, ordering, and idempotent processing rather than assuming everything happens synchronously.

### Evidence basis: [Commercial exposure]

I built asynchronous and event-driven product workflows at INDY, including inventory updates where sales and stock movements triggered background balance recomputation and updated availability was propagated downstream to point-of-sale clients. I worked directly with these patterns, but did not own an event-driven architecture at system level.

### Development trajectory: [Deepening]

I am deepening my reasoning around ordering, retries, idempotency, event modelling, temporal coordination, fan-out, and recovery. Personal project work has added further experience with stateful real-time event flows and multiple asynchronous sources.

### Leverage profile: [Core competency]

Core competency because many real workflows do not fit synchronous request-response assumptions. Understanding asynchronous coordination expands the range of product and system behaviours that can be modelled safely.

## Scalability & reliability

```yaml
evidence_basis: commercial_exposure
development_trajectory: learning
leverage_profile: core_competency
order: 7
```

Designing systems that continue to behave acceptably as load, data volume, complexity, and failure increase, with performance, resilience, observability, and diagnosability treated as design concerns.

### Evidence basis: [Commercial exposure]

I have worked on production systems where performance and reliability mattered, including inventory logic that became more expensive as data volumes grew. I changed the model to bound calculations with opening and closing stocktakes and explicit adjustment records, reducing balance computation to simpler operations.

### Development trajectory: [Learning]

I am building a broader mental model around load, resilience, capacity, failure modes, performance, observability, diagnosability, and graceful degradation. I want to be able to reason about production behaviour as part of system design rather than only through problems I have encountered in running software.

### Leverage profile: [Core competency]

Core competency because production software has to keep working as usage, data, and failure conditions change. Performance, resilience, observability, and diagnosability are part of the design, not operational afterthoughts.

# Leadership

## Technical leadership

```yaml
evidence_basis: commercial_ownership
development_trajectory: deepening
leverage_profile: strategic_leverage
order: 1
```

Creating technical direction and raising engineering quality through judgement, context, standards, review, mentoring, and influence rather than relying on formal authority.

### Evidence basis: [Commercial ownership]

At INDY, I took increasing responsibility for technical direction as a senior IC, particularly across frontend architecture, design systems, framework migrations, testing, interface quality, review, and solution shaping. I led through judgement and influence rather than formal management authority.

### Development trajectory: [Deepening]

I am deliberately developing toward broader responsibility for technical direction across product and system boundaries. I want to remain close to implementation while becoming stronger at connecting domain understanding, architecture, engineering standards, and team decision-making.

### Leverage profile: [Strategic leverage]

Strategic leverage because technical judgement scales through other people. Strong leadership improves standards, decision quality, architectural consistency, and the effectiveness of the team beyond one engineer’s direct output.

## Servant leadership

```yaml
evidence_basis: commercial_exposure
development_trajectory: deepening
leverage_profile: strategic_leverage
order: 2
```

Creating leverage for other engineers by improving context, removing blockers, enabling autonomy, and helping people make better decisions and take greater ownership.

### Evidence basis: [Commercial exposure]

I have practised this informally within engineering teams by sharing context, unblocking work, explaining decisions, supporting colleagues, and helping other engineers take greater ownership. I have not held a formal people-leadership role.

### Development trajectory: [Deepening]

I am making that approach more deliberate by thinking in terms of leverage: improving the context, autonomy, decision environment, and support available to other engineers so they can make better decisions and manage more of their own growth.

### Leverage profile: [Strategic leverage]

Strategic leverage because removing blockers, improving context, and enabling autonomy increases the effectiveness of the whole team. The leverage comes from helping others make better decisions and take greater ownership.

## Product & technical strategy

```yaml
evidence_basis: commercial_exposure
development_trajectory: learning
leverage_profile: strategic_leverage
order: 3
```

Connecting domain understanding, product direction, and technical investment over longer horizons so that what is built and how the system evolves reinforce each other.

### Evidence basis: [Commercial exposure]

I have influenced product direction and architectural choices within areas I owned, particularly where a local request had wider implications for the product model. I have not yet held sustained responsibility for product or technical strategy across a wider organisation.

### Development trajectory: [Learning]

I am building a clearer mental model for connecting domain strategy, product direction, and technical investment over longer horizons. I have made these connections within product areas I owned; the gap I am working on now is how to reason about them at wider product and organisational scope.

### Leverage profile: [Strategic leverage]

Strategic leverage because product direction and technical investment compound over long horizons. Connecting the two improves prioritisation, reduces local optimisation, and helps architecture evolve in support of the product rather than against it.
