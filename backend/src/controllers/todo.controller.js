import Todo from '../models/todo.model.js';

export const createTodo = async (req, res) => {
  try {
    const { userId } = req.params;
    const todo = new Todo({
      userId,
      ...req.body
    });
    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getTodos = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isCompleted, subject, priority, category } = req.query;
    
    const query = { userId };
    
    if (isCompleted !== undefined) query.isCompleted = isCompleted === 'true';
    if (subject) query.subject = subject;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    
    const todos = await Todo.find(query).sort({ dueDate: 1, createdAt: -1 });
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.params.userId
    });
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTodo = async (req, res) => {
  try {
    if (req.body.isCompleted && !req.body.completedAt) {
      req.body.completedAt = new Date();
    }
    if (!req.body.isCompleted) {
      req.body.completedAt = null;
    }
    
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userId: req.params.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.status(200).json(todo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      userId: req.params.userId
    });
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
