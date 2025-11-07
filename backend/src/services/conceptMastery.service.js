import slugify from 'slugify';

export const statusFromMastery = (masteryLevel = 0, confidenceScore = 0) => {
  if (masteryLevel >= 90 && confidenceScore >= 0.7) return 'mastered';
  if (masteryLevel >= 65 && confidenceScore >= 0.5) return 'strong';
  if (masteryLevel >= 35 && confidenceScore >= 0.3) return 'developing';
  return 'weak';
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const calculateNextReviewDate = (concept, score, timestamp = new Date()) => {
  const masteryFactor = clamp(concept.masteryLevel / 100, 0.05, 1);
  const confidenceFactor = clamp(concept.confidenceScore, 0.05, 1);
  const difficultyFactor = clamp(1.4 - concept.difficulty, 0.6, 1.6);
  const scoreFactor = clamp((score ?? 70) / 100, 0.05, 1.2);

  const baseDays = 1 + masteryFactor * 14; // up to two weeks base
  const intervalDays = baseDays * confidenceFactor * difficultyFactor * scoreFactor;
  const nextDate = new Date(timestamp);
  nextDate.setDate(nextDate.getDate() + Math.max(1, Math.round(intervalDays)));
  return nextDate;
};

export const updateConceptMasteryMetrics = (concept, activity = {}) => {
  const {
    score = 70,
    difficultyShift = 0,
    importanceShift = 0,
    timestamp = new Date(),
    source = 'manual',
  } = activity;

  const normalizedScore = clamp(score <= 1 ? score * 100 : score, 0, 100);
  const scoreRatio = normalizedScore / 100;

  const masterySmoothing = clamp(0.25 + (concept.confidenceScore * 0.4), 0.2, 0.75);
  const newMastery = (concept.masteryLevel * (1 - masterySmoothing)) + (normalizedScore * masterySmoothing);
  concept.masteryLevel = Math.round(clamp(newMastery, 0, 100));

  const confidenceSmoothing = 0.3;
  concept.confidenceScore = clamp(
    (concept.confidenceScore * (1 - confidenceSmoothing)) + (scoreRatio * confidenceSmoothing),
    0,
    1,
  );

  if (difficultyShift !== 0) {
    concept.difficulty = clamp(concept.difficulty + difficultyShift, 0, 1);
  }

  if (importanceShift !== 0) {
    concept.importance = clamp(concept.importance + importanceShift, 0, 1);
  }

  concept.status = statusFromMastery(concept.masteryLevel, concept.confidenceScore);

  concept.totalReviews = (concept.totalReviews || 0) + 1;
  concept.recentScore = normalizedScore;
  concept.lastReviewed = timestamp;
  concept.nextReview = calculateNextReviewDate(concept, normalizedScore, timestamp);

  concept.reviewHistory = concept.reviewHistory || [];
  concept.reviewHistory.push({
    date: timestamp,
    source,
    score: normalizedScore,
    masteryLevel: concept.masteryLevel,
  });

  if (concept.reviewHistory.length > 50) {
    concept.reviewHistory = concept.reviewHistory.slice(-50);
  }

  return concept;
};

const colorPalette = {
  weak: '#f87171',
  developing: '#facc15',
  strong: '#34d399',
  mastered: '#60a5fa',
};

const glowPalette = {
  weak: 'rgba(248, 113, 113, 0.45)',
  developing: 'rgba(250, 204, 21, 0.45)',
  strong: 'rgba(52, 211, 153, 0.45)',
  mastered: 'rgba(96, 165, 250, 0.55)',
};

const randomInRange = (min, max) => Math.random() * (max - min) + min;

const getSubjectLayoutAnchor = (subject, subjectMap) => {
  if (subjectMap.has(subject)) {
    return subjectMap.get(subject);
  }
  const angle = randomInRange(0, Math.PI * 2);
  const radius = randomInRange(180, 320);
  const anchor = { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  subjectMap.set(subject, anchor);
  return anchor;
};

export const buildConceptGraph = (concepts = []) => {
  const subjectAnchors = new Map();

  const nodes = concepts.map((concept, index) => {
    const status = statusFromMastery(concept.masteryLevel, concept.confidenceScore);
    const anchor = getSubjectLayoutAnchor(concept.subject || 'General', subjectAnchors);

    const jitterX = randomInRange(-60, 60);
    const jitterY = randomInRange(-60, 60);

    const node = {
      id: concept.conceptKey,
      conceptId: concept._id?.toString(),
      label: concept.conceptName,
      subject: concept.subject || 'General',
      description: concept.description || '',
      masteryLevel: concept.masteryLevel || 0,
      confidenceScore: concept.confidenceScore || 0,
      status,
      difficulty: concept.difficulty ?? 0.5,
      importance: concept.importance ?? 0.5,
      totalReviews: concept.totalReviews || 0,
      lastReviewed: concept.lastReviewed,
      nextReview: concept.nextReview,
      recentScore: concept.recentScore,
      tags: concept.tags || [],
      metadata: concept.metadata || {},
      coordinates: {
        x: anchor.x + jitterX + randomInRange(-index % 15, index % 20),
        y: anchor.y + jitterY + randomInRange(-index % 20, index % 15),
      },
      visuals: {
        color: colorPalette[status],
        glow: glowPalette[status],
        size: 12 + (concept.importance || 0.5) * 20,
      },
    };

    return node;
  });

  const links = [];
  concepts.forEach((concept) => {
    const sourceKey = concept.conceptKey;

    (concept.relatedConcepts || []).forEach((related) => {
      links.push({
        id: `${sourceKey}->${related.conceptKey}`,
        source: sourceKey,
        target: related.conceptKey,
        strength: clamp(related.strength ?? 0.5, 0.1, 1),
        type: 'related',
      });
    });

    (concept.prerequisites || []).forEach((prereq) => {
      links.push({
        id: `${prereq.conceptKey}|${sourceKey}`,
        source: prereq.conceptKey,
        target: sourceKey,
        strength: clamp(prereq.strength ?? 0.7, 0.1, 1),
        type: 'prerequisite',
      });
    });
  });

  const stats = concepts.reduce((acc, concept) => {
    const status = statusFromMastery(concept.masteryLevel, concept.confidenceScore);
    acc.total += 1;
    acc.masterySum += concept.masteryLevel || 0;
    acc.statusCounts[status] = (acc.statusCounts[status] || 0) + 1;

    if (concept.nextReview) {
      const next = new Date(concept.nextReview);
      if (next <= new Date()) {
        acc.overdue += 1;
      } else {
        const diffDays = Math.ceil((next - Date.now()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 3) {
          acc.dueSoon += 1;
        }
      }
    }

    return acc;
  }, {
    total: 0,
    masterySum: 0,
    overdue: 0,
    dueSoon: 0,
    statusCounts: { weak: 0, developing: 0, strong: 0, mastered: 0 },
  });

  const averageMastery = stats.total > 0 ? Math.round(stats.masterySum / stats.total) : 0;

  return {
    nodes,
    links,
    stats: {
      totalConcepts: stats.total,
      averageMastery,
      overdue: stats.overdue,
      dueSoon: stats.dueSoon,
      statusCounts: stats.statusCounts,
    },
  };
};

export const getConceptRecommendations = (concepts = [], limit = 6) => {
  const now = Date.now();

  const withScores = concepts.map((concept) => {
    const dueScore = concept.nextReview
      ? clamp(1 - Math.min((new Date(concept.nextReview).getTime() - now) / (1000 * 60 * 60 * 24 * 7), 1), 0, 1)
      : 0.4;
    const masteryScore = 1 - clamp((concept.masteryLevel || 0) / 100, 0, 1);
    const importanceScore = clamp(concept.importance ?? 0.5, 0, 1);
    const priority = (importanceScore * 0.4) + (dueScore * 0.35) + (masteryScore * 0.25);

    const blockers = (concept.prerequisites || [])
      .filter((prereq) => {
        const target = concepts.find((c) => c.conceptKey === prereq.conceptKey);
        return target && ((target.masteryLevel || 0) < 60);
      })
      .map((prereq) => prereq.conceptKey);

    return {
      concept,
      priority,
      blockers,
      dueScore,
      masteryScore,
      importanceScore,
    };
  });

  const sorted = withScores
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit)
    .map(({ concept, priority, blockers, dueScore, masteryScore }) => ({
      conceptKey: concept.conceptKey,
      conceptName: concept.conceptName,
      subject: concept.subject,
      masteryLevel: concept.masteryLevel,
      status: statusFromMastery(concept.masteryLevel, concept.confidenceScore),
      nextReview: concept.nextReview,
      blockers,
      priority: Number(priority.toFixed(3)),
      insights: {
        dueScore: Number(dueScore.toFixed(3)),
        masteryScore: Number(masteryScore.toFixed(3)),
      },
    }));

  return sorted;
};

export const createConceptKey = (name) => {
  if (!name) return `concept-${Date.now()}`;
  return slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });
};

