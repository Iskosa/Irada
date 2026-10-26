# 🎙️ `irada` — Team Presentation Script (4 Speakers)
**Format:** 5–7 minutes presentation with Live Demo  
**App Demo:** [irada-focus.vercel.app](https://irada-focus.vercel.app)

---

## 👥 Speaker Roles & Timing

| Speaker | Role | Topic | Duration |
| :--- | :--- | :--- | :--- |
| **Speaker 1** | **The Visionary** | The Hook, Problem Statement & Philosophy of *irada* | ~1.5 min |
| **Speaker 2** | **Product Architect** | The 1-3-5 Framework & Cognitive Energy System (⚡) | ~1.5 min |
| **Speaker 3** | **UX & Flow Master** | Timeboxing Grid, Smart Audio Reminders & Mobile Focus Terminal | ~1.5 min |
| **Speaker 4** | **Tech Lead** | Technical Architecture, Real-Time Sync & Live Demo / Closing | ~1.5 min |

---

## 🎬 Full Presentation Script (Word-for-Word)

### 👤 SPEAKER 1: The Hook, The Problem & The Mission (~1.5 min)

> **[Slide 1: Title Slide — "irada: Mindful Focus & Cognitive Energy Workspace"]**  
> *(Stand confidently, smile, and make eye contact with the audience)*

"Good morning / afternoon everyone!  
Today, my teammates and I are thrilled to introduce **irada** — a mindful focus and cognitive energy workspace built for the modern digital age.

Let me start with a quick question:  
How many times have you created a to-do list with 20 items, felt completely overwhelmed before lunch, and ended your day feeling exhausted — yet feeling like you accomplished nothing?

We’ve all been there. Traditional productivity apps like Todoist or Trello treat humans like endless machines. They encourage **task hoarding**. You write dozens of tasks, your brain enters **ADHD paralysis**, and you burn out.

We asked ourselves: **What if productivity wasn't about doing more, but doing what truly matters?**

That is why we created **irada**. The word *irada* means *willpower, conscious intention, and resolve*.  
Instead of an endless checklist, **irada** is a single-task focus system that treats your mental energy like a finite battery.

Now, my teammate will walk you through how our core 1-3-5 cognitive framework works."

---

### 👤 SPEAKER 2: The 1-3-5 Rule & Cognitive Energy System (~1.5 min)

> **[Slide 2 & Screen: Show the 3-column PC Dashboard with Energy Meter]**

"Thank you, [Speaker 1's Name]!

To stop cognitive overload, we grounded **irada** in the proven **1-3-5 cognitive framework**, combined with a **hard energy budget**.

Here is how it works:
Every day, you are allocated a maximum of **15 Cognitive Energy units (15⚡)**. You cannot exceed this capacity:
- **1 Boss Task (🔥):** Worth 4⚡. This is the single, highest-impact goal of your day. If you only accomplish this one thing today, your day is already a victory.
- **3 Medium Tasks (⚡):** Worth 2⚡ each. Important secondary milestones that keep projects moving forward.
- **5 Small Tasks (🪶):** Worth 1⚡ each. Quick administrative chores, emails, or calls.

*(Point to the Energy Bar in the Header)*  
Notice our **Cognitive Energy Meter** at the top. If you try to plan beyond your energy threshold, the system visually warns you of overload.

*(Gesture: Toggle "Low Energy Mode")*  
Now, look at this unique feature: **Low Energy Mode** (or «Нет сил»).  
Some days you wake up tired, stressed, or sick. When you turn on Low Energy Mode:
1. Your energy capacity instantly drops from 15⚡ down to **6⚡**.
2. High-pressure 'Boss Tasks' are automatically locked out.  
3. The interface eliminates guilt and refocuses you solely on small, manageable wins.

Next, [Speaker 3's Name] will demonstrate how tasks turn into actual focused action."

---

### 👤 SPEAKER 3: Timeboxing, Smart Reminders & Focus Terminal (~1.5 min)

> **[Slide 3 & Screen: Show Timebox Column and Mobile Focus Terminal]**

"Thank you, [Speaker 2's Name]!

Having a prioritized plan is great, but without a dedicated time, a plan is just a wish.  
That is why **irada** features a seamless **Timebox Grid** running from **8:00 AM to 10:00 PM**.

*(Point to the Timeboxing Column)*  
With one click, any task from your 1-3-5 plan is mapped into a specific hour. You always know *what* you should be doing and *when*.

Now, here is where our smart automation shines:
**Hourly Arrival Reminders:**  
Right when a scheduled hour begins — say, 2:00 PM — **irada** plays a gentle, synthesized celestial chime and sends an instant browser push notification.  
A focused modal appears right on screen, giving you two friction-free choices:
- **Focus Now:** Instantly launches the Pomodoro focus timer.
- **Postpone 1 Hour:** Gracefully slides the task without breaking your schedule.

*(Show the Mobile / Single-task Terminal)*  
When you switch to our **Mobile Focus Terminal**, everything disappears except **ONE** active task.  
No distracting sidebars, no multi-tasking clutter. Just your current objective, a 25-minute Pomodoro timer, and our built-in **Ambient Soundscapes** — generating real-time rain, wind, and atmospheric aurora sounds to induce deep work flow.

Now, I'll pass it to [Speaker 4's Name] to discuss our technical architecture and demonstrate live synchronization."

---

### 👤 SPEAKER 4: Technical Architecture, Real-Time Sync & Conclusion (~1.5 min)

> **[Slide 4 & Screen: Show Architecture & Live Phone Sync]**

"Thank you, [Speaker 3's Name]!

Behind this serene interface is a modern, high-performance technology stack:
- **Frontend:** Built with **React 19**, **TypeScript**, and **Vite** for sub-millisecond responsiveness.
- **Styling:** Custom dark-mode design system with **Tailwind CSS**.
- **Audio Engine:** 100% synthesized in real time via the **Web Audio API** — meaning zero external MP3 assets, zero latency, and zero broken links.
- **Backend & Real-Time Sync:** Powered by **Supabase PostgreSQL** with WebSocket subscriptions.

*(Live Demo moment: Show PC and Phone simultaneously)*  
Look at our device synchronization:  
Users do not need to fill out tedious registration forms or passwords. You simply click **Sync**, scan a dynamic **QR Code** with your phone's camera, and your mobile device pairs with your desktop in less than two seconds!  
When I check off a task on my phone — it updates instantly on the PC dashboard in real time.

**To conclude:**  
In a world full of noise, notifications, and burnout, **irada** helps people reclaim their willpower, protect their mental energy, and achieve deep focus every single day.

Our application is live right now at **irada-focus.vercel.app**.

Thank you for your time, and we would now love to take any questions!"

---

## ❓ Frequently Asked Questions (Q&A Preparation)

### Q1: "Why would someone use irada instead of Notion, Todoist, or Apple Reminders?"
**Answer (by Speaker 1 or 2):**  
> *"Great question! Those tools are great file cabinets, but terrible focus drivers. They allow you to list 100 tasks, which research shows triggers cognitive anxiety and decision fatigue. irada is opinionated: it enforces the 1-3-5 rule, caps your daily energy, and displays only ONE single task on your phone. It's not a storage bucket; it's a focus accelerator."*

### Q2: "How does the sound engine work without audio files?"
**Answer (by Speaker 4):**  
> *"We synthesize all notification chimes and ambient soundscapes programmatically using the browser's Web Audio API oscillators and gain nodes. This means zero audio asset downloads, instantaneous playback, offline capability, and extremely low data usage."*

### Q3: "What inspired the Low Energy Mode?"
**Answer (by Speaker 2 or 3):**  
> *"Most productivity apps assume you are at 100% energy every day, which is unrealistic. When people feel sick or overwhelmed, they abandon their productivity tools because of guilt. Low Energy Mode provides psychological safety: it drops your goal to 6 units and removes high-stress Boss tasks, keeping your momentum alive without burnout."*

### Q4: "Is it a native app or a web app?"
**Answer (by Speaker 4):**  
> *"It is a Progressive Web App (PWA). It works seamlessly on any browser, can be installed directly onto iOS and Android home screens without an app store, and runs fully offline with local persistence."*

---

## 💡 Quick Presentation Tips for the Team
1. **Pronunciation:**
   - *irada* -> `ee-RAH-dah`
   - *Cognitive* -> `KOG-nih-tiv`
   - *Timeboxing* -> `TIME-box-ing`
   - *Pomodoro* -> `poh-moh-DOH-roh`
   - *Synthesized* -> `SIN-thuh-syzed`
2. **Body Language:** Look at the judges/audience, not just the screen.
3. **Smooth Hand-offs:** Always say the name of the next speaker: *"Now, [Name] will show you our energy system..."*

