/* =====================================================================
   TigerQuest — script.js
   Plain JavaScript, no libraries. Sections:
     1. Game data (categories, buildings, missions, walking paths, sample events)
     2. Saving & loading (localStorage)
     3. XP and levels
     4. Map geometry helpers
     5. Pathfinding (Dijkstra's algorithm)
     6. Game loop: character movement, keyboard, camera zoom
     7. Map rendering & building selection
     8. Building detail panel & mission actions
     9. Happening This Week (events)
    10. Skills, Mission log and Progress screens
    11. Navigation, toast messages and startup
   ===================================================================== */
'use strict';

/* =====================================================================
   1. GAME DATA
   ===================================================================== */

// The seven skill categories. "all" is only used by the filter list.
const CATEGORIES = {
  all:           { name: 'All quests',    icon: '🌍', color: '#ffc637' },
  academic:      { name: 'Academics',     icon: '📚', color: '#2f9ea1' },
  career:        { name: 'Career',        icon: '💼', color: '#3f86d4' },
  communication: { name: 'Communication', icon: '💬', color: '#e39a22' },
  social:        { name: 'Community',     icon: '🤝', color: '#8d55cc' },
  leadership:    { name: 'Leadership',    icon: '🚩', color: '#e16a5b' },
  wellness:      { name: 'Wellness',      icon: '🌿', color: '#3f9e64' },
  creative:      { name: 'Creativity',    icon: '🎨', color: '#cc5f9f' }
};

const SKILL_DESCRIPTIONS = {
  academic: 'Research, study support and lifelong learning.',
  career: 'Explore opportunities and prepare for work.',
  communication: 'Practice speaking, writing and confidence.',
  social: 'Build friendships and campus connections.',
  leadership: 'Make a positive difference in your community.',
  wellness: 'Explore healthier, more active routines.',
  creative: 'Express yourself through arts and new ideas.'
};

// Size of the map picture in pixels. Every coordinate below uses this system.
const MAP_WIDTH = 1511;
const MAP_HEIGHT = 1041;

/*
  Each building:
  - area:  outline of the building in the picture, as [x, y] corners (used for the clickable hotspot
           and to stop the character from walking through the building)
  - door:  the spot where the character stops when travelling to this building
  - missions: real-world activities. "skills" says how much XP each category earns.
              A mission's total XP is the sum of its skill XP, so nothing is counted twice.
  Mission ids from the first prototype are kept so old saved progress still works.
*/
const BUILDINGS = [
  {
    id: 'burdick', name: 'Burdick Hall', abbr: 'BU', tagline: 'RECREATION', icon: '🏀', color: '#2f8f98',
    area: [[178,118],[205,55],[332,36],[388,66],[402,180],[382,207],[196,210],[176,196]],
    door: { x: 297, y: 282 },
    categories: ['wellness', 'social'],
    description: 'Home of Campus Recreation, with fitness spaces, pools and activity courts.',
    services: ['Fitness center', 'Pools', 'Activity courts', 'Rec programs & club sports info'],
    url: 'https://www.towson.edu/campus/landmarks/',
    missions: [
      { id: 'bur1', name: 'Try Something Active', desc: 'Participate in a recreational activity you have never tried.', skills: { wellness: 120 }, icon: '🏃' },
      { id: 'bur2', name: 'Find Your Team', desc: 'Explore a club sport or campus recreation group.', skills: { social: 60, wellness: 30 }, icon: '🏀' },
      { id: 'west2', name: 'Explore a Rec Space', desc: 'Visit a campus recreation space you have not used yet and learn what it offers.', skills: { wellness: 60 }, icon: '🧭' }
    ]
  },
  {
    id: 'liberal', name: 'College of Liberal Arts', abbr: 'LA', tagline: 'ACADEMIC CORE', icon: '📖', color: '#8d63c4',
    area: [[610,128],[698,92],[704,74],[958,46],[966,165],[642,216],[618,190]],
    door: { x: 842, y: 248 },
    categories: ['academic', 'communication'],
    description: 'The College of Liberal Arts building, with classrooms and department spaces for the humanities and social sciences.',
    services: ['Classrooms', 'Liberal arts departments', 'Faculty offices'],
    url: 'https://www.towson.edu/maps/',
    missions: [
      { id: 'lib1', name: 'Ask the Big Question', desc: 'Attend a talk or class discussion and ask a thoughtful question.', skills: { communication: 100 }, icon: '🎤' },
      { id: 'lib2', name: 'Find an Academic Event', desc: 'Discover and attend a department lecture or academic event.', skills: { academic: 90 }, icon: '🔎' }
    ]
  },
  {
    id: 'union', name: 'University Union', abbr: 'UU', tagline: 'CAMPUS HUB', icon: '🏛️', color: '#e0812f',
    area: [[348,385],[352,300],[392,288],[515,293],[522,330],[518,500],[350,500]],
    door: { x: 440, y: 584 },
    categories: ['social', 'leadership', 'career'],
    description: 'The student center: a hub for student organizations, dining, meeting rooms and campus events.',
    services: ['Student organizations', 'Dining', 'Meeting & event rooms', 'Campus store'],
    url: 'https://www.towson.edu/campus/landmarks/',
    missions: [
      { id: 'uni1', name: 'Career Quest: Resume Check', desc: 'Meet a Career Center coach or attend a resume review.', skills: { career: 150, communication: 50 }, icon: '💼' },
      { id: 'uni2', name: 'Join the Guild', desc: 'Attend a student organization meeting in real life.', skills: { social: 150 }, icon: '🤝' },
      { id: 'uni3', name: 'Lead the Way', desc: 'Volunteer for a leadership role or event responsibility.', skills: { leadership: 200, social: 50 }, icon: '🚩' },
      { id: 'west1', name: 'Make a New Connection', desc: 'Join a campus gathering and introduce yourself to someone new.', skills: { social: 100 }, icon: '👋' }
    ]
  },
  {
    id: 'hawkins', name: 'Hawkins Hall / Psychology Building', abbr: 'HH', tagline: 'ACADEMIC CORE', icon: '🧠', color: '#d95f86',
    area: [[612,340],[628,302],[790,300],[792,412],[612,416]],
    door: { x: 697, y: 505 },
    categories: ['academic', 'communication'],
    description: 'Hawkins Hall and the Psychology Building: classrooms, labs and offices, including the Department of Psychology.',
    services: ['Classrooms', 'Psychology labs', 'Faculty offices'],
    url: 'https://www.towson.edu/maps/',
    missions: [
      { id: 'haw1', name: 'Mind Explorer', desc: 'Attend a psychology talk, lab open house or academic presentation.', skills: { academic: 100 }, icon: '🧠' },
      { id: 'haw2', name: 'Office Hours Hero', desc: 'Visit a professor during office hours and ask a question about the course or field.', skills: { academic: 60, communication: 40 }, icon: '🙋' }
    ]
  },
  {
    id: 'lecture', name: 'Lecture Hall', abbr: 'LH', tagline: 'ACADEMIC CORE', icon: '📝', color: '#3f84cf',
    area: [[828,330],[844,318],[990,320],[1004,345],[1000,428],[830,428]],
    door: { x: 917, y: 496 },
    categories: ['academic', 'communication'],
    description: 'A shared teaching building with lecture rooms used by many departments.',
    services: ['Lecture rooms', 'Classes across majors', 'Presentations'],
    url: 'https://www.towson.edu/maps/',
    missions: [
      { id: 'lec1', name: 'Speak Up in Class', desc: 'Contribute a question or idea during a class discussion.', skills: { communication: 80 }, icon: '🙋' },
      { id: 'lec2', name: 'Learning Streak', desc: 'Attend a campus lecture and write down three takeaways.', skills: { academic: 120 }, icon: '📝' }
    ]
  },
  {
    id: 'cook', name: 'Cook Library / Media Center', abbr: 'CK/MC', tagline: 'LIBRARY', icon: '📚', color: '#d9a81f',
    area: [[1052,345],[1090,285],[1296,282],[1292,430],[1056,428]],
    door: { x: 1185, y: 508 },
    categories: ['academic', 'communication'],
    description: 'Albert S. Cook Library and the Media Center: research help, study spaces and academic support through the Academic Commons.',
    services: ['Research help', 'Study spaces', 'Tutoring', 'Writing support', 'Media & technology help'],
    url: 'https://libraries.towson.edu/using-the-libraries/building-directory',
    missions: [
      { id: 'cook1', name: 'Unlock Research Skills', desc: 'Ask a librarian a research question or attend a library research workshop.', skills: { academic: 130 }, icon: '🔬' },
      { id: 'cook2', name: 'Study Smarter', desc: 'Explore tutoring or academic coaching available in the library.', skills: { academic: 140 }, icon: '📚' },
      { id: 'cook3', name: 'Polish Your Writing', desc: 'Get writing feedback from a campus writing support resource.', skills: { communication: 120, academic: 40 }, icon: '✍️' }
    ]
  },
  {
    id: 'stephens', name: 'Stephens Hall', abbr: 'ST', tagline: 'CAMPUS LANDMARK', icon: '🕰️', color: '#8b5fc2',
    area: [[1200,560],[1215,535],[1362,526],[1386,560],[1386,662],[1204,662]],
    door: { x: 1300, y: 728 },
    categories: ['academic', 'social'],
    description: "One of Towson's most recognizable historic buildings, used for classrooms and offices.",
    services: ['Historic landmark', 'Classrooms', 'Offices'],
    url: 'https://www.towson.edu/campus/landmarks/',
    missions: [
      { id: 'ste1', name: 'Campus Historian', desc: 'Learn one interesting fact about a Towson campus landmark.', skills: { academic: 70 }, icon: '🕰️' },
      { id: 'ste2', name: 'Show a New Tiger Around', desc: 'Help another student get familiar with a campus location.', skills: { social: 110 }, icon: '🧭' }
    ]
  },
  {
    id: 'vanbokkelen', name: 'Van Bokkelen Hall', abbr: 'VB', tagline: 'COMMUNICATION', icon: '🎙️', color: '#2a9c86',
    area: [[968,632],[984,580],[1150,575],[1152,680],[970,686]],
    door: { x: 930, y: 655 },
    categories: ['communication', 'creative'],
    description: 'Van Bokkelen Hall hosts communication-focused programs, with classrooms and media spaces.',
    services: ['Communication classrooms', 'Media spaces', 'Faculty offices'],
    url: 'https://www.towson.edu/maps/',
    missions: [
      { id: 'psy1', name: 'Find Your Voice', desc: 'Practice a speech with a peer or a campus speaking-support resource.', skills: { communication: 180 }, icon: '🎙️' },
      { id: 'psy2', name: 'Take the Stage', desc: 'Give a real presentation in a class, club, or campus event.', skills: { communication: 200, leadership: 50 }, icon: '🎤' },
      { id: 'vb1', name: 'Media Maker', desc: 'Create a short video, podcast or story about something happening on campus.', skills: { creative: 100, communication: 50 }, icon: '🎬' }
    ]
  },
  {
    id: 'science', name: 'Science Complex', abbr: 'SC', tagline: 'STEM ZONE', icon: '🔬', color: '#3c78c9',
    area: [[985,778],[1010,755],[1180,750],[1198,775],[1196,852],[988,854]],
    door: { x: 942, y: 815 },
    categories: ['academic', 'career'],
    description: "Towson's science building, with teaching and research labs for STEM disciplines.",
    services: ['Science classrooms', 'Teaching & research labs', 'STEM learning'],
    url: 'https://www.towson.edu/maps/',
    missions: [
      { id: 'sci1', name: 'Explore STEM', desc: 'Find and attend a STEM talk, demonstration, or workshop.', skills: { academic: 160 }, icon: '🔬' },
      { id: 'sci2', name: 'Meet a Researcher', desc: 'Ask about a research project at an open campus event.', skills: { career: 120, academic: 60 }, icon: '🧪' }
    ]
  },
  {
    id: 'york', name: 'York Road Building', abbr: 'YR', tagline: 'EAST CAMPUS', icon: '💻', color: '#d65b8c',
    area: [[1004,930],[1020,905],[1182,903],[1194,925],[1192,978],[1004,978]],
    door: { x: 952, y: 962 },
    categories: ['career', 'academic'],
    description: 'The York Road Building (7800 York Road) holds university offices and classrooms on the east side of campus.',
    services: ['Classrooms', 'University offices', 'Meeting rooms'],
    url: 'https://www.towson.edu/maps/',
    missions: [
      { id: 'york1', name: 'Map Your Career Path', desc: 'Attend a career workshop or information session.', skills: { career: 150 }, icon: '🗺️' },
      { id: 'york2', name: 'Discover a New Office', desc: 'Visit a campus office you have never used and learn one way it can help you.', skills: { academic: 80 }, icon: '🚪' }
    ]
  },
  {
    id: 'arts', name: 'Center for the Arts', abbr: 'CA', tagline: 'CREATIVE CAMPUS', icon: '🎭', color: '#d6528a',
    area: [[118,825],[150,790],[198,762],[240,735],[362,735],[372,808],[356,896],[160,916],[124,882]],
    door: { x: 428, y: 835 },
    categories: ['creative', 'communication'],
    description: "Towson's arts hub, with theatres, concert halls and galleries for music, theatre, dance and visual art.",
    services: ['Performance spaces', 'Art galleries', 'Concert halls', 'Creative events'],
    url: 'https://www.towson.edu/campus/landmarks/',
    missions: [
      { id: 'art1', name: 'Experience Something New', desc: 'Attend a campus performance or exhibition.', skills: { creative: 130 }, icon: '🎟️' },
      { id: 'art2', name: 'Share Your Creativity', desc: 'Participate in a creative activity, audition or showcase.', skills: { creative: 100, communication: 60 }, icon: '🎨' }
    ]
  }
];

// Handy lookups built from the data above.
const BUILDING_BY_ID = {};
BUILDINGS.forEach(b => { BUILDING_BY_ID[b.id] = b; });

const ALL_MISSIONS = BUILDINGS.flatMap(b => b.missions.map(m => ({ ...m, buildingId: b.id, buildingName: b.name })));
const MISSION_BY_ID = {};
ALL_MISSIONS.forEach(m => { MISSION_BY_ID[m.id] = m; });

/*
  Walking paths: a small hand-made graph.
  WAYPOINTS are spots on the illustrated paths and lawns.
  PATH_LINKS lists which waypoints are connected by a walkable straight line.
  (Open the app with "#debug" at the end of the URL to see them drawn on the map.)
*/
const WAYPOINTS = {
  a:{x:60,y:290},   b:{x:200,y:288},  c:{x:330,y:288},  d:{x:470,y:262},  e:{x:575,y:258},
  f:{x:805,y:250},  g:{x:1027,y:255}, h:{x:1200,y:250}, i:{x:1350,y:255}, j:{x:1470,y:290},
  k:{x:330,y:440},  l:{x:330,y:610},  m:{x:565,y:505},  n:{x:808,y:505},  o:{x:1007,y:512},
  p:{x:1185,y:515}, q:{x:1440,y:490}, r:{x:950,y:620},  s:{x:1176,y:610}, sa:{x:1180,y:700},
  t:{x:1300,y:735}, u:{x:945,y:810},  v:{x:1225,y:820}, w:{x:950,y:960},  x:{x:1240,y:960},
  y:{x:1440,y:760}, z:{x:820,y:660},  aa:{x:620,y:640}, ab:{x:470,y:660}, ac:{x:440,y:830},
  ad:{x:620,y:850}, ae:{x:800,y:900}, af:{x:250,y:700}, ag:{x:80,y:640},  ah:{x:60,y:960},
  ai:{x:280,y:1000},aj:{x:500,y:120}, ak:{x:1030,y:120},al:{x:1300,y:120},am:{x:100,y:110},
  ao:{x:809,y:370}, ap:{x:1027,y:380},aq:{x:570,y:400}
};
const PATH_LINKS = [
  ['a','b'],['b','c'],['c','d'],['d','e'],['e','f'],['f','g'],['g','h'],['h','i'],['i','j'],
  ['c','k'],['k','l'],['e','aq'],['aq','m'],['m','n'],['n','o'],['o','p'],['p','q'],['j','q'],
  ['f','ao'],['ao','n'],['g','ap'],['ap','o'],['o','r'],['r','u'],['u','w'],['p','s'],['s','sa'],
  ['sa','t'],['sa','v'],['t','v'],['v','x'],['t','y'],['q','y'],['y','x'],['r','z'],
  ['z','aa'],['aa','m'],['aa','ab'],['ab','l'],['ab','ac'],['ac','ad'],['ad','ae'],['ae','u'],
  ['ae','w'],['l','af'],['af','ag'],['ag','a'],['ag','ah'],['ah','ai'],['ai','ac'],
  ['d','aj'],['am','a'],['am','b'],['g','ak'],['ak','al'],['al','i'],['z','n']
];

// Turn the list of links into a "neighbors" table: { a: ['b','ag','am'], ... }
const NEIGHBORS = {};
Object.keys(WAYPOINTS).forEach(id => { NEIGHBORS[id] = []; });
PATH_LINKS.forEach(([from, to]) => { NEIGHBORS[from].push(to); NEIGHBORS[to].push(from); });

const PLAYER_START = { x: 700, y: 640 };   // open lawn near the construction cone
const AUTO_WALK_SPEED = 300;               // map pixels per second when walking a route
const MANUAL_WALK_SPEED = 240;             // map pixels per second when using the keyboard

/*
  SAMPLE EVENTS — clearly labeled demo data, NOT real Towson events.
  "day" is 0 for Monday ... 6 for Sunday. Dates are filled in for the current week
  when the app starts, so the demo never goes out of date.
*/
const SAMPLE_EVENT_TEMPLATES = [
  { key: 'speaking',   day: 0, start: '14:00', end: '15:00', buildingId: 'lecture',     categories: ['communication'],           title: 'Public Speaking Practice Workshop', host: 'Sample host', description: 'Practice a short talk in a friendly group and get feedback on delivery and confidence.' },
  { key: 'writing',    day: 0, start: '11:00', end: '13:00', buildingId: 'liberal',     categories: ['communication','academic'],title: 'Writing Feedback Pop-Up', host: 'Sample host', description: 'Bring a draft and get quick tips on structure, clarity and citations.' },
  { key: 'orgfair',    day: 1, start: '12:00', end: '14:00', buildingId: 'union',       categories: ['social','leadership'],     title: 'Student Organization Involvement Fair', host: 'Sample host', description: 'Meet student organizations, learn how to join, and find a community that fits you.' },
  { key: 'resume',     day: 1, start: '10:00', end: '12:00', buildingId: 'york',        categories: ['career'],                  title: 'Resume Review Drop-In', host: 'Sample host', description: 'Bring your resume for a quick review and leave with a list of improvements.' },
  { key: 'research',   day: 2, start: '15:00', end: '16:00', buildingId: 'cook',        categories: ['academic'],                title: 'Library Research Tools Workshop', host: 'Sample host', description: 'Learn how to find scholarly sources and use library databases for your next paper.' },
  { key: 'rec',        day: 2, start: '19:00', end: '21:00', buildingId: 'burdick',     categories: ['wellness','social'],       title: 'Open Rec Night: Try a New Sport', host: 'Sample host', description: 'Drop in, try a sport you have never played, and meet other students.' },
  { key: 'psychtalk',  day: 2, start: '12:30', end: '13:30', buildingId: 'hawkins',     categories: ['academic'],                title: 'Psychology Speaker Series', host: 'Sample host', description: 'A short talk on how habits form, followed by Q&A.' },
  { key: 'artwalk',    day: 3, start: '17:00', end: '18:30', buildingId: 'arts',        categories: ['creative'],                title: 'Student Art Exhibition Walkthrough', host: 'Sample host', description: 'Tour a student exhibition and hear artists talk about their work.' },
  { key: 'posters',    day: 3, start: '13:00', end: '15:00', buildingId: 'science',     categories: ['academic','career'],       title: 'Undergraduate Research Poster Session', host: 'Sample host', description: 'See student research projects and ask how to get involved in a lab.' },
  { key: 'meetings',   day: 4, start: '16:00', end: '17:00', buildingId: 'union',       categories: ['leadership'],              title: 'Leadership Workshop: Running Great Meetings', host: 'Sample host', description: 'Learn simple techniques for planning agendas and leading productive meetings.' },
  { key: 'podcast',    day: 4, start: '14:00', end: '15:00', buildingId: 'vanbokkelen', categories: ['creative','communication'],title: 'Podcast & Media Lab Intro', host: 'Sample host', description: 'An introduction to recording and editing a short podcast episode.' },
  { key: 'history',    day: 5, start: '11:00', end: '12:00', buildingId: 'stephens',    categories: ['social'],                  title: 'Campus History Walk', host: 'Sample host', description: 'A relaxed walk that starts at a historic campus landmark.' },
  { key: 'watchparty', day: 5, start: '19:00', end: '21:00', buildingId: null, location: 'SECU Arena (not on this map)', categories: ['social'], title: 'Tigers Game Watch Party', host: 'Sample host', description: 'Cheer on the Tigers with other students. Example of an off-map event.' },
  { key: 'panel',      day: 6, start: '18:00', end: '19:00', buildingId: null, location: 'Online (virtual)', categories: ['career'], title: 'Virtual Alumni Career Panel', host: 'Sample host', description: 'Alumni share how they found internships and first jobs. Example of an online event.' }
];

// Official Towson calendar (Localist). Its public API allows browser requests (CORS: *).
const LIVE_EVENTS_API = 'https://events.towson.edu/api/2/events';
const OFFICIAL_CALENDAR_URL = 'https://events.towson.edu/';

/* =====================================================================
   2. SAVING & LOADING (localStorage)
   Everything is stored in ONE object under one key:
   {
     version: 2,
     missionStates: { uni1: 'verified', cook2: 'planned', ... },  // missing = "available"
     savedEvents:   [ {id, title, date, ...}, ... ],               // "My Quests"
     summary:       { totalXp, level, skillXp }                    // convenience copy, recalculated on load
   }
   ===================================================================== */
const STORAGE_KEY = 'tigerquest-save-v2';
const OLD_STORAGE_KEY = 'tigerquest-prototype-v1'; // format used by the first prototype
const MISSION_STATES = ['available', 'planned', 'self-reported', 'verified'];

function createEmptySave() {
  return { version: 2, missionStates: {}, savedEvents: [] };
}

// Keep only data we recognise, so a damaged save can never break the app.
function cleanSave(data) {
  const save = createEmptySave();
  if (!data || typeof data !== 'object') return save;
  const states = data.missionStates && typeof data.missionStates === 'object' ? data.missionStates : {};
  Object.keys(states).forEach(id => {
    if (MISSION_BY_ID[id] && MISSION_STATES.includes(states[id]) && states[id] !== 'available') {
      save.missionStates[id] = states[id];
    }
  });
  if (Array.isArray(data.savedEvents)) {
    save.savedEvents = data.savedEvents.filter(ev => ev && typeof ev.id === 'string' && typeof ev.title === 'string');
  }
  return save;
}

// Old format: { completed: ['uni1', 'cook2'] }  ->  those missions become "verified".
function migrateFromVersion1(oldData) {
  const save = createEmptySave();
  if (oldData && Array.isArray(oldData.completed)) {
    oldData.completed.forEach(id => { if (MISSION_BY_ID[id]) save.missionStates[id] = 'verified'; });
  }
  return save;
}

function loadSave() {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) return cleanSave(JSON.parse(current));
    const old = localStorage.getItem(OLD_STORAGE_KEY);
    if (old) {
      const migrated = migrateFromVersion1(JSON.parse(old));
      writeSave(migrated); // store in the new format; the old key is left untouched
      return migrated;
    }
  } catch (error) {
    console.warn('TigerQuest: saved data was unreadable, starting fresh.', error);
  }
  return createEmptySave();
}

function writeSave(save) {
  try {
    const levelInfo = getLevelInfo(getTotalXp(save));
    const skillXp = {};
    Object.keys(SKILL_DESCRIPTIONS).forEach(c => { skillXp[c] = getSkillXp(c, save); });
    const toStore = { ...save, summary: { totalXp: levelInfo.totalXp, level: levelInfo.level, skillXp } };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch (error) {
    // Private windows or blocked storage: the app still works, progress just isn't kept.
    console.warn('TigerQuest: could not save progress.', error);
  }
}

let save = createEmptySave(); // filled in by init()
function saveProgress() { writeSave(save); }

function getMissionState(missionId) {
  return save.missionStates[missionId] || 'available';
}

/* =====================================================================
   3. XP AND LEVELS
   - Only VERIFIED missions give XP. Planning or self-reporting gives none.
   - Total XP is recalculated from the mission states every time,
     so the same mission can never be counted twice.
   ===================================================================== */
function missionXp(mission) {
  return Object.values(mission.skills).reduce((sum, xp) => sum + xp, 0);
}

function getTotalXp(fromSave = save) {
  return ALL_MISSIONS
    .filter(m => fromSave.missionStates[m.id] === 'verified')
    .reduce((sum, m) => sum + missionXp(m), 0);
}

function getSkillXp(category, fromSave = save) {
  return ALL_MISSIONS
    .filter(m => fromSave.missionStates[m.id] === 'verified')
    .reduce((sum, m) => sum + (m.skills[category] || 0), 0);
}

function getMaxSkillXp(category) {
  return ALL_MISSIONS.reduce((sum, m) => sum + (m.skills[category] || 0), 0);
}

// XP needed to go from `level` to the next level (same numbers as the first prototype):
// level 1 -> 2 needs 350 XP, after that each level needs 350 + 90 x level.
function xpNeededForNextLevel(level) {
  return level === 1 ? 350 : 350 + level * 90;
}

// Walk up the levels, subtracting the cost of each one, until the XP runs out.
function getLevelInfo(totalXp) {
  let level = 1;
  let xpLeft = totalXp;
  while (xpLeft >= xpNeededForNextLevel(level)) {
    xpLeft -= xpNeededForNextLevel(level);
    level++;
  }
  return { level, xpIntoLevel: xpLeft, xpForThisLevel: xpNeededForNextLevel(level), totalXp };
}

/* =====================================================================
   4. MAP GEOMETRY HELPERS
   ===================================================================== */
function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Classic "ray casting" test: draw a line to the right of the point and count how many
// polygon edges it crosses. An odd count means the point is inside.
function isPointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const crosses = (yi > point.y) !== (yj > point.y) &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

function isInsideAnyBuilding(point) {
  return BUILDINGS.some(b => isPointInPolygon(point, b.area));
}

function isWalkable(point) {
  const insideMap = point.x >= 12 && point.x <= MAP_WIDTH - 12 && point.y >= 40 && point.y <= MAP_HEIGHT - 8;
  return insideMap && !isInsideAnyBuilding(point);
}

// A straight line is "clear" if no point along it (checked every 8 pixels) is inside a building.
function isSegmentClear(a, b) {
  const steps = Math.max(1, Math.ceil(distance(a, b) / 8));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    if (isInsideAnyBuilding({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })) return false;
  }
  return true;
}

function polygonBounds(polygon) {
  const xs = polygon.map(p => p[0]);
  const ys = polygon.map(p => p[1]);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}

/* =====================================================================
   5. PATHFINDING — Dijkstra's shortest-path algorithm
   1. If the destination can be reached in a straight line, just walk there.
   2. Otherwise add two temporary nodes, START (the player) and END (the destination),
      connected to every waypoint they can "see" without crossing a building.
   3. Dijkstra: repeatedly pick the unvisited node with the smallest known distance,
      and try to improve the distance of each of its neighbours through it.
      When END is picked, we follow the "previous" links backwards to get the route.
   With ~45 nodes this takes well under a millisecond.
   ===================================================================== */
function findPath(from, to) {
  if (isSegmentClear(from, to)) return [to];

  const points = { ...WAYPOINTS, START: from, END: to };
  const waypointIds = Object.keys(WAYPOINTS);

  function neighborsOf(id) {
    if (id === 'START') return waypointIds.filter(w => isSegmentClear(from, WAYPOINTS[w]));
    if (id === 'END') return [];
    const list = [...NEIGHBORS[id]];
    if (isSegmentClear(WAYPOINTS[id], to)) list.push('END');
    return list;
  }

  const shortest = {};   // best known distance from START to each node
  const previous = {};   // which node we came from on that best route
  const unvisited = new Set(Object.keys(points));
  unvisited.forEach(id => { shortest[id] = Infinity; });
  shortest.START = 0;

  while (unvisited.size > 0) {
    // Pick the closest unvisited node (a simple loop is fine for a small graph).
    let current = null;
    unvisited.forEach(id => { if (current === null || shortest[id] < shortest[current]) current = id; });
    if (shortest[current] === Infinity || current === 'END') break;
    unvisited.delete(current);

    neighborsOf(current).forEach(next => {
      if (!unvisited.has(next)) return;
      const viaCurrent = shortest[current] + distance(points[current], points[next]);
      if (viaCurrent < shortest[next]) {
        shortest[next] = viaCurrent;
        previous[next] = current;
      }
    });
  }

  if (shortest.END === Infinity) return [to]; // no route found: walk straight as a fallback

  // Rebuild the route by walking backwards from END to START.
  const route = [];
  for (let id = 'END'; id !== 'START'; id = previous[id]) route.unshift(points[id]);
  return route;
}

/* =====================================================================
   6. GAME LOOP — character movement, keyboard input, camera zoom
   requestAnimationFrame() calls gameLoop() about 60 times per second.
   Each frame we look at the keyboard, move the player a little, and redraw.
   Movement uses "pixels per second × seconds since last frame", so speed is
   the same on fast and slow computers.
   ===================================================================== */
const player = { x: PLAYER_START.x, y: PLAYER_START.y, route: [], facing: 1, walking: false };
const keysHeld = new Set();
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ZOOM_LEVELS = [1, 1.5, 2.2];
let zoomIndex = 0;
let lastFrameTime = null;
let lastViewBox = '';

const KEY_DIRECTIONS = {
  ArrowUp: 'up', w: 'up', W: 'up',
  ArrowDown: 'down', s: 'down', S: 'down',
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right'
};

// Clicking a building (or an empty spot) replaces any previous route with a new one.
function walkTo(destination) {
  player.route = findPath({ x: player.x, y: player.y }, destination);
  hideMapHints();
}

// The "click a building" and "WASD" hints fade out once the player starts exploring.
function hideMapHints() {
  $('#mapStage').classList.add('explored');
}

function getKeyboardDirection() {
  let dx = 0, dy = 0;
  if (keysHeld.has('left')) dx -= 1;
  if (keysHeld.has('right')) dx += 1;
  if (keysHeld.has('up')) dy -= 1;
  if (keysHeld.has('down')) dy += 1;
  if (dx !== 0 && dy !== 0) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; } // same speed diagonally
  return { dx, dy };
}

// Try to move; if blocked by a building, try sliding along just one axis.
function moveManually(dx, dy, seconds) {
  const step = MANUAL_WALK_SPEED * seconds;
  const options = [
    { x: player.x + dx * step, y: player.y + dy * step },
    { x: player.x + dx * step, y: player.y },
    { x: player.x, y: player.y + dy * step }
  ];
  const next = options.find(p => (p.x !== player.x || p.y !== player.y) && isWalkable(p));
  if (!next) return false;
  if (next.x !== player.x) player.facing = next.x > player.x ? 1 : -1;
  player.x = next.x; player.y = next.y;
  return true;
}

// Move toward the next point of the route; remove points as we reach them.
function followRoute(seconds) {
  // With "reduce motion" turned on, the walk is shorter (faster) and has no bounce.
  let budget = AUTO_WALK_SPEED * (prefersReducedMotion ? 2.5 : 1) * seconds;
  while (budget > 0 && player.route.length > 0) {
    const target = player.route[0];
    const remaining = distance(player, target);
    if (target.x !== player.x) player.facing = target.x > player.x ? 1 : -1;
    if (remaining <= budget) {
      player.x = target.x; player.y = target.y;
      player.route.shift();
      budget -= remaining;
    } else {
      player.x += ((target.x - player.x) / remaining) * budget;
      player.y += ((target.y - player.y) / remaining) * budget;
      budget = 0;
    }
  }
  return true;
}

function drawPlayer(now) {
  // A little bounce while walking and a slight lean in the walking direction.
  const animate = player.walking && !prefersReducedMotion;
  const bounce = animate ? -Math.abs(Math.sin(now / 85)) * 5 : 0;
  const lean = animate ? player.facing * 5 : 0;
  $('#playerSprite').setAttribute('transform', `translate(${player.x.toFixed(1)} ${(player.y - 8).toFixed(1)})`);
  $('#playerBody').setAttribute('transform', `translate(0 ${bounce.toFixed(1)}) rotate(${lean}) scale(1.05)`);
}

// Zooming changes the SVG "viewBox" (the part of the map that is visible).
// When zoomed in, the camera follows the player.
function updateCamera() {
  const zoom = ZOOM_LEVELS[zoomIndex];
  const width = MAP_WIDTH / zoom;
  const height = MAP_HEIGHT / zoom;
  const left = clamp(player.x - width / 2, 0, MAP_WIDTH - width);
  const top = clamp(player.y - height / 2, 0, MAP_HEIGHT - height);
  const viewBox = `${left.toFixed(1)} ${top.toFixed(1)} ${width.toFixed(1)} ${height.toFixed(1)}`;
  if (viewBox !== lastViewBox) {
    $('#campusMap').setAttribute('viewBox', viewBox);
    lastViewBox = viewBox;
  }
}

function gameLoop(now) {
  const seconds = lastFrameTime === null ? 0 : Math.min(0.05, (now - lastFrameTime) / 1000);
  lastFrameTime = now;

  const { dx, dy } = getKeyboardDirection();
  if (dx !== 0 || dy !== 0) {
    player.route = [];                       // keyboard always cancels automatic walking
    player.walking = moveManually(dx, dy, seconds);
  } else if (player.route.length > 0) {
    player.walking = followRoute(seconds);
  } else {
    player.walking = false;
  }

  drawPlayer(now);
  updateCamera();
  requestAnimationFrame(gameLoop);
}

function setupKeyboard() {
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeDetailSheet();
    const direction = KEY_DIRECTIONS[event.key];
    if (!direction || currentTab !== 'map' || event.ctrlKey || event.metaKey || event.altKey) return;
    const tag = document.activeElement ? document.activeElement.tagName : '';
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return; // don't steal typing
    event.preventDefault(); // stop arrow keys from scrolling the page
    keysHeld.add(direction);
    hideMapHints();
  });
  document.addEventListener('keyup', event => {
    const direction = KEY_DIRECTIONS[event.key];
    if (direction) keysHeld.delete(direction);
  });
  window.addEventListener('blur', () => keysHeld.clear()); // avoid "stuck" keys
}

// Convert a mouse/touch position on screen into map coordinates (works at any size or zoom).
function screenToMap(clientX, clientY) {
  const svg = $('#campusMap');
  const point = svg.createSVGPoint();
  point.x = clientX; point.y = clientY;
  return point.matrixTransform(svg.getScreenCTM().inverse());
}

/* =====================================================================
   7. MAP RENDERING & BUILDING SELECTION
   ===================================================================== */
let currentCategory = 'all';
let selectedBuildingId = 'union';
let selectedEventId = null;
let currentTab = 'map';
let journalFilter = 'all';

const $ = selector => document.querySelector(selector);
const escapeHTML = text => String(text ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));
const pointsAttr = polygon => polygon.map(p => p.join(',')).join(' ');
const isPhoneLayout = () => window.matchMedia('(max-width: 760px)').matches;

// Transparent SVG polygons drawn on top of the picture make each building clickable.
function renderHotspots() {
  $('#hotspots').innerHTML = BUILDINGS.map(b => `
    <g class="hotspot" role="button" tabindex="0" data-building="${b.id}" aria-label="${escapeHTML(b.name)} (${b.abbr})">
      <title>${escapeHTML(b.name)} (${b.abbr})</title>
      <polygon class="hit" points="${pointsAttr(b.area)}"></polygon>
    </g>`).join('');

  document.querySelectorAll('.hotspot').forEach(el => {
    el.addEventListener('click', event => {
      event.stopPropagation();
      selectedEventId = null;
      selectBuilding(el.dataset.building, { walk: true, openSheet: true });
    });
    el.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectedEventId = null;
        selectBuilding(el.dataset.building, { walk: true, openSheet: true });
      }
    });
  });
  renderMapState();
}

function getFilteredBuildings() {
  const query = $('#searchBox').value.trim().toLowerCase();
  return BUILDINGS.filter(b => {
    const inCategory = currentCategory === 'all' || b.categories.includes(currentCategory) ||
      b.missions.some(m => m.skills[currentCategory]);
    const searchable = [b.name, b.abbr, b.description, b.services.join(' '), ...b.missions.map(m => m.name)].join(' ').toLowerCase();
    return inCategory && (!query || searchable.includes(query));
  });
}

// Update which hotspot is selected and which ones are faded by the filters.
function renderMapState() {
  const visibleIds = new Set(getFilteredBuildings().map(b => b.id));
  document.querySelectorAll('.hotspot').forEach(el => {
    const id = el.dataset.building;
    const matches = visibleIds.has(id);
    el.classList.toggle('selected', id === selectedBuildingId);
    el.classList.toggle('faded', !matches);
    const b = BUILDING_BY_ID[id];
    el.setAttribute('aria-label', `${b.name} (${b.abbr})${matches ? '' : ' — not in current filter'}${id === selectedBuildingId ? ' — selected' : ''}`);
  });
  $('#buildingCount').textContent = visibleIds.size + ' spots';
}

// Small "📅 3" badges show how many events a building has this week.
function renderEventBadges() {
  const counts = {};
  getActiveEvents().forEach(ev => { if (ev.buildingId) counts[ev.buildingId] = (counts[ev.buildingId] || 0) + 1; });
  $('#eventBadges').innerHTML = BUILDINGS.filter(b => counts[b.id]).map(b => {
    const box = polygonBounds(b.area);
    const x = box.minX - 14, y = box.minY - 16;
    return `<g class="event-badge" transform="translate(${x} ${y})" aria-hidden="true">
      <rect width="66" height="34" rx="11"></rect>
      <text x="33" y="24" text-anchor="middle">📅 ${counts[b.id]}</text>
    </g>`;
  }).join('');
}

// Draws waypoints and links when the URL ends in #debug. Red links would cross a building.
function renderDebugLayer() {
  if (!location.hash.includes('debug')) return;
  let svg = '';
  PATH_LINKS.forEach(([a, b]) => {
    const ok = isSegmentClear(WAYPOINTS[a], WAYPOINTS[b]);
    svg += `<line x1="${WAYPOINTS[a].x}" y1="${WAYPOINTS[a].y}" x2="${WAYPOINTS[b].x}" y2="${WAYPOINTS[b].y}" stroke="${ok ? '#1d4ed8' : '#ff0000'}" stroke-width="${ok ? 3 : 6}" opacity=".7"/>`;
  });
  Object.entries(WAYPOINTS).forEach(([id, p]) => {
    svg += `<circle cx="${p.x}" cy="${p.y}" r="7" fill="#1d4ed8"/><text x="${p.x + 9}" y="${p.y - 6}" font-size="16" font-weight="900" fill="#0b1f4d">${id}</text>`;
  });
  BUILDINGS.forEach(b => {
    svg += `<polygon points="${pointsAttr(b.area)}" fill="rgba(255,0,0,.15)" stroke="#d00" stroke-width="2"/>`;
    svg += `<circle cx="${b.door.x}" cy="${b.door.y}" r="9" fill="${isWalkable(b.door) ? '#16a34a' : '#ff0000'}" stroke="white" stroke-width="3"/>`;
  });
  $('#debugLayer').innerHTML = svg;
  $('#debugLayer').style.pointerEvents = 'none';
}

function selectBuilding(id, options = {}) {
  const building = BUILDING_BY_ID[id];
  if (!building) return;
  selectedBuildingId = id;
  if (currentTab !== 'map') setTab('map');
  // On desktop the right sidebar scrolls on its own: start a new building at the top.
  if (!isPhoneLayout()) $('#detailSheet').scrollTop = 0;
  renderMapState();
  renderDetails();
  if (options.walk) walkTo(building.door);
  if (options.openSheet) openDetailSheet();
}

function openDetailSheet() {
  if (isPhoneLayout()) $('#detailSheet').classList.add('sheet-open');
}
function closeDetailSheet() {
  $('#detailSheet').classList.remove('sheet-open');
}

/* =====================================================================
   8. BUILDING DETAIL PANEL & MISSION ACTIONS
   ===================================================================== */
const STATE_LABELS = {
  available: '○ Available',
  planned: '📌 Planned',
  'self-reported': '✋ Self-reported — awaiting verification',
  verified: '✅ Verified'
};

function skillSplitText(mission) {
  return Object.entries(mission.skills).map(([c, xp]) => `${CATEGORIES[c].icon} ${CATEGORIES[c].name} +${xp}`).join(' · ');
}

function missionCardHTML(mission) {
  const state = getMissionState(mission.id);
  const xp = missionXp(mission);
  let buttons;
  if (state === 'verified') {
    buttons = `<button class="mission-action full" disabled>✓ Verified · +${xp} XP earned</button>`;
  } else {
    const planButton = state === 'self-reported'
      ? ''
      : `<button class="mission-action secondary" data-mission-action="plan" data-mission="${mission.id}" aria-pressed="${state === 'planned'}">${state === 'planned' ? '📌 Planned (undo)' : '📌 Plan it'}</button>`;
    const reportButton = state === 'self-reported'
      ? `<button class="mission-action secondary" disabled>✋ Reported</button>`
      : `<button class="mission-action secondary" data-mission-action="report" data-mission="${mission.id}">✋ I did this</button>`;
    buttons = planButton + reportButton +
      `<button class="mission-action full" data-mission-action="verify" data-mission="${mission.id}">⚡ Simulate verified completion</button>`;
  }
  return `<article class="mission ${state}">
    <div class="mission-row">
      <span class="mission-symbol" aria-hidden="true">${state === 'verified' ? '✅' : mission.icon}</span>
      <div class="mission-copy">
        <div class="mission-name">${escapeHTML(mission.name)}</div>
        <p class="mission-desc">${escapeHTML(mission.desc)}</p>
        <div class="skill-split">${skillSplitText(mission)}</div>
        <span class="state-pill ${state}">${STATE_LABELS[state]}</span>
      </div>
      <span class="xp-label">+${xp} XP</span>
    </div>
    <div class="mission-buttons">${buttons}</div>
  </article>`;
}

function miniEventHTML(ev) {
  const saved = isEventSaved(ev.id);
  return `<article class="mini-event ${ev.id === selectedEventId ? 'highlight event-card' : ''}" data-event-card="${escapeHTML(ev.id)}">
    <strong>${escapeHTML(ev.title)}</strong>
    <div class="event-meta"><span>🗓️ ${formatEventWhen(ev, nextDateOfEvent(ev) || ev.date)}</span><span class="source-badge ${ev.source}">${ev.source === 'live' ? 'LIVE' : 'SAMPLE'}</span></div>
    <div class="event-buttons">
      <button class="mini-btn" data-save-event="${escapeHTML(ev.id)}" aria-pressed="${saved}">${saved ? '★ In My Quests' : '☆ Add to My Quests'}</button>
      <a class="mini-btn" href="${escapeHTML(ev.url)}" target="_blank" rel="noopener noreferrer">${ev.source === 'live' ? 'Event page ↗' : 'Official calendar ↗'}</a>
    </div>
  </article>`;
}

function renderDetails() {
  const b = BUILDING_BY_ID[selectedBuildingId];
  if (!b) return;
  $('#detailArt').style.background = `linear-gradient(125deg, ${b.color}, #1c3845)`;
  $('#detailIcon').textContent = b.icon;
  $('#detailCode').textContent = `${b.tagline} · ${b.abbr}`;
  $('#detailName').textContent = b.name;
  $('#detailDesc').textContent = b.description;
  $('#detailCategories').innerHTML = b.categories.map(c =>
    `<span class="chip" style="border-color:${CATEGORIES[c].color}88">${CATEGORIES[c].icon} ${CATEGORIES[c].name}</span>`).join('');
  $('#detailServices').innerHTML = b.services.map(s => `<span class="service">${escapeHTML(s)}</span>`).join('');

  // Events at this building (plus the selected event, if it came from another source).
  // Upcoming events first, then the ones that already happened this week.
  let events = getActiveEvents().filter(ev => ev.buildingId === b.id)
    .sort((x, y) => (nextDateOfEvent(x) ? 0 : 1) - (nextDateOfEvent(y) ? 0 : 1));
  const selected = findEventById(selectedEventId);
  if (selected && selected.buildingId === b.id && !events.some(ev => ev.id === selected.id)) events.unshift(selected);
  if (selected) events = [selected, ...events.filter(ev => ev.id !== selected.id)];
  $('#detailEventCount').textContent = events.length ? `${events.length} this week` : '';
  $('#detailEvents').innerHTML = events.length
    ? events.slice(0, 4).map(miniEventHTML).join('') +
      (events.length > 4 ? `<button class="mini-btn" data-goto-week="${b.id}">See all ${events.length} in This Week →</button>` : '')
    : '<div class="empty">No events listed here this week.</div>';

  const verifiedHere = b.missions.filter(m => getMissionState(m.id) === 'verified').length;
  $('#detailMissionCount').textContent = `${verifiedHere} / ${b.missions.length} verified`;
  $('#detailMissions').innerHTML = b.missions.map(missionCardHTML).join('');
  $('#officialLink').href = b.url;

  const highlighted = document.querySelector('#detailEvents .highlight');
  if (highlighted) highlighted.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
}

// One click handler for all mission buttons anywhere on the page ("event delegation").
function handleMissionAction(missionId, action) {
  const mission = MISSION_BY_ID[missionId];
  if (!mission) return;
  const state = getMissionState(missionId);

  if (action === 'plan') {
    if (state === 'planned') delete save.missionStates[missionId];
    else if (state === 'available') save.missionStates[missionId] = 'planned';
    showToast(state === 'planned' ? 'REMOVED FROM PLAN' : 'MISSION PLANNED 📌', mission.name + ' · Planning does not give XP.', '📌');
  } else if (action === 'report') {
    if (state === 'verified') return;
    save.missionStates[missionId] = 'self-reported';
    showToast('SELF-REPORTED ✋', 'Waiting for verification — XP is awarded once verified.', '✋');
  } else if (action === 'verify') {
    if (state === 'verified') return; // prevents earning the same XP twice
    const levelBefore = getLevelInfo(getTotalXp()).level;
    save.missionStates[missionId] = 'verified';
    const levelAfter = getLevelInfo(getTotalXp()).level;
    showToast(`MISSION VERIFIED! +${missionXp(mission)} XP`,
      levelAfter > levelBefore ? `🎉 LEVEL UP! You reached level ${levelAfter}.` : `${mission.name} · (verification simulated for the demo)`, '🏆');
  }
  saveProgress();
  updateAll();
}

/* =====================================================================
   9. HAPPENING THIS WEEK
   - The week runs Monday–Sunday in the America/New_York time zone.
   - Dates are stored as "YYYY-MM-DD" text and times as "HH:MM" (New York time),
     which avoids time-zone conversion bugs.
   - On startup we try the official calendar's public API. If it fails (offline, blocked),
     the clearly-labeled sample events are used instead.
   ===================================================================== */
let eventSource = 'demo';         // which list is shown: 'demo' or 'live'
let liveStatus = 'loading';       // 'loading' | 'ok' | 'empty' | 'failed'
let userPickedSource = false;     // if the user chose a source, don't switch automatically
let liveEvents = [];
let sampleEvents = [];
let eventCategoryFilter = 'all';
let eventDayFilter = 'all';
let week = null;

function todayInNewYork() {
  // 'en-CA' formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

function addDays(dateText, days) {
  const date = new Date(dateText + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getCurrentWeek() {
  const today = todayInNewYork();
  const weekday = new Date(today + 'T12:00:00Z').getUTCDay(); // 0 = Sunday
  const monday = addDays(today, -((weekday + 6) % 7));
  const days = [0, 1, 2, 3, 4, 5, 6].map(i => addDays(monday, i));
  return { today, monday, sunday: days[6], days };
}

function formatDay(dateText, style = 'short') {
  return new Date(dateText + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: style, month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function formatTime(timeText) {
  if (!timeText) return '';
  let [hours, minutes] = timeText.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

// The next day (today or later) an event happens this week, or null if it is over.
function nextDateOfEvent(ev) {
  return (ev.dates || [ev.date]).find(d => d >= week.today) || null;
}

function formatEventWhen(ev, shownDate = ev.date) {
  const time = ev.allDay ? 'All day' : formatTime(ev.startTime) + (ev.endTime ? ' – ' + formatTime(ev.endTime) : '');
  const otherDays = (ev.dates || [ev.date]).length - 1;
  const extra = otherDays > 0 ? ` (on ${otherDays + 1} days this week)` : '';
  return `${formatDay(shownDate)} · ${time}${extra}`;
}

function buildSampleEvents() {
  return SAMPLE_EVENT_TEMPLATES.map(t => {
    const date = week.days[t.day];
    return {
      id: 'demo-' + t.key,
      title: t.title,
      description: t.description,
      date, dates: [date],
      startTime: t.start, endTime: t.end, allDay: false,
      location: t.buildingId ? BUILDING_BY_ID[t.buildingId].name : t.location,
      buildingId: t.buildingId,
      categories: t.categories,
      host: t.host,
      url: OFFICIAL_CALENDAR_URL,
      source: 'demo'
    };
  });
}

// Match a calendar location like "University Union | UU 222" to one of our 11 buildings.
// If nothing matches clearly, the event stays off the map (buildingId = null).
const LOCATION_RULES = [
  { id: 'union',       pattern: /university union|\buu\s?\d/ },
  { id: 'arts',        pattern: /center for the arts|\bca\s?\d{3,4}/ },
  { id: 'cook',        pattern: /cook library|media center|\bck\s?\d/ },
  { id: 'liberal',     pattern: /liberal arts|\bla\s?\d{3,4}/ },
  { id: 'hawkins',     pattern: /hawkins|psychology building|\bhh\s?\d/ },
  { id: 'lecture',     pattern: /^lecture hall|\blh\s?\d/ },
  { id: 'york',        pattern: /7800 york|york road building|\byr\s?\d/ },
  { id: 'science',     pattern: /science complex/ },
  { id: 'stephens',    pattern: /stephens hall/ },
  { id: 'vanbokkelen', pattern: /van bokkelen|\bvb\s?\d/ },
  { id: 'burdick',     pattern: /burdick/ }
];
function guessBuildingId(locationName, room) {
  const text = `${locationName || ''} ${room || ''}`.toLowerCase().trim();
  const rule = LOCATION_RULES.find(r => r.pattern.test(text));
  return rule ? rule.id : null;
}

// Guess skill categories from the calendar's event types, departments and title.
const CATEGORY_KEYWORDS = [
  ['creative', /\barts?\b|music|theat|dance|film|galler|concert|perform|exhibit|recital/],
  ['career', /career|job|intern|employ|professional|network|startup|entrepreneur/],
  ['wellness', /wellness|health|recreation|fitness|athlet|yoga|sport|counsel|mindful/],
  ['leadership', /leader/],
  ['communication', /speak|communicat|writing|debate|present|journalism|podcast/],
  ['academic', /lecture|research|academic|seminar|workshop|colloquium|science|library|study|conference/],
  ['social', /student life|club|organization|social|cultur|divers|community|service|involve|celebrat|heritage/]
];
function guessCategories(text) {
  const lower = text.toLowerCase();
  const found = CATEGORY_KEYWORDS.filter(([, pattern]) => pattern.test(lower)).map(([id]) => id);
  return found.length ? found.slice(0, 2) : ['social'];
}

function safeUrl(url) {
  return typeof url === 'string' && /^https:\/\//.test(url) ? url : OFFICIAL_CALENDAR_URL;
}

function shortenText(text, maxLength) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  return clean.length > maxLength ? clean.slice(0, maxLength - 1).trim() + '…' : clean;
}

// Convert one event from the Localist API into TigerQuest's simple event object.
function convertLiveEvent(item) {
  const e = item && item.event;
  if (!e) return null;
  const instances = (e.event_instances || [])
    .map(x => x.event_instance)
    .filter(inst => inst && inst.start && inst.start.slice(0, 10) >= week.monday && inst.start.slice(0, 10) <= week.sunday)
    .sort((a, b) => a.start.localeCompare(b.start));
  if (instances.length === 0) return null;
  const first = instances[0];
  const filters = e.filters || {};
  const typeNames = [...(filters.event_types || []), ...(filters.departments || [])].map(t => t.name).join(' ');
  return {
    id: 'live-' + e.id,
    title: e.title || 'Untitled event',
    description: shortenText(e.description_text, 260),
    date: first.start.slice(0, 10),
    dates: [...new Set(instances.map(inst => inst.start.slice(0, 10)))],
    // Localist sends times already in New York time, e.g. "2026-11-09T11:00:00-05:00".
    startTime: first.all_day ? '' : first.start.slice(11, 16),
    endTime: first.all_day || !first.end ? '' : first.end.slice(11, 16),
    allDay: Boolean(first.all_day),
    location: [e.location_name, e.room_number].filter(Boolean).join(' · ') || 'Location to be announced',
    buildingId: guessBuildingId(e.location_name, e.room_number),
    categories: guessCategories(`${typeNames} ${e.title || ''}`),
    host: filters.departments && filters.departments[0] ? filters.departments[0].name : '',
    url: safeUrl(e.localist_url || e.url),
    source: 'live'
  };
}

async function loadLiveEvents() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000); // give up after 8 seconds
  try {
    let all = [];
    for (let page = 1; page <= 3; page++) {
      const url = `${LIVE_EVENTS_API}?start=${week.monday}&end=${week.sunday}&pp=100&page=${page}`;
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      all = all.concat(data.events || []);
      if (!data.page || page >= data.page.total) break;
    }
    liveEvents = all.map(convertLiveEvent).filter(Boolean);
    liveStatus = liveEvents.length ? 'ok' : 'empty';
    if (liveStatus === 'ok' && !userPickedSource) eventSource = 'live';
  } catch (error) {
    console.info('TigerQuest: live calendar unavailable, using sample events.', error);
    liveStatus = 'failed';
  } finally {
    clearTimeout(timer);
  }
  refreshEvents();
}

function getActiveEvents() {
  const list = eventSource === 'live' ? liveEvents : sampleEvents;
  return [...list].sort((a, b) => (a.date + (a.startTime || '00:00')).localeCompare(b.date + (b.startTime || '00:00')));
}

function findEventById(id) {
  if (!id) return null;
  return liveEvents.find(e => e.id === id) || sampleEvents.find(e => e.id === id) || save.savedEvents.find(e => e.id === id) || null;
}

function isEventSaved(id) {
  return save.savedEvents.some(e => e.id === id);
}

// "Add to My Quests": we store a copy of the event so it still shows up offline.
// Saving an event never gives XP.
function toggleSavedEvent(id) {
  if (isEventSaved(id)) {
    save.savedEvents = save.savedEvents.filter(e => e.id !== id);
    showToast('REMOVED FROM MY QUESTS', 'You can add it again any time.', '☆');
  } else {
    const ev = findEventById(id);
    if (!ev) return;
    save.savedEvents.push({ ...ev });
    showToast('ADDED TO MY QUESTS ⭐', 'Planning is not completing — no XP yet.', '⭐');
  }
  saveProgress();
  updateAll();
}

// Clicking an event: switch to the map, highlight the building, walk there, show details.
function showEventOnMap(id) {
  const ev = findEventById(id);
  if (!ev || !ev.buildingId) return;
  selectedEventId = id;
  selectBuilding(ev.buildingId, { walk: true, openSheet: true });
}

function eventCardHTML(ev, shownDate) {
  const saved = isEventSaved(ev.id);
  const building = ev.buildingId ? BUILDING_BY_ID[ev.buildingId] : null;
  return `<article class="event-card ${ev.id === selectedEventId ? 'highlight' : ''}">
    <div class="event-top">
      <h3 class="event-title">${escapeHTML(ev.title)}</h3>
      <span class="source-badge ${ev.source}">${ev.source === 'live' ? '🌐 LIVE · TU CALENDAR' : '🧪 SAMPLE DATA'}</span>
    </div>
    <div class="event-meta">
      <span>🗓️ ${formatEventWhen(ev, shownDate)}</span>
      <span>📍 ${escapeHTML(ev.location)}</span>
      <span>${building ? '🗺️ On map: ' + building.abbr : '🧭 Not on the TigerQuest map'}</span>
      ${ev.host ? `<span>🏷️ ${escapeHTML(ev.host)}</span>` : ''}
    </div>
    <div class="chips">${ev.categories.map(c => `<span class="chip">${CATEGORIES[c].icon} ${CATEGORIES[c].name}</span>`).join('')}</div>
    ${ev.description ? `<p class="event-desc">${escapeHTML(ev.description)}</p>` : ''}
    <div class="event-buttons">
      ${building ? `<button class="mini-btn" data-show-event="${escapeHTML(ev.id)}">🗺️ Show on map</button>` : ''}
      <button class="mini-btn" data-save-event="${escapeHTML(ev.id)}" aria-pressed="${saved}">${saved ? '★ In My Quests (remove)' : '☆ Add to My Quests'}</button>
      <a class="mini-btn" href="${escapeHTML(ev.url)}" target="_blank" rel="noopener noreferrer">${ev.source === 'live' ? 'More info ↗' : 'Browse official calendar ↗'}</a>
    </div>
  </article>`;
}

function renderWeekScreen() {
  $('#weekRange').textContent = `${formatDay(week.monday, 'long')} – ${formatDay(week.sunday, 'long')} · New York time`;

  // Source label + explanation
  const sourceLabel = eventSource === 'live' ? '🌐 LIVE DATA' : '🧪 SAMPLE DATA';
  $('#eventSourceLabel').textContent = sourceLabel;
  const notes = {
    loading: 'Checking the official Towson events calendar… sample events are shown meanwhile.',
    ok: `Loaded ${liveEvents.length} events from the public events.towson.edu calendar.`,
    empty: 'The official calendar returned no events for this week.',
    failed: 'Could not reach events.towson.edu (offline or blocked), so the live view is unavailable.'
  };
  const sampleNote = 'These are made-up SAMPLE events for demonstration, dated to this week. They are not real Towson events.';
  $('#eventSourceNote').textContent = eventSource === 'live' ? notes[liveStatus] : `${sampleNote} ${liveStatus === 'ok' ? 'Live events are available — switch source above.' : notes[liveStatus]}`;
  $('#eventSourceNote').classList.toggle('live', eventSource === 'live');
  document.querySelectorAll('[data-source]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.source === eventSource);
    btn.setAttribute('aria-pressed', String(btn.dataset.source === eventSource));
  });
  $('#liveSourceBtn').disabled = liveStatus !== 'ok';

  // Category + day filter buttons
  $('#eventCategoryFilter').innerHTML = '<span class="filter-label">Category</span>' + Object.entries(CATEGORIES).map(([id, c]) =>
    `<button class="mini-btn ${eventCategoryFilter === id ? 'active' : ''}" data-event-category="${id}" aria-pressed="${eventCategoryFilter === id}">${c.icon} ${id === 'all' ? 'All' : c.name}</button>`).join('');
  $('#eventDayFilter').innerHTML = '<span class="filter-label">Day</span>' +
    `<button class="mini-btn ${eventDayFilter === 'all' ? 'active' : ''}" data-event-day="all" aria-pressed="${eventDayFilter === 'all'}">All week</button>` +
    week.days.map(d => `<button class="mini-btn ${eventDayFilter === d ? 'active' : ''}" data-event-day="${d}" aria-pressed="${eventDayFilter === d}">${formatDay(d).split(',')[0]}${d === week.today ? ' (today)' : ''}</button>`).join('');

  // The list, grouped by day
  const events = getActiveEvents().filter(ev =>
    (eventCategoryFilter === 'all' || ev.categories.includes(eventCategoryFilter)) &&
    (eventDayFilter === 'all' || (ev.dates || [ev.date]).includes(eventDayFilter)));
  if (events.length === 0) {
    $('#eventList').innerHTML = '<div class="empty">No events match these filters. Try another category or day.</div>';
    return;
  }
  // A specific day: show that day's events. "All week": upcoming events first
  // (grouped by the next day they happen), then the ones that already happened.
  let html = '';
  if (eventDayFilter !== 'all') {
    html += `<div class="event-day">${formatDay(eventDayFilter, 'long')}${eventDayFilter === week.today ? ' · Today' : ''}</div>`;
    html += events.map(ev => eventCardHTML(ev, eventDayFilter)).join('');
  } else {
    const upcoming = events.filter(ev => nextDateOfEvent(ev))
      .sort((a, b) => (nextDateOfEvent(a) + (a.startTime || '')).localeCompare(nextDateOfEvent(b) + (b.startTime || '')));
    const past = events.filter(ev => !nextDateOfEvent(ev));
    let lastDay = '';
    upcoming.forEach(ev => {
      const day = nextDateOfEvent(ev);
      if (day !== lastDay) { html += `<div class="event-day">${formatDay(day, 'long')}${day === week.today ? ' · Today' : ''}</div>`; lastDay = day; }
      html += eventCardHTML(ev, day);
    });
    if (past.length) {
      html += `<div class="event-day">⏮ Earlier this week (already happened)</div>`;
      html += past.map(ev => eventCardHTML(ev, ev.date)).join('');
    }
  }
  $('#eventList').innerHTML = html;
}

function refreshEvents() {
  renderEventBadges();
  renderWeekScreen();
  renderDetails();
}

/* =====================================================================
   10. SKILLS, MISSION LOG AND PROGRESS SCREENS
   ===================================================================== */
const SKILL_IDS = Object.keys(SKILL_DESCRIPTIONS);

function updatePlayerHeader() {
  const info = getLevelInfo(getTotalXp());
  const percent = (info.xpIntoLevel / info.xpForThisLevel) * 100;
  $('#levelLabel').textContent = 'LEVEL ' + info.level;
  $('#xpLabel').textContent = `${info.xpIntoLevel.toLocaleString()} / ${info.xpForThisLevel.toLocaleString()} XP`;
  $('#xpBar').style.width = percent + '%';
  $('#xpTrack').setAttribute('aria-valuenow', Math.round(percent));
  const verified = ALL_MISSIONS.filter(m => getMissionState(m.id) === 'verified').length;
  $('#storyCount').textContent = `${verified} / ${ALL_MISSIONS.length}`;
  $('#storyBar').style.width = (100 * verified / ALL_MISSIONS.length) + '%';
  $('#totalXpLabel').textContent = `⭐ ${info.totalXp.toLocaleString()} total XP · ${verified} missions verified`;
}

function renderCategoryList() {
  $('#categoryList').innerHTML = Object.entries(CATEGORIES).map(([id, c]) => {
    const count = id === 'all' ? BUILDINGS.length : BUILDINGS.filter(b => b.categories.includes(id) || b.missions.some(m => m.skills[id])).length;
    return `<button class="category-btn ${currentCategory === id ? 'active' : ''}" data-category="${id}" aria-pressed="${currentCategory === id}">
      <span class="category-icon" aria-hidden="true">${c.icon}</span><span>${c.name}</span><span class="category-count">${count}</span></button>`;
  }).join('');
}

function renderSkills() {
  $('#skillsGrid').innerHTML = SKILL_IDS.map(c => {
    const cat = CATEGORIES[c];
    const missions = ALL_MISSIONS.filter(m => m.skills[c]);
    const done = missions.filter(m => getMissionState(m.id) === 'verified');
    const xp = getSkillXp(c), max = getMaxSkillXp(c);
    const next = missions.find(m => getMissionState(m.id) !== 'verified');
    return `<article class="skill-card">
      <div class="skill-icon" style="background:${cat.color}29" aria-hidden="true">${cat.icon}</div>
      <h3>${cat.name}</h3><p>${SKILL_DESCRIPTIONS[c]}</p>
      <div class="skill-meta"><span>${done.length} / ${missions.length} quests</span><span>${xp} / ${max} XP</span></div>
      <div class="skill-track"><div class="skill-fill" style="background:${cat.color};width:${max ? 100 * xp / max : 0}%"></div></div>
      <div class="skill-detail">${next ? 'Next: ' + escapeHTML(next.name) + ' @ ' + BUILDING_BY_ID[next.buildingId].abbr : '🏅 Skill path complete!'}</div>
    </article>`;
  }).join('');
}

function journalItemHTML(m) {
  const state = getMissionState(m.id);
  return `<article class="journal-item ${state}">
    <div class="journal-icon" aria-hidden="true">${state === 'verified' ? '✅' : m.icon}</div>
    <div class="journal-copy"><strong>${escapeHTML(m.name)}</strong>
      <p>${escapeHTML(m.buildingName)} · ${skillSplitText(m)}</p>
      <span class="state-pill ${state}">${STATE_LABELS[state]}</span></div>
    <div class="journal-actions">
      ${state !== 'verified' ? `<button class="mini-btn" data-mission-action="verify" data-mission="${m.id}">⚡ Simulate verified</button>` : ''}
      <button class="mini-btn" data-jump="${m.buildingId}">View on map ↗</button>
    </div>
  </article>`;
}

function renderJournal() {
  const missions = ALL_MISSIONS.filter(m => journalFilter === 'all' || getMissionState(m.id) === journalFilter);
  const verified = ALL_MISSIONS.filter(m => getMissionState(m.id) === 'verified').length;
  $('#missionJournalCount').textContent = `${verified} / ${ALL_MISSIONS.length} VERIFIED`;
  $('#journalList').innerHTML = missions.length ? missions.map(journalItemHTML).join('') : '<div class="empty">No missions in this view yet. Explore a building on the map.</div>';
  document.querySelectorAll('[data-journal]').forEach(btn => btn.classList.toggle('active', btn.dataset.journal === journalFilter));
}

function renderProgress() {
  const info = getLevelInfo(getTotalXp());
  const count = state => ALL_MISSIONS.filter(m => getMissionState(m.id) === state).length;
  const stats = [
    ['Level', info.level], ['Total XP', info.totalXp.toLocaleString()], ['To next level', (info.xpForThisLevel - info.xpIntoLevel) + ' XP'],
    ['✅ Verified', count('verified')], ['✋ Self-reported', count('self-reported')], ['⭐ Saved events', save.savedEvents.length]
  ];
  $('#statGrid').innerHTML = stats.map(([label, value]) => `<div class="stat"><b>${value}</b><span>${label}</span></div>`).join('');

  $('#skillRows').innerHTML = SKILL_IDS.map(c => {
    const xp = getSkillXp(c), max = getMaxSkillXp(c);
    return `<div class="skill-row"><div class="skill-meta"><span>${CATEGORIES[c].icon} ${CATEGORIES[c].name}</span><span>${xp} / ${max} XP</span></div>
      <div class="skill-track"><div class="skill-fill" style="background:${CATEGORIES[c].color};width:${max ? 100 * xp / max : 0}%"></div></div></div>`;
  }).join('');

  const savedSorted = [...save.savedEvents].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  $('#savedEventList').innerHTML = savedSorted.length ? savedSorted.map(ev => `
    <article class="journal-item">
      <div class="journal-icon" aria-hidden="true">⭐</div>
      <div class="journal-copy"><strong>${escapeHTML(ev.title)}</strong>
        <p>${ev.date ? formatEventWhen(ev) : ''} · ${escapeHTML(ev.location || '')} · ${ev.source === 'live' ? 'Live TU calendar' : 'Sample data'}</p></div>
      <div class="journal-actions">
        ${ev.buildingId ? `<button class="mini-btn" data-show-event="${escapeHTML(ev.id)}">🗺️ Show on map</button>` : ''}
        <a class="mini-btn" href="${escapeHTML(safeUrl(ev.url))}" target="_blank" rel="noopener noreferrer">Details ↗</a>
        <button class="mini-btn" data-save-event="${escapeHTML(ev.id)}">✕ Remove</button>
      </div>
    </article>`).join('') : '<div class="empty">No saved events yet. Open <strong>This Week</strong> and tap “Add to My Quests”.</div>';

  const planned = ALL_MISSIONS.filter(m => getMissionState(m.id) === 'planned');
  $('#plannedMissionList').innerHTML = planned.length ? planned.map(journalItemHTML).join('') : '<div class="empty">No planned missions. Use “📌 Plan it” on any mission.</div>';
}

function updateAll() {
  updatePlayerHeader();
  renderDetails();
  renderSkills();
  renderJournal();
  renderProgress();
  renderWeekScreen();
}

function resetProgress() {
  if (!confirm('Restart TigerQuest? This clears all mission progress and saved events stored in this browser.')) return;
  save = createEmptySave();
  try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(OLD_STORAGE_KEY); } catch (error) { /* storage blocked */ }
  updateAll();
  showToast('ADVENTURE RESTARTED', 'Your mission log is ready for a fresh playthrough.', '🔄');
}

/* =====================================================================
   11. NAVIGATION, TOASTS AND STARTUP
   ===================================================================== */
const TAB_TEXT = {
  map: ['Welcome to Tiger Territory! 👋', 'Select a building to discover real opportunities around campus.'],
  skills: ['Choose your character build 🌳', 'Real experiences make your skill paths grow.'],
  journal: ['Your adventure log 📜', 'Plan, report and (in this demo) verify real-world missions.'],
  week: ['Happening This Week 📅', 'Real campus opportunities, connected to the map.'],
  progress: ['Player progress 🏆', 'Your level, skills and saved quests.']
};
const SCREEN_IDS = { skills: '#skillsScreen', journal: '#journalScreen', week: '#weekScreen', progress: '#progressScreen' };

function setTab(id) {
  currentTab = id;
  keysHeld.clear();
  document.querySelectorAll('[data-tab]').forEach(btn => {
    const on = btn.dataset.tab === id;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', String(on));
  });
  $('#mapStage').style.display = id === 'map' ? 'block' : 'none';
  $('#mapControls').style.visibility = id === 'map' ? 'visible' : 'hidden';
  Object.entries(SCREEN_IDS).forEach(([tab, selector]) => $(selector).classList.toggle('active', tab === id));
  $('#viewTitle').textContent = TAB_TEXT[id][0];
  $('#viewSubtitle').textContent = TAB_TEXT[id][1];
  if (id !== 'map') closeDetailSheet();
}

let toastTimer = null;
function showToast(title, subtitle, icon = '✨') {
  clearTimeout(toastTimer);
  $('#toastIcon').textContent = icon;
  $('#toastTitle').textContent = title;
  $('#toastSub').textContent = subtitle;
  $('#toast').classList.add('show');
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3600);
}

// After a search or category change, make sure the selected building is still a match.
function keepSelectionInFilter() {
  renderMapState();
  const matches = getFilteredBuildings();
  if (matches.length && !matches.some(b => b.id === selectedBuildingId)) {
    selectedEventId = null;
    selectBuilding(matches[0].id);
  }
}

function setupEventHandlers() {
  document.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => setTab(btn.dataset.tab)));
  $('#searchBox').addEventListener('input', keepSelectionInFilter);

  // Event delegation: one listener on the page handles buttons that are re-rendered often.
  document.addEventListener('click', event => {
    const target = event.target.closest('button');
    if (!target) return;
    const data = target.dataset;
    if (data.category) {
      currentCategory = data.category;
      renderCategoryList();
      if (currentTab !== 'map') setTab('map');
      keepSelectionInFilter();
    } else if (data.missionAction) {
      handleMissionAction(data.mission, data.missionAction);
    } else if (data.jump) {
      selectedEventId = null;
      selectBuilding(data.jump, { walk: true, openSheet: true });
    } else if (data.saveEvent) {
      toggleSavedEvent(data.saveEvent);
    } else if (data.showEvent) {
      showEventOnMap(data.showEvent);
    } else if (data.journal) {
      journalFilter = data.journal;
      renderJournal();
    } else if (data.source) {
      if (data.source === 'live' && liveStatus !== 'ok') return;
      eventSource = data.source;
      userPickedSource = true;
      refreshEvents();
    } else if (data.eventCategory) {
      eventCategoryFilter = data.eventCategory;
      renderWeekScreen();
    } else if (data.eventDay) {
      eventDayFilter = data.eventDay;
      renderWeekScreen();
    } else if (data.gotoWeek) {
      setTab('week');
    }
  });

  // Click or tap on an empty part of the map: walk there (if it isn't inside a building).
  $('#campusMap').addEventListener('click', event => {
    if (event.target.closest('.hotspot')) return;
    const point = screenToMap(event.clientX, event.clientY);
    if (isWalkable(point)) walkTo({ x: point.x, y: point.y });
  });

  $('#zoomInBtn').addEventListener('click', () => { zoomIndex = Math.min(ZOOM_LEVELS.length - 1, zoomIndex + 1); });
  $('#zoomOutBtn').addEventListener('click', () => { zoomIndex = Math.max(0, zoomIndex - 1); });
  $('#resetViewBtn').addEventListener('click', () => {
    zoomIndex = 0;
    walkTo(PLAYER_START);
    showToast('BACK TO START', 'Use arrow keys / WASD, or click a building.', '🧭');
  });
  $('#resetProgressBtn').addEventListener('click', resetProgress);
  $('#detailsFab').addEventListener('click', () => $('#detailSheet').classList.add('sheet-open'));
  $('#sheetCloseBtn').addEventListener('click', closeDetailSheet);
}

function init() {
  save = loadSave();
  week = getCurrentWeek();
  sampleEvents = buildSampleEvents();

  renderHotspots();
  renderCategoryList();
  renderEventBadges();
  renderDebugLayer();
  updateAll();
  setupEventHandlers();
  setupKeyboard();
  requestAnimationFrame(gameLoop);

  loadLiveEvents(); // runs in the background; the app works without it

  window.resetTigerQuest = resetProgress; // handy for demos (call from the browser console)
}

init();
