import type { ConversationModelRequest } from "packages/products/src/socratic-draft/server/conversation";
import type { ProposedIdea } from "packages/products/src/socratic-draft/server/idea-map";
import type { ConversationModel } from "packages/products/src/socratic-draft/server/conversation";
import {
  ASSISTANT_MOVES,
  IDEA_DISPOSITIONS,
  READINESS_ACTIONS,
  READINESS_ASSESSMENTS,
  USER_INTENTIONS,
  type Idea,
  type IdeaMap,
} from "packages/products/src/socratic-draft/shared";

export function createDiscoveryTestModel() {
  const responses = [
    () => response({
      text: "Your condemnation is aimed at Gianni Infantino's leadership, not at football itself. What has made that leadership feel intolerable to you?",
      move: ASSISTANT_MOVES.clarify,
      ideas: [newIdea({
        title: "Leadership without accountability",
        synthesis: "Infantino's leadership represents a FIFA that appears insulated from accountability.",
        substance: "My condemnation is directed at Gianni Infantino's leadership of FIFA rather than at football itself.",
        questions: ["What conduct makes that leadership feel intolerable?"],
        exploration: "emerging",
        importance: "central",
      })],
    }),
    (request: ConversationModelRequest) => {
      const map = ideaMap(request);
      return response({
        text: "The pattern you condemn is power presenting itself as service to football while becoming harder to question. Which part of that contradiction matters most?",
        move: ASSISTANT_MOVES.probe,
        ideas: [existingIdea(map, "Leadership without accountability", {
          synthesis: "Infantino's FIFA presents concentrated power as service to football while resisting meaningful scrutiny.",
          substance: "The condemnation concerns leadership that speaks in football's name while centralising authority and making itself difficult for the game's participants to question.",
          questions: ["Is the deepest objection concentrated power, hypocrisy, or the damage done to football's legitimacy?"],
          exploration: "developing",
          importance: "central",
        })],
      });
    },
    (request: ConversationModelRequest) => {
      const map = ideaMap(request);
      return response({
        text: "So FIFA's leadership and football are not the same thing: the institution borrows its authority from a game that exceeds it. What does football possess that FIFA cannot manufacture?",
        move: ASSISTANT_MOVES.distinguish,
        ideas: [newIdea({
          title: "Football is larger than FIFA",
          synthesis: "FIFA depends on a game whose meaning and legitimacy come from beyond its leadership.",
          substance: "Football lives in players, supporters, clubs, local associations, shared memory, and play itself. FIFA can administer competitions, but it cannot create the game's underlying meaning.",
          questions: ["Which parts of football can exert pressure on FIFA rather than merely outlast it?"],
          exploration: "emerging",
          importance: "central",
        }), existingIdea(map, "Leadership without accountability", {
          synthesis: "Infantino's FIFA claims to embody football even though its legitimacy is borrowed from the game.",
          substance: "The leadership problem is not only concentrated power; it is the use of football's moral and cultural authority to shield that power from scrutiny.",
          questions: ["How can football withdraw the legitimacy its governing body borrows?"],
          exploration: "developing",
          importance: "central",
        })],
      });
    },
    (request: ConversationModelRequest) => response({
      text: "Supporters refusing to let FIFA define what loyalty to football means is one concrete source of pressure. What would that refusal look like beyond outrage?",
      move: ASSISTANT_MOVES.askForExample,
      ideas: [newIdea({
        title: "Supporters can withdraw consent",
        synthesis: "Supporters can deny FIFA the passive consent on which its authority depends.",
        substance: "Supporters are not merely consumers of FIFA's competitions. They can organise, scrutinise sponsors and associations, preserve public memory, and refuse the idea that supporting football requires accepting its leadership.",
        questions: ["Which supporter actions could turn moral refusal into sustained leverage?"],
        exploration: "emerging",
        importance: "supporting",
      }), existingIdea(ideaMap(request), "Football is larger than FIFA", {
        synthesis: "Football's communities give the game legitimacy and can refuse to surrender that legitimacy to FIFA.",
        substance: "The game's meaning is created collectively by players, supporters, clubs, local associations, and traditions. Their loyalty is to football, not automatically to whoever governs it.",
        questions: ["How can those communities act together rather than as isolated critics?"],
        exploration: "developing",
        importance: "central",
      })],
    }),
    (request: ConversationModelRequest) => response({
      text: "You are describing two kinds of rescue working together: public pressure from football's communities and institutional power exercised by associations. What reforms would make that power accountable?",
      move: ASSISTANT_MOVES.branchCheck,
      ideas: [newIdea({
        title: "Associations must reclaim governance",
        synthesis: "Football associations can convert public pressure into enforceable institutional reform.",
        substance: "Member associations possess formal power within FIFA. Saving the organisation requires them to use that power collectively for transparent decisions, credible leadership challenges, and governance that can be scrutinised.",
        questions: ["Which governance reforms would prevent another unaccountable presidency?"],
        exploration: "emerging",
        importance: "central",
      }), existingIdea(ideaMap(request), "Supporters can withdraw consent", {
        synthesis: "Organised supporters can create sustained reputational and commercial pressure for reform.",
        substance: "Supporters can coordinate scrutiny, press sponsors and associations, keep abuses in public memory, and make clear that love of football is compatible with opposition to FIFA's leadership.",
        questions: ["How should supporter pressure connect to formal votes inside FIFA?"],
        exploration: "developing",
        importance: "supporting",
      })],
    }),
    (request: ConversationModelRequest) => {
      const map = ideaMap(request);
      return response({
        text: "Your argument is becoming sharper: football saves FIFA not through a heroic replacement, but by making leadership answerable to the game's communities and institutions. Is accountability the standard that joins the whole argument?",
        move: ASSISTANT_MOVES.partialReflection,
        ideas: [
          existingIdea(map, "Leadership without accountability", {
            synthesis: "Infantino's leadership is condemnable because it uses football's authority while evading accountability to football.",
            substance: "The central objection is a model of leadership that speaks for the game, concentrates power, and resists meaningful scrutiny from the people and institutions that give FIFA legitimacy.",
            questions: [], exploration: "well_explored", importance: "central",
          }),
          existingIdea(map, "Football is larger than FIFA", {
            synthesis: "Because football creates FIFA's legitimacy, football also retains the power to remake it.",
            substance: "FIFA administers part of football but does not own the game. Players, supporters, clubs, associations, traditions, and shared memory are the source of the legitimacy that FIFA's leadership claims.",
            questions: [], exploration: "well_explored", importance: "central",
          }),
          existingIdea(map, "Associations must reclaim governance", {
            synthesis: "Associations must turn football's demand for accountability into durable governance.",
            substance: "Member associations can coordinate leadership challenges and establish transparent decisions, independent scrutiny, and enforceable limits that survive any individual president.",
            questions: ["Which reform should be the first non-negotiable demand?"], exploration: "developing", importance: "central",
          }),
        ],
      });
    },
    (request: ConversationModelRequest) => {
      const map = ideaMap(request);
      return response({
        text: "Then the condemnation has a constructive destination: football can save FIFA by withdrawing unearned legitimacy, organising pressure, and rebuilding governance around accountability rather than personality.",
        move: ASSISTANT_MOVES.fullReflection,
        ideas: [
          existingIdea(map, "Supporters can withdraw consent", {
            synthesis: "Supporters protect football by making consent conditional on accountable governance.",
            substance: "Coordinated supporters can sustain scrutiny, influence sponsors and associations, and reject the claim that loyalty to the game requires silence about its governors.",
            questions: [], exploration: "well_explored", importance: "supporting",
          }),
          existingIdea(map, "Associations must reclaim governance", {
            synthesis: "Collective association action can rebuild FIFA so accountability outlasts any president.",
            substance: "The practical institutional answer combines coordinated leadership opposition with transparent decisions, independent scrutiny, and enforceable limits on presidential power.",
            questions: [], exploration: "well_explored", importance: "central",
          }),
        ],
      });
    },
  ];

  const model: ConversationModel = {
    async createResponse(request) {
      const turnIndex =
        request.messages.filter((message) => message.role === "user").length - 1;
      const scriptedResponse = responses[Math.min(turnIndex, responses.length - 1)];
      if (!scriptedResponse) {
        throw new Error("The discovery scenario received no user message.");
      }
      return typeof scriptedResponse === "function"
        ? scriptedResponse(request)
        : scriptedResponse;
    },
  };
  return model;
}

type Exploration = Idea["assistantAssessment"]["exploration"];
type Importance = Idea["assistantAssessment"]["importance"];

interface IdeaContent {
  title?: string;
  synthesis: string;
  substance: string;
  questions: string[];
  exploration: Exploration;
  importance: Importance;
}

function newIdea(content: IdeaContent & { title: string }) {
  return {
    id: null,
    title: content.title,
    synthesis: content.synthesis,
    substance: content.substance,
    unresolvedQuestions: content.questions,
    disposition: IDEA_DISPOSITIONS.active,
    assistantAssessment: {
      exploration: content.exploration,
      importance: content.importance,
    },
  };
}

function existingIdea(map: IdeaMap, title: string, content: IdeaContent) {
  const current = map.ideas.find((idea) => idea.title === title);
  if (!current) throw new Error(`Discovery scenario could not find idea: ${title}`);
  return {
    ...newIdea({ ...content, title: content.title ?? title }),
    id: current.id,
  };
}

function response(input: {
  text: string;
  move: string;
  ideas: ProposedIdea[];
}) {
  return { content: JSON.stringify({
    response: input.text,
    move: input.move,
    assistantReadiness: [
      { action: READINESS_ACTIONS.reflect, assessment: READINESS_ASSESSMENTS.ready, explanation: null },
      { action: READINESS_ACTIONS.compose, assessment: READINESS_ASSESSMENTS.readyWithUncertainty, explanation: "The user is still deciding which reforms should be most prominent." },
    ],
    userIntention: USER_INTENTIONS.explore,
    proposedIdeas: input.ideas,
    ideaActions: null,
  }) };
}

function ideaMap(request: ConversationModelRequest): IdeaMap {
  const marker = "Current idea map: ";
  const markerIndex = request.system.lastIndexOf(marker);
  if (markerIndex === -1) throw new Error("The test model request did not include an idea map.");
  return JSON.parse(request.system.slice(markerIndex + marker.length)) as IdeaMap;
}
