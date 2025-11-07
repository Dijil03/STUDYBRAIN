import ConceptMastery from '../models/conceptMastery.model.js';
import Revision from '../models/revision.model.js';
import {
  buildConceptGraph,
  createConceptKey,
  getConceptRecommendations,
  statusFromMastery,
  updateConceptMasteryMetrics,
} from '../services/conceptMastery.service.js';

const normalizeConceptPayload = (payload = {}) => {
  const fields = {};

  if (payload.conceptName) fields.conceptName = payload.conceptName;
  if (payload.subject) fields.subject = payload.subject;
  if (payload.description !== undefined) fields.description = payload.description;
  if (Array.isArray(payload.tags)) fields.tags = payload.tags;
  if (payload.difficulty !== undefined) fields.difficulty = payload.difficulty;
  if (payload.importance !== undefined) fields.importance = payload.importance;
  if (payload.metadata !== undefined) fields.metadata = payload.metadata;

  if (payload.masteryLevel !== undefined) {
    fields.masteryLevel = Math.max(0, Math.min(100, Number(payload.masteryLevel)));
  }

  if (payload.confidenceScore !== undefined) {
    fields.confidenceScore = Math.max(0, Math.min(1, Number(payload.confidenceScore)));
  }

  if (payload.relatedConcepts) {
    fields.relatedConcepts = payload.relatedConcepts.map((item) => ({
      conceptKey: item.conceptKey,
      strength: item.strength ?? 0.5,
    }));
  }

  if (payload.prerequisites) {
    fields.prerequisites = payload.prerequisites.map((item) => ({
      conceptKey: item.conceptKey,
      strength: item.strength ?? 0.7,
    }));
  }

  return fields;
};

export const conceptController = {
  getConceptMap: async (req, res) => {
    try {
      const { userId } = req.params;

      const concepts = await ConceptMastery.find({ userId }).lean();
      const graph = buildConceptGraph(concepts);

      res.json({
        success: true,
        ...graph,
      });
    } catch (error) {
      console.error('Failed to fetch concept map:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch concept map',
        error: error.message,
      });
    }
  },

  upsertConcept: async (req, res) => {
    try {
      const { userId } = req.params;
      const {
        conceptKey,
        conceptName,
        autoGenerateKey,
        ...rest
      } = req.body;

      if (!conceptName && !conceptKey) {
        return res.status(400).json({
          success: false,
          message: 'Concept name or key is required',
        });
      }

      const resolvedKey = conceptKey || createConceptKey(conceptName);
      const payload = normalizeConceptPayload({
        conceptName: conceptName || resolvedKey,
        ...rest,
      });

      const updated = await ConceptMastery.findOneAndUpdate(
        { userId, conceptKey: resolvedKey },
        {
          $setOnInsert: {
            userId,
            conceptKey: resolvedKey,
            conceptName: payload.conceptName || conceptName || resolvedKey,
            status: statusFromMastery(payload.masteryLevel ?? 0, payload.confidenceScore ?? 0.4),
          },
          $set: payload,
        },
        {
          upsert: true,
          new: true,
        },
      );

      res.status(201).json({
        success: true,
        concept: updated,
      });
    } catch (error) {
      console.error('Failed to upsert concept:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save concept',
        error: error.message,
      });
    }
  },

  recordActivity: async (req, res) => {
    try {
      const { userId } = req.params;
      const {
        conceptKey,
        conceptName,
        score,
        difficultyShift,
        importanceShift,
        source,
        timestamp,
      } = req.body;

      if (!conceptKey && !conceptName) {
        return res.status(400).json({
          success: false,
          message: 'Concept key or name is required',
        });
      }

      const resolvedKey = conceptKey || createConceptKey(conceptName);

      let concept = await ConceptMastery.findOne({ userId, conceptKey: resolvedKey });

      if (!concept) {
        concept = new ConceptMastery({
          userId,
          conceptKey: resolvedKey,
          conceptName: conceptName || resolvedKey,
          subject: req.body.subject || 'General',
        });
      }

      updateConceptMasteryMetrics(concept, {
        score,
        difficultyShift,
        importanceShift,
        source,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      });

      await concept.save();

      res.json({
        success: true,
        concept,
      });
    } catch (error) {
      console.error('Failed to record concept activity:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record concept activity',
        error: error.message,
      });
    }
  },

  markMastered: async (req, res) => {
    try {
      const { userId } = req.params;
      const { conceptKey } = req.body;

      if (!conceptKey) {
        return res.status(400).json({
          success: false,
          message: 'Concept key is required',
        });
      }

      const concept = await ConceptMastery.findOneAndUpdate(
        { userId, conceptKey },
        {
          masteryLevel: 100,
          confidenceScore: 0.9,
          status: 'mastered',
          nextReview: null,
          lastReviewed: new Date(),
        },
        { new: true },
      );

      if (!concept) {
        return res.status(404).json({
          success: false,
          message: 'Concept not found',
        });
      }

      res.json({
        success: true,
        concept,
      });
    } catch (error) {
      console.error('Failed to mark concept mastered:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update concept',
        error: error.message,
      });
    }
  },

  getRecommendations: async (req, res) => {
    try {
      const { userId } = req.params;
      const concepts = await ConceptMastery.find({ userId }).lean();
      const recommendations = getConceptRecommendations(concepts);

      res.json({
        success: true,
        recommendations,
      });
    } catch (error) {
      console.error('Failed to get concept recommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recommendations',
        error: error.message,
      });
    }
  },

  syncFromRevisions: async (req, res) => {
    try {
      const { userId } = req.params;

      const revisions = await Revision.find({ userId }).lean();
      if (!revisions.length) {
        return res.json({
          success: true,
          message: 'No revision items found to sync',
          synced: 0,
        });
      }

      const operations = [];
      const subjectGroups = new Map();
      const conceptKeys = new Set();

      revisions.forEach((revision) => {
        const baseName = revision.title || revision.content?.slice(0, 60) || 'Untitled Concept';
        const conceptKey = createConceptKey(baseName);
        conceptKeys.add(conceptKey);

        const masteryLevel = typeof revision.masteryLevel === 'number'
          ? Math.max(0, Math.min(100, revision.masteryLevel))
          : Math.max(0, Math.min(100, (revision.interval || 0) * 10));

        operations.push({
          updateOne: {
            filter: { userId, conceptKey },
            update: {
              $setOnInsert: {
                userId,
                conceptKey,
                conceptName: baseName,
                subject: revision.subject || 'General',
                tags: revision.tags || [],
              },
              $set: {
                masteryLevel,
                confidenceScore: revision.easeFactor ? Math.max(0, Math.min(1, revision.easeFactor / 3)) : 0.4,
                difficulty: revision.difficulty ?? 0.5,
                nextReview: revision.nextReview,
                lastReviewed: revision.lastReviewed,
                status: statusFromMastery(masteryLevel, revision.easeFactor ? revision.easeFactor / 3 : 0.4),
              },
            },
            upsert: true,
          },
        });

        const groupKey = revision.subject || 'General';
        if (!subjectGroups.has(groupKey)) {
          subjectGroups.set(groupKey, []);
        }
        subjectGroups.get(groupKey).push(conceptKey);
      });

      if (operations.length) {
        await ConceptMastery.bulkWrite(operations);
      }

      const allConcepts = await ConceptMastery.find({ userId, conceptKey: { $in: Array.from(conceptKeys) } });

      const relationUpdates = [];
      subjectGroups.forEach((conceptList) => {
        conceptList.forEach((conceptKey) => {
          const related = conceptList
            .filter((key) => key !== conceptKey)
            .slice(0, 6)
            .map((key, index) => ({
              conceptKey: key,
              strength: Math.max(0.25, 0.8 - (index * 0.1)),
            }));

          relationUpdates.push(
            ConceptMastery.updateOne(
              { userId, conceptKey },
              {
                $set: {
                  relatedConcepts: related,
                },
              },
            ),
          );
        });
      });

      if (relationUpdates.length) {
        await Promise.all(relationUpdates);
      }

      res.json({
        success: true,
        message: 'Concept map synced from revision items',
        synced: operations.length,
        concepts: allConcepts.length,
      });
    } catch (error) {
      console.error('Failed to sync concepts from revisions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sync concepts',
        error: error.message,
      });
    }
  },
};


