# irada — Mindful Focus & Cognitive Energy Workspace

<div align="center">
  <img src="public/orb-crystal.png" alt="irada logo" width="96" height="96" />
  <p><strong>A single-task focus terminal and cognitive energy management system designed for deep work.</strong></p>
  <p>
    <a href="https://irada-focus.vercel.app" target="_blank"><strong>🚀 Live Demo: irada-focus.vercel.app</strong></a>
  </p>

  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
</div>

---

## 💡 About The Project

Most to-do list applications fail because they encourage endless hoarding of tasks, leading to cognitive fatigue, ADHD paralysis, and burnout. 

**`irada`** (*from Arabic/Turkic: willpower, intention, resolve*) rethinks daily productivity from the ground up:
1. **Capacity Over Quantity:** Treat mental energy like a finite battery rather than an endless bucket.
2. **One Thing at a Time:** On mobile, only your immediate active focus task is presented.
3. **Structured Flow:** Plan via the 1-3-5 cognitive framework, lock into hourly timeboxes, and enter deep flow with synthesized soundscapes.

---

## 🌟 Key Features

### 1. 🧠 1-3-5 Rule & Cognitive Energy Budget
- **1 Boss Task (🔥 - 4⚡):** The single defining high-impact objective for the day.
- **3 Medium Tasks (⚡ - 2⚡ each):** Important operational milestones.
- **5 Small Tasks (🪶 - 1⚡ each):** Quick administrative items.
- **Cognitive Energy Cap (15⚡):** Visual progress bar prevents overcommitment.

### 2. 🪫 Low Energy Mode ("Нет сил")
When feeling overwhelmed, ill, or fatigued, toggle **Low Energy Mode**:
- Strict **6⚡ daily limit**.
- Locks out "Boss Tasks" to eliminate guilt and prevent burnout.
- Re-focuses attention entirely on manageable wins.

### 3. ⏱️ Timebox Grid & Hourly Arrival Reminders
- Schedule tasks into dedicated hourly blocks (**08:00 to 22:00**).
- **Automated Sound & Push Reminders:** Synthesized celestial chimes via Web Audio API and Web Notifications alert you right when a planned timebox hour arrives.
- Quick actions inside the reminder: **Focus Now** or **Postpone 1 Hour**.

### 4. 📱 Adaptive Dual Architecture (Desktop HQ + Mobile Terminal)
- **Desktop Planning HQ:** 3-column control center (Quick Inbox & Scratchpad + 1-3-5 Plan + Timebox Timeline).
- **Mobile Focus Terminal:** Strict distraction-free screen displaying only the current task with a 25-minute Pomodoro timer, scratchpad dump, and timeline.

### 5. ☁️ Real-time Cloud Sync & Zero-Setup QR Pairing
- Built on **Supabase Realtime PostgreSQL**.
- Instant QR-code or 1-click URL sync allows pairing your phone with your desktop with zero login friction.

### 6. 🎧 Ambient Deep Work Soundscapes
- Built-in atmospheric sound generator (Rain, Wind, Polar Aurora) to mask background noise and induce flow states.

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Audio Engine:** Web Audio API (zero external sound file dependencies)
- **Database & Sync:** [Supabase](https://supabase.com/) (PostgreSQL & Realtime WebSockets)
- **Deployment:** [Vercel](https://vercel.com/)

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/irada.git

# 2. Enter project directory
cd irada

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
