# NimGames — Product Overview

## 1. What is NimGames?

NimGames is a social gaming Mini App for the Nimiq ecosystem.

The idea is simple:

> Bring different game-night games into one place where people can play, compete, and have fun with friends or other players.

Instead of building one game, NimGames acts as a platform containing multiple games.

Players can choose a game, invite other players, play a match, and see the result.

## 2. The Problem

Game nights are often fragmented.

People may need different apps, websites, physical materials, or complicated setups depending on the game they want to play.

For online game nights, there is also the challenge of getting everyone into the same game and making the experience simple enough to start quickly.

NimGames aims to provide a simple place where players can:

* Choose a game
* Invite friends
* Start a match
* Play together remotely
* Track scores
* Determine a winner

## 3. Product Concept

NimGames is built around the concept of a **digital game night**.

A player opens NimGames and sees the available games.

They choose a game and can either:

* Create a game
* Join a friend's game
* Invite other players
* Play a quick match where supported

Each game can have its own rules and mechanics while sharing the same overall platform.

## 4. Initial Games

### Word Rush

A competitive word-search game.

Players receive the same letter board and search for hidden words.

The player who finds a valid word first receives the point.

A match can contain multiple rounds, with the player achieving the highest score becoming the winner.

### Dare

A social game where players give challenges to one another.

The exact mechanics and verification system will be defined separately before implementation.

### Trivia Battle

Players answer the same trivia questions and compete based on their scores and/or speed.

### Caption Battle

Players receive an image or prompt and create captions.

The game requires a defined method for determining the winning caption.

### Scrabble

A word-based board game where players compete by creating words and scoring points.

Scrabble implementation will be considered after the first game has been validated.

## 5. Target Users

NimGames is primarily designed for:

* Friends playing remotely
* Online communities
* Discord/community game nights
* Casual competitive players
* People looking for quick multiplayer games

The product should remain accessible to people who are not deeply familiar with crypto.

## 6. Nimiq's Role

Nimiq is not simply being added as a payment method.

The goal is to use the Nimiq ecosystem where it genuinely improves the game experience.

Potential uses include:

* Wallet-based player identity
* Player-to-player NIM transactions
* Game entry or stakes where appropriate
* Rewards where supported
* Game-related payments

However, no payment or reward mechanic should be assumed until it has been confirmed to be technically supported by the current Nimiq Mini App environment.

## 7. Core User Flow

A simplified experience:

```text
Open NimGames
      ↓
Onboarding
      ↓
Wallet / identity ready
      ↓
Home
      ↓
Choose a game
      ↓
Game lobby
      ↓
Create / Join / Invite
      ↓
Game
      ↓
Results
      ↓
Play again / Return Home
```

## 8. MVP Principles

The MVP should prioritize:

1. Simple game discovery
2. Easy player invitations
3. Reliable multiplayer sessions
4. Clear game rules
5. Simple scoring
6. Clear match results
7. Meaningful Nimiq integration
8. Good mobile experience

The project should avoid unnecessary features until the core game loop works.

## 9. Development Strategy

NimGames will be developed incrementally.

Rather than building the entire application at once, development will follow the product flow.

For each feature:

1. Design the experience in Figma.
2. Define what the feature needs technically.
3. Identify frontend and backend requirements.
4. Implement the smallest working version.
5. Test it.
6. Review the implementation.
7. Improve the experience.
8. Move to the next feature.

## 10. Current Priority

The current priority is establishing the core NimGames experience and implementing **Word Rush** as the first complete game.

The goal is to prove the platform's core loop before expanding into additional games.

## 11. Non-Goals for the Initial MVP

The first version will not attempt to build:

* A large social network
* Complex player profiles
* Advanced matchmaking
* A large game library
* Automated moderation
* Complex reward economies
* Custodial wallet functionality
* Features that are not required for the core game experience

These can be considered later if the core product proves useful.

## 12. Product Principle

**NimGames should feel like a game-night app first and a crypto Mini App second.**

Nimiq should make the experience better, not make the experience unnecessarily complicated.
