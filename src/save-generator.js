const FLAG_COUNT_V1 = 9999;
const FLAG_COUNT_V2 = 2500;

const CHAPTER_END = {
  1: { plot: 251, room: 10283 },
  2: { plot: 211, room: 20031 },
  3: { plot: 350, room: 40029 },
  4: { plot: 320, room: 40014 },
  5: { plot: 590, room: 50013 },
};

const RECRUIT_FLAGS = {
  2: [630, 631, 632, 633, 634, 635, 636, 640, 642, 644],
  3: [654, 655, 656, 657, 658, 659, 660, 661],
  4: [662, 663, 664, 665, 666, 667, 668, 669],
  5: [670, 671, 672, 673, 674, 675, 676, 677],
};

const DEFAULT_RECRUITS = {
  2: [632, 633, 636, 642],
  3: [654, 656, 657, 659, 660, 661],
  4: [662, 663, 665, 668],
  5: [670, 671, 674, 677],
};

const RECRUIT_NAMES = {
  2: ['AMBYU-LANCE', 'POPUP', 'TASQUE', 'WEREWIRE', 'MAUS', 'VIROVIROKUN', 'SWATCHLING', 'WEREWEREWIRE', 'TASQUE MANAGER', 'MAUSWHEEL'],
  3: ['SHADOWGUY', 'SHUTTAH', 'ZAPPER', 'RIBBICK', 'WATERCOOLER', 'PIPPINS', 'ELNINA', 'LANINO'],
  4: ['GUEI', 'BALTHIZARD', 'BIBLIOX', 'MIZZLE', 'WICABEL', 'WINGLADE', 'ORGANIKK', 'MISS MIZZLE'],
  5: ['FLORADINN', 'LEAFLING', 'SHI', 'SHINOBEETLE', 'KAWKAW', 'SHEARY', 'NETSKIE', 'TERAKOTA'],
};

const LOADOUTS = {
  1: [[1, 0, 0], [2, 0, 0], [3, 0, 0]],
  2: [[1, 1, 1], [2, 1, 1], [3, 1, 4], [1, 0, 0]],
  3: [[15, 1, 10], [16, 1, 10], [17, 1, 10], [1, 0, 0]],
  4: [[23, 19, 10], [24, 19, 10], [25, 19, 10], [22, 16, 22]],
  5: [[38, 19, 19], [24, 19, 19], [25, 19, 19], [22, 16, 22]],
};

const BASE_STATS = {
  1: [[90, 10, 2, 0], [110, 14, 2, 1], [70, 8, 2, 7]],
  2: [[120, 12, 2, 0], [140, 16, 2, 1], [100, 10, 2, 8], [90, 9, 1, 11]],
  3: [[160, 14, 3, 0], [180, 18, 3, 1], [140, 12, 3, 10], [250, 10, 2, 0]],
  4: [[200, 16, 4, 0], [220, 20, 4, 2], [180, 14, 4, 12], [250, 12, 3, 14]],
  5: [[240, 18, 5, 0], [260, 22, 5, 3], [220, 16, 5, 14], [270, 14, 4, 16]],
};

const SPELLS = {
  kris: [1],
  susie: [5, 13, 22],
  ralsei: [3, 2, 21],
  noelle: [2, 10, 11],
};

function empty(count) {
  return Array(count).fill(0);
}

function makeCharacter(chapter, index, format) {
  const stats = BASE_STATS[chapter][index] ?? [1, 0, 0, 0];
  const loadout = LOADOUTS[chapter][index] ?? [0, 0, 0];
  const spellSet = [SPELLS.kris, SPELLS.susie, SPELLS.ralsei, SPELLS.noelle][index] ?? [];
  const weaponStats = Array.from({ length: 4 }, () =>
    format === 1 ? empty(8) : empty(10),
  );
  const spells = empty(12);
  spellSet.forEach((spell, slot) => { spells[slot] = spell; });
  return {
    health: stats[0], maxHealth: stats[0], attack: stats[1], defence: stats[2], magic: stats[3], guts: 0,
    weapon: loadout[0], primaryArmor: loadout[1], secondaryArmor: loadout[2], weaponStyle: format === 1 ? 'Normal' : 0,
    weaponStats, spells,
  };
}

function addItem(list, item) {
  const slot = list.findIndex((value) => value === 0);
  if (slot !== -1) list[slot] = item;
}

function setRecruitState(flags, chapter, state, selected = []) {
  const allFlags = RECRUIT_FLAGS[chapter] ?? [];
  const active = state === 'all'
    ? allFlags
    : state === 'some'
      ? selected.map((name) => allFlags[RECRUIT_NAMES[chapter].indexOf(name)]).filter(Number.isInteger)
      : [];
  active.forEach((flag) => { flags[flag] = 1; });
}

function applyAnswers(save, chapter, answers) {
  const { flags, inventory } = save;
  flags[914] = 1;
  const rememberedVessel = answers.vesselMemory === 'yes';
  const vesselPart = (value, maximum) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed >= 0 && parsed <= maximum ? parsed : 0;
  };
  const vesselChoice = (value, choices) => Math.max(0, choices.indexOf(String(value || '').toLowerCase()));
  flags[900] = rememberedVessel ? vesselPart(answers.vesselHeadIndex, 7) : 0;
  flags[901] = rememberedVessel ? vesselPart(answers.vesselBodyIndex, 5) : 0;
  flags[902] = rememberedVessel ? vesselPart(answers.vesselLegsIndex, 4) : 0;
  flags[903] = rememberedVessel ? vesselChoice(answers.vesselFood, ['sweet', 'soft', 'sour', 'salty', 'pain', 'cold']) : 0;
  flags[904] = rememberedVessel ? vesselChoice(answers.vesselBlood, ['a', 'ab', 'b', 'c', 'd']) : 0;
  flags[905] = rememberedVessel ? vesselChoice(answers.vesselColor, ['red', 'blue', 'green', 'cyan']) : 0;
  flags[906] = rememberedVessel ? vesselChoice(answers.vesselFeeling, ['love', 'hope', 'disgust', 'fear']) : 0;
  flags[907] = rememberedVessel && answers.vesselHonest === 'no' ? 1 : 0;
  flags[908] = rememberedVessel && answers.vesselSeizure === 'no' ? 1 : 0;
  flags[909] = rememberedVessel ? ({ kindness: 1, mind: 0, ambition: -1, bravery: -2, voice: -3 }[String(answers.vesselGiftChoice || '').toLowerCase()] ?? 0) : 0;

  flags[203] = answers.c1Prophecy === 'skip' ? 1 : 0;
  flags[207] = answers.c1Manual === 'threw' ? 2 : 0;
  flags[214] = ({ squad: 1, lancer: 2, fun: 3 }[answers.c1PartyName] ?? 0);
  flags[220] = ({ laser: 0, sword: 1, flame: 2, duck: 3 }[answers.machineHead] ?? 0);
  flags[221] = ({ plain: 0, wheel: 1, tank: 2, duck: 3 }[answers.machineBody] ?? 0);
  flags[222] = ({ sneak: 0, wheel: 1, tread: 2, duck: 3 }[answers.machineShoes] ?? 0);
  const machineColor = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed >= 0 && parsed <= 31 ? parsed : fallback;
  };
  flags[223] = answers.c1Machine === 'yes' ? machineColor(answers.machineHeadColor, 4) : 4;
  flags[224] = answers.c1Machine === 'yes' ? machineColor(answers.machineBodyColor, 17) : 17;
  flags[225] = answers.c1Machine === 'yes' ? machineColor(answers.machineShoeColor, 26) : 26;
  flags[226] = answers.c1Machine === 'yes' ? 1 : 0;
  flags[241] = answers.c1JevilEnd === 'fight' ? 6 : answers.c1JevilEnd === 'tire' ? 7 : answers.c1JevilFound === 'yes' ? 1 : 0;
  flags[247] = answers.c1KingAid === 'yes' ? 1 : 0;
  flags[248] = answers.c1Combat === 'fought' ? 1 : 0;
  flags[252] = answers.c1Beds === 'yes' ? 1 : 0;
  flags[253] = answers.c1CakeFate === 'returned' ? 1 : 0;
  flags[254] = answers.c1StarwalkerBack === 'yes' ? 1 : 0;
  flags[255] = answers.c1Hospital === 'yes' ? 2 : 0;
  flags[258] = answers.c1Onion === 'yes' ? 1 : 0;
  flags[263] = answers.c1EggFate === 'fridge' ? 1 : 0;
  flags[910] = answers.c1EggRoom === 'yes' ? 2 : 0;
  flags[911] = answers.c1EggGift === 'egg' ? 1 : 0;

  if (answers.c1Manual === 'kept') addItem(inventory.consumables, 4);
  if (answers.c1CakeFate === 'kept') addItem(inventory.consumables, 6);
  if (answers.c1EggGift === 'egg' && answers.c1EggFate === 'kept') addItem(save.lightWorld.items, 8);
  if (answers.c1JevilEnd) {
    flags[112] = 1;
    addItem(inventory.keyItems, 13);
    if (answers.c1JevilEnd === 'fight') addItem(inventory.weapons, 7);
    else addItem(inventory.armors, 7);
  }

  if (chapter >= 2) {
    setRecruitState(flags, 2, answers.c2Recruitment, answers.c2RecruitDetail);
    flags[357] = answers.c2Hacker === 'yes' ? 1 : 0;
    flags[359] = answers.c2Hacker === 'yes' ? 2 : 0;
    flags[915] = answers.c2Frozen === 'yes' ? 6 : 0;
    flags[916] = 0;
    flags[918] = answers.c2Egg === 'yes' ? 1 : 0;
    flags[309] = answers.c2Disk === 'yes' ? 8 : answers.c2Shop === 'yes' ? 2 : 0;
    flags[358] = answers.c2Basement === 'yes' ? 1 : 0;
    flags[571] = answers.c2Strings === 'violence' ? 1 : answers.c2Strings === 'mercy' ? 3 : 0;
    if (answers.c2Frozen === 'yes') flags[456] = 1;
    if (answers.c2Strings) {
      flags[142] = 1;
      addItem(inventory.keyItems, 13);
      if (answers.c2Strings === 'violence') addItem(inventory.weapons, 21);
      else addItem(inventory.armors, 21);
    }
  }

  if (chapter >= 3) {
    setRecruitState(flags, 3, answers.c3Recruitment, answers.c3RecruitDetail);
    flags[930] = answers.c3EggTake === 'yes' ? 1 : 0;
    flags[1047] = answers.c3Knight === 'yes' ? 1 : answers.c3Pursue === 'yes' ? 2 : 0;
    if (answers.c3Knight === 'yes') addItem(inventory.keyItems, 13);
  }

  if (chapter >= 4) {
    setRecruitState(flags, 4, answers.c4Recruitment, answers.c4RecruitDetail);
    flags[931] = answers.c4Egg === 'yes' ? 1 : 0;
    flags[176] = answers.c4Justice === 'yes' ? 2 : 0;
    flags[186] = answers.c4Justice === 'yes' ? 2 : 0;
    flags[1656] = answers.c4Weird === 'continue' ? 0 : answers.c2Frozen === 'yes' ? 1 : 0;
    if (answers.c4Justice === 'yes') addItem(inventory.keyItems, 13);
  }

  if (chapter >= 5) {
    setRecruitState(flags, 5, answers.c5Recruitment, answers.c5RecruitDetail);
    flags[941] = answers.c5Egg === 'yes' ? 1 : 0;
    flags[1743] = answers.c5Route === 'stop' ? 1 : 0;
    flags[1907] = answers.c5PinkWin === 'yes' ? 1 : 0;
    flags[1908] = answers.c5PinkWin === 'yes' ? 1 : 0;
    if (answers.c5PinkWin === 'yes') addItem(inventory.keyItems, 13);
  }
}

function createSave(chapter, answers) {
  const format = chapter === 1 ? 1 : 2;
  const flags = empty(format === 1 ? FLAG_COUNT_V1 : FLAG_COUNT_V2);
  const characterCount = format === 1 ? 4 : 5;
  const characters = Array.from({ length: characterCount }, (_, index) => {
    const character = makeCharacter(chapter, Math.max(0, index - 1), format);
    if (index !== 0) return character;
    return {
      ...character,
      health: 0,
      maxHealth: 0,
      attack: 0,
      defence: 0,
      magic: 0,
      weapon: 0,
      primaryArmor: 0,
      secondaryArmor: 0,
      spells: empty(12),
    };
  });
  const inventory = {
    consumables: empty(13), keyItems: empty(13),
    weapons: empty(format === 1 ? 13 : 48), armors: empty(format === 1 ? 13 : 48),
    ...(format === 2 ? { storage: empty(72) } : {}),
  };
  inventory.keyItems[0] = 1;

  const save = {
    format,
    playerName: String(answers.playerName || 'KRIS').toUpperCase().slice(0, 12),
    vesselName: answers.vesselMemory === 'yes' && answers.vesselNameKnown === 'yes'
      ? String(answers.vesselName || '').toUpperCase().slice(0, 9)
      : '',
    party: [1, 0, 0], money: 0, xp: 0, lv: 1, inv: 0, invc: 1, inDarkWorld: false,
    characters,
    battle: { boltSpeed: 100, grazeAmount: 100, grazeSize: 100, tension: 0, maxTension: 250 },
    inventory,
    lightWorld: {
      weapon: chapter === 5 ? 18 : 2, armor: 3, experience: 0, level: 1, money: 2,
      health: 20, maxHealth: 20, attack: 10, defence: 10, weaponStrength: 1, armorDefence: 0,
      items: empty(8), phone: [1, 0, 0, 0, 0, 0, 0, 0],
    },
    flags,
    plot: CHAPTER_END[chapter].plot,
    room: CHAPTER_END[chapter].room,
    time: 0,
  };
  applyAnswers(save, chapter, answers);
  return save;
}

function number(value) {
  if (typeof value === 'string') return value;
  if (value >= 1e6) return value.toExponential().replace(/e\+(\d)$/, 'e+0$1');
  return String(value);
}

export function serializeSave(save) {
  const lines = [save.playerName, save.vesselName, '', '', '', '', ''];
  save.party.forEach((value) => lines.push(number(value)));
  [save.money, save.xp, save.lv, save.inv, save.invc, save.inDarkWorld ? 1 : 0].forEach((value) => lines.push(number(value)));

  save.characters.forEach((character) => {
    [character.health, character.maxHealth, character.attack, character.defence, character.magic, character.guts,
      character.weapon, character.primaryArmor, character.secondaryArmor, character.weaponStyle]
      .forEach((value) => lines.push(number(value)));
    character.weaponStats.flat().forEach((value) => lines.push(number(value)));
    character.spells.forEach((value) => lines.push(number(value)));
  });

  [save.battle.boltSpeed, save.battle.grazeAmount, save.battle.grazeSize].forEach((value) => lines.push(number(value)));
  if (save.format === 1) {
    for (let i = 0; i < 13; i += 1) {
      lines.push(number(save.inventory.consumables[i]), number(save.inventory.keyItems[i]), number(save.inventory.weapons[i]), number(save.inventory.armors[i]));
    }
  } else {
    for (let i = 0; i < 13; i += 1) lines.push(number(save.inventory.consumables[i]), number(save.inventory.keyItems[i]));
    for (let i = 0; i < 48; i += 1) lines.push(number(save.inventory.weapons[i]), number(save.inventory.armors[i]));
    save.inventory.storage.forEach((value) => lines.push(number(value)));
  }
  lines.push(number(save.battle.tension), number(save.battle.maxTension));
  const light = save.lightWorld;
  [light.weapon, light.armor, light.experience, light.level, light.money, light.health, light.maxHealth,
    light.attack, light.defence, light.weaponStrength, light.armorDefence].forEach((value) => lines.push(number(value)));
  for (let i = 0; i < 8; i += 1) lines.push(number(light.items[i]), number(light.phone[i]));
  save.flags.forEach((value) => lines.push(number(value ?? 0)));
  lines.push(number(save.plot), number(save.room), number(save.time));
  return lines.map((line, index) => index <= 6 ? line : `${line} `).join('\n');
}

export function completionFile(chapter, slot, answers) {
  const save = createSave(chapter, answers);
  const weird = chapter === 5 && answers.c2Frozen === 'yes' && answers.c4Weird === 'continue' && answers.c5Route !== 'stop';
  return {
    name: `filech${chapter}_${slot + 2}${weird ? '_b' : ''}`,
    content: serializeSave(save),
  };
}

export function downloadCompletion(chapter, slot, answers) {
  const file = completionFile(chapter, slot, answers);
  const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = file.name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return file.name;
}

export function shadowCount(answers, through = 5) {
  return [
    through >= 1 && Boolean(answers.c1JevilEnd),
    through >= 2 && Boolean(answers.c2Strings),
    through >= 3 && answers.c3Knight === 'yes',
    through >= 4 && answers.c4Justice === 'yes',
    through >= 5 && answers.c5PinkWin === 'yes',
  ].filter(Boolean).length;
}

export function eggCount(answers, through = 5) {
  return [
    through >= 1 && answers.c1EggGift === 'egg',
    through >= 2 && answers.c2Egg === 'yes',
    through >= 3 && answers.c3EggTake === 'yes',
    through >= 4 && answers.c4Egg === 'yes',
    through >= 5 && answers.c5Egg === 'yes',
  ].filter(Boolean).length;
}

export { RECRUIT_NAMES, DEFAULT_RECRUITS };
