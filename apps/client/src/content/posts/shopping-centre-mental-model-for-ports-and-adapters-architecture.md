---
title: How a shopping-centre mental model lets me see my personal website's ports-and-adapters architecture with my eyes closed
shortTitle: A shopping-centre model for my website architecture
description: The shopping-centre mental model that lets me see my website's architecture with my eyes closed.
createdAt: 2026-08-06
slug: shopping-centre-website-architecture
legacySlugs:
  - portfolio-website-architecture-for-dummies
  - shopping-centre-mental-model-for-ports-and-adapters-architecture
coverImage: /images/writing/shopping-centre-website-architecture/cover-2000x840.jpg
coverImageSmall: /images/writing/shopping-centre-website-architecture/cover-1000x420.jpg
internalTags:
  - thoughtform
externalTags:
  - productengineering
  - architecture
  - softwareengineering
  - webdev
---
This website serves two purposes:

1. It's where I write about how I think.
2. It's where I showcase what I build.

Soon, I'll be releasing my first demo product: [ThoughtForm](https://adambelton.com/products/thoughtform).

ThoughtForm is a conversational thinking workspace where an AI assistant helps you explore, organise and articulate what you think or feel. Through focused questions, examples, clarification, challenge and alternative perspectives, it helps you develop an evolving idea map you can inspect and correct. If it would be useful, it can then bring that understanding together into a coherent expression, in your own words. It is useful when something is bothering you, but you cannot quite put your finger on why.

It's not quite ready to show you yet, though.

In the meantime, I thought I'd tell you how this website works under the hood. Its architecture.

But instead of just talking about its architecture, I'm going to talk about how I think about its architecture. Architecture is inherently technical, and what interests me about building things is simplifying complexity.

Technically, the website uses a version of something called ports-and-adapters architecture. It has a host, delivery and application layers, capabilities, ports, adapters and composition.

I designed the architecture around those ideas. The technical language is useful because it gives each part a precise name. But knowing the names of things isn't the same as having a mental model for how they fit together.

I understand technical concepts best when I can see the underlying model with my eyes closed. It's a tool I use whenever something has lots of moving parts: I turn it into a picture I can hold in my head, move around and explain without relying on the technical language.

This is the picture I use for the website's architecture.

Here we go.

Imagine AdamBelton.com is a shopping centre. I'm Adam, and I own it.

There is a big unit at the front where I display my writing. Down a corridor are some smaller units where my projects operate. One of those projects is ThoughtForm, but we'll get to that later.

These projects could have their own buildings in different locations. But I like having them here, so you can visit them in one place instead of driving all over town.

One benefit of having them here is that they can share the shopping centre's resources. These include:

1. Security.
2. Storage.
3. Cutting-edge AI.

Right now, you're inside the shopping centre. You're in the main unit, looking at my writing. You haven't passed security because you haven't needed to. The writing is open to everyone.

If you were visiting one of the private project units, you would have to pass security first. They would ask you to sign in and check whether you were allowed through.

Then you get to ThoughtForm.

The way ThoughtForm works is that you have a conversation. You talk about what you're thinking or feeling, and the assistant asks questions to help you explore it. While that's happening, ThoughtForm builds an idea map: an inspectable view of the ideas you establish and the perspectives you explore. If you decide it would be useful, ThoughtForm can help you bring those ideas together in your own words.

We'll get into more detail about how this works and why it exists another time, but for now, let's get back to the shopping centre.

You walk into ThoughtForm, and here's the layout.

There is a receptionist at the front. Somewhere behind the receptionist, there is a floor manager wandering around. Behind the floor manager are three departmental offices with signs on their doors: conversations, idea maps and drafting. Inside each office is a specialist for that department.

At the back are two more doors marked storage and AI. We can't see behind them, but they connect the project unit to restricted areas of the shopping centre.

When ThoughtForm's unit was being designed, it told the shopping centre's fit-out team that it would need storage and AI.

But here is the important bit: ThoughtForm doesn't know how the shopping centre provides either of them. It doesn't deal with the suppliers or know what the restricted areas look like. It just knows what it needs to be able to ask for at each door.

This matters because ThoughtForm might want to relocate one day. It can't take the shopping centre's storage rooms or AI suppliers with it. But it can take the design of its doors. A new building would only need to connect suitable services on the other side.

Before the unit opened, the shopping centre's fit-out team connected those doors to the services it had chosen. If the shopping centre upgrades a service or changes suppliers, it can change what is behind the door without ThoughtForm needing to redesign itself.

Back to ThoughtForm. And you.

When you start a conversation, you speak to the receptionist. She passes your message to the floor manager.

The floor manager makes two copies. One goes to the conversations department. The other goes to the idea map department.

The conversation specialist takes your message through the AI door. A response starts coming back, and it makes its way through the floor manager and receptionist to you.

At the same time, the idea map specialist takes their copy through the AI door. They are not trying to respond to you. They are looking for ideas you have established, corrected or developed. If they find something useful, the idea map is updated.

The work that needs to be kept is passed through the storage door.

There are two important points here.

The first is that the conversations department and the idea map department work independently. They receive the same message, but they do different jobs and finish in their own time. The floor manager doesn't make you wait for the idea map before the conversation can continue.

The second is that this happens over and over again. You send a message, the floor manager coordinates the work, and each department handles its own area of expertise using services supplied by the shopping centre.

If you later decide to bring your thinking together, the drafting department gets involved. It works with the material you have established and helps create a draft in your own words. The draft is optional. You can use ThoughtForm to explore something without ever producing one.

That's the picture.

Like any metaphor, it isn't a perfect representation. It keeps the relationships I need to see and leaves out the details I don't.

Now the technical language has somewhere to live.

The shopping centre is the **host**. It provides the shared environment and infrastructure.

Preparing the unit and connecting everything before it opens is **composition**.

The routes and roads that bring you to the right place are **HTTP**. ThoughtForm's entrance and receptionist are its **delivery** layer. In another architecture, I might have called this a controller.

The floor manager is the **application** layer. She coordinates the complete job without doing the specialist work herself.

The departments are **capabilities**. They own the rules for conversations, idea maps and drafting. The specialists inside them are **services**.

The storage and AI doors are **ports**. ThoughtForm designs them around what it needs, without knowing what is behind them.

The connections fitted to the other side are **adapters**. They translate between ThoughtForm's needs and the shopping centre's actual services.

In shorthand:

```text
Delivery receives.
Application coordinates.
Capabilities decide.
Ports describe what is needed.
Adapters connect the product to real services.
Composition connects everything.
```

That is not the only way to describe this architecture. It might not even be the metaphor that works for you. But it is the one that lets me see the whole thing at once.

And that matters to me.

I don't think understanding something means being able to repeat its terminology. I think it means being able to turn it around in your head, look at it from another angle and explain it without relying on the original language.

The code already shows what I've built. The repository is open for anyone who wants the technical detail. What I want to show here is how I make sense of it.

When a system becomes complicated, my instinct is to look for the smallest picture that preserves the important relationships. In this case, it was a shopping centre: a host, a fitted-out unit, a receptionist, a floor manager, some specialist departments and a couple of carefully designed doors.

That is how I see the architecture with my eyes closed.

If you ever understand the individual words in a technical explanation but still find the whole thing difficult to hold in your head, try looking for the picture underneath them. It doesn't have to be a shopping centre, and it doesn't have to make sense to anyone else at first.

Find the mental model that lets you see how the parts relate. Then give the technical language somewhere to live.
