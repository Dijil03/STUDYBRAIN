import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Users,
  Clock3,
  Sparkles,
  Paintbrush,
  Trash2,
  Search,
  FolderPlus,
  ArrowRight,
  Shield,
  Star,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WhiteboardService from '../services/whiteboardService';

const accentGradients = [
  'from-cyan-500/40 via-sky-500/20 to-transparent',
  'from-purple-500/40 via-fuchsia-500/20 to-transparent',
  'from-emerald-500/40 via-teal-500/20 to-transparent',
  'from-amber-500/40 via-orange-500/20 to-transparent',
];

const randomGradient = () =>
  accentGradients[Math.floor(Math.random() * accentGradients.length)];

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return '—';
  }
};

const Whiteboards = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username') || 'You';

  const [whiteboards, setWhiteboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  useEffect(() => {
    if (!userId) return;
    loadWhiteboards();
  }, [userId]);

  const loadWhiteboards = async () => {
    try {
      setLoading(true);
      const response = await WhiteboardService.list(userId);
      const data = response.data?.whiteboards || [];
      setWhiteboards(
        data.map((board) => ({
          ...board,
          accent: randomGradient(),
        })),
      );
    } catch (error) {
      console.error('Failed to load whiteboards', error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredBoards = useMemo(() => {
    if (!search.trim()) return whiteboards;
    return whiteboards.filter((board) =>
      `${board.title} ${board.description}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [whiteboards, search]);

  const handleCreate = async () => {
    if (!form.title.trim()) {
      setError('Give your whiteboard a title to get started.');
      return;
    }

    try {
      setCreating(true);
      setError('');
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
      };
      const response = await WhiteboardService.create(userId, payload);
      const newBoard = response.data?.whiteboard;
      if (newBoard) {
        setWhiteboards((prev) => [
          {
            ...newBoard,
            accent: randomGradient(),
          },
          ...prev,
        ]);
        setShowCreateModal(false);
        setForm({ title: '', description: '' });
        navigate(`/whiteboards/${newBoard._id}`);
      }
    } catch (error) {
      console.error('Failed to create whiteboard', error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (whiteboardId) => {
    if (!window.confirm('Delete this whiteboard permanently?')) return;
    try {
      setDeletingId(whiteboardId);
      await WhiteboardService.delete(userId, whiteboardId);
      setWhiteboards((prev) => prev.filter((board) => board._id !== whiteboardId));
    } catch (error) {
      console.error('Failed to delete whiteboard', error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setDeletingId('');
    }
  };

  const quickStartTemplates = [
    {
      title: 'Brainstorm Space',
      description: 'Sticky notes, arrows, and quick sketches to ideate fast.',
      color: 'from-sky-500/30 via-indigo-500/10 to-transparent',
    },
    {
      title: 'Lesson Flow',
      description: 'Map chapters, subtopics, and key checkpoints.',
      color: 'from-amber-500/30 via-orange-500/10 to-transparent',
    },
    {
      title: 'Study Sprint',
      description: 'Plan 25/5 focus cycles with accountability.',
      color: 'from-emerald-500/30 via-teal-500/10 to-transparent',
    },
  ];

  const renderEmptyState = () => (
    <div className="col-span-full">
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 px-6 py-12 text-center shadow-2xl shadow-cyan-900/30">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
          <Sparkles className="h-8 w-8" />
        </div>
        <h3 className="mt-6 text-2xl font-semibold text-white">Create your first board</h3>
        <p className="mt-3 text-base text-slate-300">
          Draft mind maps, explain tricky concepts, or plan team sessions with multiplayer drawing.
        </p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 px-6 py-3 text-base font-semibold text-white shadow-xl shadow-cyan-900/40 transition hover:scale-105"
        >
          <Plus className="mr-2 h-5 w-5" />
          Start a Whiteboard
        </button>
      </div>
    </div>
  );

  if (!userId) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="max-w-lg rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center shadow-2xl">
          <Shield className="mx-auto h-12 w-12 text-rose-400" />
          <p className="mt-4 text-lg font-semibold text-white">Sign in required</p>
          <p className="mt-2 text-slate-300">Whiteboards are available once you&apos;re logged in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 pb-24 pt-24 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 p-6 shadow-2xl shadow-cyan-900/30 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Realtime Studio</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Collaborative Whiteboards</h1>
            <p className="mt-3 text-base text-slate-300">
              Sketch concepts, co-create lesson flows, and share ideas live with StudyBrain peers.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-cyan-900/40 transition hover:scale-[1.02]"
            >
              <Plus className="mr-2 h-5 w-5" />
              New Whiteboard
            </button>
            <button
              onClick={loadWhiteboards}
              className="inline-flex items-center rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-cyan-400/40 hover:text-cyan-200"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Refresh
            </button>
          </div>
        </header>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-2/3">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search boards by title or description..."
              className="w-full rounded-2xl border border-white/5 bg-white/5 py-3 pl-12 pr-4 text-base text-white placeholder:text-slate-400 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            />
          </div>
          <div className="flex gap-3">
            <div className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-300">
              <span className="text-white">{whiteboards.length}</span> boards
            </div>
            <div className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-300">
              Hosted by <span className="text-white">{username}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {loading ? (
            [...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-48 animate-pulse rounded-3xl bg-white/5"
              />
            ))
          ) : filteredBoards.length === 0 ? (
            renderEmptyState()
          ) : (
            filteredBoards.map((board) => (
              <motion.div
                key={board._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-slate-950/40 transition hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-cyan-900/30"
              >
                <div className={`pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${board.accent} blur-3xl`} />
                <div className="relative flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">Whiteboard</p>
                      <h3 className="mt-2 text-xl font-bold text-white">{board.title}</h3>
                    </div>
                    <button
                      onClick={() => handleDelete(board._id)}
                      className="rounded-2xl border border-white/5 p-2 text-slate-400 transition hover:border-rose-400/40 hover:text-rose-200"
                      disabled={deletingId === board._id}
                    >
                      {deletingId === board._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <p className="text-sm text-slate-300">
                    {board.description || 'Capture ideas, diagrams, and walkthroughs together.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                    <span className="inline-flex items-center gap-2 rounded-2xl border border-white/5 px-3 py-1 text-xs text-cyan-200">
                      <Users className="h-4 w-4" />
                      {(board.collaborators?.length || 0) + 1} contributors
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-2xl border border-white/5 px-3 py-1 text-xs text-slate-300">
                      <Clock3 className="h-4 w-4" />
                      Updated {formatDate(board.updatedAt)}
                    </span>
                    {board.settings?.showGrid && (
                      <span className="inline-flex items-center gap-1 rounded-2xl border border-white/5 px-3 py-1 text-xs text-slate-300">
                        <Star className="h-4 w-4 text-amber-300" />
                        Grid on
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                      <Paintbrush className="h-4 w-4 text-cyan-300" />
                      Infinite canvas
                    </div>
                    <button
                      onClick={() => navigate(`/whiteboards/${board._id}`)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500/80"
                    >
                      Open
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <section className="mt-16">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-inner shadow-slate-900/60">
            <p className="text-xs uppercase tracking-[0.5em] text-cyan-300/80">Templates</p>
            <h2 className="mt-2 text-2xl font-black text-white">Quick start layouts</h2>
            <p className="mt-2 text-base text-slate-300">
              Duplicate a template and remix it live with your study group.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {quickStartTemplates.map((template) => (
                <div
                  key={template.title}
                  className="relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/60 p-5 text-white shadow-lg"
                >
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${template.color}`} />
                  <div className="relative space-y-3">
                    <h3 className="text-lg font-semibold">{template.title}</h3>
                    <p className="text-sm text-slate-200">{template.description}</p>
                    <button
                      onClick={() => {
                        setForm({ title: template.title, description: template.description });
                        setShowCreateModal(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em]"
                    >
                      <FolderPlus className="h-4 w-4" />
                      Use template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-300">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">New Space</p>
                  <h3 className="text-xl font-semibold text-white">Create whiteboard</h3>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm text-slate-300">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Thermodynamics lesson map"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="What do you want to map together?"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  />
                </div>
                {error && (
                  <p className="text-sm text-rose-300">{error}</p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setForm({ title: '', description: '' });
                    setError('');
                  }}
                  className="rounded-2xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="inline-flex items-center rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-cyan-900/40 transition hover:scale-[1.01] disabled:opacity-60"
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create and open
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Whiteboards;

