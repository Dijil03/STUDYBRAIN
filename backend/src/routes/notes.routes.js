import express from 'express';
import {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote
} from '../controllers/note.controller.js';

const router = express.Router();

router.post('/:userId', createNote);
router.get('/:userId', getNotes);
router.get('/:userId/:id', getNote);
router.put('/:userId/:id', updateNote);
router.delete('/:userId/:id', deleteNote);

export default router;
