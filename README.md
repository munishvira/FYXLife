# Fyxlife Fitness Tracker

## Overview

This is a simple cross-platform fitness tracking mobile app built with **React Native** for the Fyxlife Take Home Assignment.  
It features onboarding, daily wellness goals, progress tracking, and a risk-o-meter.  
Animations, local storage, and a streak counter are included for a motivating and friendly user experience.

---

## Features

- **Onboarding Flow**
  - Welcome screen with CTA
  - User info collection (Name, Age, Phone, Gender, Activity level, etc.)
  - Confirmation screen with personalized greeting

- **Dashboard**
  - Wellness goals in card format (Move, Eat, Calm)
  - Streak counter
  - Ability to swap goals (bonus)

- **Progress View**
  - Summary of goals completed today, week, month

- **Risk-o-meter**
  - Point-in-time health risks grouped by bio-system (Cardio, Neuro, etc.)

- **Local Storage**
  - Progress and user data retained after app restart using [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)

- **Animations**
  - Smooth transitions and motivating UI

---

## Demo Video

[Demo Video Link Here](#)  
https://github.com/user-attachments/assets/6887289d-3678-45c1-b8a4-5846b57b984d

---

## Frameworks & Libraries Used

- **React Native** (`0.77.2`)
- **react-native-mmkv** (local storage)
- **react-navigation** (navigation)
- **react-native-linear-gradient** (UI)
- **react-native-vector-icons** (icons)
- **react-native-safe-area-context** (layout)

---

## AI Tools Used

- **Claude**
- **ChatGPT**
- **GitHub Copilot**

These tools were used for ideation, code generation, and speeding up development.

---

## Instructions to Run

1. **Install dependencies:**
   ```sh
   yarn install
   ```

2. **Run on Android:**
   ```sh
   yarn android
   ```

   **Run on iOS:**
   ```sh
   yarn ios
   ```
---

## Assumptions & Shortcuts

- The risk-o-meter uses static data for demonstration.
- Goal swapping is implemented simply; no backend or AI logic.
- UI is designed for clarity and motivation, not pixel-perfect polish.
- Phone number is collected but not validated.
- No authentication or remote sync.

---

## Scaling Notes (v0 → v1)

- **AI Suggestions:**  
  To integrate basic AI suggestions (e.g., swapping a meal/workout), I would:
  - Add a backend API endpoint that receives user profile and current goals.
  - The API would use a simple rules engine or ML model to suggest swaps based on user preferences, activity level, and health risks.
  - The frontend would fetch and display suggestions, allowing users to accept or reject them.

- **Next Steps:**
  - Add remote sync and authentication.
  - Expand risk-o-meter with real health data and trends.
  - AI-driven suggestions for goals, meals, and workouts based on user data and preferences.
  - Enhance UI with more animations and feedback.
  - Integrate push notifications for reminders and streaks.
  - Social sharing of progress and achievements.
  - Curated articles, videos, and recipes related to health and wellness.
  - Detailed charts and graphs to visualize progress over time.

---
