# TigerQuest — Limitations, Simulated Features & Future Work

This document is an honest account of what TigerQuest does **not** do yet. It's written so the team can answer judges openly.

---

## 1. What is simulated

| Feature | What really happens | What a real version would need |
|---|---|---|
| **Mission verification** | The button "⚡ Simulate verified completion" marks a mission as verified and awards XP. **Nothing checks that the student actually attended.** | Event check-in (QR code scanned at the event), organizer or staff confirmation, or an official attendance system, plus a backend to store trusted records. |
| **Self-reporting** | "✋ I did this" records a claim only. It awards **0 XP**. | The same verification process as above. |
| **Sample events** | 14 invented events, generated for the current week and labeled 🧪 SAMPLE DATA. Used offline or when the live calendar can't be reached. | Not needed when live data is available. |
| **Character position** | A position on the illustrated map, **not GPS**. Walking to a building does not complete anything. | Optional location features, which raise privacy questions. |

**Why reaching a building doesn't complete a mission:** TigerQuest's core idea is that growth happens in real life. If walking the virtual character to Cook Library gave XP, students could level up without ever going to the library.

---

## 2. Current limitations (most important first)

### 2.1 Progress is stored only in the browser
- Data is in `localStorage` under the key `tigerquest-save-v2`.
- It **does not sync** between devices or browsers.
- **Clearing browser data erases it.** Private/incognito windows lose it when closed.
- A user can edit `localStorage` by hand in developer tools and award themselves XP. **There is no data integrity or anti-cheating.**
- *Fix:* user accounts and a backend database (e.g. a small server with PostgreSQL), where XP is awarded only by the server after verification.

### 2.2 No authentication
- There are no user accounts. Anyone who opens the page is "the player".
- *Fix:* university single sign-on (requires university approval) or a standard login provider.

### 2.3 Mission verification is simulated
See section 1. This is the biggest gap between the prototype and a real product.

### 2.4 Live events depend on an external service
- Live data comes from `https://events.towson.edu/api/2/events` (Towson's public Localist calendar). We did **not** review the calendar's terms of use for third-party apps.
- If the service is down, changes its format, or stops allowing browser requests (CORS), TigerQuest falls back to sample data. That fallback was tested by blocking the site.
- At most 300 events per week are loaded (3 pages × 100).
- *Fix:* ask the university for permission or an official feed, and cache events on a server.

### 2.5 Event location and category matching is approximate
- Locations are matched with keyword rules (`LOCATION_RULES` in `script.js`). For example, `"CA 3040"` → Center for the Arts. An unusual spelling may not match, and the event then appears as "Not on the TigerQuest map". Ambiguous locations are deliberately left off the map rather than guessed.
- Skill categories for live events are guessed from the calendar's event types, departments and titles (`CATEGORY_KEYWORDS`), and may be wrong.
- *Fix:* a maintained lookup table of official building codes, or using the calendar's own venue/place IDs.

### 2.6 Involved@TU is not integrated
| What we checked | Result |
|---|---|
| Public RSS feed `involved.towson.edu/events.rss` | Allows browser requests, but only covers about the **next 24 hours**. We found no documented way to request a full week. |
| JSON endpoint `/api/discovery/event/search` | Responds, but is **undocumented** and sends no CORS header, so **browsers block it**. Not used. |
| Official Campus Labs Engage API | Requires credentials issued to the institution, which can never go into frontend code. It would need a backend and university authorization. |

### 2.7 Limited campus coverage
- Only **11 buildings** are on the map. Residence halls, dining halls, SECU Arena, the Cyber Center, etc. are not.
- Building descriptions and services are intentionally general. **The team should verify them against official Towson pages before relying on them.**
- Hotspots are hand-traced polygons: close to the artwork but not pixel-perfect.

### 2.8 Pathfinding is simple
- The walking network is about 45 hand-placed points. Routes are reasonable, not real sidewalks.
- The construction cone is decorative, not an obstacle.
- Manual movement checks only the character's feet, so the sprite can visually overlap a building's edge.

### 2.9 Mobile usability
- Works on phones: one-column layout, tap buildings, and a details panel that slides up from the bottom.
- The map is small on a phone (about 350 px wide). Zoom helps, but there's no pinch-zoom or drag-to-pan.
- **Known cosmetic issue:** on phone widths above about 400 px, the cards below the map (Main Quest, search, categories) don't stretch to the full width. The cause is `align-items: start` on `.workspace` in `style.css`. The app still works.
- Tested only in emulated phone sizes, **not on a real phone**.

### 2.10 Accessibility
- **Done:** labeled hotspots, keyboard selection (Tab + Enter), visible focus outlines, states shown with icons and words (not color alone), reduced-motion support (the walk is faster and has no bounce).
- **Not done:** no screen-reader testing; the map itself is a picture, so its paths and visual details aren't described; global arrow-key handling on the Map tab means arrow keys move the character instead of scrolling a sidebar.

### 2.11 Scalability
- All buildings and missions are written by hand inside `script.js`. Adding a building means editing code.
- *Fix:* load content from an admin-managed data source.

### 2.12 Browser support
- Tested in Google Chrome (Windows). Edge, Firefox and Safari were not tested.

---

## 3. Uncertain items the team must confirm

| Item | Why it matters |
|---|---|
| **Origin and rights of `assets/towson-campus-map.png`** | The file's embedded C2PA content credentials say it was generated with **ChatGPT (OpenAI image generation)** on Nov 14, 2026 at 1:53 PM ET. Confirm this, disclose it as AI-generated, and review OpenAI's terms on publishing generated images. It shows a stylized, not survey-accurate, Towson layout. |
| **Terms of use of the events.towson.edu API** | The API is public and allows browser access, but we haven't reviewed whether third-party apps may display its data. |
| **Building descriptions** | Written to be general. Confirm details such as which programs are in Van Bokkelen Hall. The old prototype's "Career Center in Union 225" claim was removed because it couldn't be confirmed. |
| **License** | No license chosen yet. See the README. |

---

## 4. Future improvements (not built)

1. Real mission verification (QR check-in or organizer confirmation)
2. Accounts and a backend so progress is secure and synced
3. An authorized Involved@TU integration
4. More buildings, hours, and accessible routes
5. Event reminders and notifications
6. Usability study with Towson students to measure whether TigerQuest increases participation. **This has not been measured yet.**
