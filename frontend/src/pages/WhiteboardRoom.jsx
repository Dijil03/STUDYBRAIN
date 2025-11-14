import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  ArrowLeft,
  PenSquare,
  Eraser,
  Highlighter,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Sparkles,
  Save,
  Grid,
  SquareDashed,
  Shield,
  Loader2,
  Share2,
  Link2,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import WhiteboardService from '../services/whiteboardService';
import { getSocketUrl } from '../utils/apiConfig';

const COLORS = ['#38bdf8', '#a855f7', '#22d3ee', '#34d399', '#facc15', '#fb7185', '#f97316', '#f472b6', '#e879f9'];

const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

const drawPath = (ctx, path) => {
  const points = path?.points || [];
  if (points.length < 2) return;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = path.width || 4;
  ctx.strokeStyle = path.color || '#fff';
  ctx.globalAlpha = path.opacity ?? 1;
  ctx.globalCompositeOperation = path.composite || 'source-over';

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
  ctx.restore();
};

const WhiteboardRoom = () => {
  const { whiteboardId } = useParams();
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username') || 'Learner';
  const userColor = useMemo(
    () => localStorage.getItem('whiteboardColor') || (() => {
      const color = randomColor();
      localStorage.setItem('whiteboardColor', color);
      return color;
    })(),
    [],
  );

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const socketRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const dirtyRef = useRef(false);

  const [whiteboard, setWhiteboard] = useState(null);
  const [paths, setPaths] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState(userColor);
  const [lineWidth, setLineWidth] = useState(4);
  const [showGrid, setShowGrid] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareCopyStatus, setShareCopyStatus] = useState('');
  const [shareUpdating, setShareUpdating] = useState(false);
  const [linkRefreshing, setLinkRefreshing] = useState(false);
  const collaboratorList = useMemo(
    () => participants.filter((person) => person.userId !== userId),
    [participants, userId],
  );
  const onlineCount = participants.length || 1;
  const inviteLink = useMemo(() => {
    if (typeof window === 'undefined' || !whiteboard?._id) return '';
    const origin = window.location.origin;
    const codeSegment = whiteboard.shareCode ? `?code=${whiteboard.shareCode}` : '';
    return `${origin}/whiteboards/${whiteboard._id}${codeSegment}`;
  }, [whiteboard]);

  const devicePixelRatioValue = window.devicePixelRatio || 1;

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const { width, height } = container.getBoundingClientRect();
    canvas.width = width * devicePixelRatioValue;
    canvas.height = height * devicePixelRatioValue;

    const ctx = canvas.getContext('2d');
    ctx.scale(devicePixelRatioValue, devicePixelRatioValue);
    ctx.clearRect(0, 0, width, height);
    paths.forEach((path) => drawPath(ctx, path));
  }, [paths, devicePixelRatioValue]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(devicePixelRatioValue, devicePixelRatioValue);
    paths.forEach((path) => drawPath(ctx, path));
  }, [paths, devicePixelRatioValue]);

  const handlePointerDown = (event) => {
    if (!canvasRef.current) return;
    setRedoStack([]);
    setIsDrawing(true);

    const rect = canvasRef.current.getBoundingClientRect();
    const point = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    const pathId = window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    const path = {
      id: pathId,
      points: [point],
      color: tool === 'highlighter' ? color : tool === 'eraser' ? '#000000' : color,
      width: tool === 'highlighter' ? lineWidth * 3 : lineWidth,
      opacity: tool === 'highlighter' ? 0.3 : 1,
      composite: tool === 'eraser' ? 'destination-out' : 'source-over',
      tool,
      userId,
      username,
      createdAt: Date.now(),
    };

    setCurrentPath(path);
  };

  const handlePointerMove = (event) => {
    if (!isDrawing || !currentPath || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const point = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    setCurrentPath((prev) => {
      const updated = { ...prev, points: [...prev.points, point] };
      const ctx = canvasRef.current.getContext('2d');
      drawPath(ctx, { ...updated, points: updated.points.slice(-2) });
      return updated;
    });
  };

  const finalizePath = () => {
    if (!isDrawing || !currentPath) return;

    setPaths((prev) => [...prev, currentPath]);
    dirtyRef.current = true;
    socketRef.current?.emit('whiteboard-sync', {
      whiteboardId,
      paths: [currentPath],
    });
    setCurrentPath(null);
    setIsDrawing(false);
  };

  const handlePointerUp = () => finalizePath();

  const handlePointerLeave = () => finalizePath();

  const handleUndo = () => {
    setPaths((prev) => {
      if (!prev.length) return prev;
      const clone = [...prev];
      const removed = clone.pop();
      if (removed) {
        setRedoStack((stack) => [...stack, removed]);
        dirtyRef.current = true;
        socketRef.current?.emit('whiteboard-sync', {
          whiteboardId,
          meta: { action: 'remove', pathIds: [removed.id] },
        });
      }
      return clone;
    });
  };

  const handleRedo = () => {
    setRedoStack((prev) => {
      if (!prev.length) return prev;
      const clone = [...prev];
      const restored = clone.pop();
      if (restored) {
        setPaths((pathsValue) => [...pathsValue, restored]);
        dirtyRef.current = true;
        socketRef.current?.emit('whiteboard-sync', {
          whiteboardId,
          paths: [restored],
        });
      }
      return clone;
    });
  };

  const handleClear = () => {
    if (!window.confirm('Clear the canvas for everyone?')) return;
    setPaths([]);
    setRedoStack([]);
    dirtyRef.current = true;
    socketRef.current?.emit('whiteboard-clear', { whiteboardId });
  };

  const handleToggleGrid = () => {
    dirtyRef.current = true;
    setShowGrid((prev) => !prev);
  };

  const handleCopyInviteLink = async () => {
    if (!inviteLink || typeof navigator === 'undefined' || !navigator.clipboard) {
      setShareCopyStatus('Copy not supported');
      setTimeout(() => setShareCopyStatus(''), 2500);
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteLink);
      setShareCopyStatus('Link copied!');
      setTimeout(() => setShareCopyStatus(''), 2500);
    } catch (err) {
      console.error('Failed to copy link', err);
      setShareCopyStatus('Copy failed');
      setTimeout(() => setShareCopyStatus(''), 2500);
    }
  };

  const handleToggleAllowGuests = async () => {
    if (!whiteboard) return;
    try {
      setShareUpdating(true);
      const response = await WhiteboardService.updateMeta(userId, whiteboardId, {
        allowGuests: !whiteboard.allowGuests,
      });
      const updatedBoard = response.data?.whiteboard || whiteboard;
      setWhiteboard(updatedBoard);
    } catch (err) {
      console.error('Failed to toggle guest access', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setShareUpdating(false);
    }
  };

  const handleRegenerateShareLink = async () => {
    if (!whiteboard) return;
    try {
      setLinkRefreshing(true);
      const response = await WhiteboardService.updateMeta(userId, whiteboardId, {
        regenerateShareCode: true,
      });
      const updatedBoard = response.data?.whiteboard || whiteboard;
      setWhiteboard(updatedBoard);
    } catch (err) {
      console.error('Failed to refresh share code', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLinkRefreshing(false);
    }
  };

  const persistCanvas = useCallback(async () => {
    if (!whiteboard || !userId) return;
    setSaving(true);
    try {
      await WhiteboardService.saveCanvas(userId, whiteboardId, {
        paths,
        background: whiteboard.canvasData?.background || '#0f172a',
        settings: { ...(whiteboard.settings || {}), showGrid },
      });
      setWhiteboard((prev) =>
        prev
          ? {
              ...prev,
              canvasData: {
                ...(prev.canvasData || {}),
                paths,
              },
              settings: {
                ...(prev.settings || {}),
                showGrid,
              },
              updatedAt: new Date().toISOString(),
            }
          : prev,
      );
      dirtyRef.current = false;
    } catch (err) {
      console.error('Failed to save whiteboard', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }, [paths, whiteboard, userId, whiteboardId, showGrid]);

  useEffect(() => {
    if (!whiteboard || !dirtyRef.current) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      persistCanvas();
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [paths, showGrid, persistCanvas, whiteboard]);

  const fetchWhiteboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await WhiteboardService.get(userId, whiteboardId);
      const data = response.data?.whiteboard;
      setWhiteboard(data);
      setShowGrid(data?.settings?.showGrid ?? true);
      setPaths(data?.canvasData?.paths || []);
    } catch (err) {
      console.error('Failed to load whiteboard', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, whiteboardId]);

  useEffect(() => {
    if (!userId) return;
    fetchWhiteboard();
  }, [fetchWhiteboard, userId]);

  useEffect(() => {
    dirtyRef.current = false;
  }, [whiteboardId]);

  useEffect(() => {
    redraw();
  }, [paths, redraw]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    if (!userId || !whiteboardId) return;
    const socketUrl = getSocketUrl();
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.emit('join-whiteboard', {
      whiteboardId,
      userId,
      username,
      color: userColor,
    });

    socket.on('whiteboard-users', (users) => setParticipants(users));
    socket.on('whiteboard-user-joined', (user) =>
      setParticipants((prev) => {
        const exists = prev.some((item) => item.socketId === user.socketId);
        if (exists) return prev;
        return [...prev, user];
      }),
    );
    socket.on('whiteboard-user-left', (user) =>
      setParticipants((prev) => prev.filter((item) => item.socketId !== user.socketId)),
    );
    socket.on('whiteboard-sync', ({ paths: incomingPaths, meta }) => {
      if (meta?.action === 'remove' && meta.pathIds) {
        setPaths((prev) => prev.filter((path) => !meta.pathIds.includes(path.id)));
        return;
      }
      if (incomingPaths?.length) {
        setPaths((prev) => {
          const ids = new Set(prev.map((path) => path.id));
          const unique = incomingPaths.filter((path) => !ids.has(path.id));
          if (!unique.length) return prev;
          return [...prev, ...unique];
        });
      }
    });
    socket.on('whiteboard-clear', () => {
      setPaths([]);
      setRedoStack([]);
    });

    return () => {
      socket.emit('leave-whiteboard', { whiteboardId });
      socket.disconnect();
    };
  }, [userId, whiteboardId, username, userColor]);

  const backgroundClass = showGrid
    ? 'bg-[radial-gradient(circle,_rgba(148,163,184,0.15)_1px,_transparent_1px)] [background-size:24px_24px]'
    : 'bg-slate-950';

  const downloadBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${whiteboard?.title || 'whiteboard'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (!userId) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center bg-slate-950 px-4 pt-24">
          <div className="max-w-lg rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center shadow-2xl">
            <Shield className="mx-auto h-12 w-12 text-rose-400" />
            <p className="mt-4 text-lg font-semibold text-white">Sign in required</p>
            <p className="mt-2 text-slate-300">Collaborative boards are available once you&apos;re logged in.</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 rounded-2xl bg-white/10 px-6 py-3 font-semibold text-white"
            >
              Go to Login
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="flex min-h-screen flex-col bg-slate-950/95 pt-24">
      <header className="sticky top-20 z-30 border-b border-white/10 bg-slate-950/90 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/whiteboards')}
            className="rounded-2xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
          >
            <ArrowLeft className="mr-1 inline h-4 w-4" />
            Boards
          </button>
          <div className="flex flex-1 flex-col">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">Realtime Studio</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold">{whiteboard?.title || 'Untitled board'}</h1>
              <span className="rounded-2xl border border-white/10 px-3 py-1 text-xs text-slate-300">
                {onlineCount} online
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={downloadBoard}
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-cyan-400/40 hover:text-white"
            >
              <Download className="mr-1 inline h-4 w-4" />
              Export PNG
            </button>
            <button
              onClick={persistCanvas}
              disabled={saving}
              className="rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-900/40 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Save className="mr-2 inline h-4 w-4" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mx-auto mt-4 flex max-w-6xl flex-col gap-4">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">Invite link</p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <div className="flex flex-1 items-center rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-200">
                    <Link2 className="mr-2 h-4 w-4 text-cyan-300" />
                    <span className="truncate">{inviteLink || 'Generating link...'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyInviteLink}
                      className="inline-flex items-center rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400/40 hover:text-cyan-100"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Copy
                    </button>
                    <button
                      onClick={handleRegenerateShareLink}
                      disabled={linkRefreshing}
                      className="inline-flex items-center rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-amber-400/40 hover:text-amber-100 disabled:opacity-60"
                    >
                      {linkRefreshing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Refreshing
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Refresh link
                        </>
                      )}
                    </button>
                  </div>
                </div>
                {shareCopyStatus && (
                  <p className="mt-2 text-xs text-cyan-200">{shareCopyStatus}</p>
                )}
              </div>
              <button
                onClick={handleToggleAllowGuests}
                disabled={shareUpdating}
                className={`inline-flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${whiteboard?.allowGuests ? 'bg-cyan-500/20 text-cyan-100' : 'bg-white/5 text-slate-300'} disabled:opacity-60`}
              >
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Allow everyone with link
                </span>
                <span className={`ml-3 inline-flex items-center rounded-full px-3 py-1 text-xs uppercase tracking-[0.3em] ${whiteboard?.allowGuests ? 'bg-cyan-500/40 text-white' : 'bg-white/10 text-slate-300'}`}>
                  {shareUpdating ? '...' : whiteboard?.allowGuests ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-4 py-6">
        {error && (
          <div className="mx-auto mb-4 max-w-5xl rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 lg:flex-row">
          <aside className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/50 p-4 shadow-2xl shadow-slate-950/40 lg:w-64">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">Tools</p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTool('pen')}
                  className={`rounded-2xl border px-3 py-2 transition ${tool === 'pen' ? 'border-cyan-400 bg-cyan-500/20 text-white' : 'border-white/10 text-slate-300 hover:border-cyan-300/30 hover:text-white'}`}
                >
                  <PenSquare className="mx-auto h-5 w-5" />
                  <span className="mt-1 block text-[10px] uppercase tracking-[0.3em]">Pen</span>
                </button>
                <button
                  onClick={() => setTool('highlighter')}
                  className={`rounded-2xl border px-3 py-2 transition ${tool === 'highlighter' ? 'border-amber-400 bg-amber-500/20 text-white' : 'border-white/10 text-slate-300 hover:border-amber-300/30 hover:text-white'}`}
                >
                  <Highlighter className="mx-auto h-5 w-5" />
                  <span className="mt-1 block text-[10px] uppercase tracking-[0.3em]">Glow</span>
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`rounded-2xl border px-3 py-2 transition ${tool === 'eraser' ? 'border-rose-400 bg-rose-500/20 text-white' : 'border-white/10 text-slate-300 hover:border-rose-300/30 hover:text-white'}`}
                >
                  <Eraser className="mx-auto h-5 w-5" />
                  <span className="mt-1 block text-[10px] uppercase tracking-[0.3em]">Erase</span>
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">Colors</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {COLORS.map((palette) => (
                  <button
                    key={palette}
                    onClick={() => {
                      setColor(palette);
                      localStorage.setItem('whiteboardColor', palette);
                    }}
                    className={`h-9 w-9 rounded-2xl border-2 transition ${color === palette ? 'border-white scale-110' : 'border-white/20 hover:scale-105'}`}
                    style={{ backgroundColor: palette }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">Line width</label>
              <input
                type="range"
                min="2"
                max="16"
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className="mt-3 w-full accent-cyan-400"
              />
              <p className="mt-1 text-sm text-slate-300">{lineWidth}px</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleUndo}
                className="flex-1 rounded-2xl border border-white/10 px-3 py-2 text-sm text-white/80 transition hover:border-cyan-400/40 hover:text-white"
              >
                <Undo2 className="mr-1 inline h-4 w-4" />
                Undo
              </button>
              <button
                onClick={handleRedo}
                className="flex-1 rounded-2xl border border-white/10 px-3 py-2 text-sm text-white/80 transition hover:border-cyan-400/40 hover:text-white"
              >
                <Redo2 className="mr-1 inline h-4 w-4" />
                Redo
              </button>
            </div>
            <button
              onClick={handleClear}
              className="rounded-2xl border border-white/10 px-3 py-2 text-sm text-rose-300 transition hover:border-rose-400/60 hover:text-white"
            >
              <Trash2 className="mr-1 inline h-4 w-4" />
              Clear board
            </button>
            <button
              onClick={handleToggleGrid}
              className="rounded-2xl border border-white/10 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400/40 hover:text-white"
            >
              {showGrid ? (
                <>
                  <Grid className="mr-1 inline h-4 w-4" />
                  Grid on
                </>
              ) : (
                <>
                  <SquareDashed className="mr-1 inline h-4 w-4" />
                  Grid off
                </>
              )}
            </button>

            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">Participants</p>
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
                  <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-500 text-center text-base font-bold leading-8 shadow-lg shadow-cyan-900/40">
                    {username?.[0] || 'Y'}
                  </div>
                  <div>
                    <p className="text-white">{username}</p>
                    <p className="text-xs text-slate-400">Host</p>
                  </div>
                </div>
                {collaboratorList.map((user) => (
                  <div
                    key={user.socketId}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  >
                    <div
                      className="h-8 w-8 rounded-2xl text-center text-base font-bold leading-8"
                      style={{ backgroundColor: user.color || '#22d3ee' }}
                    >
                      {user.username?.[0]?.toUpperCase() || 'G'}
                    </div>
                    <div>
                      <p className="text-white">{user.username || 'Guest'}</p>
                      <p className="text-xs text-slate-400">Live</p>
                    </div>
                  </div>
                ))}
                {!collaboratorList.length && (
                  <p className="text-xs text-slate-400">Invite friends to draw together in real-time.</p>
                )}
              </div>
            </div>
          </aside>

          <section className="relative flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-2xl shadow-slate-950/50">
            <div className={`flex-1 ${backgroundClass}`} ref={containerRef}>
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="rounded-3xl border border-white/10 bg-slate-900/70 px-6 py-4 text-center text-sm text-slate-300">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-cyan-300" />
                    <p className="mt-2">Loading whiteboard...</p>
                  </div>
                </div>
              ) : (
                <canvas
                  ref={canvasRef}
                  className="h-full w-full cursor-crosshair touch-none"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerLeave}
                />
              )}
            </div>
            <div className="border-t border-white/5 bg-slate-900/70 px-4 py-3 text-xs uppercase tracking-[0.4em] text-slate-400">
              <Sparkles className="mr-2 inline h-4 w-4 text-cyan-300" />
              Infinite board — syncs automatically
            </div>
          </section>
        </div>
      </main>
      </div>
    </div>
  );
};

export default WhiteboardRoom;

