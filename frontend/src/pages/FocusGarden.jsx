import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import {
  Leaf,
  TreePine,
  Droplet,
  Play,
  Pause,
  RotateCcw,
  ShoppingBag,
  Sprout,
  Timer,
  Sun,
  CloudRain,
  Flame,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const timerStates = {
  idle: 'idle',
  running: 'running',
  paused: 'paused',
  completed: 'completed',
};

const createEmptyGrid = (rows, cols) =>
  Array.from({ length: rows * cols }, (_, idx) => {
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    return {
      tileIndex: idx,
      row,
      col,
      occupied: false,
    };
  });

const formatMinutes = (minutes) => `${minutes} min`;

const FocusGarden = () => {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [speciesCatalog, setSpeciesCatalog] = useState([]);

  const [selectedSpecies, setSelectedSpecies] = useState('pine-tree');
  const [sessionSubject, setSessionSubject] = useState('General');
  const [targetMinutes, setTargetMinutes] = useState(25);
  const [timerState, setTimerState] = useState(timerStates.idle);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [sessionId, setSessionId] = useState(null);
  const [viewMode, setViewMode] = useState('isometric');

  const fetchOverview = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await api.get(`/garden/${userId}/overview`);
      if (response.data.success) {
        setOverview(response.data.overview);
        setSpeciesCatalog(response.data.overview.speciesCatalog || []);
      }
    } catch (error) {
      console.error('Failed to load garden overview', error);
      toast.error('Failed to load your focus garden.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    if (timerState !== timerStates.running) return;
    if (secondsRemaining <= 0) {
      handleCompleteSession();
      return undefined;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState, secondsRemaining]);

  const handleStartSession = async () => {
    if (!userId) {
      toast.error('Please log in to start a session.');
      return;
    }
    if (!selectedSpecies) {
      toast.error('Select a species to plant.');
      return;
    }

    try {
      const response = await api.post(`/garden/${userId}/session/start`, {
        species: selectedSpecies,
        subject: sessionSubject,
        targetMinutes,
      });
      if (response.data.success) {
        const { session } = response.data;
        setSessionId(session.sessionId);
        setSecondsRemaining((session.targetMinutes || targetMinutes) * 60);
        setTimerState(timerStates.running);
        toast.success(`Focus session started with ${selectedSpecies.replace('-', ' ')}!`);
        fetchOverview();
      }
    } catch (error) {
      console.error('Failed to start session:', error);
      toast.error(error.response?.data?.message || 'Could not start session.');
    }
  };

  const handlePauseResume = () => {
    if (timerState === timerStates.running) {
      setTimerState(timerStates.paused);
    } else if (timerState === timerStates.paused) {
      setTimerState(timerStates.running);
    }
  };

  const handleAbortSession = async () => {
    if (!sessionId || !userId) {
      setTimerState(timerStates.idle);
      setSecondsRemaining(targetMinutes * 60);
      return;
    }
    try {
      await api.post(`/garden/${userId}/session/abort`);
      toast.info('Session aborted. Seed returned to inventory.');
    } catch (error) {
      console.error('Failed to abort session:', error);
    } finally {
      setTimerState(timerStates.idle);
      setSessionId(null);
      setSecondsRemaining(targetMinutes * 60);
      fetchOverview();
    }
  };

  const handleCompleteSession = async () => {
    if (!sessionId || !userId) {
      setTimerState(timerStates.completed);
      return;
    }
    try {
      const minutes = Math.ceil(targetMinutes - secondsRemaining / 60);
      const response = await api.post(`/garden/${userId}/session/complete`, {
        sessionId,
        minutes,
        quality: 5,
      });
      if (response.data.success) {
        toast.success(`Session complete! Earned ${response.data.dewEarned} dew drops.`);
      }
    } catch (error) {
      console.error('Failed to complete session:', error);
      toast.error(error.response?.data?.message || 'Could not complete session.');
    } finally {
      setTimerState(timerStates.completed);
      setSessionId(null);
      setSecondsRemaining(targetMinutes * 60);
      fetchOverview();
    }
  };

  const handlePurchaseSpecies = async (species) => {
    if (!userId) return;
    try {
      const response = await api.post(`/garden/${userId}/shop/purchase`, { species });
      if (response.data.success) {
        toast.success('Species unlocked! Check your inventory.');
        fetchOverview();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cannot unlock species right now.');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const plantGrid = useMemo(() => {
    if (!overview?.garden) return [];
    const rows = overview.garden.gridRows;
    const cols = overview.garden.gridColumns;
    const plants = overview.plants || [];
    const plantMap = new Map(plants.map((plant) => [plant.position.row * cols + plant.position.col, plant]));
    return createEmptyGrid(rows, cols).map((tile) => {
      const plant = plantMap.get(tile.tileIndex);
      return {
        ...tile,
        occupied: Boolean(plant),
        plant,
      };
    });
  }, [overview]);

  const isometricLayout = useMemo(() => {
    if (!overview?.garden) {
      return {
        width: 0,
        height: 0,
        tileWidth: 120,
        tileHeight: 60,
        tiles: [],
      };
    }

    const rows = overview.garden.gridRows;
    const cols = overview.garden.gridColumns;
    const tileWidth = 120;
    const tileHeight = tileWidth / 2;
    const xOffset = rows * (tileWidth / 2);
    const width = (cols + rows) * (tileWidth / 2) + tileWidth;
    const height = (cols + rows) * (tileHeight / 2) + tileHeight;

    const tiles = plantGrid.map((tile) => {
      const isoX = (tile.col - tile.row) * (tileWidth / 2) + xOffset;
      const isoY = (tile.col + tile.row) * (tileHeight / 2);
      const points = [
        `${isoX},${isoY - tileHeight / 2}`,
        `${isoX + tileWidth / 2},${isoY}`,
        `${isoX},${isoY + tileHeight / 2}`,
        `${isoX - tileWidth / 2},${isoY}`,
      ].join(' ');

      return {
        ...tile,
        isoX,
        isoY,
        points,
      };
    });

    return { width, height, tileWidth, tileHeight, tiles };
  }, [overview, plantGrid]);

  const inventoryLookup = useMemo(() => {
    const map = new Map();
    (overview?.inventory || []).forEach((item) => map.set(item.species, item.quantity));
    return map;
  }, [overview]);

  const timerLabel = useMemo(() => {
    switch (timerState) {
      case timerStates.running:
        return 'Session in progress';
      case timerStates.paused:
        return 'Session paused';
      case timerStates.completed:
        return 'Session completed';
      default:
        return 'Ready to focus';
    }
  }, [timerState]);

  const chartData = useMemo(() => {
    const minutes = overview?.plants?.map((plant) => plant.totalFocusMinutes) || [];
    const labels = overview?.plants?.map((plant) => plant.displayName) || [];
    return {
      labels,
      datasets: [
        {
          label: 'Focus minutes',
          data: minutes,
          backgroundColor: 'rgba(56, 189, 248, 0.4)',
          borderColor: 'rgba(56, 189, 248, 1)',
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    };
  }, [overview]);

  if (!userId) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">Focus Garden</h1>
          <p className="text-slate-400">Please log in to cultivate your study forest.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <span className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/40 rounded-full text-emerald-200 text-xs font-semibold uppercase tracking-wide">
              <Sparkles className="w-4 h-4" />
              <span>Focus Garden</span>
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-white">
              Grow your study forest
            </h1>
            <p className="mt-3 text-lg text-slate-300 max-w-2xl">
              Plant a seed, stay focused, and watch your garden thrive with every study session. Complete timers to earn dew drops, unlock rare species, and keep your plants healthy.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/60 border border-slate-800 rounded-3xl px-6 py-5 space-y-4 backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Dew Balance</span>
              <Droplet className="w-5 h-5 text-blue-300" />
            </div>
            <p className="text-3xl font-semibold text-white">{overview?.garden?.dewBalance ?? 0}</p>
            <p className="text-xs text-slate-500">Earn dew drops by completing focus sessions.</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <Timer className="w-5 h-5 text-emerald-300" />
                  <span>{timerLabel}</span>
                </h2>
                <p className="text-slate-400 text-sm">Stay on track to grow your next plant.</p>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min={5}
                  max={120}
                  step={5}
                  value={targetMinutes}
                  disabled={timerState !== timerStates.idle}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setTargetMinutes(value);
                    setSecondsRemaining(value * 60);
                  }}
                  className="w-24 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
                <span className="text-sm text-slate-400">minutes</span>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6 space-y-6 lg:space-y-0">
              <div className="flex-1">
                <div className="relative h-48">
                  <div className="absolute inset-0 rounded-full border border-emerald-500/40 bg-emerald-500/10"></div>
                  <div className="absolute inset-4 rounded-full border border-emerald-400/40 bg-emerald-400/10"></div>
                  <div className="absolute inset-8 rounded-full border border-emerald-300/40 bg-emerald-300/10"></div>
                  <div className="absolute inset-12 flex flex-col items-center justify-center text-center space-y-2">
                    <motion.span
                      key={secondsRemaining}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-3xl font-semibold tracking-tight"
                    >
                      {formatTime(secondsRemaining)}
                    </motion.span>
                    <span className="text-xs uppercase tracking-wide text-slate-400">
                      {selectedSpecies.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wide mb-2 block">Subject</label>
                  <input
                    type="text"
                    value={sessionSubject}
                    onChange={(event) => setSessionSubject(event.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    placeholder="e.g. Biology"
                    disabled={timerState !== timerStates.idle}
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wide mb-2 block">Species</label>
                  <select
                    value={selectedSpecies}
                    onChange={(event) => setSelectedSpecies(event.target.value)}
                    disabled={timerState !== timerStates.idle}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  >
                    {(overview?.inventory || []).map((item) => (
                      <option key={item.species} value={item.species}>
                        {item.species.replace(/-/g, ' ')} ({item.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  {timerState === timerStates.idle && (
                    <button
                      onClick={handleStartSession}
                      className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 transition-colors text-slate-950 font-semibold"
                    >
                      <Play className="w-5 h-5" />
                      <span>Start Session</span>
                    </button>
                  )}

                  {timerState !== timerStates.idle && (
                    <>
                      <button
                        onClick={handlePauseResume}
                        className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors text-emerald-200 font-semibold"
                      >
                        {timerState === timerStates.running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        <span>{timerState === timerStates.running ? 'Pause' : 'Resume'}</span>
                      </button>
                      <button
                        onClick={handleCompleteSession}
                        className="inline-flex items-center justify-center px-4 py-3 rounded-2xl bg-blue-500/20 border border-blue-500/40 hover:bg-blue-500/30 transition-colors text-blue-200 font-semibold"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Complete
                      </button>
                    </>
                  )}

                  <button
                    onClick={handleAbortSession}
                    className="inline-flex items-center justify-center px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-colors text-slate-300"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur space-y-4"
          >
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <Leaf className="w-5 h-5 text-emerald-300" />
              <span>Garden stats</span>
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total focus minutes</span>
                <span className="text-white font-semibold">{overview?.garden?.totalFocusMinutes ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total sessions</span>
                <span className="text-white font-semibold">{overview?.garden?.totalSessions ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current streak</span>
                <span className="text-white font-semibold">{overview?.garden?.currentStreak ?? 0} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Longest streak</span>
                <span className="text-white font-semibold">{overview?.garden?.longestStreak ?? 0} days</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Plant health tips</h3>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex items-center space-x-2">
                  <Sun className="w-4 h-4 text-amber-300" />
                  <span>Complete sessions daily to keep leaves vibrant.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CloudRain className="w-4 h-4 text-sky-300" />
                  <span>Revise tough concepts for fertilizer boosts.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-orange-300" />
                  <span>Abandoned sessions dry out the soil; try again soon!</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <TreePine className="w-5 h-5 text-emerald-300" />
                <span>Your forest</span>
              </h2>
              <div className="flex items-center space-x-2 bg-slate-950/60 border border-slate-800 rounded-full px-1 py-1">
                {[
                  { id: 'isometric', label: 'Isometric' },
                  { id: 'grid', label: 'Grid' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setViewMode(option.id)}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                      viewMode === option.id
                        ? 'bg-emerald-500 text-slate-950 font-semibold shadow shadow-emerald-500/30'
                        : 'text-slate-400 hover:text-emerald-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                  <Sprout className="w-8 h-8 text-emerald-300" />
                </motion.div>
              </div>
            ) : viewMode === 'grid' ? (
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: `repeat(${overview?.garden?.gridColumns || 5}, minmax(0, 1fr))`,
                }}
              >
                {plantGrid.map((tile) => (
                  <div
                    key={tile.tileIndex}
                    className={`rounded-2xl border border-slate-800 bg-slate-950/60 aspect-square flex flex-col items-center justify-center text-center p-2 ${
                      tile.occupied ? 'shadow-lg shadow-emerald-500/10' : 'opacity-60'
                    }`}
                  >
                    {tile.occupied ? (
                      <>
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-300/20 border border-emerald-500/40 flex items-center justify-center"
                        >
                          <TreePine className="w-6 h-6 text-emerald-200" />
                        </motion.div>
                        <p className="mt-2 text-xs font-semibold text-white truncate w-full">
                          {tile.plant.displayName}
                        </p>
                        <p className="text-[11px] text-emerald-200">
                          Stage {tile.plant.stage} · {tile.plant.totalFocusMinutes}m
                        </p>
                      </>
                    ) : (
                      <div className="text-xs text-slate-500">
                        <span className="block text-lg">+</span>
                        Plant here
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative w-full">
                <div className="relative mx-auto" style={{ width: isometricLayout.width, height: isometricLayout.height }}>
                  <svg
                    width={isometricLayout.width}
                    height={isometricLayout.height + 60}
                    viewBox={`0 0 ${isometricLayout.width} ${isometricLayout.height + 60}`}
                    className="w-full h-auto drop-shadow-[0_25px_40px_rgba(15,118,110,0.35)]"
                  >
                    <defs>
                      <linearGradient id="boardGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#99f6e4" />
                        <stop offset="100%" stopColor="#22d3ee" />
                      </linearGradient>
                      <linearGradient id="tileGrass" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#bef264" />
                        <stop offset="100%" stopColor="#4ade80" />
                      </linearGradient>
                      <linearGradient id="tileSoil" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#78350f" />
                        <stop offset="100%" stopColor="#451a03" />
                      </linearGradient>
                      <radialGradient id="treeCanopy" cx="50%" cy="40%" r="60%">
                        <stop offset="0%" stopColor="#bbf7d0" />
                        <stop offset="70%" stopColor="#4ade80" />
                        <stop offset="100%" stopColor="#16a34a" />
                      </radialGradient>
                      <filter id="tileShadow" x="-40%" y="-40%" width="180%" height="180%">
                        <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="rgba(15,118,110,0.35)" />
                      </filter>
                    </defs>

                    <g filter="url(#tileShadow)">
                      <polygon
                        points={`${isometricLayout.width / 2},10 ${isometricLayout.width - 20},${isometricLayout.height / 2} ${
                          isometricLayout.width / 2
                        },${isometricLayout.height} 20,${isometricLayout.height / 2}`}
                        fill="url(#boardGradient)"
                        opacity="0.4"
                      />
                    </g>

                    {isometricLayout.tiles.map((tile) => {
                      const plant = tile.plant;
                      const fillColor = plant
                        ? plant.stage === 'blooming'
                          ? 'url(#treeCanopy)'
                          : plant.stage === 'mature'
                          ? '#4ade80'
                          : plant.stage === 'sprout'
                          ? '#86efac'
                          : '#bbf7d0'
                        : 'url(#tileGrass)';

                      return (
                        <g key={tile.id} transform={`translate(0, 20)`}>
                          <polygon points={tile.points} fill={fillColor} stroke="#134e4a" strokeWidth="1.5" opacity={plant ? 1 : 0.65} />

                          <polygon
                            points={`${tile.isoX},${tile.isoY + isometricLayout.tileHeight / 2} ${
                              tile.isoX + isometricLayout.tileWidth / 2
                            },${tile.isoY + isometricLayout.tileHeight} ${tile.isoX},${
                              tile.isoY + isometricLayout.tileHeight + isometricLayout.tileHeight / 2
                            } ${tile.isoX - isometricLayout.tileWidth / 2},${tile.isoY + isometricLayout.tileHeight}`}
                            fill="url(#tileSoil)"
                            opacity="0.7"
                          />

                          {plant && (
                            <>
                              <path
                                d={`M${tile.isoX},${tile.isoY + 10} C${tile.isoX - 6},${tile.isoY + 30} ${tile.isoX - 4},${tile.isoY + 45} ${
                                  tile.isoX - 2
                                },${tile.isoY + 60}`}
                                stroke="#854d0e"
                                strokeWidth="3"
                                strokeLinecap="round"
                              />
                              <circle cx={tile.isoX} cy={tile.isoY - 12} r={18} fill="url(#treeCanopy)" opacity="0.88" />
                              <circle cx={tile.isoX - 14} cy={tile.isoY - 6} r={10} fill="#bbf7d0" opacity="0.8" />
                              <circle cx={tile.isoX + 14} cy={tile.isoY - 4} r={12} fill="#86efac" opacity="0.85" />
                              <text
                                x={tile.isoX}
                                y={tile.isoY + 78}
                                textAnchor="middle"
                                fill="#f0fdfa"
                                fontSize="10"
                                fontFamily="Inter, sans-serif"
                                opacity="0.85"
                              >
                                {plant.displayName.length > 18 ? `${plant.displayName.slice(0, 17)}…` : plant.displayName}
                              </text>
                              <text
                                x={tile.isoX}
                                y={tile.isoY + 92}
                                textAnchor="middle"
                                fill="#99f6e4"
                                fontSize="9"
                                fontFamily="Inter, sans-serif"
                                opacity="0.75"
                              >
                                {`Stage ${plant.stage ?? '1'} • ${plant.totalFocusMinutes}m`}
                              </text>
                            </>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-emerald-300" />
                <span>Seed shop</span>
              </h2>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Unlock new species</span>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
              {speciesCatalog.map((species) => {
                const owned = inventoryLookup.get(species.slug) ?? 0;
                const affordable = (overview?.garden?.dewBalance || 0) >= species.price;
                return (
                  <motion.div
                    key={species.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white capitalize">{species.displayName}</h3>
                        <p className="text-xs text-slate-400">{species.description}</p>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full border ${
                          species.rarity === 'rare'
                            ? 'border-violet-500/40 text-violet-200 bg-violet-500/10'
                            : species.rarity === 'legendary'
                            ? 'border-amber-500/40 text-amber-200 bg-amber-500/10'
                            : 'border-emerald-500/40 text-emerald-200 bg-emerald-500/10'
                        }`}
                      >
                        {species.rarity}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Base focus: {formatMinutes(species.baseFocusMinutes)}</span>
                      <span>Owned: {owned}</span>
                    </div>

                    <button
                      onClick={() => handlePurchaseSpecies(species.slug)}
                      disabled={!affordable}
                      className={`w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                        affordable
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-100 hover:bg-emerald-500/30'
                          : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Droplet className="w-4 h-4" />
                      <span>{affordable ? `Buy for ${species.price} dew` : 'Not enough dew drops'}</span>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <Leaf className="w-5 h-5 text-emerald-300" />
              <span>Plant performance</span>
            </h2>
            <span className="text-xs text-slate-500 uppercase tracking-wide">Minutes by plant</span>
          </div>
          <div className="h-72">
            {overview?.plants?.length ? (
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      ticks: { color: '#94a3b8' },
                      grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    },
                    x: {
                      ticks: { color: '#94a3b8' },
                      grid: { display: false },
                    },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.parsed.y} minutes`,
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Complete a focus session to populate this chart.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FocusGarden;

