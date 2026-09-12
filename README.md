# NimGames

NimGames is a Nimiq Mini App built around social and competitive game nights.

It brings multiple simple games into one place, allowing friends and other players to play together, compete, and potentially use NIM as part of the game experience.

## Games

The initial game lineup includes:

* Word Rush
* Scrabble
* Dare
* Trivia Battle
* Caption Battle

More games may be added as the project develops.

## Vision

Make game nights easier to start, more engaging to play, and accessible directly within the Nimiq ecosystem.

NimGames is not intended to be a single-game application. It is designed as a collection of social and competitive games that players can choose from.

## MVP

The first version will focus on:

* Nimiq wallet integration
* Game selection
* Creating or joining a game
* Inviting friends
* Multiplayer game sessions
* Game rules and scoring
* Match results
* NIM integration where supported by the Nimiq Mini Apps environment

The MVP will initially prioritize a small number of games rather than trying to build every game at once.

## Current Focus

**Word Rush** is the first game being explored for implementation.

The game is designed around a shared word-search challenge where players compete to find words faster than their opponent.

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Node.js
* Express
* TypeScript
* MongoDB
* Mongoose

### Blockchain / Payments

* Nimiq
* Nimiq Mini Apps / Nimiq Pay

## Project Structure

```text
NimGames/
├── frontend/       # Next.js application
├── backend/        # Express API
├── docs/           # Product and technical documentation
└── README.md
```

## Development Approach

NimGames is being developed incrementally.

Features will be designed in Figma and implemented one feature or screen at a time.

OpenCode is used as the implementation agent, while development decisions, architecture, debugging, and code understanding are reviewed throughout the process.

The goal is not simply to generate the application, but to understand how it is built while developing it.

## Status

🚧 In development
