# QuestBound

A gamified task-management web application designed for two players (ages 7 and 9) to complete real-world "Quests" for digital and physical rewards. Built with a rich game-like aesthetic, vibrant animations, and dynamic feedback to encourage habit building.

## Tech Stack

- **Frontend Framework:** React + Vite
- **Styling:** Vanilla CSS (Tailored UI mimicking RPG mechanics with bouncy micro-animations and thick borders)
- **Icons:** Lucide
- **State/Backend:** Google Firebase (Firestore) - *Currently mocking data for Phase 1*
- **View Management:** React Router DOM

## Project Structure

- `src/components/`: Reusable, highly visual UI components (e.g., `QuestCard.jsx`, `Header.jsx`, `QuestBoard.jsx`).
- `src/index.css`: Global styles, layout utilities, animations, and color tokens defined to build the game UI.
- `docs/design_doc.md`: The overarching design patterns and roadmap guiding the project.

## Getting Started

To run this application locally, you will need Node.js installed.

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the Development Server:**
   ```bash
   npm run dev
   ```

3. **Navigate to the App:**
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## Roadmap & Features

Currently, the project is configured with the **Phase 1 MVP**.
- [x] Application routing, layouts, and global design aesthetic.
- [x] The Morning Check-in: Displaying Quest Boards.
- [x] The Heroic Act: Interacting with Quests to yield Gold & XP.
- [ ] Connect Firestore to replace mock variables.
- [ ] Implement The Reward Store (Gacha system, themes).
- [ ] Connect Narrative Recap via LLM text generation.
