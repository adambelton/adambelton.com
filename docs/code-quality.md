# Code Quality

This project optimises for code that is understandable first, maintainable second, and tested for meaningful regressions third.

These standards apply to human contributors and coding agents.

## 1. Understandable

Code should explain its intent before it explains its mechanics.

- Use precise names that describe domain meaning and responsibility.
- Name boolean variables and parameters as predicates with verbs such as `is`,
  `has`, `can`, or `should` so their type and meaning are clear at the call site.
- Name functions whose purpose is to compute a boolean as predicates too.
  Operations that merely return a boolean keep their operation name, while the
  variable receiving that result uses a predicate name.
- Prefer declarative top-level code that reads in the order a human would explain the feature.
- Hide complexity behind well-named functions, services, and modules.
- Keep files focused enough that their purpose is obvious from their names and exports.
- Avoid cleverness that requires re-reading to understand ordinary behaviour.

Good names are a primary design tool in this repo. If a name is vague, overloaded, or implementation-shaped, improve the name before adding more structure around it.

## 2. Maintainable

Code should be easy to change without surprising unrelated parts of the system.

- Keep modules responsible for one coherent job.
- Respect package boundaries from `AGENTS.md`.
- Put shared contracts in `packages/shared`.
- Put product-specific domain logic in `packages/products`.
- Keep app routes and UI components thin where domain logic belongs elsewhere.
- Prefer composition of small pieces over large branching objects or services.
- Avoid duplicate decisions, repeated magic strings, and parallel type definitions.

When a directory grows, check whether it still has a clear public entry point and a coherent story. Deep module trees are acceptable only when they reduce cognitive load.

Repository paths are explanatory names. Follow the ownership → architectural
role → capability → responsibility order defined in `README.md` and
`docs/architecture.md`. A new file should have one obvious place in that tree.
If several locations appear equally plausible, resolve the ownership or role
ambiguity before adding the file.

Suffixes such as `service`, `port`, `adapter`, `store`, `persistence`,
`fixture`, and `fake` use the repository vocabulary in `README.md`; they are not
interchangeable. Avoid generic `manager`, `helper`, or `util` names when the
product operation can be named directly.

## 3. Tested For Regression

Tests should protect behaviour the project relies on.

- Test public contracts and observable behaviour.
- Test package boundaries where other code depends on them.
- Test composition points where small pieces are wired together.
- Scale coverage with risk and blast radius.
- Avoid tests that primarily assert private implementation details.

The goal is not maximum test count. The goal is confidence that important behaviour can change intentionally and regressions fail loudly.

## Audit Checklist

Before completing a task, review changed code against these questions:

- Do the names explain intent in the project's domain language?
- Can the main flow be read top-down without chasing every helper?
- Does each changed file have a clear reason to exist?
- Are package boundaries still respected?
- Are shared contracts defined once in the right package?
- Are tests focused on behaviour and contracts rather than internals?
- Would a failure point to a real regression?
- Does the path identify the owner, role, capability, and responsibility?
- Is production code independent from test support?
