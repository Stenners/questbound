# Project Specification: QuestBound

**Project Goal:** A gamified task-management web application for two players (ages 7 and 9) to complete real-world "Quests" for digital and physical rewards.

## 1. System Architecture

The application is a Headless Quest Engine with a decoupled frontend.

- **Frontend:** React + Vite + Vanilla CSS (for maximum flexibility and custom game-like animations) + Lucide Icons.
- **State/Database:** Google Firebase (Firestore for real-time updatesxe).
- **Narrative Engine:** LLM API (Gemini/OpenAI) via a backend function (e.g., Firebase Cloud Functions).
- **Deployment:** Netlify Hosting.
- **Configuration:** All game data (Quests, Reward Tables, Level Tiers) defined in JSON/YAML for easy "Admin" updates without code changes.

## 2. Data Model (Core Entities)

### Player
- `id`, `name`, `avatar_url`
- `xp` (Experience Points), `level`
- `gold_balance`
- `inventory` (Array of unlocked digital items/stickers)
- `streak_count`

### Quest
- `id`, `title`, `description`
- `type`: [Bounty (Daily), Trial (One-off), Profession (Skill-based)]
- `reward_xp`, `reward_gold`
- `status`: [Available, Pending Approval, Completed]
- `assigned_to`: [PlayerID or "Co-op"]

### Reward
- `id`, `title`, `cost_gold`
- `is_mystery_box`: Boolean
- `real_world_item`: Boolean (Triggers notification to Parent)

## 3. The Functional Loop

### Phase 1: The Morning Check-in
- Players log in to a dashboard featuring high-contrast "Game UI" (thick borders, rounded buttons, vibrant colors).
- The "Quest Board" displays available tasks. Tasks are categorized by "Guilds" (e.g., The Scholar’s Guild for reading, The Ranger’s Guild for outdoor/physical chores).

### Phase 2: The Heroic Act
- When a task is completed, the player hits "Claim."
- **Interaction:** Trigger a full-screen confetti effect and a "Quest Complete" sound bite.
- **Validation:** The quest moves to a "Pending" state for Parent approval (via a hidden admin toggle).

### Phase 3: The Narrative Recap (LLM Integration)
- Once daily, the system passes the list of completed titles to the LLM API.
- **Prompt:** "Transform these tasks into a 3-sentence heroic chronicle for a 7 and 9-year-old."
- **Output:** Displayed as a "Daily Log" on the dashboard (e.g., "Today, the Brave Knights conquered the Great Folding of the Laundry and cleared the Table Plains.")

## 4. Engagement Mechanics (Gamification)

### The Season Theme (The Journey)
- Implement a global "Progress Bar" shared by both players.
- **Theme Example:** "The Road to Japan." As they earn XP, a shared icon moves across a map of Japan. Every 10% progress unlocks a family "Mini-Reward" (e.g., a specific Japanese snack to try).

### The Mystery Gacha
- A "Shop" item that costs 10 Gold.
- On purchase, run a simple weighted probability function to select a reward from a `loot_table.json`.
- Rewards include digital stickers, 5-minute time extensions, or "Critical Success" physical treats.

### Avatar Evolution
- Visual "Rank" titles that change based on Level (e.g., Level 1: Novice, Level 5: Apprentice, Level 10: Master Architect).
- Background colors or border effects on the player's profile that become more "legendary" as they level up.

## 5. Technical Requirements for Antigravity

### Component Breakdown
- **Dashboard:** Responsive grid layout for Quest Cards.
- **Reward Store:** A card-based shop with "Buy" buttons that check `gold_balance`.
- **Parent Portal:** A simple, password-protected view to add/edit quests and approve completions.
- **Notification Webhook:** Optional integration to send a Discord/Slack/SMS alert to parents when a "Real World Reward" is purchased.

### Visual Style Guide
- **Typography:** 'Luckiest Guy' for headings, 'Inter' for UI text.
- **Color Palette:** Action-oriented (Success: Emerald-400, Quest: Amber-400, Critical: Violet-500).
- **Assets:** Placeholders using Lucide Icons; final assets sourced from Kenney.nl (RPG Urban/Board Game packs).

## 6. Implementation Roadmap

- **V1 (MVP):** Simple list of quests, gold tracking, and a basic reward shop.
- **V2 (Engagement):** LLM Narrative Recap, Confetti/Sound effects, and Mystery Chests.
- **V3 (Stretch):** Seasonal Progress Map and Co-op "Boss" challenges.
