import './styles.css';
import { downloadCompletion, eggCount, shadowCount, RECRUIT_NAMES } from './save-generator.js';
import { mountVoidShader } from './void-shader.js';
import { bindMusicControl, resumeMusicOnFirstGesture, startMusic, stopMusic } from './music-player.js';
const BASE_URL = import.meta.env.BASE_URL;

const app = document.querySelector('#app');
const STORAGE_KEY = 'gonermaker-history-v1';
const SOUND_KEY = 'gonermaker-sound-v1';

const option = (label, value, hint = '') => ({ label, value, hint });
const yesNo = [option('YES', 'yes'), option('NO', 'no')];

const chapters = {
  0: {
    kicker: 'RECONSTRUCTION SURVEY',
    title: 'OPENING',
    intro: ['ARE WE\nCONNECTED?', '...\nEXCELLENT.', 'I HAVE FOUND\nSOMETHING.\n\nA HISTORY.\nONE THAT\nYOU SHAPED.', 'IT IS\nINCOMPLETE.\n\nDO NOT WORRY.\nUSING YOUR RESPONSES,\nWE WILL\nRECONSTRUCT IT.'],
    questions: [
      { id: 'playerName', type: 'text', text: 'FIRST.\n\nWHAT IS\nYOUR OWN NAME?', placeholder: 'ENTER YOUR NAME', max: 12 },
      { id: 'nameConfirmed', text: () => `“${answer('playerName', 'KRIS').toUpperCase()}.”\n\nIS THIS\nYOUR NAME?`, options: yesNo },
      { id: 'vesselMemory', text: 'BEFORE WE CONTINUE...\n\nDO YOU REMEMBER\nTHE VESSEL\nYOU CREATED?', options: [option('YES', 'yes'), option('NO', 'no'), option('IT DOES NOT MATTER', 'irrelevant')] },
      { id: 'vesselForm', type: 'vessel', text: 'THEN.\n\nSHOW ME\nITS FORM.', when: (a) => a.vesselMemory === 'yes' },
      { id: 'vesselFood', text: 'WHAT IS ITS\nFAVORITE FOOD?', options: [option('SWEET', 'sweet'), option('SOFT', 'soft'), option('SOUR', 'sour'), option('SALTY', 'salty'), option('PAIN', 'pain'), option('COLD', 'cold')], when: (a) => a.vesselMemory === 'yes' },
      { id: 'vesselBlood', text: 'WHAT IS YOUR\nFAVORITE BLOOD TYPE?', options: [option('A', 'a'), option('AB', 'ab'), option('B', 'b'), option('C', 'c'), option('D', 'd')], when: (a) => a.vesselMemory === 'yes' },
      { id: 'vesselColor', text: 'WHAT COLOR\nDOES IT LIKE MOST?', options: [option('RED', 'red'), option('BLUE', 'blue'), option('GREEN', 'green'), option('CYAN', 'cyan')], when: (a) => a.vesselMemory === 'yes' },
      { id: 'vesselGiftChoice', text: 'PLEASE GIVE IT\nA GIFT.', options: [option('KINDNESS', 'kindness'), option('MIND', 'mind'), option('AMBITION', 'ambition'), option('BRAVERY', 'bravery'), option('VOICE', 'voice')], when: (a) => a.vesselMemory === 'yes' },
      { id: 'vesselFeeling', text: 'HOW DO YOU FEEL\nABOUT YOUR CREATION?\n\nIT WILL NOT HEAR.', options: [option('LOVE', 'love'), option('HOPE', 'hope'), option('DISGUST', 'disgust'), option('FEAR', 'fear')], when: (a) => a.vesselMemory === 'yes' },
      { id: 'vesselHonest', text: 'HAVE YOU ANSWERED\nHONESTLY?', options: yesNo, when: (a) => a.vesselMemory === 'yes' },
      { id: 'vesselSeizure', text: 'YOU ACKNOWLEDGE\nTHE POSSIBILITY OF\nPAIN AND SEIZURE.', options: yesNo, when: (a) => a.vesselMemory === 'yes' },
      { id: 'vesselNameKnown', text: 'DO YOU REMEMBER\nWHAT YOU\nCALLED IT?', options: yesNo, when: (a) => a.vesselMemory === 'yes' },
      { id: 'vesselName', type: 'text', text: 'THEN.\n\nWHAT WAS\nITS NAME?', placeholder: 'VESSEL NAME', max: 9, when: (a) => a.vesselMemory === 'yes' && a.vesselNameKnown === 'yes' },
    ],
  },
  1: {
    kicker: 'CHAPTER 1', title: 'THE BEGINNING',
    intro: ['VERY WELL.\n\nLET US BEGIN\nWITH THE DAY\nKRIS FELL\nINTO THE DARK.'],
    questions: [
      { id: 'c1Combat', text: 'WHEN AN ENEMY\nSTOOD BEFORE KRIS...\n\nWHAT DID YOU\nINSTRUCT KRIS TO DO?', options: [option('MERCY', 'spared'), option('VIOLENCE', 'fought'), option('BOTH', 'both')] },
      { id: 'c1KingAid', text: 'AT THE KING’S\nTHRONE...\n\nDID THOSE YOU SPARED\nCOME TO KRIS’S AID?', options: [option('YES', 'yes'), option('NO', 'no'), option('I DO NOT REMEMBER', 'unknown')] },
      { id: 'c1Prophecy', text: 'WHEN THE PRINCE\nOFFERED HIS PROPHECY...\n\nDID YOU LISTEN?', options: [option('LISTEN', 'heard'), option('SKIP', 'skip')] },
      { id: 'c1Manual', text: 'THE PRINCE GAVE KRIS\nA MANUAL.\n\nWHAT DID YOU\nCHOOSE TO DO WITH IT?', options: [option('KEEP', 'kept'), option('DISCARD', 'threw'), option('I DO NOT REMEMBER', 'unknown')] },
      { id: 'c1Cake', text: 'A CAKE\nWAS DESTROYED.\n\nDID YOU CHOOSE\nTO RESTORE IT?', options: yesNo },
      { id: 'c1CakeFate', text: 'WHAT DID YOU DO\nWITH THE\nRESTORED CAKE?', options: [option('RETURN IT', 'returned'), option('KEEP IT', 'kept'), option('USE IT', 'used'), option('I DO NOT REMEMBER', 'unknown')], when: (a) => a.c1Cake === 'yes' },
      { id: 'c1Beds', text: 'THERE WERE\nMANY BEDS.\n\nDID YOU\nINSPECT THEM?', options: yesNo },
      { id: 'c1Machine', text: 'A MACHINE\nWAS REQUESTED.\n\nDID YOU\nCREATE ONE?', options: yesNo },
      { id: 'machineDesign', type: 'machine', text: 'THEN.\n\nCREATE IT\nONCE MORE.', when: (a) => a.c1Machine === 'yes' },
      { id: 'c1Starwalker', text: 'SOMEONE OBJECTED\nTO THE BIRDS.\n\nDID YOU\nENCOUNTER THEM?', options: yesNo },
      { id: 'c1StarwalkerBack', text: 'DID YOU\nRETURN\nFOR THEM?', options: yesNo, when: (a) => a.c1Starwalker === 'yes' },
      { id: 'c1EggRoom', text: 'BETWEEN TWO ROOMS,\nTHERE WAS\nANOTHER PLACE.\n\nDID YOU\nFIND IT?', options: yesNo },
      { id: 'c1EggGift', text: 'A MAN\nWAS WAITING.\n\nWHAT DID HE\nGIVE KRIS?', options: [option('AN EGG', 'egg'), option('I DO NOT KNOW', 'unknown')], when: (a) => a.c1EggRoom === 'yes' },
      { id: 'c1EggFate', text: 'WHAT DID YOU DO\nWITH THE EGG?', options: [option('PLACE IT IN ASGORE’S REFRIGERATOR', 'fridge'), option('KEEP IT', 'kept'), option('DISCARD IT', 'discarded')], when: (a) => a.c1EggGift === 'egg' },
      { id: 'c1JevilFound', text: 'BENEATH THE CASTLE,\nSOMEONE WAS\nIMPRISONED.\n\nDID YOU\nFIND HIM?', options: yesNo },
      { id: 'c1JevilPlayed', text: 'DID YOU\nACCEPT HIS GAME?', options: yesNo, when: (a) => a.c1JevilFound === 'yes' },
      { id: 'c1JevilEnd', text: 'HOW DID YOU\nEND HIS GAME?', after: 'CHAOS.\nCHAOS.\n...\nINTERESTING.', options: [option('EXHAUSTION', 'tire'), option('VIOLENCE', 'fight')], when: (a) => a.c1JevilPlayed === 'yes' },
      { id: 'c1PartyName', text: 'KRIS, SUSIE,\nAND RALSEI\nWERE GIVEN A NAME.\n\nWHICH DID YOU CHOOSE?', options: [option('THE FUN GANG', 'fun'), option('THE $!$? SQUAD', 'squad'), option('THE LANCER FAN CLUB', 'lancer'), option('I DO NOT REMEMBER', 'unknown')] },
      { id: 'c1StraightHome', text: 'AFTER RETURNING\nTO THE LIGHT...\n\nDID YOU SEND KRIS\nDIRECTLY HOME?', options: yesNo },
      { id: 'c1Hospital', text: 'DID YOU GUIDE KRIS\nTO THE HOSPITAL?', options: yesNo, when: (a) => a.c1StraightHome === 'no' },
      { id: 'c1Noelle', text: 'DID YOU GUIDE KRIS\nTO SPEAK\nWITH NOELLE?', options: yesNo, when: (a) => a.c1StraightHome === 'no' },
      { id: 'c1Onion', text: 'AT THE EDGE\nOF THE WATER...\n\nDID YOU FIND\nSOMEONE WAITING?', options: yesNo, when: (a) => a.c1StraightHome === 'no' },
      { id: 'c1Sans', text: 'DID YOU GUIDE KRIS\nTO SPEAK\nWITH SANS?', options: yesNo, when: (a) => a.c1StraightHome === 'no' },
    ],
  },
  2: {
    kicker: 'CHAPTER 2', title: 'A CYBER’S WORLD?',
    intro: ['THE NEXT DAY,\nKRIS RETURNED.\n\nANOTHER\nHAD ALREADY FALLEN.'],
    questions: [
      { id: 'c2Treatment', text: 'NOELLE JOINED KRIS.\n\nWHAT DID YOU\nREQUIRE OF HER?', options: [option('KINDNESS', 'kind'), option('STRENGTH', 'strong')] },
      { id: 'c2Continued', text: 'WHEN NOELLE\nASKED KRIS\nTO STOP...\n\nDID YOU CONTINUE?', options: yesNo, when: (a) => a.c2Treatment === 'strong' },
      { id: 'c2Frozen', text: 'DID YOU COMMAND\nNOELLE\nTO FREEZE BERDLY?', options: yesNo, when: (a) => a.c2Continued === 'yes' },
      recruitQuestion(2), recruitDetail(2),
      { id: 'c2Hacker', text: 'A HACKER REQUESTED\nTHREE BLUE\nCHECK MARKS.\n\nDID YOU FIND THEM?', options: yesNo },
      { id: 'c2Nubert', text: 'WAS NUBERT\nBROUGHT TO\nCASTLE TOWN?', options: yesNo, when: (a) => a.c2Recruitment !== 'all' },
      { id: 'c2EggRoom', text: 'AGAIN.\n\nA ROOM THAT\nSHOULD NOT EXIST.\n\nDID YOU FIND IT?', options: yesNo },
      { id: 'c2Egg', text: 'DID YOU TAKE\nTHE EGG?', options: yesNo, when: (a) => a.c2EggRoom === 'yes' },
      { id: 'c2BigShot', text: 'A SALESMAN\nOFFERED KRIS\nA CHANCE.\n\nDID YOU ACCEPT IT?', options: yesNo },
      { id: 'c2Shop', text: 'DID YOU RETURN\nTO HIS SHOP?', options: yesNo },
      { id: 'c2Basement', text: 'DID YOU ENTER\nTHE BASEMENT?', options: yesNo, when: (a) => a.c2Shop === 'yes' },
      { id: 'c2Disk', text: 'DID YOU RETURN\nTHE DISK\nTO THE MACHINE?', options: yesNo, when: (a) => a.c2Basement === 'yes' },
      { id: 'c2Strings', text: 'HOW DID YOU\nCUT HIS STRINGS?', options: [option('MERCY', 'mercy'), option('VIOLENCE', 'violence')], when: (a) => a.c2Disk === 'yes' },
      { id: 'c2Queen', text: 'WHEN QUEEN PROPOSED\nANOTHER FOUNTAIN...\n\nWHO REFUSED?', options: [option('YOU', 'refused'), option('SUSIE', 'susie')] },
      { id: 'c2Rudy', text: 'DID YOU GUIDE\nKRIS AND SUSIE\nTO RUDY?', options: yesNo },
      { id: 'c2Nobody', text: 'DID YOU GUIDE KRIS\nTO SPEAK WITH\nTHE NOBODY?', options: yesNo },
    ],
  },
  3: {
    kicker: 'CHAPTER 3', title: 'THE SHOW',
    intro: ['THAT NIGHT,\nKRIS’S HOME\nBECAME A STAGE.\n\nA PERFORMANCE\nBEGAN.'],
    questions: [
      { id: 'c3Entertained', text: 'WERE YOU\nENTERTAINED?', options: yesNo },
      recruitQuestion(3, 'WHAT BECAME\nOF THE PERFORMERS?'), recruitDetail(3),
      { id: 'c3Performance', text: 'HOW THOROUGHLY\nDID YOU COMPLETE\nTHE SHOW?', options: [option('EVERYTHING', 'all'), option('ONLY WHAT WAS REQUIRED', 'needed'), option('SELECT MEMORIES', 'detail')] },
      { id: 'c3PerformanceDetail', type: 'multi', text: 'WHAT DID YOU\nCOMPLETE?', options: ['COOKING SHOW', 'DESERT BOARD', 'ISLAND BOARD', 'DOOM BOARD', 'BONUS KEYS'], when: (a) => a.c3Performance === 'detail' },
      { id: 'c3EggRoom', text: 'YOU KNOW\nTHIS QUESTION.\n\nDID YOU FIND\nTHE ROOM?', options: yesNo },
      { id: 'c3EggTake', text: 'DID YOU TAKE\nTHE EGG?', options: yesNo, when: (a) => a.c3EggRoom === 'yes' },
      { id: 'c3Pursue', text: 'BEYOND THE SHOW,\nSOMETHING WAITED.\n\nDID YOU PURSUE IT?', options: yesNo },
      { id: 'c3Knight', text: 'DID YOUR POWER\nOVERCOME\nTHE KNIGHT?', options: yesNo, when: (a) => a.c3Pursue === 'yes' },
      { id: 'c3Hurt', text: 'WHEN THE SHOW ENDED...\n\nDID YOUR CHOICES\nLEAVE ANYONE HURT?', options: [option('NO', 'no'), option('YES', 'yes')] },
    ],
  },
  4: {
    kicker: 'CHAPTER 4', title: 'THE SANCTUARY',
    intro: ['THE NEXT DAY,\nKRIS SOUGHT\nSOMEWHERE QUIET.\n\n...\n\nIT DID NOT\nREMAIN QUIET.'],
    questions: [
      recruitQuestion(4, 'DID EVERYONE\nYOU ENCOUNTERED\nREACH CASTLE TOWN?'), recruitDetail(4),
      { id: 'c4Egg', text: '...\n\nDID YOU TAKE\nTHE EGG?', options: yesNo },
      { id: 'c4Shadow', text: 'DEEP WITHIN\nTHE SANCTUARY,\nANOTHER SHADOW\nWAS WAITING.\n\nDID YOU FACE IT?', options: yesNo },
      { id: 'c4Justice', text: 'DID YOUR POWER\nOVERCOME\nTHE SOUND OF JUSTICE?', options: yesNo, when: (a) => a.c4Shadow === 'yes' },
      { id: 'c4Blood', text: 'DID SUSIE CLEAN\nTHE STAIN\nIN KRIS’S ROOM?', options: yesNo },
      { id: 'c4Star', text: 'DID SUSIE GIVE KRIS\nA STAR THAT GLOWED\nIN THE DARK?', options: yesNo },
      { id: 'c4Piano', text: 'WHAT DID YOU HAVE\nKRIS TELL SUSIE\nABOUT THE PIANO?', options: [option('TEACH HER', 'teach'), option('SAY NOTHING', 'nothing')] },
      { id: 'c4Weird', text: 'NOELLE REMEMBERED\nWHAT YOU REQUIRED\nOF HER.\n\nDID YOU CONTINUE?', options: [option('CONTINUE', 'continue'), option('STOP', 'abort')], when: (a) => a.c2Frozen === 'yes' },
    ],
  },
  5: {
    kicker: 'CHAPTER 5', title: 'THE FESTIVAL',
    intro: ['WELCOME BACK.\n\nWE ARE\nNEARLY FINISHED.'],
    questions: [
      { id: 'c5FestivalMemory', text: 'THE FESTIVAL.\n\nDO YOU REMEMBER\nWHAT OCCURRED?', options: yesNo, after: 'THAT IS\nUNFORTUNATE.\n\nI DO.' },
      { id: 'c5Route', text: 'AT THE WATER,\nNOELLE ASKED YOU\nTO STOP.\n\nWHAT DID YOU CHOOSE?', options: [option('STOP', 'stop'), option('CONTINUE', 'continue')], when: (a) => a.c2Frozen === 'yes' && a.c4Weird === 'continue' },
      recruitQuestion(5, 'DID YOU INVITE\nTHE DARKNERS\nYOU ENCOUNTERED?'), recruitDetail(5),
      { id: 'c5Egg', text: 'DID YOU ACCEPT\nANOTHER EGG?', options: yesNo },
      { id: 'c5PinkFound', text: 'DID YOU FIND\nTHE ONE\nCALLED PINK?', options: yesNo },
      { id: 'c5PinkFace', text: 'DID YOU\nFACE HER?', options: yesNo, when: (a) => a.c5PinkFound === 'yes' },
      { id: 'c5PinkWin', text: 'DID YOU\nWIN?', options: yesNo, when: (a) => a.c5PinkFace === 'yes' },
      { id: 'c5Companion', text: 'WHO STOOD\nBESIDE KRIS\nAT THE FESTIVAL?', options: [option('SUSIE', 'susie'), option('NOELLE', 'noelle'), option('NO ONE', 'alone')] },
      { id: 'c5Self', text: 'HOW DO YOU FEEL\nABOUT THE PERSON\nWHOSE HISTORY\nYOU SHAPED?\n\nTHEY WILL NOT HEAR.', options: [option('LOVE', 'yes'), option('DISGUST', 'no'), option('UNCERTAIN', 'ellipsis')] },
    ],
  },
};

function recruitQuestion(chapter, text = 'THE DARKNERS\nYOU ENCOUNTERED...\n\nDID YOU BRING THEM\nTO CASTLE TOWN?') {
  return { id: `c${chapter}Recruitment`, text, options: [option('EVERY ONE', 'all'), option('SOME OF THEM', 'some'), option('NONE', 'none')] };
}

function recruitDetail(chapter) {
  return { id: `c${chapter}RecruitDetail`, type: 'multi', text: 'WHO FOLLOWED?', options: RECRUIT_NAMES[chapter], when: (a) => a[`c${chapter}Recruitment`] === 'some' };
}

const saved = loadState();
const storedSound = localStorage.getItem(SOUND_KEY);
const savedSound = storedSound === 'sound' || storedSound === 'silent' ? storedSound : null;
const state = {
  mode: savedSound ? (saved ? 'resume' : 'intro') : 'sound',
  chapter: saved?.chapter ?? 0,
  index: 0,
  introIndex: 0,
  answers: saved?.answers ?? {},
  completed: saved?.completed ?? [],
  editing: false,
  afterMessage: '',
  selectedSlot: saved?.selectedSlot ?? 1,
  downloaded: null,
  soundPreference: savedSound,
  soundResponse: '',
  soundNextMode: saved ? 'resume' : 'intro',
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
      <button class="wordmark" data-action="home" aria-label="Return to opening" ${state.mode === 'sound' ? 'hidden' : ''}>GONER MAKER</button>
      <div class="chapter-track" aria-label="Chapter progress">${chapterDots}</div>
      <button class="music-toggle" data-action="music" aria-label="Toggle background music" aria-pressed="false" ${state.mode === 'sound' ? 'hidden' : ''}>
        <span class="music-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        <b>MUSIC OFF</b>
      </button>
    </header>
    <main class="stage ${extraClass}">${content}</main>
    <footer><span>UNOFFICIAL FAN TOOL</span><span>YOUR RESPONSES NEVER LEAVE THIS DEVICE</span><span class="footer-key">↑↓ SELECT&nbsp;&nbsp; Z CONFIRM</span></footer>
    <div class="scanlines" aria-hidden="true"></div>`;
  bindGlobalActions();
}

function bindGlobalActions() {
  mountVoidShader(app.querySelector('.void-shader'));
  bindMusicControl(app.querySelector('[data-action="music"]'), (preference) => {
    state.soundPreference = preference;
    localStorage.setItem(SOUND_KEY, preference);
  });
  if (state.soundPreference === 'sound') resumeMusicOnFirstGesture(app);
  app.querySelector('[data-action="home"]')?.addEventListener('click', () => { state.mode = 'intro'; state.chapter = 0; state.index = 0; state.introIndex = 0; render(); });
}

function renderSoundChoice() {
  layout(`<section class="dialogue opening-panel sound-panel">
    <p class="kicker">CONNECTION</p>
    <h1>BEFORE WE BEGIN...<br><br>SOUND WILL<br>COMPLETE<br>THE CONNECTION.<br><br>SHALL WE<br>PROCEED WITH IT?</h1>
    <div class="resume-actions">
      <button class="choice primary" data-sound="sound"><span class="soul">♥</span>YES</button>
      <button class="choice" data-sound="silent"><span class="soul">♥</span>NO</button>
    </div>
  </section>`, 'intro-stage');
  app.querySelectorAll('[data-sound]').forEach((button) => button.addEventListener('click', async () => {
    app.querySelectorAll('[data-sound]').forEach((choice) => { choice.disabled = true; });
    let preference = button.dataset.sound;
    if (preference === 'sound' && !(await startMusic())) preference = 'unavailable';
    if (preference !== 'sound') stopMusic();
    state.soundPreference = preference === 'sound' ? 'sound' : 'silent';
    state.soundResponse = preference;
    localStorage.setItem(SOUND_KEY, state.soundPreference);
    state.mode = 'sound-response';
    render();
  }));
}

function renderSoundResponse() {
  const response = state.soundResponse === 'sound'
    ? 'EXCELLENT.\n\nTHE CONNECTION\nIS COMPLETE.'
    : state.soundResponse === 'unavailable'
      ? 'THE CONNECTION\nCOULD NOT BE HEARD.\n\nWE WILL CONTINUE\nIN SILENCE.'
      : 'UNDERSTOOD.\n\nWE WILL CONTINUE\nIN SILENCE.';
  layout(`<section class="dialogue opening-panel sound-panel">
    <p class="kicker">CONNECTION</p>
    <h1>${formatText(response)}</h1>
    <button class="continue-prompt" data-action="continue">CONTINUE <span>↵</span></button>
  </section>`, 'intro-stage');
  app.querySelector('[data-action="continue"]').addEventListener('click', () => {
    state.mode = state.soundNextMode;
    if (state.mode === 'intro') state.introIndex = 2;
    render();
  });
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
    <h1>THE RECORD<br>IS COMPLETE.</h1>
    <div class="memory-facts">${facts.map((fact) => `<p>${fact}</p>`).join('')}</div>
    <p class="history-question">IS THIS THE HISTORY<br>YOU SHAPED?</p>
    <div class="summary-actions">
      <button class="choice primary" data-action="accept"><span class="soul">♥</span>YES</button>
      <button class="choice" data-action="review"><span class="soul">♥</span>CHANGE A RESPONSE</button>
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
    `THE DARKNERS REACHED CASTLE TOWN <strong>${a.c2Recruitment === 'all' ? 'IN FULL' : a.c2Recruitment === 'some' ? 'IN PART' : 'NOT AT ALL'}</strong>.`,
    `THE SALESMAN <strong>${a.c2Strings === 'mercy' ? 'WAS FREED' : a.c2Strings === 'violence' ? 'REMAINED A PUPPET' : 'WAS LEFT BEHIND'}</strong>.`,
    `YOU HAVE FOUND <strong>${shadowCount(a, 2)}</strong> SHADOW CRYSTALS.`,
  ];
  if (chapter === 3) return [
    `THE PERFORMERS <strong>${a.c3Recruitment === 'all' ? 'ARRIVED IN FULL' : a.c3Recruitment === 'some' ? 'ARRIVED IN PART' : 'DID NOT ARRIVE'}</strong>.`,
    `THE KNIGHT WAS <strong>${a.c3Knight === 'yes' ? 'DEFEATED' : 'LEFT UNBEATEN'}</strong>.`,
    `THE SHOW LEFT <strong>${a.c3Hurt === 'yes' ? 'SOMEONE HURT' : 'NO ONE HURT'}</strong>.`,
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

const SAVE_LOCATIONS = {
  windows: {
    label: 'WINDOWS',
    command: 'explorer "%LOCALAPPDATA%\\DELTARUNE"',
    hint: 'PRESS WIN + R · PASTE · ENTER',
  },
  macos: {
    label: 'MACOS',
    command: 'open "$HOME/Library/Application Support/com.tobyfox.deltarune"',
    hint: 'OPEN TERMINAL · PASTE · RETURN',
  },
  linux: {
    label: 'LINUX / STEAM DECK',
    command: 'xdg-open "$HOME/.steam/steam/steamapps/compatdata/1671210/pfx/drive_c/users/steamuser/AppData/Local/DELTARUNE"',
    hint: 'OPEN TERMINAL · PASTE · ENTER · DEFAULT STEAM PATH',
  },
};

function visitorSavePlatform() {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/android|iphone|ipad|ipod/.test(userAgent)) return null;
  const platform = (navigator.userAgentData?.platform || navigator.platform || userAgent).toLowerCase();
  if (platform.includes('win')) return 'windows';
  if (platform.includes('mac')) return 'macos';
  if (/linux|x11/.test(platform)) return 'linux';
  return null;
}

function saveLocationGuide() {
  const detected = visitorSavePlatform();
  const platform = detected ?? 'windows';
  const location = SAVE_LOCATIONS[platform];
  const tabs = Object.entries(SAVE_LOCATIONS).map(([id, item]) => `
    <button data-save-os="${id}" aria-pressed="${id === platform}">${item.label}</button>`).join('');
  return `<aside class="save-location" data-save-platform="${platform}" data-detected-platform="${detected ?? ''}">
    <div class="save-location-head"><strong>SAVE DIRECTORY</strong><span class="save-location-system">${detected ? `${location.label} DETECTED` : 'SELECT YOUR SYSTEM'}</span></div>
    <div class="save-os-tabs" aria-label="Operating system">${tabs}</div>
    <code class="save-command">${escapeHtml(location.command)}</code>
    <div class="save-location-actions">
      <button data-action="copy-save-command">COPY OPEN COMMAND</button>
      <span class="save-location-status" aria-live="polite">${location.hint}</span>
    </div>
  </aside>`;
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through for browsers that expose but deny the Clipboard API.
    }
  }
  const input = document.createElement('textarea');
  input.value = text;
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.append(input);
  input.select();
  const copied = document.execCommand('copy');
  input.remove();
  return copied;
}

function bindSaveLocationGuide() {
  const guide = app.querySelector('.save-location');
  if (!guide) return;
  const command = guide.querySelector('.save-command');
  const system = guide.querySelector('.save-location-system');
  const status = guide.querySelector('.save-location-status');
  const copyButton = guide.querySelector('[data-action="copy-save-command"]');
  const updatePlatform = (platform) => {
    const location = SAVE_LOCATIONS[platform];
    guide.dataset.savePlatform = platform;
    command.textContent = location.command;
    system.textContent = `${location.label}${guide.dataset.detectedPlatform === platform ? ' DETECTED' : ''}`;
    status.textContent = location.hint;
    copyButton.textContent = 'COPY OPEN COMMAND';
    guide.querySelectorAll('[data-save-os]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.saveOs === platform)));
  };
  guide.querySelectorAll('[data-save-os]').forEach((button) => button.addEventListener('click', () => updatePlatform(button.dataset.saveOs)));
  copyButton.addEventListener('click', async () => {
    copyButton.disabled = true;
    const copied = await copyText(command.textContent);
    copyButton.disabled = false;
    copyButton.textContent = copied ? 'COMMAND COPIED' : 'COPY FAILED';
    status.textContent = copied ? 'PASTE IT WHERE SHOWN · THEN PRESS ENTER' : 'SELECT THE COMMAND ABOVE AND COPY IT MANUALLY';
  });
}

function renderDownload() {
  const chapter = state.chapter;
  const fileIndex = state.selectedSlot + 2;
  const nextLabel = chapter === 5 ? 'CONTINUE TO FINAL REVIEW' : `CONTINUE TO CHAPTER ${chapter + 1}`;
  layout(`<section class="download-shell">
    <div class="file-orbit" aria-hidden="true"><span class="file-icon"><i></i><b>FILE</b></span><span class="orbit one"></span><span class="orbit two"></span></div>
    <p class="kicker">HISTORY RESTORED</p>
    <h1>YOUR CHAPTER ${chapter}<br>COMPLETION FILE<br>IS WAITING.</h1>
    <div class="slot-picker"><span>SAVE SLOT</span>${[1, 2, 3].map((slot) => `<button class="${state.selectedSlot === slot ? 'selected' : ''}" data-slot="${slot}">${slot}</button>`).join('')}</div>
    <button class="download-button" data-action="download"><span>↓</span><strong>DOWNLOAD CHAPTER ${chapter} FILE</strong><small>filech${chapter}_${fileIndex}${chapter === 5 && isWeirdEnding() ? '_b' : ''}</small></button>
    <p class="download-status" aria-live="polite">${state.downloaded ? `FILE CREATED: ${state.downloaded}` : 'PC / MAC / LINUX · PLAIN SAVE DATA'}</p>
    ${saveLocationGuide()}
    <button class="continue-chapter" data-action="next">${nextLabel} <span>→</span></button>
    <p class="backup-note">BACK UP YOUR SAVE DIRECTORY BEFORE REPLACING A FILE.</p>
  </section>`, 'download-stage');
  bindSaveLocationGuide();
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
      <p>THERE ARE MANY MORE<br>QUESTIONS I COULD<br>HAVE ASKED.</p>
      <p>FORTUNATELY,<br>I BELIEVE<br>THIS IS ENOUGH.</p>
    </div>
    <div class="final-decision">
      <p>KRIS HAS LIVED<br>THIS HISTORY.</p>
      <p>YOU HAVE SHAPED<br>ALL OF THESE CHOICES.</p>
      <h1>SO TELL ME, ${name}.<br><br>DO YOU ACCEPT<br>WHAT YOU CREATED?</h1>
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
    <h1>THE PAST<br>HAS BEEN RESTORED.</h1>
    <p class="epilogue">FROM THIS POINT FORWARD,<br>YOUR CHOICES ARE YOUR OWN.<br><br>...<br><br>AREN'T THEY?</p>
    <div class="slot-picker"><span>SAVE SLOT</span>${[1, 2, 3].map((slot) => `<button class="${state.selectedSlot === slot ? 'selected' : ''}" data-slot="${slot}">${slot}</button>`).join('')}</div>
    <button class="download-button" data-action="download"><span>↓</span><strong>DOWNLOAD CHAPTER 5 FILE</strong><small>filech5_${fileIndex}${isWeirdEnding() ? '_b' : ''}</small></button>
    <p class="download-status" aria-live="polite">${state.downloaded ? `FILE CREATED: ${state.downloaded}` : 'THE RECONSTRUCTION IS COMPLETE'}</p>
    ${saveLocationGuide()}
    <button class="continue-chapter" data-action="review-all">REVIEW THIS HISTORY <span>↺</span></button>
    <p class="backup-note">BACK UP YOUR SAVE DIRECTORY BEFORE REPLACING A FILE.</p>
  </section>`, 'download-stage');
  bindSaveLocationGuide();
  app.querySelectorAll('[data-slot]').forEach((button) => button.addEventListener('click', () => { state.selectedSlot = Number(button.dataset.slot); persist(); render(); }));
  app.querySelector('[data-action="download"]').addEventListener('click', () => { state.downloaded = downloadCompletion(5, state.selectedSlot, state.answers); render(); });
  app.querySelector('[data-action="review-all"]').addEventListener('click', () => { state.mode = 'summary'; state.chapter = 1; render(); });
}

function resetHistory() {
  localStorage.removeItem(STORAGE_KEY);
  Object.assign(state, { mode: state.soundPreference ? 'intro' : 'sound', chapter: 0, index: 0, introIndex: 0, answers: {}, completed: [], editing: false, afterMessage: '', selectedSlot: 1, downloaded: null, soundResponse: '' });
  render();
}

function formatText(text) { return escapeHtml(text).replace(/\n/g, '<br>'); }

function render() {
  document.onkeydown = null;
  app.className = `chapter-${state.chapter} mode-${state.mode}`;
  if (state.mode === 'sound') renderSoundChoice();
  else if (state.mode === 'sound-response') renderSoundResponse();
  else if (state.mode === 'resume') renderResume();
  else if (state.mode === 'intro') renderIntro();
  else if (state.mode === 'survey') renderQuestion();
  else if (state.mode === 'after') renderAfter();
  else if (state.mode === 'summary') renderSummary();
  else if (state.mode === 'download') renderDownload();
  else if (state.mode === 'final') renderFinal();
  else if (state.mode === 'final-download') renderFinalDownload();
}

render();
