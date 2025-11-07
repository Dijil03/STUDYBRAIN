import { v4 as uuidv4 } from 'uuid';
import GardenState from '../models/garden.model.js';
import Plant from '../models/plant.model.js';
import Species from '../models/species.model.js';

const DEFAULT_SPECIES = [
  {
    slug: 'pine-tree',
    displayName: 'Pine Tree',
    category: 'tree',
    description: 'Evergreen and resilient. Best for long focus intervals.',
    baseFocusMinutes: 25,
    price: 0,
    rarity: 'common',
    recommendedSubjects: ['Science', 'Mathematics'],
    growthStages: [
      { name: 'Seedling', stage: 1, minSessions: 1, minMinutes: 20, artVariant: 'pine_stage_1' },
      { name: 'Sapling', stage: 2, minSessions: 2, minMinutes: 50, artVariant: 'pine_stage_2' },
      { name: 'Towering', stage: 3, minSessions: 4, minMinutes: 120, artVariant: 'pine_stage_3' },
    ],
  },
  {
    slug: 'flower-tree',
    displayName: 'Flower Tree',
    category: 'tree',
    description: 'A tree with delicate white flowers. Perfect for creative study sessions.',
    baseFocusMinutes: 25,
    price: 500,
    rarity: 'uncommon',
    recommendedSubjects: ['Literature', 'Design'],
    growthStages: [
      { name: 'Bud', stage: 1, minSessions: 1, minMinutes: 25, artVariant: 'flower_stage_1' },
      { name: 'Blooming', stage: 2, minSessions: 3, minMinutes: 75, artVariant: 'flower_stage_2' },
      { name: 'Full Bloom', stage: 3, minSessions: 5, minMinutes: 140, artVariant: 'flower_stage_3' },
    ],
    unlockRequirement: { type: 'totalMinutes', value: 300 },
  },
  {
    slug: 'lavender-bush',
    displayName: 'Lavender Bush',
    category: 'flower',
    description: 'Calming aroma helps with revision. Generates dew drops faster.',
    baseFocusMinutes: 15,
    price: 200,
    rarity: 'uncommon',
    recommendedSubjects: ['Revision', 'Languages'],
    growthStages: [
      { name: 'Sprout', stage: 1, minSessions: 1, minMinutes: 15, artVariant: 'lavender_stage_1' },
      { name: 'Fragrant', stage: 2, minSessions: 2, minMinutes: 45, artVariant: 'lavender_stage_2' },
      { name: 'Lush', stage: 3, minSessions: 3, minMinutes: 80, artVariant: 'lavender_stage_3' },
    ],
  },
];

export const ensureDefaultSpecies = async () => {
  const count = await Species.countDocuments();
  if (count > 0) return;
  await Species.insertMany(DEFAULT_SPECIES);
};

export const getOrCreateGardenState = async (userId) => {
  let garden = await GardenState.findOne({ userId });
  if (!garden) {
    garden = new GardenState({
      userId,
      dewBalance: 0,
      gridColumns: 5,
      gridRows: 5,
      inventory: [{ species: 'pine-tree', quantity: 3 }],
    });
    await garden.save();
  }
  return garden;
};

const computeTilePosition = (index, columns = 5) => ({
  row: Math.floor(index / columns),
  col: index % columns,
});

export const buildOverviewPayload = (garden, plants = [], speciesMap = new Map()) => {
  const plotted = plants.map((plant) => {
    const species = speciesMap.get(plant.species) || {};
    const pos = computeTilePosition(plant.tileIndex, garden.gridColumns);
    return {
      id: plant._id,
      species: plant.species,
      displayName: species.displayName || plant.species,
      stage: plant.growthStage,
      position: pos,
      subject: plant.subject,
      healthStatus: plant.healthStatus,
      artVariant: species?.growthStages?.find((stage) => stage.stage === plant.growthStage)?.artVariant || null,
      sessions: plant.sessions.length,
      totalFocusMinutes: plant.totalFocusMinutes,
    };
  });

  return {
    garden: {
      dewBalance: garden.dewBalance,
      totalFocusMinutes: garden.totalFocusMinutes,
      totalSessions: garden.totalSessions,
      currentStreak: garden.currentStreak,
      longestStreak: garden.longestStreak,
      gridColumns: garden.gridColumns,
      gridRows: garden.gridRows,
      nextTileIndex: garden.nextTileIndex,
    },
    plants: plotted,
    inventory: garden.inventory,
    activeSession: garden.activeSession,
  };
};

export const startFocusSession = async ({ userId, speciesSlug, subject, targetMinutes }) => {
  const garden = await getOrCreateGardenState(userId);

  if (garden.activeSession) {
    throw new Error('An active focus session is already running.');
  }

  const inventoryItem = garden.inventory.find((item) => item.species === speciesSlug);
  if (!inventoryItem || inventoryItem.quantity <= 0) {
    throw new Error('Selected species not available in inventory.');
  }

  const sessionId = uuidv4();
  const tileIndex = garden.nextTileIndex;

  garden.activeSession = {
    sessionId,
    species: speciesSlug,
    subject: subject || 'General',
    targetMinutes: targetMinutes || 25,
    startedAt: new Date(),
    tileIndex,
  };

  inventoryItem.quantity -= 1;
  await garden.save();

  return garden.activeSession;
};

export const completeFocusSession = async ({ userId, sessionId, actualMinutes, quality = 5 }) => {
  const garden = await getOrCreateGardenState(userId);
  const active = garden.activeSession;
  if (!active || active.sessionId !== sessionId) {
    throw new Error('Active session not found.');
  }

  const species = await Species.findOne({ slug: active.species });
  if (!species) {
    throw new Error('Species metadata missing.');
  }

  const now = new Date();
  const duration = Math.max(actualMinutes || 0, active.targetMinutes);

  let plant = await Plant.findOne({ userId, tileIndex: active.tileIndex });
  if (!plant) {
    plant = new Plant({
      userId,
      species: active.species,
      subject: active.subject,
      tileIndex: active.tileIndex,
      plantedAt: active.startedAt,
      growthStage: 1,
    });
  }

  plant.sessions.push({
    startedAt: active.startedAt,
    completedAt: now,
    durationMinutes: duration,
    subject: active.subject,
    quality,
  });

  plant.totalFocusMinutes += duration;
  plant.growthProgressMinutes += duration;
  plant.lastCareAt = now;
  plant.healthStatus = 'healthy';

  // Determine new growth stage
  const stageDefinition = species.growthStages
    .slice()
    .reverse()
    .find((stage) => plant.totalFocusMinutes >= stage.minMinutes && plant.sessions.length >= stage.minSessions);
  if (stageDefinition) {
    plant.growthStage = stageDefinition.stage;
  }

  const dewEarned = Math.round(duration / 5);
  plant.earnedDew += dewEarned;

  await plant.save();

  garden.dewBalance += dewEarned;
  garden.totalFocusMinutes += duration;
  garden.totalSessions += 1;
  garden.nextTileIndex += 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (garden.lastSessionDate) {
    const last = new Date(garden.lastSessionDate);
    last.setHours(0, 0, 0, 0);
    const diff = (today - last) / (1000 * 60 * 60 * 24);
    if (diff === 0) {
      // same day, keep streak
    } else if (diff === 1) {
      garden.currentStreak += 1;
      garden.longestStreak = Math.max(garden.longestStreak, garden.currentStreak);
    } else if (diff > 1) {
      garden.currentStreak = 1;
    }
  } else {
    garden.currentStreak = 1;
    garden.longestStreak = 1;
  }

  garden.lastSessionDate = today;
  garden.activeSession = null;
  await garden.save();

  return { plant, garden, dewEarned };
};

export const abortFocusSession = async ({ userId }) => {
  const garden = await getOrCreateGardenState(userId);
  if (!garden.activeSession) return garden;

  // Return species back to inventory
  const { species } = garden.activeSession;
  const item = garden.inventory.find((inv) => inv.species === species);
  if (item) {
    item.quantity += 1;
  } else {
    garden.inventory.push({ species, quantity: 1 });
  }

  garden.activeSession = null;
  await garden.save();
  return garden;
};

export const purchaseSpecies = async ({ userId, speciesSlug }) => {
  const garden = await getOrCreateGardenState(userId);
  const species = await Species.findOne({ slug: speciesSlug });
  if (!species) {
    throw new Error('Species not found.');
  }

  if (garden.dewBalance < species.price) {
    throw new Error('Not enough dew drops to unlock this species.');
  }

  garden.dewBalance -= species.price;
  const inventoryItem = garden.inventory.find((item) => item.species === speciesSlug);
  if (inventoryItem) {
    inventoryItem.quantity += 1;
  } else {
    garden.inventory.push({ species: speciesSlug, quantity: 1 });
  }

  await garden.save();
  return garden;
};

export const getGardenOverview = async (userId) => {
  await ensureDefaultSpecies();

  const [garden, plants, speciesList] = await Promise.all([
    getOrCreateGardenState(userId),
    Plant.find({ userId }),
    Species.find({}),
  ]);

  const speciesMap = new Map(speciesList.map((spec) => [spec.slug, spec]));
  const overview = buildOverviewPayload(garden, plants, speciesMap);

  overview.speciesCatalog = speciesList.map((spec) => ({
    slug: spec.slug,
    displayName: spec.displayName,
    description: spec.description,
    category: spec.category,
    price: spec.price,
    rarity: spec.rarity,
    baseFocusMinutes: spec.baseFocusMinutes,
    recommendedSubjects: spec.recommendedSubjects,
    growthStages: spec.growthStages,
    unlockRequirement: spec.unlockRequirement,
  }));

  return overview;
};

