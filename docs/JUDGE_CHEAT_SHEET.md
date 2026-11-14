# TigerQuest — Judge Cheat Sheet

**CODE/CLASH 2026 · Track: Community & Social Impact**

**Format:** 4 minutes presentation + live demo, then 2 minutes of judge questions.

**Judging criteria:** Prompt Alignment · Technical Execution · Innovation · User Impact · Polish & Presentation

---

## ⚡ One-page quick reference (read right before presenting)

| | |
|---|---|
| **What it is** | A game-style Towson campus map that helps students discover resources and this week's real events, and rewards real-world participation with XP. |
| **Problem** | Opportunities exist, but students don't know where they are, what's happening this week, or don't feel motivated to go. The information is scattered. |
| **Core idea** | *Play the game digitally. Complete the missions in real life.* |
| **Top features** | 11 clickable buildings · character walks the paths (Dijkstra) · WASD/arrow keys · **live Towson events** with Show on map · 27 missions, 7 skill trees, XP and levels · saved events · works offline with sample data |
| **Tech** | HTML, CSS, vanilla JavaScript, SVG, Fetch API + JSON, localStorage, requestAnimationFrame. No frameworks, no backend, no database, no npm. |
| **Why that tech** | Runs by double-clicking one file; reliable for a live demo; every part is explainable. |
| **Movement** | 43 waypoints form a graph → Dijkstra finds the shortest route around buildings → the game loop moves the character ~60×/s at a constant speed. |
| **Live events** | `fetch()` → `events.towson.edu/api/2/events` (public, no key, CORS allowed) → JSON → matched to buildings with text rules → shown on the map. Falls back to labeled sample events if offline. |
| **XP storage** | `localStorage` key `tigerquest-save-v2` stores mission states. XP is recalculated from verified missions, so it can't be double counted. |
| **Simulated** | Mission verification (a "Simulate verified completion" button). Sample events when offline. |
| **Strongest innovation** | Linking a game map to **live, real campus events**: a real event → its building on the map → your character walks there → you save it as a quest. |
| **Biggest limitations** | Verification is simulated; progress is per-browser with no accounts; depends on an external calendar; 11 buildings; no user testing yet. |
| **AI use** | We defined the problem, requirements and UX. AI wrote most of the code, helped debug, test and research. We direct, test and can explain it. |

---

## 🎤 Four-minute presentation script

> Practice with a timer. Demo steps are in **[brackets]**. Before starting: open `index.html` in Chrome, confirm the **🌐 LIVE DATA** label on This Week (if it says SAMPLE, say so honestly), and reset progress (Progress → Reset) so XP starts at 0.

### 0:00–0:30 — The Problem *(Speaker: Member 1)*
"Towson has tutoring, career coaching, hundreds of student organizations, workshops and performances every week. But a lot of students, especially freshmen and commuters, never use them. Not because they don't care, but because the information is scattered across websites and calendars, and taking the first step is hard. The prompt asks how technology can break down barriers to growth and opportunity. For many students, the first barrier is simply discovery."

### 0:30–1:10 — Our Solution *(Member 1 → Member 2)*
"TigerQuest turns campus into a game. You explore an illustrated Towson map, discover what each building offers and what's happening there this week, and earn XP in seven skill areas, like Career, Communication and Wellness, for things you do **in real life**. Our rule is: *play the game digitally, complete the missions in real life.* Walking your character to the library doesn't earn anything. Actually going to a research workshop does."

### 1:10–2:50 — Live Demonstration *(Member 2 drives map; Member 3 / 4 narrate their parts)*
1. **[Click Cook Library]** "Every building is clickable. My character walks there along the paths, and the panel shows what's here: research help, tutoring, writing support, this week's events and missions." *(~20s)*
2. **[Click Liberal Arts]** "Notice it walks *around* Hawkins Hall instead of through it. That's a shortest-path algorithm we'll explain in a second." **[Press W/A/S/D briefly]** "You can also move freely with the keyboard." *(~20s)*
3. **[Click 📅 This Week]** "This is real data. These events come live from Towson's public events calendar for this week. I can filter by skill or by day." **[Click a category, e.g. Creativity]** *(~25s)*
4. **[Click 🗺️ Show on map on an event]** "When I pick an event, TigerQuest takes me to its building on the map and highlights it." **[Click ☆ Add to My Quests]** "And I can save it as a quest. Saving doesn't give XP. Planning isn't doing." *(~20s)*
5. **[In the building panel: click ⚡ Simulate verified completion on a mission]** "After you actually attend, the mission gets verified. In this prototype verification is simulated, and we're upfront about that. XP goes up, my Career and Communication skills grow, and…" **[open 🌳 Skills or 🏆 Progress]** "…progress is saved, even if I refresh." *(~15s)*

### 2:50–3:30 — Technology *(Member 3 + Member 4)*
"TigerQuest is a lightweight web app: HTML, CSS and plain JavaScript, with no frameworks, no server and no database, so it runs by double-clicking one file. The map is an SVG: the illustration with invisible clickable outlines over each building. For movement, we placed 43 waypoints on the campus paths and use **Dijkstra's algorithm** to find the shortest route that doesn't cross any building. For events, the browser calls Towson's public calendar API, gets JSON back, and matches each event's location to our buildings. If the internet is down, it switches to clearly labeled sample events. Progress is stored in the browser with localStorage."

### 3:30–4:00 — Impact & Conclusion *(Member 1)*
"TigerQuest puts scattered opportunities on one map, shows what's happening *this week*, and gives students a reason to take the first step. Next, we'd add real check-in verification, student accounts and an official Involved@TU integration, and we'd test with students to see whether it actually increases participation. TigerQuest: discover your campus, build real skills, unlock your future. Thank you!"

**Backup plan if the live demo fails:** if events show SAMPLE DATA, say: "We're offline right now, so it switched to labeled sample events. That's the fallback we built." If something freezes, refresh the page (progress is saved).

---

## 🏅 Our strongest points (by judging criterion)

| Criterion | What to emphasize | Be careful not to claim |
|---|---|---|
| **Prompt Alignment** | Discovery is a real barrier to growth and opportunity. TigerQuest connects students to real Towson resources and real events. | That it has *already* increased participation. It has not been tested with students. |
| **Technical Execution** | Working pathfinding (Dijkstra plus polygon collision), live API integration with a tested offline fallback, persistent progress with migration and corrupted-data handling, responsive layout, accessibility basics. | Production readiness, security, or scale. |
| **Innovation** | Combining an open-world game map with **live** campus events: event → building → walk there → save quest. Plus the "virtual discovery, real completion" rule. | That no one has ever gamified campus life. Similar ideas exist (see Q5). |
| **User Impact** | Lowers the effort to find opportunities; the seven skill trees connect activities to career-relevant growth; it's free and needs no install. | Measured engagement gains. Gamification *may* help motivation, but we haven't measured it. |
| **Polish & Presentation** | Consistent game aesthetic, smooth animation, clear honest labels (LIVE vs SAMPLE, "simulated verification"). | — |

---

## ❓ Likely judge questions (27)

*Format: **Short answer** (say this in Q&A) → *Study notes* → `Code`*

### Problem, users, impact

**1. What problem are you solving?**
**Short:** Students don't use campus resources because they can't easily discover them or what's happening this week. We make discovery visual, current and motivating.
*Study:* Information is spread across department sites, the events calendar and Involved@TU. Freshmen, transfers and commuters are most affected.

**2. Who is your target user?**
**Short:** Towson undergraduates, especially new and commuter students who don't know campus yet.
*Study:* Also useful for orientation leaders and offices that want their events discovered.

**3. How do you know students want this?**
**Short:** Honestly, we haven't run a user study yet. It's based on our own experience as students. A usability test is our first next step.
*Study:* Don't invent survey numbers.

**4. Why gamification? Doesn't it feel gimmicky?**
**Short:** Games give clear goals, visible progress and a sense of discovery, which lowers the barrier to trying something new. The rewards are tied to real actions, not screen time.
*Study:* Gamification can increase motivation in some contexts, but effects vary; we haven't measured ours. Planning and self-reporting deliberately give 0 XP to keep the focus on real participation.

**5. What existing solutions are there, and why is yours different?**
**Short:** Towson already has an events calendar and Involved@TU, and those are lists. TigerQuest puts opportunities on a map, ties them to buildings, and adds missions and skill progress that encourage people to actually attend.
*Study:* We use the official calendar as our data source; we complement it rather than replace it.

**6. How would you measure impact?**
**Short:** Verified mission completions, events saved versus attended, and repeat usage. Plus a survey comparing awareness of resources before and after.
*Study:* This needs accounts and real verification first.

### Map & interface

**7. How is the map interactive if it's just an image?**
**Short:** It's inside an SVG. On top of each building we drew an invisible polygon with the same outline. Clicking the polygon tells our code which building you chose.
*Study:* The SVG `viewBox` equals the image size (1511×1041), so polygon coordinates are image pixels. `data-building="cook"` links the shape to the data.
`script.js: renderHotspots(), BUILDINGS[].area`

**8. Why doesn't it break when the window is resized?**
**Short:** The image, the polygons and the character are all in the same SVG, so they scale together as one picture.
*Study:* `preserveAspectRatio="xMidYMid meet"` keeps the proportions; `screenToMap()` converts clicks using the SVG's own transform.

**9. Does it work on phones?**
**Short:** Yes. On phones the layout becomes one column, you tap buildings, and the details slide up in a panel you can close.
*Study:* Tested in an emulated phone size, not on a real device. Known cosmetic issue: on wider phones, the cards under the map don't stretch to full width.

**10. Is it accessible?**
**Short:** Partly. Buildings have labels and can be selected with Tab and Enter, focus outlines are visible, statuses use icons and words not just color, and we respect reduced-motion settings. We haven't tested it with a screen reader.

### Movement & algorithms

**11. How does the character know where to walk?**
**Short:** We placed 43 waypoints on the campus paths and connected them into a graph. Dijkstra's algorithm finds the shortest route from the character to the building's door without crossing any building.
`script.js: WAYPOINTS, PATH_LINKS, findPath()`

**12. Explain Dijkstra's algorithm.**
**Short:** It starts at your position and keeps expanding to the closest unfinished point, recording the shortest known distance to each point and where it came from. When it reaches the destination, it traces those notes back to get the route.
*Study:* Guarantees shortest paths with non-negative edge weights. Our weights are straight-line distances. Example: Union → Liberal Arts goes UU door → waypoint `n` → waypoint `ao` (the gap between Hawkins and Lecture Hall) → LA door.

**13. Why Dijkstra and not A\* or BFS?**
**Short:** BFS finds the fewest hops, not the shortest distance. A* is faster on huge maps, but our graph has about 45 nodes and Dijkstra runs in about a millisecond, and it's simpler to explain.

**14. How do you stop it walking through buildings?**
**Short:** We check whether a straight line between two points passes through any building outline. If it does, that line isn't allowed. For keyboard movement, we block steps into a building and let the character slide along the wall.
*Study:* `isPointInPolygon()` (ray casting) and `isSegmentClear()` (samples every 8 px). `moveManually()` tries the full move, then x-only, then y-only.

**15. How does the animation work?**
**Short:** `requestAnimationFrame` calls our game loop about 60 times a second. Each frame we move the character by speed × time since the last frame, so the speed is the same on every computer.
`script.js: gameLoop(), followRoute(), drawPlayer()`

**16. What happens if I press a key while it's walking?**
**Short:** The keyboard always wins. It clears the automatic route. Clicking another building replaces the route too.

### Events, APIs, data

**17. Is the event data real?**
**Short:** Yes, when online. It comes live from Towson's public events calendar API. If the API can't be reached, the app shows sample events clearly labeled "SAMPLE DATA".
`LIVE_EVENTS_API = 'https://events.towson.edu/api/2/events'`

**18. How do you get the events? What's an API?**
**Short:** An API is a way for programs to ask another system for data. Our page uses JavaScript's `fetch()` to send an HTTP request to the calendar API for this week's dates. It answers in JSON, which we turn into event cards.
`loadLiveEvents(), convertLiveEvent()`

**19. What is JSON?**
**Short:** A simple text format for structured data, like `{"title": "Career Fair", "location_name": "University Union"}`. JavaScript can turn it directly into objects.

**20. How do you know which building an event is in?**
**Short:** We match the event's location text with simple rules. For example, "University Union" or "UU 222" means the Union, and "CA 3040" means Center for the Arts. If it's unclear, we don't guess. The event is listed as not on our map.
`LOCATION_RULES, guessBuildingId()`

**21. Why not Involved@TU?**
**Short:** We looked into it. Its public RSS feed only covers about the next 24 hours, its JSON endpoint is undocumented and browsers block it, and the official API needs university credentials, which can't safely go in a website. So we used the public events calendar, which allows browser access.

**22. What's CORS?**
**Short:** It's a browser security rule: a page can only read another site's data if that site allows it. Towson's events API allows any site, so our page can read it. Involved@TU's endpoint doesn't, and we didn't try to bypass that.

### Storage, security, scale

**23. Where is progress stored? Why no database?**
**Short:** In the browser's localStorage, a small storage area for each site. It survives refreshes without any server. For a prototype that's simpler, free and keeps data on the user's device. A real version would need accounts and a database.
`loadSave(), writeSave(), key 'tigerquest-save-v2'`

**24. Can't students cheat?**
**Short:** In this prototype, yes. Verification is simulated, and a tech-savvy user could edit localStorage. That's our biggest limitation. A real version would award XP only on a server, after a check-in such as a QR code at the event.

**25. How do you prevent earning XP twice?**
**Short:** We never add XP to a running total. We recalculate it from which missions are verified. A mission is either verified or not, so it can only count once.
`getTotalXp(), handleMissionAction()`

**26. Is it secure? Do you collect personal data?**
**Short:** We don't collect anything. There are no accounts and no server of ours, and progress stays in the user's own browser. We escape all event text before showing it, so the calendar data can't inject code.
*Study:* `escapeHTML()`, `safeUrl()`. No API keys exist anywhere in the code.

**27. How would this scale to the whole university?**
**Short:** The frontend is static, so hosting is cheap and scales easily. What would need to change is content and trust: buildings and missions are currently written in the code, so we'd move them to an admin-managed database, and add accounts and verification on a server.

### Process & team

**28. How much did you use AI? What did your team do?**
**Short:** A lot, and we're upfront about it. We identified the problem, designed the product and its rules, wrote detailed requirements and made the UX decisions. An AI coding assistant wrote most of the code, and helped us debug, test and research the event sources. We reviewed and tested everything and learned how each part works so we can explain and maintain it.
*Study:* Don't claim anyone hand-wrote the pathfinding or the API code. Each member should name their real contributions, and confirm them before presenting.

**29. What was the hardest technical challenge?**
**Short (pick what's true for you):** Making characters walk *around* buildings on a picture: we had to trace building outlines, place waypoints, and verify every route. Our automated check confirmed all 143 start-to-building routes avoid buildings. Another was finding an event source that browsers are allowed to read.

**30. What would you build next?**
**Short:** Real check-in verification, student accounts, an official Involved@TU partnership, more buildings, and a usability study.

---

## 👥 Preparation split (suggested, not a record of who built what)

Everyone must be able to explain: what TigerQuest is, the "real-life missions" rule, that it's HTML/CSS/JS with no backend, what's simulated, and the AI-use answer.

### Member 1 — Problem & Product Vision
- [ ] Deliver 0:00–1:10 and 3:30–4:00 from memory
- [ ] Questions 1–6, 28, 30
- [ ] Know which limitations to admit (PROJECT_LIMITATIONS §1–2)
- [ ] Explain why reaching a building doesn't give XP

### Member 2 — Interface & Campus Map
- [ ] Drive the live demo smoothly (practice 5×)
- [ ] Questions 7–10
- [ ] Explain SVG + invisible polygons + `data-building`; show `index.html#debug`
- [ ] Explain the responsive layout: 3 columns, then 2, then the phone bottom sheet; sidebars scroll independently

### Member 3 — Movement & Game Logic
- [ ] Questions 11–16, 24, 25
- [ ] Explain Dijkstra with the Union → Liberal Arts example (draw it on paper!)
- [ ] Explain `requestAnimationFrame` and speed × time
- [ ] Explain mission states, XP sum of skills, level formula (350, then 350 + 90 × L), localStorage

### Member 4 — Events & Architecture
- [ ] Questions 17–23, 26, 27
- [ ] Explain fetch → JSON → `convertLiveEvent` → `LOCATION_RULES` → map
- [ ] Explain CORS simply and the Involved@TU findings
- [ ] Explain the offline fallback and the "SAMPLE DATA" labeling
- [ ] Explain the architecture diagram (TECHNICAL_GUIDE §1)

---

## ✅ Pre-demo checklist
- [ ] Laptop charged; Chrome open with `index.html` already loaded
- [ ] Internet connected → This Week shows **🌐 LIVE DATA**
- [ ] Progress reset (Progress → Reset all progress) before going on stage
- [ ] Browser zoom at 100%, window maximized
- [ ] Know which event you'll click "Show on map" on (pick one at a mapped building)
- [ ] Fallback line ready if offline
