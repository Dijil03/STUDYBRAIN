import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import api from '../utils/axios';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  Flag,
  Filter,
  X,
  Clock
} from 'lucide-react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const Todos = () => {
  const userId = localStorage.getItem('userId');
  const [todos, setTodos] = useState([]);
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  
  const [todoForm, setTodoForm] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: '',
    priority: 'Medium',
    category: 'Study'
  });
  
  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Other'];
  const priorities = [
    { name: 'High', color: 'red' },
    { name: 'Medium', color: 'yellow' },
    { name: 'Low', color: 'green' }
  ];

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    filterTodos();
  }, [todos, searchTerm, filterStatus, filterPriority]);

  const fetchTodos = async () => {
    try {
      const response = await api.get(`/todos/${userId}`);
      setTodos(response.data);
      setFilteredTodos(response.data);
    } catch (error) {
      toast.error('Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const filterTodos = () => {
    let filtered = [...todos];
    
    if (searchTerm) {
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus === 'completed') {
      filtered = filtered.filter(todo => todo.isCompleted);
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(todo => !todo.isCompleted);
    }
    
    if (filterPriority !== 'all') {
      filtered = filtered.filter(todo => todo.priority === filterPriority);
    }
    
    setFilteredTodos(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTodo) {
        await api.put(`/todos/${userId}/${editingTodo._id}`, todoForm);
        toast.success('Todo updated!');
      } else {
        await api.post(`/todos/${userId}`, todoForm);
        toast.success('Todo created!');
      }
      setShowModal(false);
      resetForm();
      fetchTodos();
    } catch (error) {
      toast.error('Failed to save todo');
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      await api.put(`/todos/${userId}/${todo._id}`, {
        isCompleted: !todo.isCompleted
      });
      
      // Record progress when task is completed
      if (!todo.isCompleted) {
        try {
          console.log('Recording progress for task completion...');
          
          // Record streak activity
          const activityRes = await api.post(`/progress/activity/${userId}`, {
            tasksCompleted: 1,
            studyTime: 0
          });
          console.log('✅ Activity recorded:', activityRes.data);
          
          // Update progress stats
          const progressRes = await api.put(`/progress/${userId}`, {
            tasksCompleted: 1,
            xp: 10 // Give 10 XP per completed task
          });
          console.log('✅ Progress updated:', progressRes.data);
        } catch (progressError) {
          console.error('❌ Progress update failed:', progressError);
          console.error('Error details:', progressError.response?.data || progressError.message);
        }
      }
      
      toast.success(todo.isCompleted ? 'Task uncompleted' : 'Task completed! 🎉');
      fetchTodos();
    } catch (error) {
      toast.error('Failed to update todo');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await api.delete(`/todos/${userId}/${id}`);
        toast.success('Todo deleted');
        fetchTodos();
      } catch (error) {
        toast.error('Failed to delete todo');
      }
    }
  };

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setTodoForm({
      title: todo.title,
      description: todo.description || '',
      subject: todo.subject || '',
      dueDate: todo.dueDate ? dayjs(todo.dueDate).format('YYYY-MM-DD') : '',
      priority: todo.priority,
      category: todo.category || 'Study'
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingTodo(null);
    setTodoForm({
      title: '',
      description: '',
      subject: '',
      dueDate: '',
      priority: 'Medium',
      category: 'Study'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'Low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-400';
    }
  };

  const isOverdue = (todo) => {
    if (!todo.dueDate || todo.isCompleted) return false;
    return new Date(todo.dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-white text-xl">Loading todos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">✅ My Tasks</h1>
            <p className="text-gray-300">Stay organized and productive</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Task
          </motion.button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
            >
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Todos List */}
        {filteredTodos.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 className="w-24 h-24 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">No tasks yet. Add your first task!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTodos.map((todo) => (
              <motion.div
                key={todo._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all"
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggleComplete(todo)}
                    className="mt-1"
                  >
                    {todo.isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-lg font-semibold ${
                        todo.isCompleted ? 'line-through text-gray-400' : 'text-white'
                      }`}>
                        {todo.title}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(todo)}
                          className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(todo._id)}
                          className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {todo.description && (
                      <p className="text-gray-300 text-sm mb-3">{todo.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-3 items-center text-sm">
                      {todo.subject && (
                        <span className="px-3 py-1 bg-white/10 rounded-full text-gray-300">
                          {todo.subject}
                        </span>
                      )}
                      
                      {todo.dueDate && (
                        <span className={`px-3 py-1 rounded-full flex items-center gap-1 ${
                          isOverdue(todo) ? 'text-red-400 bg-red-500/10' : 'text-gray-300 bg-white/10'
                        }`}>
                          <Calendar className="w-4 h-4" />
                          {dayjs(todo.dueDate).format('MMM DD, YYYY')}
                        </span>
                      )}
                      
                      {todo.priority && (
                        <span className={`px-3 py-1 rounded-full border ${getPriorityColor(todo.priority)}`}>
                          <Flag className="w-3 h-3 inline mr-1" />
                          {todo.priority}
                        </span>
                      )}
                      
                      {todo.category && (
                        <span className="px-3 py-1 bg-white/10 rounded-full text-gray-300">
                          {todo.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                {editingTodo ? 'Edit Task' : 'New Task'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={todoForm.title}
                  onChange={(e) => setTodoForm({ ...todoForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  value={todoForm.description}
                  onChange={(e) => setTodoForm({ ...todoForm, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Subject</label>
                  <select
                    value={todoForm.subject}
                    onChange={(e) => setTodoForm({ ...todoForm, subject: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={todoForm.dueDate}
                    onChange={(e) => setTodoForm({ ...todoForm, dueDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Priority</label>
                  <select
                    value={todoForm.priority}
                    onChange={(e) => setTodoForm({ ...todoForm, priority: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Category</label>
                  <select
                    value={todoForm.category}
                    onChange={(e) => setTodoForm({ ...todoForm, category: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Study">Study</option>
                    <option value="Personal">Personal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  {editingTodo ? 'Update' : 'Create'} Task
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Todos;
