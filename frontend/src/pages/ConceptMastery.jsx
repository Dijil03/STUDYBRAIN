import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Line, OrbitControls, Text } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import {
  Brain,
  Sparkles,
  RefreshCw,
  Compass,
  Target,
  Flame,
  Zap,
  Layers,
  ChevronRight,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info,
  Search,
} from 'lucide-react';

const statusStyles = {
  weak: {
    badge: 'bg-red-400/20 text-red-300 border border-red-500/40',
    label: 'Weak',
  },
  developing: {
    badge: 'bg-amber-400/20 text-amber-300 border border-amber-500/40',
    label: 'Developing',
  },
  strong: {
    badge: 'bg-emerald-400/20 text-emerald-300 border border-emerald-500/40',
    label: 'Strong',
  },
  mastered: {
    badge: 'bg-blue-400/20 text-blue-300 border border-blue-500/40',
    label: 'Mastered',
  },
};

const NodeSphere = ({ node, isSelected, onSelect }) => {
  const scale = useMemo(() => (node.visuals?.size || 20) / 14, [node.visuals]);
  const color = node.visuals?.color || '#ffffff';
  const glow = node.visuals?.glow || 'rgba(255,255,255,0.4)';

  return (
    <group position={[node.coordinates?.x || 0, node.coordinates?.y || 0, 0]}>
      <mesh onClick={(event) => {
        event.stopPropagation();
        onSelect(node);
      }}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={isSelected ? color : '#111111'}
          emissiveIntensity={isSelected ? 1 : 0.35}
          metalness={0.2}
          roughness={0.3}
        />
        <mesh scale={[1.4, 1.4, 1.4]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial
            color={glow}
            transparent
            opacity={0.25}
          />
        </mesh>
      </mesh>
      <Text
        position={[0, -2.2, 0]}
        fontSize={1.2}
        color="#dbeafe"
        anchorX="center"
        anchorY="top"
      >
        {node.label}
      </Text>
    </group>
  );
};

const LinkLine = ({ link, nodeLookup }) => {
  const source = nodeLookup.get(link.source);
  const target = nodeLookup.get(link.target);

  if (!source || !target) return null;

  const start = [source.coordinates?.x || 0, source.coordinates?.y || 0, 0];
  const end = [target.coordinates?.x || 0, target.coordinates?.y || 0, 0];

  const color = link.type === 'prerequisite' ? '#f97316' : '#6366f1';
  const dashed = link.type === 'prerequisite';

  return (
    <Line
      points={[start, end]}
      color={color}
      dashed={dashed}
      lineWidth={1 + (link.strength || 0.3)}
    />
  );
};

const ConceptCanvas = ({ nodes, links, onSelectNode, selectedNode }) => {
  const nodeLookup = useMemo(() => {
    const map = new Map();
    nodes.forEach((node) => {
      map.set(node.id, node);
    });
    return map;
  }, [nodes]);

  return (
    <div className="h-[540px] md:h-[620px] rounded-3xl overflow-hidden border border-slate-800 bg-slate-950/60 backdrop-blur-sm">
      <Canvas camera={{ position: [0, 0, 150], fov: 60 }}>
        <color attach="background" args={['#030712']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 150]} intensity={1.2} color="#a855f7" />
        <pointLight position={[0, 0, -150]} intensity={0.6} color="#38bdf8" />

        {links.map((link) => (
          <LinkLine key={link.id} link={link} nodeLookup={nodeLookup} />
        ))}

        {nodes.map((node) => (
          <NodeSphere
            key={node.id}
            node={node}
            isSelected={selectedNode?.id === node.id}
            onSelect={onSelectNode}
          />
        ))}

        <OrbitControls enableZoom enablePan />
      </Canvas>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, accent }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center space-x-4 backdrop-blur-sm"
  >
    <div className={`p-3 rounded-xl bg-gradient-to-br ${accent}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-400">{title}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  </motion.div>
);

const RecommendationCard = ({ recommendation, onSelect }) => {
  const status = statusStyles[recommendation.status] || statusStyles.weak;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 hover:border-purple-500/40 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white font-semibold text-lg">{recommendation.conceptName}</p>
          <p className="text-slate-400 text-sm">{recommendation.subject || 'General'}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.badge}`}>
          {status.label}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-300">
        <p>Priority score: <span className="text-purple-300 font-semibold">{(recommendation.priority * 100).toFixed(0)}</span></p>
        <p>Mastery level: <span className="text-blue-300 font-semibold">{recommendation.masteryLevel ?? 0}%</span></p>

        {recommendation.blockers?.length > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
            <p className="font-medium text-xs uppercase tracking-wide mb-1">Prerequisites</p>
            <p className="text-xs">Boost these first: {recommendation.blockers.join(', ')}</p>
          </div>
        )}
      </div>

      <button
        onClick={() => onSelect(recommendation.conceptKey)}
        className="mt-4 inline-flex items-center space-x-2 text-sm text-purple-300 hover:text-purple-100 transition-colors"
      >
        <span>Focus on this concept</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

const EmptyState = ({ onSync }) => (
  <div className="h-[540px] md:h-[620px] rounded-3xl border border-dashed border-purple-500/40 bg-slate-900/60 flex flex-col items-center justify-center text-center space-y-6">
    <div className="p-6 rounded-full bg-purple-500/10 border border-purple-400/30">
      <Brain className="w-14 h-14 text-purple-300" />
    </div>
    <div className="max-w-md">
      <h3 className="text-2xl font-semibold text-white mb-3">No concepts yet</h3>
      <p className="text-slate-400">
        Sync your revision items to generate a stunning concept map and start tracking mastery instantly.
      </p>
    </div>
    <button
      onClick={onSync}
      className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors inline-flex items-center space-x-2"
    >
      <Sparkles className="w-5 h-5" />
      <span>Auto-create from revisions</span>
    </button>
  </div>
);

const ConceptMastery = () => {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [graph, setGraph] = useState({ nodes: [], links: [], stats: {} });
  const [recommendations, setRecommendations] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchConceptMap = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await api.get(`/concepts/${userId}/map`);
      if (response.data.success) {
        setGraph({
          nodes: response.data.nodes || [],
          links: response.data.links || [],
          stats: response.data.stats || {},
        });
      }
    } catch (error) {
      console.error('Failed to fetch concept map:', error);
      toast.error('Failed to load concept map');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchRecommendations = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await api.get(`/concepts/${userId}/recommendations`);
      if (response.data.success) {
        setRecommendations(response.data.recommendations || []);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  }, [userId]);

  const handleSyncRevisions = async () => {
    if (!userId) return;
    try {
      setSyncing(true);
      const response = await api.post(`/concepts/${userId}/sync/revisions`);
      if (response.data.success) {
        toast.success(response.data.message || 'Synced concepts from revision items');
        await Promise.all([fetchConceptMap(), fetchRecommendations()]);
      }
    } catch (error) {
      console.error('Failed to sync revisions:', error);
      toast.error(error.response?.data?.message || 'Failed to sync revisions');
    } finally {
      setSyncing(false);
    }
  };

  const handleMarkMastered = async (conceptKey) => {
    if (!userId || !conceptKey) return;
    try {
      const response = await api.post(`/concepts/${userId}/mark-mastered`, { conceptKey });
      if (response.data.success) {
        toast.success('Marked concept as mastered!');
        await Promise.all([fetchConceptMap(), fetchRecommendations()]);
      }
    } catch (error) {
      console.error('Failed to mark mastered:', error);
      toast.error(error.response?.data?.message || 'Failed to update concept');
    }
  };

  const handleFocusConcept = (conceptKey) => {
    const target = graph.nodes.find((node) => node.id === conceptKey);
    if (target) {
      setSelectedNode(target);
    } else {
      toast.info('Concept not present in map yet. Try syncing revisions.');
    }
  };

  const filteredNodes = useMemo(() => {
    if (!searchQuery) return graph.nodes;
    return graph.nodes.filter((node) => {
      const query = searchQuery.toLowerCase();
      return (
        node.label?.toLowerCase().includes(query) ||
        node.subject?.toLowerCase().includes(query) ||
        (node.tags || []).some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }, [graph.nodes, searchQuery]);

  useEffect(() => {
    if (!userId) return;
    fetchConceptMap();
    fetchRecommendations();
  }, [userId, fetchConceptMap, fetchRecommendations]);

  useEffect(() => {
    if (filteredNodes.length > 0 && !filteredNodes.includes(selectedNode)) {
      setSelectedNode(filteredNodes[0]);
    }
  }, [filteredNodes, selectedNode]);

  if (!userId) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">Please log in</h1>
          <p className="text-slate-400">We need your account to personalize the concept mastery map.</p>
        </div>
      </div>
    );
  }

  const stats = graph.stats || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200 text-sm font-medium backdrop-blur">
              <Sparkles className="w-4 h-4" />
              <span>Concept Mastery Map</span>
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-white">
              Visualize. Understand. Dominate.
            </h1>
            <p className="mt-3 text-lg text-slate-300 max-w-2xl">
              Explore an adaptive galaxy of everything you&apos;re learning. See strengths, uncover weak spots,
              and let AI guide your next move with breathtaking clarity.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSyncRevisions}
              disabled={syncing}
              className="inline-flex items-center px-5 py-3 rounded-xl bg-blue-500/10 border border-blue-500/40 text-blue-100 hover:bg-blue-500/20 transition-colors disabled:opacity-70"
            >
              <RefreshCw className={`w-5 h-5 mr-2 animate-spin ${syncing ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} />
              <span>{syncing ? 'Syncing...' : 'Sync from revisions'}</span>
            </button>
            <button
              onClick={() => fetchConceptMap()}
              className="inline-flex items-center px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition-colors font-semibold"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              <span>Refresh map</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Brain} title="Total Concepts" value={stats.totalConcepts || 0} accent="from-purple-500/60 to-indigo-600/60" />
          <StatCard icon={Target} title="Average Mastery" value={`${stats.averageMastery || 0}%`} accent="from-blue-500/60 to-cyan-600/60" />
          <StatCard icon={Flame} title="Urgent Reviews" value={(stats.overdue || 0) + (stats.dueSoon || 0)} accent="from-red-500/60 to-orange-600/50" />
          <StatCard icon={Layers} title="Mastered Concepts" value={stats.statusCounts?.mastered || 0} accent="from-emerald-500/60 to-lime-600/50" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Compass className="w-5 h-5 text-purple-300" />
                  <span>Your mastery universe</span>
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Tap any concept to explore connections, mastery data, and AI-powered recommendations.
                </p>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search concept..."
                  className="pl-9 pr-4 py-2 rounded-xl bg-slate-900/70 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                />
              </div>
            </div>

            {loading ? (
              <div className="h-[540px] md:h-[620px] rounded-3xl border border-slate-800 bg-slate-900/60 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
                >
                  <RefreshCw className="w-8 h-8 text-purple-300" />
                </motion.div>
              </div>
            ) : filteredNodes.length === 0 ? (
              <EmptyState onSync={handleSyncRevisions} />
            ) : (
              <ConceptCanvas
                nodes={filteredNodes}
                links={graph.links}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
              />
            )}
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {selectedNode ? (
                <motion.div
                  key={selectedNode.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-purple-300 font-semibold mb-2">
                        Active concept
                      </p>
                      <h3 className="text-2xl font-bold text-white">{selectedNode.label}</h3>
                      <p className="text-sm text-slate-400 mt-1">{selectedNode.subject}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[selectedNode.status]?.badge || statusStyles.weak.badge}`}>
                      {statusStyles[selectedNode.status]?.label || 'Weak'}
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Mastery</p>
                      <p className="text-xl text-blue-300 font-semibold">{selectedNode.masteryLevel ?? 0}%</p>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Confidence</p>
                      <p className="text-xl text-emerald-300 font-semibold">{Math.round((selectedNode.confidenceScore ?? 0) * 100)}%</p>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Difficulty</p>
                      <p className="text-xl text-amber-300 font-semibold">{Math.round((selectedNode.difficulty ?? 0.5) * 100)}%</p>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Importance</p>
                      <p className="text-xl text-purple-300 font-semibold">{Math.round((selectedNode.importance ?? 0.5) * 100)}%</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 text-sm text-slate-300">
                    {selectedNode.nextReview && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>
                          Next review:{' '}
                          <span className="text-blue-300 font-medium">
                            {new Date(selectedNode.nextReview).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </span>
                      </div>
                    )}
                    {selectedNode.lastReviewed && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-slate-400" />
                        <span>
                          Last reviewed:{' '}
                          <span className="text-emerald-300 font-medium">
                            {new Date(selectedNode.lastReviewed).toLocaleDateString()}
                          </span>
                        </span>
                      </div>
                    )}
                    {selectedNode.recentScore && (
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-slate-400" />
                        <span>
                          Latest score:{' '}
                          <span className="text-amber-300 font-medium">
                            {selectedNode.recentScore}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedNode.description && (
                    <div className="mt-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-sm text-slate-300">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Concept summary</p>
                      <p>{selectedNode.description}</p>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-2">
                    {(selectedNode.tags || []).map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full text-xs bg-slate-900 border border-slate-700 text-slate-300">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                      onClick={() => handleMarkMastered(selectedNode.id)}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/30 transition-colors text-sm font-medium"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark mastered
                    </button>
                    <button
                      onClick={() => toast.info('Coming soon: schedule review flow!')}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-200 hover:bg-purple-500/30 transition-colors text-sm font-medium"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule focused review
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 text-center space-y-4"
                >
                  <div className="mx-auto w-14 h-14 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
                    <Info className="w-6 h-6 text-purple-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Select a concept</h3>
                  <p className="text-sm text-slate-400">
                    Tap any node to reveal mastery breakdown, connections, and AI-powered insights.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-purple-300 uppercase tracking-wide font-semibold mb-1">
                    Next best move
                  </p>
                  <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-300" />
                    <span>AI Recommendations</span>
                  </h3>
                </div>
                <button
                  onClick={fetchRecommendations}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Refresh
                </button>
              </div>

              {recommendations.length === 0 ? (
                <div className="text-sm text-slate-500 bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                  No recommendations yet. Once you start reviewing concepts, AI will surface your next priorities.
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((item) => (
                    <RecommendationCard
                      key={item.conceptKey}
                      recommendation={item}
                      onSelect={handleFocusConcept}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConceptMastery;

