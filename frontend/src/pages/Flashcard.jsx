import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { 
  Plus, 
  Eye, 
  BookOpen, 
  Zap, 
  Brain, 
  Sparkles,
  ArrowRight,
  Target,
  Clock,
  Users
} from 'lucide-react';

const Flashcard = () => {
  const features = [
    {
      icon: Plus,
      title: "Create New Flashcards",
      description: "Build your own custom flashcard sets for any subject",
      color: "from-blue-500 to-cyan-500",
      path: "/flashcards",
      buttonText: "Start Creating",
      features: ["Custom content", "Multiple formats", "Easy editing"]
    },
    {
      icon: Eye,
      title: "Study with Flashcards",
      description: "Review and practice with existing flashcard sets",
      color: "from-purple-500 to-pink-500",
      path: "/flashcard-viewer",
      buttonText: "Start Studying",
      features: ["Spaced repetition", "Progress tracking", "Smart review"]
    }
  ];

  const stats = [
    { icon: BookOpen, label: "Total Sets", value: "50+", color: "text-blue-400" },
    { icon: Target, label: "Success Rate", value: "95%", color: "text-green-400" },
    { icon: Clock, label: "Study Time", value: "2.5h", color: "text-purple-400" },
    { icon: Users, label: "Active Users", value: "1.2k", color: "text-pink-400" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Navbar />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-2xl"
          >
            <Brain className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Flashcard
            </span>
            <span className="text-white"> Hub</span>
          </h1>
          
          <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
            Choose your learning path. Create custom flashcards or study with existing sets to master any subject.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20"
              >
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.2, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 h-full">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-white/70 mb-6 text-lg">{feature.description}</p>

                  {/* Features */}
                  <div className="space-y-2 mb-8">
                    {feature.features.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-white/80">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <Link
                    to={feature.path}
                    className={`inline-flex items-center space-x-2 bg-gradient-to-r ${feature.color} text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105`}
                  >
                    <span>{feature.buttonText}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Why Use Flashcards?</h3>
            <p className="text-white/70 text-lg mb-6">
              Flashcards are one of the most effective study methods, using active recall and spaced repetition 
              to help you retain information long-term. Our intelligent system adapts to your learning pace.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Active Recall</h4>
                <p className="text-white/60 text-sm">Test your memory actively</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Spaced Repetition</h4>
                <p className="text-white/60 text-sm">Review at optimal intervals</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-pink-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Progress Tracking</h4>
                <p className="text-white/60 text-sm">Monitor your improvement</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default Flashcard;
