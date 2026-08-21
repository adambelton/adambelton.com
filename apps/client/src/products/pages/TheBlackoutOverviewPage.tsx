import { ProductOverviewSection } from "apps/client/src/products/components/ProductOverviewSection";
import { ProductOverviewTitleSection } from "apps/client/src/products/components/ProductOverviewTitleSection";

export function TheBlackoutOverviewPage() {
  return (
    <div className="grid gap-14 sm:gap-20">
      <ProductOverviewTitleSection
        description={
          <>
            The Blackout is made for the Saturday 3pm match you cannot watch in
            the UK. You enter one live room and experience the game as an
            unfolding piece of football writing—spoken by a narrator,
            accompanied by illustration, and shared with everyone at the same
            moment.
          </>
        }
        tagline={
          <>
          A new way to consume live football, driven by quality football writing
          and enabled by AI.
          </>
        }
        title="The Blackout"
      />

      <ProductOverviewSection
        id="different-title"
        title="More than following the score"
      >
          <p>
            Conventional commentary tells you what just happened. The Blackout
            tries to give the match meaning while it is still happening. Goals,
            chances, substitutions, pressure, and momentum remain the factual
            anchors, but each important moment becomes part of a larger live
            narrative.
          </p>
          <p>
            The result sits somewhere between radio, a football essay, and a live
            literary performance. It preserves the uncertainty and shared timing
            of sport while bringing in the perspective normally available only
            after the final whistle.
          </p>
      </ProductOverviewSection>

      <ProductOverviewSection
        id="writing-title"
        title="Football writing creates the value"
      >
          <p>
            Every match has history, character, tension, memory, and a particular
            reason it matters. A football writer supplies that understanding: the
            research, voice, player arcs, club context, motifs, and point of view
            through which the audience experiences the game.
          </p>
          <p>
            The gaps between match events carry much of this depth. While the
            next passage takes shape, atmospheric illustration holds the room and
            the narrative can draw connections that a continuous event feed would
            miss. The football remains authoritative; the writing cannot invent
            significance the match does not support.
          </p>
      </ProductOverviewSection>

      <ProductOverviewSection
        id="ai-title"
        title="AI makes the writing live"
      >
          <p>
            The creative perspective comes from the writer. AI applies that
            perspective at a speed no person could sustain across a complete live
            match: interpreting structured events and commentary texture,
            selecting what matters now, and shaping a coherent passage for the
            narrator.
          </p>
          <p>
            This makes AI an enabling medium rather than an autonomous author. A
            thin creative brief produces a thin experience; the technology can
            amplify attention and judgement, but it cannot replace them.
          </p>
      </ProductOverviewSection>

      <ProductOverviewSection
        id="shared-title"
        title="One room, one version of the match"
      >
          <p>
            Text, narration, and imagery follow one server-owned clock. Everyone
            receives the same reveal at the same pace, without spoilers or drift
            between devices. The technology disappears into a communal experience
            of waiting, listening, and discovering what the match becomes.
          </p>
      </ProductOverviewSection>

      <ProductOverviewSection
        id="status-title"
        title="Concept prototype complete"
      >
          <p>
            Several full live match experiments validate the end-to-end
            experience: real-time narrative, synchronized reveals, spoken audio,
            atmospheric imagery, and a shared room following the same match.
          </p>
          <p>
            Active development is paused. The completed prototype remains public
            as a record of the product thinking, creative model, system design,
            engineering decisions, and lessons behind the concept.
          </p>
          <p>
            <a
              className="font-semibold text-[var(--link)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-current"
              href="https://github.com/adambelton/the-blackout"
            >
              Explore The Blackout source and documentation →
            </a>
          </p>
          <p className="text-sm">Updated August 2026</p>
      </ProductOverviewSection>
    </div>
  );
}
