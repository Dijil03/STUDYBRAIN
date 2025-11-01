import express from 'express';
import {
  createTodo,
  getTodos,
  getTodo,
  updateTodo,
  deleteTodo
} from '../controllers/todo.controller.js';

const router = express.Router();

router.post('/:userId', createTodo);
router.get('/:userId', getTodos);
router.get('/:userId/:id', getTodo);
router.put('/:userId/:id', updateTodo);
router.delete('/:userId/:id', deleteTodo);

export default router;
