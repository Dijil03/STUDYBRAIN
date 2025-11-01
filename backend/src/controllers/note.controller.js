import Note from '../models/note.model.js';

export const createNote = async (req, res) => {
  try {
    const { userId } = req.params;
    const note = new Note({
      userId,
      ...req.body
    });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getNotes = async (req, res) => {
  try {
    const { userId } = req.params;
    const { subject, isArchived, isStarred, search } = req.query;
    
    const query = { userId };
    
    if (subject) query.subject = subject;
    if (isArchived !== undefined) query.isArchived = isArchived === 'true';
    if (isStarred !== undefined) query.isStarred = isStarred === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    const notes = await Note.find(query).sort({ updatedAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.params.userId
    });
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.params.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.status(200).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.params.userId
    });
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
