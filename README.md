# adambelton.com

Adam Belton's personal website and product-demo monorepo. The public site,
writing tools, authentication, persistence, and AI infrastructure live together
so products can share a platform without losing ownership of their behaviour.

## How the repository is organised

The organising rule is **ownership first, architectural role second, business
capability third**. Each directory level should answer one question:

1. Who owns this code?
2. What role does it perform?
3. What part of the product or platform does it concern?
4. What single responsibility does this file fulfil?

### Why it is organised this way

The structure is intended to make the repository usable as a map, not merely to
sort files. It follows these principles:

1. **A path should explain responsibility.** Someone investigating behaviour
   should be able to narrow the search from owner, to role, to capability,
   without already knowing the implementation history.
2. **Meaning and mechanism stay separate.** Products decide what conversations,
   ideas, drafts, and revisions mean. Hosts and infrastructure decide how AI,
   authentication, HTTP, and storage are provided.
3. **Dependencies point toward stable meaning.** Deployable apps may assemble
   packages, and adapters may implement product ports, but product behaviour
   must not depend on a particular host, provider, or database.
4. **Coordination is not ownership.** Application operations may connect several
   capabilities, but the rules of each capability remain with that capability.
   This prevents workspace orchestration from becoming a second home for every
   product rule.
5. **Tests belong to the behaviour or boundary they prove.** A nearby test
   protects one responsibility; fakes, fixtures, browser journeys, evaluations,
   and infrastructure integrations are separated because they answer different
   confidence questions.
6. **Structure must be earned by real responsibilities.** Empty scaffolds and
   speculative abstractions make navigation less reliable. A folder or layer is
   introduced only when implemented code has that role.
7. **Consistency is more valuable than local cleverness.** Repeating a small,
   well-understood organisation vocabulary makes future bug reports and changes
   easier to route across every product and package.

When deciding where new code belongs, ask in order:

```txt
Who owns the meaning?
  → Is this a rule, coordination, delivery, or external mechanism?
    → Which capability does it concern?
      → What one reason should this file have to change?
```

```txt
adambelton.com/
│
├── apps/                                      Deployable hosts
│   ├── client/                                Browser application
│   │   └── src/
│   │       ├── bootstrap/                     Starts and assembles the app
│   │       ├── content/                       Repository-backed pages and posts
│   │       ├── website/                       Public website experience
│   │       ├── auth/                          Browser authentication experience
│   │       ├── platform/                      Host-wide browser capabilities
│   │       ├── products/                      Mounts product applications
│   │       └── ui/                            Host-owned reusable presentation
│   └── api/                                   Server application
│       └── src/
│           ├── bootstrap/                     Starts and assembles the API
│           ├── platform/                      Host-wide HTTP capabilities
│           └── products/                      Mounts products and supplies adapters
│
├── packages/                                  Reusable ownership boundaries
│   ├── products/                              Product behaviour and interfaces
│   ├── shared/                                Platform-wide vocabulary only
│   ├── auth/                                  Authentication and access capability
│   ├── ai/                                    Provider-neutral AI infrastructure
│   ├── observability/                         Shared observation contracts
│   └── db/                                    Database client, schema and adapters
│
├── tests/                                     Repository-wide architecture checks
├── docs/                                      Current architecture and decisions
├── tasks/                                     Proposed and completed delivery work
└── progress.md                                Current implementation status
```

Apps decide how the system is deployed and assembled. Packages own reusable
meaning or infrastructure. A product never imports its host's database, auth, or
AI implementation; it describes what it needs and the host supplies a matching
adapter.

## ThoughtForm

ThoughtForm is a private conversational thinking workspace that helps the
user explore, organise, and express what they think or feel. Its self-contained
[product guide](packages/products/src/thoughtform/README.md) explains its
internal structure, interaction flow, integration points, testing strategy, and
where to begin investigating product behaviour.

## Architecture vocabulary

| Term | Meaning in this repository |
|---|---|
| **Capability** | A cohesive area of product or platform behaviour. |
| **Service** | Performs meaningful operations for one capability. |
| **Application operation** | Coordinates capabilities for one complete user action. |
| **Port** | A product-owned description of something required from outside. |
| **Adapter** | Connects a port to a concrete provider or storage mechanism. |
| **Store** | Offers product-language reading and writing operations. |
| **Persistence** | Performs storage mechanics behind a store. |
| **Delivery** | Makes operations available through HTTP or another entrance. |
| **Bootstrap** | Starts a deployable app and assembles its dependencies. |
| **Fixture** | Reusable example state for tests. |
| **Fake** | A deterministic substitute for an external dependency. |
| **Evaluation** | Checks behaviour that depends on a real hosted model. |

Generic folders such as `helpers`, `utilities`, `services`, or `components`
must not become dumping grounds. Prefer the owning capability and the specific
responsibility in the path and filename.

## Where to look when something goes wrong

| Reported problem | Start here |
|---|---|
| Public website page, navigation, or shell | `apps/client/src/website` or `apps/client/src/ui` |
| Login or browser session experience | `apps/client/src/auth` |
| API startup or global route mounting | `apps/api/src/bootstrap` |
| Product access or host dependency assembly | `apps/api/src/products/thoughtform/mount.ts` |
| Demo storage behaves incorrectly | API ThoughtForm persistence adapters |
| Owner data behaves incorrectly | DB ThoughtForm adapters |
| Hosted-model provider request mechanics are wrong | `packages/ai/src/providers` |
| Owner evaluation traces or timing metrics are wrong | `packages/observability` or API observability adapters |
| ThoughtForm behaviour or interface | Its [product guide](packages/products/src/thoughtform/README.md) |

## Testing locations

- `*.test.ts` and `*.test.tsx` sit beside the behaviour or adapter they protect.
- `testing/fakes` contains reusable deterministic replacements.
- `testing/fixtures` contains reusable example states.
- `testing/browser` contains complete product journeys.
- `testing/evaluations` contains opt-in real-model checks.
- `*.integration.test.ts` verifies concrete infrastructure against real services.
- `tests/architecture` enforces repository-wide ownership boundaries.

## Commands

```sh
pnpm install       # install dependencies
pnpm dev:client    # run the website
pnpm dev:api       # run the API
pnpm start         # run the built client and API as one production service
pnpm test          # deterministic behaviour and architecture tests
pnpm test:e2e      # complete browser journeys
pnpm typecheck     # typecheck every workspace package
pnpm build         # build every deployable/package surface
pnpm db:validate   # validate the Prisma schema
```

Canonical rules live in `AGENTS.md`, `docs/architecture.md`,
`docs/code-quality.md`, and `docs/testing.md`. ThoughtForm product language
and boundaries live in `docs/products/thoughtform/`.

Railway deployment configuration, variables, and verification are documented
in `docs/deployment.md`.
