import './styles.css';
import { downloadCompletion, eggCount, shadowCount, RECRUIT_NAMES } from './save-generator.js';
import { mountVoidShader } from './void-shader.js';
import { armMusicOnFirstGesture, bindMusicControl } from './music-player.js';
const BASE_URL = import.meta.env.BASE_URL;

const app = document.querySelector('#app');
const STORAGE_KEY = 'gonermaker-history-v1';

const option = (label, value, hint = '') => ({ label, value, hint });
const yesNo = [option('YES', 'yes'), option('NO', 'no')];

const chapters = {
  0: {
    kicker: 'RECONSTRUCTION SURVEY',
    title: 'OPENING',
    intro: ['ARE WE\nCONNECTED?', '...\nEXCELLENT.', 'WE HAVE FOUND\nSOMETHING.\n\nA HISTORY.\nYOUR HISTORY.', 'UNFORTUNATELY,\nPARTS OF IT\nARE MISSING.\n\nDO NOT WORRY.\nWE WILL\nRECONSTRUCT IT.'],
    questions: [
      { id: 'playerName', type: 'text', text: 'FIRST,\nWHAT IS YOUR\nNAME?', placeholder: 'ENTER YOUR NAME', max: 12 },
      { id: 'nameConfirmed', text: () => `“${answer('playerName', 'KRIS').toUpperCase()}.”\n\nIS THIS\nYOUR NAME?`, options: yesNo },
      { id: 'vesselMemory', text: 'BEFORE WE BEGIN...\n\nDO YOU REMEMBER\nCREATING A VESSEL?', options: [option('YES', 'yes'), option('NO', 'no'), option('IT DOES NOT MATTER', 'irrelevant')] },
      { id: 'vesselForm', type: 'vessel', text: 'THEN SHOW US\nWHAT YOU REMEMBER.', when: (a) => a.vesselMemory === 'yes' },
      { id: 'vesselFood', text: 'WHAT IS YOUR\nFAVORITE FOOD?', options: [option('SWEET', 'sweet'), option('SOFT', 'soft'), option('SOUR', 'sour'), option('SALTY', 'salty'), option('PAIN', 'pain'), option('COLD', 'cold')], when: (a) => a.vesselMemory === 'yes' },
      { id: 'vesselBlood', text: 'WHAT IS YOUR\nFAVORITE BLOOD TYPE?', options: [option('A', 'a'), option('AB', 'ab'), option('B', 'b'), option('C', 'c'), option('D', 'd')], when: (a) => a.vesselMemory === 'yes' },
      { id: 'vesselColor', text: 'WHAT COLOR\nDOES IT LIKE MOST?', options: [option('RED', 'red'), option('BLUE', 'blue'), option('GREEN', 'green'), option('CYAN', 'cyan')], when: (a) => a.vesselMemory === 'yes' },
      { id: 'vesselGiftChoice', text: 'PLEASE GIVE IT\nA GIFT.', options: [option('KINDNESS', 'kindness'), option('MIND', 'mind'), option('AMBITION', 'ambition'), option('BRAVERY', 'bravery'), option('VOICE', 'voice')], when: (a) => a.vesselMemory === 'yes' },
      { id: 'vesselFeeling', text: 'HOW DO YOU FEEL\nABOUT YOUR CREATION?', options: [option('LOVE', 'love'), option('HOPE', 'hope'), option('DISGUST', 'disgust'), option('FEAR', 'fear')], when: (a) => a.vesselMemory === 'yes' },
      { id: 'vesselHonest', text: 'HAVE YOU ANSWERED\nHONESTLY?', options: yesNo, when: (a) => a.vesselMemory === 'yes' },
      { id: 'vesselSeizure', text: 'YOU ACKNOWLEDGE\nTHE POSSIBILITY OF\nPAIN AND SEIZURE.', options: yesNo, when: (a) => a.vesselMemory === 'yes' },
      { id: 'vesselNameKnown', text: 'DO YOU REMEMBER\nITS NAME?', options: [option('YES', 'yes'), option('NO', 'no')], when: (a) => a.vesselMemory === 'yes' },
      { id: 'vesselName', type: 'text', text: 'WHAT DID YOU\nCALL IT?', placeholder: 'VESSEL NAME', max: 9, when: (a) => a.vesselMemory === 'yes' && a.vesselNameKnown === 'yes' },
    ],
  },
  1: {
    kicker: 'CHAPTER 1', title: 'THE BEGINNING',
    intro: ['VERY WELL.\n\nLET US BEGIN\nWITH THE DAY\nYOU FELL\nINTO THE DARK.'],
    questions: [
      { id: 'c1Combat', text: 'WHEN SOMETHING\nSTOOD IN YOUR WAY...\n\nWHAT DID YOU DO?', options: [option('SPARED IT', 'spared'), option('FOUGHT IT', 'fought'), option('BOTH', 'both')] },
      { id: 'c1KingAid', text: 'WHEN YOU REACHED\nTHE KING...\n\nDID YOUR ENEMIES\nCOME TO YOUR AID?', options: [option('YES', 'yes'), option('NO', 'no'), option("I DON'T REMEMBER", 'unknown')] },
      { id: 'c1Prophecy', text: 'DID YOU LISTEN\nTO THE PRINCE’S\nPROPHECY?', options: [option('I LISTENED', 'heard'), option('I SKIPPED IT', 'skip')] },
      { id: 'c1Manual', text: 'YOU WERE GIVEN\nA MANUAL.\n\nWHAT BECAME\nOF IT?', options: [option('KEPT IT', 'kept'), option('THREW IT AWAY', 'threw'), option("I DON'T REMEMBER", 'unknown')] },
      { id: 'c1Cake', text: "SOMEONE'S CAKE\nWAS DESTROYED.\n\nDID YOU\nMAKE IT WHOLE?", options: yesNo },
      { id: 'c1CakeFate', text: 'WHAT BECAME\nOF THE CAKE?', options: [option('I RETURNED IT', 'returned'), option('I KEPT IT', 'kept'), option('I USED IT', 'used'), option("I DON'T REMEMBER", 'unknown')], when: (a) => a.c1Cake === 'yes' },
      { id: 'c1Beds', text: 'THERE WERE\nMANY BEDS.\n\nDID YOU\nINSPECT THEM?', options: [option('OF COURSE', 'yes'), option('NO', 'no')] },
      { id: 'c1Machine', text: 'YOU CREATED\nA MACHINE.\n\nDO YOU\nREMEMBER IT?', options: yesNo },
      { id: 'machineDesign', type: 'machine', text: 'THEN CREATE IT\nONCE MORE.', when: (a) => a.c1Machine === 'yes' },
      { id: 'c1Starwalker', text: 'SOMEONE INSISTED\nTHAT THESE BIRDS\nWERE PISSING THEM OFF.\n\nDO YOU REMEMBER\nTHIS PERSON?', options: yesNo },
      { id: 'c1StarwalkerBack', text: 'DID YOU\nGO BACK\nTO FIND THEM?', options: yesNo, when: (a) => a.c1Starwalker === 'yes' },
      { id: 'c1EggRoom', text: 'SOMEWHERE,\nBETWEEN TWO ROOMS,\nTHERE WAS\nANOTHER PLACE.\n\nDID YOU\nFIND IT?', options: yesNo },
      { id: 'c1EggGift', text: 'THERE WAS\nA MAN.\nHE GAVE YOU\nSOMETHING.\n\nWHAT WAS IT?', options: [option('AN EGG', 'egg'), option("I DON'T KNOW", 'unknown')], when: (a) => a.c1EggRoom === 'yes' },
      { id: 'c1EggFate', text: 'WHAT BECAME\nOF THE EGG?', options: [option("PUT IT IN ASGORE'S FRIDGE", 'fridge'), option('KEPT IT', 'kept'), option('DISCARDED IT', 'discarded')], when: (a) => a.c1EggGift === 'egg' },
      { id: 'c1JevilFound', text: 'BELOW THE CASTLE\nSOMEONE WAS\nIMPRISONED.\n\nDID YOU\nFIND HIM?', options: yesNo },
      { id: 'c1JevilPlayed', text: 'DID YOU\nPLAY HIS GAME?', options: yesNo, when: (a) => a.c1JevilFound === 'yes' },
      { id: 'c1JevilEnd', text: 'HOW DID\nTHE GAME END?', after: 'CHAOS.\nCHAOS.\n...\nINTERESTING.', options: [option('I TIRED HIM OUT', 'tire'), option('I FOUGHT HIM', 'fight')], when: (a) => a.c1JevilPlayed === 'yes' },
      { id: 'c1PartyName', text: 'FOR A MOMENT,\nTHE THREE OF YOU\nHAD A NAME.\n\nWHAT WERE YOU\nCALLED?', options: [option('THE FUN GANG', 'fun'), option('THE $!$? SQUAD', 'squad'), option('THE LANCER FAN CLUB', 'lancer'), option("I DON'T REMEMBER", 'unknown')] },
      { id: 'c1StraightHome', text: 'YOU RETURNED\nTO THE LIGHT.\n\nDID YOU\nGO STRAIGHT HOME?', options: yesNo },
      { id: 'c1Hospital', text: 'DID YOU VISIT\nTHE HOSPITAL?', options: yesNo, when: (a) => a.c1StraightHome === 'no' },
      { id: 'c1Noelle', text: 'DID YOU SPEAK\nWITH NOELLE?', options: yesNo, when: (a) => a.c1StraightHome === 'no' },
      { id: 'c1Onion', text: 'DID YOU MEET\nSOMEONE\nAT THE EDGE\nOF THE WATER?', options: yesNo, when: (a) => a.c1StraightHome === 'no' },
      { id: 'c1Sans', text: 'DID YOU SPEAK\nWITH SANS?', options: yesNo, when: (a) => a.c1StraightHome === 'no' },
    ],
  },
  2: {
    kicker: 'CHAPTER 2', title: 'A CYBER’S WORLD?',
    intro: ['THE NEXT DAY,\nYOU RETURNED.\n\nBUT SOMEONE ELSE\nHAD ALREADY FALLEN.'],
    questions: [
      { id: 'c2Treatment', text: 'NOELLE JOINED YOU.\n\nHOW DID YOU\nTREAT HER?', options: [option('WITH KINDNESS', 'kind'), option('I MADE HER STRONGER', 'strong')] },
      { id: 'c2Continued', text: 'DID YOU\nCONTINUE\nEVEN WHEN\nSHE ASKED YOU\nTO STOP?', options: yesNo, when: (a) => a.c2Treatment === 'strong' },
      { id: 'c2Frozen', text: 'DID NOELLE\nFREEZE BERDLY?', options: yesNo, when: (a) => a.c2Continued === 'yes' },
      recruitQuestion(2), recruitDetail(2),
      { id: 'c2Hacker', text: 'SOMEONE ASKED YOU\nTO FIND\nTHREE BLUE\nCHECKMARKS.\n\nDID YOU?', options: yesNo },
      { id: 'c2Nubert', text: 'EVERYBODY LOVES\nNUBERT.\n\nDID NUBERT\nLOVE YOU?', options: yesNo, when: (a) => a.c2Recruitment !== 'all' },
      { id: 'c2EggRoom', text: 'AGAIN,\nTHERE WAS\nA ROOM\nTHAT SHOULD NOT\nHAVE BEEN THERE.\n\nDID YOU\nFIND IT?', options: yesNo },
      { id: 'c2Egg', text: 'ANOTHER EGG?', options: yesNo, when: (a) => a.c2EggRoom === 'yes' },
      { id: 'c2BigShot', text: 'A SALESMAN\nFOUND YOU.\n\nDID YOU BECOME\nA BIG SHOT?', options: yesNo },
      { id: 'c2Shop', text: 'DID YOU\nRETURN\nTO HIS SHOP?', options: yesNo },
      { id: 'c2Basement', text: 'DID YOU\nENTER\nTHE BASEMENT?', options: yesNo, when: (a) => a.c2Shop === 'yes' },
      { id: 'c2Disk', text: 'DID YOU\nPLACE THE DISK\nBACK\nWHERE IT BELONGED?', options: yesNo, when: (a) => a.c2Basement === 'yes' },
      { id: 'c2Strings', text: 'HOW DID YOU\nCUT HIS STRINGS?', options: [option('MERCY', 'mercy'), option('VIOLENCE', 'violence')], when: (a) => a.c2Disk === 'yes' },
      { id: 'c2Queen', text: 'WHEN THE QUEEN\nASKED YOU\nTO CREATE\nANOTHER FOUNTAIN...\n\nWHAT DID YOU DO?', options: [option('I REFUSED', 'refused'), option('SUSIE REFUSED FOR ME', 'susie')] },
      { id: 'c2Rudy', text: 'DID YOU AND SUSIE\nVISIT RUDY?', options: yesNo },
      { id: 'c2Nobody', text: 'DID YOU SPEAK\nWITH THE NOBODY?', options: yesNo },
    ],
  },
  3: {
    kicker: 'CHAPTER 3', title: 'THE SHOW',
    intro: ['THAT NIGHT,\nYOUR HOME\nBECAME A STAGE.\n\nYOU WERE\nENTERTAINED.'],
    questions: [
      { id: 'c3Entertained', text: 'WERE YOU\nENTERTAINED?', options: yesNo },
      recruitQuestion(3, 'WHAT BECAME\nOF THE PERFORMERS?'), recruitDetail(3),
      { id: 'c3Performance', text: 'HOW WELL\nDID YOU PERFORM?', options: [option('I DID EVERYTHING', 'all'), option('I DID WHAT WAS NECESSARY', 'needed'), option('LET ME CHOOSE', 'detail')] },
      { id: 'c3PerformanceDetail', type: 'multi', text: 'WHAT DID YOU\nCOMPLETE?', options: ['COOKING SHOW', 'DESERT BOARD', 'ISLAND BOARD', 'DOOM BOARD', 'BONUS KEYS'], when: (a) => a.c3Performance === 'detail' },
      { id: 'c3EggRoom', text: 'YOU KNOW\nTHIS QUESTION.\n\nDID YOU\nFIND THE ROOM?', options: yesNo },
      { id: 'c3EggTake', text: 'DID YOU\nTAKE THE EGG?', options: yesNo, when: (a) => a.c3EggRoom === 'yes' },
      { id: 'c3Pursue', text: 'SOMETHING\nWAITED\nBEYOND\nTHE SHOW.\n\nDID YOU\nPURSUE IT?', options: yesNo },
      { id: 'c3Knight', text: 'DID YOU\nDEFEAT\nTHE KNIGHT?', options: yesNo, when: (a) => a.c3Pursue === 'yes' },
      { id: 'c3Hurt', text: 'WHEN THE SHOW\nWAS OVER...\n\nDID YOU LEAVE\nANYONE HURT?', options: [option('NO', 'no'), option('YES', 'yes')] },
    ],
  },
  4: {
    kicker: 'CHAPTER 4', title: 'THE SANCTUARY',
    intro: ['THE NEXT DAY,\nYOU WENT\nSOMEWHERE QUIET.\n\n...\n\nIT DID NOT\nREMAIN QUIET.'],
    questions: [
      recruitQuestion(4, 'DID EVERYONE\nYOU MET\nFIND THEIR WAY\nTO CASTLE TOWN?'), recruitDetail(4),
      { id: 'c4Egg', text: '...\n\nTHE EGG?', options: yesNo },
      { id: 'c4Shadow', text: 'DEEP WITHIN\nTHE SANCTUARY\nYOU FOUND\nANOTHER SHADOW.\n\nDID YOU\nFACE IT?', options: yesNo },
      { id: 'c4Justice', text: 'DID YOU DEFEAT\nTHE SOUND\nOF JUSTICE?', options: yesNo, when: (a) => a.c4Shadow === 'yes' },
      { id: 'c4Blood', text: 'DID SUSIE CLEAN\nTHE STAIN\nIN YOUR ROOM?', options: yesNo },
      { id: 'c4Star', text: 'DID SUSIE GIVE YOU\nA STAR\nTHAT GLOWED\nIN THE DARK?', options: yesNo },
      { id: 'c4Piano', text: 'WHAT DID YOU TELL\nSUSIE ABOUT\nTHE PIANO?', options: [option('I WOULD TEACH HER', 'teach'), option('I SAID NOTHING', 'nothing')] },
      { id: 'c4Weird', text: 'SHE REMEMBERED\nWHAT YOU MADE HER DO.\n\nDID YOU\nCONTINUE?', options: [option('YES', 'continue'), option('NO', 'abort')], when: (a) => a.c2Frozen === 'yes' },
    ],
  },
  5: {
    kicker: 'CHAPTER 5', title: 'THE FESTIVAL',
    intro: ['WELCOME BACK.\n\nWE ARE\nNEARLY FINISHED.'],
    questions: [
      { id: 'c5FestivalMemory', text: 'YOU REMEMBER\nWHAT HAPPENED\nAT THE FESTIVAL.\n\nCORRECT?', options: yesNo, after: 'THAT IS\nUNFORTUNATE.\n\nWE DO.' },
      { id: 'c5Route', text: 'AT THE WATER,\nSHE ASKED YOU\nTO STOP.\n\nWHAT DID YOU DO?', options: [option('I STOPPED', 'stop'), option('I CONTINUED', 'continue')], when: (a) => a.c2Frozen === 'yes' && a.c4Weird === 'continue' },
      recruitQuestion(5, 'DID YOU\nINVITE EVERYONE?'), recruitDetail(5),
      { id: 'c5Egg', text: '🥚', options: yesNo },
      { id: 'c5PinkFound', text: 'DID YOU\nFIND HER?', options: yesNo },
      { id: 'c5PinkFace', text: 'DID YOU\nFACE HER?', options: yesNo, when: (a) => a.c5PinkFound === 'yes' },
      { id: 'c5PinkWin', text: 'DID YOU\nWIN?', options: yesNo, when: (a) => a.c5PinkFace === 'yes' },
      { id: 'c5Companion', text: 'WHO STOOD\nWITH YOU\nAT THE FESTIVAL?', options: [option('SUSIE', 'susie'), option('NOELLE', 'noelle'), option('I WAS ALONE', 'alone')] },
      { id: 'c5Self', text: 'DO YOU LIKE\nTHE PERSON\nWE ARE\nRECONSTRUCTING?', options: [option('YES', 'yes'), option('NO', 'no'), option('...', 'ellipsis')] },
    ],
  },
};

function recruitQuestion(chapter, text = 'THE DARKNERS\nYOU MET...\n\nDID YOU TRY\nTO BRING THEM\nTO YOUR\nNEW HOME?') {
  return { id: `c${chapter}Recruitment`, text, options: [option(chapter === 3 ? 'EVERYONE CAME WITH ME' : 'EVERY ONE I COULD', 'all'), option('SOME OF THEM', 'some'), option('NO', 'none')] };
}

function recruitDetail(chapter) {
  return { id: `c${chapter}RecruitDetail`, type: 'multi', text: 'WHO FOLLOWED YOU?', options: RECRUIT_NAMES[chapter], when: (a) => a[`c${chapter}Recruitment`] === 'some' };
}

const saved = loadState();
const state = {
  mode: saved ? 'resume' : 'intro',
  chapter: saved?.chapter ?? 0,
  index: 0,
  introIndex: 0,
  answers: saved?.answers ?? {},
  completed: saved?.completed ?? [],
  editing: false,
  afterMessage: '',
  selectedSlot: saved?.selectedSlot ?? 1,
  downloaded: null,
};

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ chapter: state.chapter, answers: state.answers, completed: state.completed, selectedSlot: state.selectedSlot }));
}

function answer(id, fallback = '') { return state.answers[id] ?? fallback; }
function visibleQuestions() { return chapters[state.chapter].questions.filter((question) => !question.when || question.when(state.answers)); }
function currentQuestion() { return visibleQuestions()[state.index]; }

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function layout(content, extraClass = '') {
  const chapterDots = [1, 2, 3, 4, 5].map((chapter) => `<span class="chapter-dot ${state.completed.includes(chapter) ? 'complete' : ''} ${state.chapter === chapter ? 'active' : ''}">${chapter}</span>`).join('');
  app.innerHTML = `
    <div class="void" aria-hidden="true">
      <canvas class="void-shader"></canvas>
      <div class="shader-vignette"></div>
    </div>
    <header class="topbar">
      <button class="wordmark" data-action="home" aria-label="Return to opening">GONER MAKER</button>
      <div class="chapter-track" aria-label="Chapter progress">${chapterDots}</div>
      <button class="music-toggle" data-action="music" aria-label="Toggle background music" aria-pressed="false">
        <span class="music-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        <b>MUSIC OFF</b>
      </button>
    </header>
    <main class="stage ${extraClass}">${content}</main>
    <footer><span>UNOFFICIAL FAN TOOL</span><span>YOUR HISTORY NEVER LEAVES THIS DEVICE</span><span class="footer-key">↑↓ SELECT&nbsp;&nbsp; Z CONFIRM</span></footer>
    <div class="scanlines" aria-hidden="true"></div>`;
  bindGlobalActions();
}

function bindGlobalActions() {
  mountVoidShader(app.querySelector('.void-shader'));
  bindMusicControl(app.querySelector('[data-action="music"]'));
  armMusicOnFirstGesture(app);
  app.querySelector('[data-action="home"]')?.addEventListener('click', () => { state.mode = 'intro'; state.chapter = 0; state.index = 0; state.introIndex = 0; render(); });
}

function renderIntro() {
  const chapter = chapters[state.chapter];
  const panel = chapter.intro[state.introIndex];
  layout(`<section class="dialogue opening-panel">
      <p class="kicker">${chapter.kicker}</p>
      <h1>${formatText(panel)}</h1>
      <button class="continue-prompt" data-action="continue">CONTINUE <span>↵</span></button>
    </section>`, 'intro-stage');
  app.querySelector('[data-action="continue"]').addEventListener('click', advanceIntro);
}

function advanceIntro() {
  if (state.introIndex < chapters[state.chapter].intro.length - 1) {
    state.introIndex += 1;
  } else {
    state.mode = 'survey'; state.index = 0; state.introIndex = 0;
  }
  render();
}

function renderResume() {
  layout(`<section class="dialogue resume-panel">
    <div class="sigil" aria-hidden="true"><span></span><i></i></div>
    <p class="kicker">A HISTORY REMAINS</p>
    <h1>WE HAVE MET<br>BEFORE.</h1>
    <div class="resume-actions">
      <button class="choice primary" data-action="resume"><span class="soul">♥</span>CONTINUE RECONSTRUCTION</button>
      <button class="choice" data-action="restart"><span class="soul">♥</span>ERASE THIS HISTORY</button>
    </div>
  </section>`, 'intro-stage');
  app.querySelector('[data-action="resume"]').addEventListener('click', () => { state.mode = state.completed.includes(state.chapter) ? 'summary' : 'intro'; render(); });
  app.querySelector('[data-action="restart"]').addEventListener('click', resetHistory);
}

function renderQuestion() {
  const question = currentQuestion();
  if (!question) { state.mode = state.chapter === 0 ? 'intro' : 'summary'; nextChapterOrSummary(); return; }
  const chapter = chapters[state.chapter];
  const questionNo = state.index + 1;
  const total = visibleQuestions().length;
  const body = `
    <section class="survey-shell">
      <div class="section-label"><span>${chapter.kicker}</span><span>${String(questionNo).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span></div>
      <div class="progress-line"><i style="width:${Math.round((questionNo / total) * 100)}%"></i></div>
      <article class="dialogue question-card">
        <h1>${formatText(typeof question.text === 'function' ? question.text() : question.text)}</h1>
        ${renderControl(question)}
      </article>
      <button class="back-button" data-action="back">← RECALL PREVIOUS</button>
    </section>`;
  layout(body, 'survey-stage');
  bindQuestion(question);
  app.querySelector('[data-action="back"]')?.addEventListener('click', goBack);
}

function renderControl(question) {
  if (question.type === 'text') {
    return `<form class="text-entry" data-control="text">
      <label class="sr-only" for="answer-input">${escapeHtml(question.placeholder)}</label>
      <input id="answer-input" value="${escapeHtml(answer(question.id))}" maxlength="${question.max}" placeholder="${escapeHtml(question.placeholder)}" autocomplete="off" spellcheck="false" autofocus />
      <button type="submit" class="confirm-button">CONFIRM <span>↵</span></button>
    </form>`;
  }
  if (question.type === 'machine') return machineControl();
  if (question.type === 'vessel') return vesselControl();
  if (question.type === 'multi') return multiControl(question);
  return `<div class="choices" role="listbox">${question.options.map((item, index) => `
    <button class="choice ${answer(question.id) === item.value ? 'selected' : ''}" data-value="${escapeHtml(item.value)}" role="option" aria-selected="${answer(question.id) === item.value}">
      <span class="soul">♥</span><span>${item.label}</span>${item.hint ? `<small>${item.hint}</small>` : ''}
    </button>`).join('')}</div>`;
}

function machineColor(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  const index = Number.isInteger(parsed) && parsed >= 0 && parsed <= 31 ? parsed : fallback;
  const hue = ((index * 8) / 255) * 6;
  const sector = Math.floor(hue);
  const fraction = hue - sector;
  const rising = fraction;
  const falling = 1 - fraction;
  const rgb = [
    [1, rising, 0], [falling, 1, 0], [0, 1, rising],
    [0, falling, 1], [rising, 0, 1], [1, 0, falling],
  ][Math.min(sector, 5)];
  return {
    index,
    rgb,
    css: `rgb(${rgb.map((channel) => Math.round(channel * 255)).join(' ')})`,
  };
}

function machineColorMatrix(rgb) {
  return `${rgb[0].toFixed(4)} 0 0 0 0  0 ${rgb[1].toFixed(4)} 0 0 0  0 0 ${rgb[2].toFixed(4)} 0 0  0 0 0 1 0`;
}

function machineControl() {
  const groups = [
    { label: 'HEAD', part: 'head', partId: 'machineHead', colorId: 'machineHeadColor', defaultColor: 4, values: [['LASER', 'laser'], ['SWORD', 'sword'], ['FLAME', 'flame'], ['DUCK', 'duck']] },
    { label: 'BODY', part: 'body', partId: 'machineBody', colorId: 'machineBodyColor', defaultColor: 17, values: [['PLAIN', 'plain'], ['WHEEL', 'wheel'], ['TANK', 'tank'], ['DUCK', 'duck']] },
    { label: 'SHOE', part: 'shoe', partId: 'machineShoes', colorId: 'machineShoeColor', defaultColor: 26, values: [['SNEAK', 'sneak'], ['A.WHL', 'wheel'], ['TREAD', 'tread'], ['DUCK', 'duck']] },
  ];
  const selections = Object.fromEntries(groups.map((group) => {
    const requested = answer(group.partId, group.values[0][1]);
    const part = group.values.some(([, value]) => value === requested) ? requested : group.values[0][1];
    return [group.part, { part, color: machineColor(answer(group.colorId), group.defaultColor) }];
  }));
  const filters = groups.map((group) => `<filter id="machine-${group.part}-tint" color-interpolation-filters="sRGB"><feColorMatrix data-machine-matrix="${group.part}" type="matrix" values="${machineColorMatrix(selections[group.part].color.rgb)}" /></filter>`).join('');
  return `<div class="maker-grid">
    <div class="machine-preview" role="img" aria-label="Thrash Machine preview">
      <svg class="machine-filters" aria-hidden="true"><defs>${filters}</defs></svg>
      ${groups.map((group) => `<div class="machine-piece machine-${group.part}-piece"><img data-machine-sprite="${group.part}" src="${BASE_URL}images/machine/${group.part}-${selections[group.part].part}.png" alt="" style="filter:url(#machine-${group.part}-tint)" /></div>`).join('')}
    </div>
    <div class="part-controls machine-controls">${groups.map((group) => {
      const selected = selections[group.part];
      return `<fieldset>
        <legend>${group.label}</legend>
        <div class="part-options">${group.values.map(([label, value]) => `<button type="button" class="part ${selected.part === value ? 'selected' : ''}" data-part="${group.partId}" data-value="${value}">${label}</button>`).join('')}</div>
        <label class="machine-color"><span>COLOR <output>${String(selected.color.index).padStart(2, '0')}</output></span><input type="range" min="0" max="31" step="1" value="${selected.color.index}" data-machine-color="${group.colorId}" data-machine-part="${group.part}" style="--machine-color:${selected.color.css}" /></label>
      </fieldset>`;
    }).join('')}<button class="confirm-button full" data-action="custom-confirm">IT IS COMPLETE</button></div>
  </div>`;
}

function vesselControl() {
  const groups = [
    ['HEAD', 'vesselHeadIndex', 8],
    ['BODY', 'vesselBodyIndex', 6],
    ['LEGS', 'vesselLegsIndex', 5],
  ];
  const selectedFrame = (id, maximum) => {
    const value = Number.parseInt(answer(id, '0'), 10);
    return Number.isInteger(value) && value >= 0 && value <= maximum ? value : 0;
  };
  const head = selectedFrame('vesselHeadIndex', 7);
  const body = selectedFrame('vesselBodyIndex', 5);
  const legs = selectedFrame('vesselLegsIndex', 4);
  return `<div class="vessel-maker">
    <div class="vessel-preview" role="img" aria-label="Vessel preview: head ${head + 1}, body ${body + 1}, legs ${legs + 1}">
      <img class="vessel-sprite v-head" src="${BASE_URL}images/vessel/head-${head}.png" alt="" />
      <img class="vessel-sprite v-body" src="${BASE_URL}images/vessel/body-${body}.png" alt="" />
      <img class="vessel-sprite v-legs" src="${BASE_URL}images/vessel/legs-${legs}.png" alt="" />
    </div>
    <div class="part-controls">${groups.map(([label, id, count]) => {
      const values = Array.from({ length: count }, (_, index) => String(index));
      return `<fieldset><legend>${label}</legend><div>${values.map((value) => `<button type="button" class="part ${answer(id, '0') === value ? 'selected' : ''}" data-part="${id}" data-value="${value}" aria-label="${label} ${Number(value) + 1}">${String(Number(value) + 1).padStart(2, '0')}</button>`).join('')}</div></fieldset>`;
    }).join('')}<button class="confirm-button full" data-action="custom-confirm">THIS IS MY VESSEL</button></div>
  </div>`;
}

function multiControl(question) {
  const chosen = answer(question.id, []);
  return `<form class="multi-control"><div class="multi-grid">${question.options.map((value) => `<label class="multi-option ${chosen.includes(value) ? 'selected' : ''}"><input type="checkbox" value="${escapeHtml(value)}" ${chosen.includes(value) ? 'checked' : ''}/><span class="box">×</span>${value}</label>`).join('')}</div><button class="confirm-button full" type="submit">REMEMBER THESE</button></form>`;
}

function bindQuestion(question) {
  if (question.type === 'text') {
    const form = app.querySelector('[data-control="text"]');
    const input = form.querySelector('input');
    requestAnimationFrame(() => input.focus());
    form.addEventListener('submit', (event) => {
      event.preventDefault(); const value = input.value.trim(); if (!value) { input.classList.add('error'); return; }
      state.answers[question.id] = value;
      if (question.id === 'nameConfirmed' && value === 'no') state.answers.playerName = '';
      completeQuestion(question);
    });
    return;
  }
  if (question.type === 'machine' || question.type === 'vessel') {
    app.querySelectorAll('[data-part]').forEach((button) => button.addEventListener('click', () => {
      state.answers[button.dataset.part] = button.dataset.value; render();
    }));
    if (question.type === 'machine') {
      app.querySelectorAll('[data-machine-color]').forEach((input) => {
        input.addEventListener('input', () => {
          state.answers[input.dataset.machineColor] = input.value;
          const color = machineColor(input.value);
          input.style.setProperty('--machine-color', color.css);
          input.closest('.machine-color').querySelector('output').textContent = String(color.index).padStart(2, '0');
          app.querySelector(`[data-machine-matrix="${input.dataset.machinePart}"]`).setAttribute('values', machineColorMatrix(color.rgb));
        });
      });
    }
    app.querySelector('[data-action="custom-confirm"]').addEventListener('click', () => {
      if (question.type === 'machine') {
        state.answers.machineHead ??= 'laser'; state.answers.machineBody ??= 'plain'; state.answers.machineShoes ??= 'sneak';
        state.answers.machineHeadColor ??= '4'; state.answers.machineBodyColor ??= '17'; state.answers.machineShoeColor ??= '26';
      } else {
        state.answers.vesselHeadIndex ??= '0'; state.answers.vesselBodyIndex ??= '0'; state.answers.vesselLegsIndex ??= '0';
      }
      state.answers[question.id] = 'complete'; completeQuestion(question);
    });
    return;
  }
  if (question.type === 'multi') {
    app.querySelectorAll('.multi-option input').forEach((input) => input.addEventListener('change', () => input.closest('label').classList.toggle('selected', input.checked)));
    app.querySelector('.multi-control').addEventListener('submit', (event) => {
      event.preventDefault(); state.answers[question.id] = [...app.querySelectorAll('.multi-option input:checked')].map((input) => input.value); completeQuestion(question);
    });
    return;
  }
  const choices = [...app.querySelectorAll('.choice[data-value]')];
  choices.forEach((button) => button.addEventListener('click', () => {
    state.answers[question.id] = button.dataset.value;
    if (question.id === 'nameConfirmed' && button.dataset.value === 'no') {
      state.answers.playerName = ''; state.index = 0; render(); return;
    }
    button.classList.add('chosen');
    setTimeout(() => completeQuestion(question), 110);
  }));
  bindChoiceKeys(choices);
}

function bindChoiceKeys(choices) {
  if (!choices.length) return;
  let active = Math.max(0, choices.findIndex((button) => button.classList.contains('selected')));
  choices[active].classList.add('keyboard-focus');
  document.onkeydown = (event) => {
    if (!['ArrowDown', 'ArrowUp', 'Enter', 'z', 'Z'].includes(event.key)) return;
    event.preventDefault(); choices[active].classList.remove('keyboard-focus');
    if (event.key === 'ArrowDown') active = (active + 1) % choices.length;
    else if (event.key === 'ArrowUp') active = (active - 1 + choices.length) % choices.length;
    else { choices[active].click(); document.onkeydown = null; return; }
    choices[active].classList.add('keyboard-focus'); choices[active].focus();
  };
}

function completeQuestion(question) {
  persist();
  if (state.editing) { state.editing = false; state.mode = 'summary'; render(); return; }
  if (question.after && ((question.id !== 'c5FestivalMemory') || answer(question.id) === 'no')) {
    state.afterMessage = question.after; state.mode = 'after'; render(); return;
  }
  advanceQuestion();
}

function advanceQuestion() {
  const questions = visibleQuestions();
  if (state.index < questions.length - 1) { state.index += 1; }
  else if (state.chapter === 0) { state.chapter = 1; state.mode = 'intro'; state.index = 0; state.introIndex = 0; persist(); }
  else { state.mode = 'summary'; }
  render();
}

function renderAfter() {
  layout(`<section class="dialogue after-panel"><h1>${formatText(state.afterMessage)}</h1><button class="continue-prompt" data-action="continue">CONTINUE <span>↵</span></button></section>`, 'intro-stage');
  app.querySelector('[data-action="continue"]').addEventListener('click', () => { state.afterMessage = ''; state.mode = 'survey'; advanceQuestion(); });
}

function goBack() {
  if (state.index > 0) { state.index -= 1; render(); }
  else { state.mode = 'intro'; state.introIndex = Math.max(0, chapters[state.chapter].intro.length - 1); render(); }
}

function nextChapterOrSummary() {
  if (state.chapter === 0) { state.chapter = 1; state.mode = 'intro'; } else state.mode = 'summary';
  render();
}

function renderSummary() {
  const chapter = state.chapter;
  const facts = summaryFacts(chapter);
  const answerRows = visibleQuestions().filter((q) => q.type !== 'machine' && q.type !== 'vessel').map((question) => {
    const raw = answer(question.id, '—');
    const label = Array.isArray(raw) ? (raw.join(', ') || 'NONE') : labelFor(question, raw);
    const prompt = typeof question.text === 'function' ? question.text() : question.text;
    return `<button class="memory-row" data-edit="${question.id}"><span>${escapeHtml(prompt.split('\n')[0])}</span><strong>${escapeHtml(label)}</strong><i>CHANGE</i></button>`;
  }).join('');
  layout(`<section class="summary-shell">
    <div class="summary-number">0${chapter}</div>
    <p class="kicker">CHAPTER ${chapter} COMPLETE</p>
    <h1>WE REMEMBER.</h1>
    <div class="memory-facts">${facts.map((fact) => `<p>${fact}</p>`).join('')}</div>
    <p class="history-question">IS THIS<br>YOUR HISTORY?</p>
    <div class="summary-actions">
      <button class="choice primary" data-action="accept"><span class="soul">♥</span>YES</button>
      <button class="choice" data-action="review"><span class="soul">♥</span>CHANGE SOMETHING</button>
    </div>
    <div class="review-drawer" hidden><div class="drawer-head"><span>RECORDED MEMORIES</span><button data-action="close-review">CLOSE ×</button></div>${answerRows}</div>
  </section>`, 'summary-stage');
  app.querySelector('[data-action="accept"]').addEventListener('click', acceptChapter);
  app.querySelector('[data-action="review"]').addEventListener('click', () => { app.querySelector('.review-drawer').hidden = false; });
  app.querySelector('[data-action="close-review"]').addEventListener('click', () => { app.querySelector('.review-drawer').hidden = true; });
  app.querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', () => editAnswer(button.dataset.edit)));
}

function labelFor(question, value) {
  return question.options?.find((item) => item.value === value)?.label ?? String(value).toUpperCase();
}

function summaryFacts(chapter) {
  const a = state.answers;
  if (chapter === 1) return [
    `THE KING WAS <strong>${a.c1KingAid === 'yes' ? 'SPARED' : 'DEFEATED'}</strong>.`,
    `THE PRISONER WAS <strong>${a.c1JevilEnd ? 'FREED' : 'LEFT BEHIND'}</strong>.`,
    `THE EGG WAS <strong>${a.c1EggGift === 'egg' ? 'FOUND' : 'NEVER FOUND'}</strong>.`,
    `THE STARWALKER WAS <strong>${a.c1StarwalkerBack === 'yes' ? 'FOUND' : 'LEFT BEHIND'}</strong>.`,
  ];
  if (chapter === 2) return [
    `NOELLE WAS <strong>${a.c2Frozen === 'yes' ? 'MADE STRONGER' : 'SAFE'}</strong>.`,
    `<strong>${(a.c2Recruitment || 'NO').toUpperCase()}</strong> DARKNERS FOLLOWED YOU HOME.`,
    `THE SALESMAN <strong>${a.c2Strings === 'mercy' ? 'WAS FREED' : a.c2Strings === 'violence' ? 'REMAINED A PUPPET' : 'WAS LEFT BEHIND'}</strong>.`,
    `YOU HAVE FOUND <strong>${shadowCount(a, 2)}</strong> SHADOW CRYSTALS.`,
  ];
  if (chapter === 3) return [
    `THE PERFORMERS <strong>${a.c3Recruitment === 'all' ? 'ALL CAME WITH YOU' : a.c3Recruitment === 'some' ? 'FOLLOWED IN PART' : 'DID NOT FOLLOW'}</strong>.`,
    `THE KNIGHT WAS <strong>${a.c3Knight === 'yes' ? 'DEFEATED' : 'LEFT UNBEATEN'}</strong>.`,
    `THE SHOW LEFT <strong>${a.c3Hurt === 'yes' ? 'SOMEONE HURT' : 'NO ONE LOST'}</strong>.`,
  ];
  if (chapter === 4) return [
    `FOUR. YOU HAVE COME <strong>FAR</strong>.`,
    `YOU HAVE FOUND <strong>${shadowCount(a, 4)}</strong> SHADOW CRYSTALS.`,
    `YOU HAVE FOUND <strong>${eggCount(a, 4)}</strong> EGGS.`,
    `THE SANCTUARY GREW <strong>QUIET</strong> AGAIN.`,
  ];
  return [
    `FIVE DAYS. <strong>FIVE HISTORIES.</strong>`,
    `YOU FOUND <strong>${eggCount(a, 5)}</strong> EGGS.`,
    `YOU DEFEATED <strong>${shadowCount(a, 5)}</strong> SHADOWS.`,
    `YOU MADE NOELLE <strong>${a.c2Frozen === 'yes' ? 'STRONGER' : 'FEEL SAFE'}</strong>.`,
  ];
}

function editAnswer(id) {
  const index = visibleQuestions().findIndex((question) => question.id === id);
  if (index < 0) return;
  state.index = index; state.editing = true; state.mode = 'survey'; render();
}

function acceptChapter() {
  if (!state.completed.includes(state.chapter)) state.completed.push(state.chapter);
  persist(); state.mode = 'download'; render();
}

function renderDownload() {
  const chapter = state.chapter;
  const fileIndex = state.selectedSlot + 2;
  const nextLabel = chapter === 5 ? 'CONTINUE TO FINAL REVIEW' : `CONTINUE TO CHAPTER ${chapter + 1}`;
  layout(`<section class="download-shell">
    <div class="file-orbit" aria-hidden="true"><span class="file-icon"><i></i><b>FILE</b></span><span class="orbit one"></span><span class="orbit two"></span></div>
    <p class="kicker">HISTORY RESTORED</p>
    <h1>YOUR CHAPTER ${chapter}<br>COMPLETION FILE<br>IS READY.</h1>
    <div class="slot-picker"><span>SAVE SLOT</span>${[1, 2, 3].map((slot) => `<button class="${state.selectedSlot === slot ? 'selected' : ''}" data-slot="${slot}">${slot}</button>`).join('')}</div>
    <button class="download-button" data-action="download"><span>↓</span><strong>DOWNLOAD CHAPTER ${chapter} FILE</strong><small>filech${chapter}_${fileIndex}${chapter === 5 && isWeirdEnding() ? '_b' : ''}</small></button>
    <p class="download-status" aria-live="polite">${state.downloaded ? `FILE CREATED: ${state.downloaded}` : 'PC / MAC / LINUX · PLAIN SAVE DATA'}</p>
    <button class="continue-chapter" data-action="next">${nextLabel} <span>→</span></button>
    <p class="backup-note">BACK UP YOUR SAVE DIRECTORY BEFORE REPLACING A FILE.</p>
  </section>`, 'download-stage');
  app.querySelectorAll('[data-slot]').forEach((button) => button.addEventListener('click', () => { state.selectedSlot = Number(button.dataset.slot); persist(); render(); }));
  app.querySelector('[data-action="download"]').addEventListener('click', () => { state.downloaded = downloadCompletion(chapter, state.selectedSlot, state.answers); render(); });
  app.querySelector('[data-action="next"]').addEventListener('click', () => {
    state.index = 0; state.introIndex = 0;
    if (chapter === 5) state.mode = 'final';
    else { state.chapter += 1; state.mode = 'intro'; state.downloaded = null; }
    persist(); render();
  });
}

function isWeirdEnding() { return answer('c2Frozen') === 'yes' && answer('c4Weird') === 'continue' && answer('c5Route') !== 'stop'; }

function renderFinal() {
  const a = state.answers;
  const name = escapeHtml(answer('playerName', 'KRIS').toUpperCase());
  layout(`<section class="final-shell">
    <div class="final-copy">
      <p>FIVE DAYS.</p><p>FIVE HISTORIES.</p>
      <p>YOU FOUND <em>${eggCount(a, 5)}</em> EGGS.</p>
      <p>YOU BROUGHT DARKNERS<br>WITH YOU.</p>
      <p>YOU DEFEATED <em>${shadowCount(a, 5)}</em> SHADOWS.</p>
      <p>YOUR MACHINE HAD<br><em>${escapeHtml(answer('machineShoes', 'SNEAK').toUpperCase())} SHOES.</em></p>
      <p>YOU ${a.c1Beds === 'yes' ? '' : 'NEVER '}INSPECTED THE BEDS.</p>
      <p>YOU ${a.c1StarwalkerBack === 'yes' ? 'REMEMBERED' : 'FORGOT'}<br>THE STARWALKER.</p>
      <p class="long-pause">...</p>
      <p>THERE ARE MANY MORE<br>QUESTIONS WE COULD<br>HAVE ASKED.</p>
      <p>FORTUNATELY,<br>WE BELIEVE<br>THIS IS ENOUGH.</p>
    </div>
    <div class="final-decision">
      <p>THIS PERSON HAS MADE<br>ALL OF THESE CHOICES.</p>
      <p>THIS PERSON HAS LIVED<br>THIS HISTORY.</p>
      <h1>SO TELL US, ${name}.<br><br>IS THIS YOU?</h1>
      <div class="summary-actions"><button class="choice primary" data-action="final-yes"><span class="soul">♥</span>YES</button><button class="choice" data-action="final-no"><span class="soul">♥</span>NO</button></div>
    </div>
  </section>`, 'final-stage');
  app.querySelector('[data-action="final-yes"]').addEventListener('click', () => { state.mode = 'final-download'; render(); });
  app.querySelector('[data-action="final-no"]').addEventListener('click', () => { state.mode = 'summary'; render(); });
}

function renderFinalDownload() {
  const fileIndex = state.selectedSlot + 2;
  layout(`<section class="download-shell final-download">
    <div class="sigil small" aria-hidden="true"><span></span><i></i></div>
    <p class="kicker">EXCELLENT.</p>
    <h1>YOUR PAST<br>HAS BEEN RESTORED.</h1>
    <p class="epilogue">FROM THIS POINT FORWARD,<br>YOUR CHOICES ARE YOUR OWN.<br><br>...<br><br>AREN'T THEY?</p>
    <div class="slot-picker"><span>SAVE SLOT</span>${[1, 2, 3].map((slot) => `<button class="${state.selectedSlot === slot ? 'selected' : ''}" data-slot="${slot}">${slot}</button>`).join('')}</div>
    <button class="download-button" data-action="download"><span>↓</span><strong>DOWNLOAD CHAPTER 5 FILE</strong><small>filech5_${fileIndex}${isWeirdEnding() ? '_b' : ''}</small></button>
    <p class="download-status" aria-live="polite">${state.downloaded ? `FILE CREATED: ${state.downloaded}` : 'THE RECONSTRUCTION IS COMPLETE'}</p>
    <button class="continue-chapter" data-action="review-all">REVIEW THIS HISTORY <span>↺</span></button>
    <p class="backup-note">BACK UP YOUR SAVE DIRECTORY BEFORE REPLACING A FILE.</p>
  </section>`, 'download-stage');
  app.querySelectorAll('[data-slot]').forEach((button) => button.addEventListener('click', () => { state.selectedSlot = Number(button.dataset.slot); persist(); render(); }));
  app.querySelector('[data-action="download"]').addEventListener('click', () => { state.downloaded = downloadCompletion(5, state.selectedSlot, state.answers); render(); });
  app.querySelector('[data-action="review-all"]').addEventListener('click', () => { state.mode = 'summary'; state.chapter = 1; render(); });
}

function resetHistory() {
  localStorage.removeItem(STORAGE_KEY);
  Object.assign(state, { mode: 'intro', chapter: 0, index: 0, introIndex: 0, answers: {}, completed: [], editing: false, afterMessage: '', selectedSlot: 1, downloaded: null });
  render();
}

function formatText(text) { return escapeHtml(text).replace(/\n/g, '<br>'); }

function render() {
  document.onkeydown = null;
  app.className = `chapter-${state.chapter} mode-${state.mode}`;
  if (state.mode === 'resume') renderResume();
  else if (state.mode === 'intro') renderIntro();
  else if (state.mode === 'survey') renderQuestion();
  else if (state.mode === 'after') renderAfter();
  else if (state.mode === 'summary') renderSummary();
  else if (state.mode === 'download') renderDownload();
  else if (state.mode === 'final') renderFinal();
  else if (state.mode === 'final-download') renderFinalDownload();
}

render();
