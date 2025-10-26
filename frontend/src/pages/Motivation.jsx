import React, { useState } from "react";
import Navbar from "../components/Navbar";

// Lucide Icons
import { Sparkles, RefreshCw, Volume2, Calendar, Zap } from "lucide-react";

const quotes = [
  {
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
  },
  {
    text: "Don’t watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    text: "Push yourself, because no one else is going to do it for you.",
    author: "Unknown",
  },
  {
    text: "It always seems impossible until it’s done.",
    author: "Nelson Mandela",
  },
  {
    text: "Your only limit is your mind.",
    author: "Unknown",
  },
];

const Motivation = () => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false); // State for CSS animation trigger

  const currentQuote = quotes[quoteIndex];

  const nextQuote = () => {
    setIsAnimating(true); // Start fade-out animation
    setTimeout(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
      setIsAnimating(false); // End animation (fade back in)
    }, 500); // Wait for fade-out duration
  };

  const speakQuote = (text) => {
    // Only speak the main text, not the author
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1.1; // Slightly higher pitch for energy
    utterance.volume = 1;
    utterance.lang = "en-US";
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  // Utility CSS class for a dynamic fade effect
  const quoteAnimationClass = isAnimating
    ? "opacity-0 transform scale-95"
    : "opacity-100 transform scale-100";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-100 flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl w-full text-center">
          {/* Header */}
          <h1 className="text-6xl font-black text-indigo-700 mb-12 tracking-tight drop-shadow-lg">
            <Sparkles className="inline-block w-12 h-12 mr-3 text-yellow-500 fill-yellow-500" />
            Your Daily Spark
          </h1>

          {/* Quote Card - Highly Visually Impactful */}
          <div
            className={`bg-white rounded-3xl shadow-2xl p-10 sm:p-16 mb-12 border-t-8 border-pink-500 transition duration-500 ease-in-out ${quoteAnimationClass}`}
            style={{ minHeight: "300px" }} // Ensure consistent height
          >
            <p className="text-4xl italic font-serif text-gray-900 leading-snug">
              “{currentQuote.text}”
            </p>
            <p className="mt-6 text-xl font-bold text-pink-600">
              — {currentQuote.author}
            </p>

            {/* Action Buttons below quote */}
            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={() => speakQuote(currentQuote.text)}
                className="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-5 py-2 rounded-full shadow-lg transition transform hover:scale-105"
              >
                <Volume2 className="w-5 h-5" />
                <span>Listen to it</span>
              </button>
              <button
                onClick={nextQuote}
                className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white font-medium px-5 py-2 rounded-full shadow-lg transition transform hover:scale-105"
              >
                <RefreshCw className="w-5 h-5" />
                <span>New Quote</span>
              </button>
            </div>
          </div>

          {/* --- */}

          {/* Call-to-Action Buttons - Prominent */}
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a
              href="/week-plan"
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 px-8 rounded-xl shadow-xl transition transform hover:scale-105"
            >
              <Calendar className="w-6 h-6" />
              <span>Back to Planning</span>
            </a>
            <a
              href="/dashboard"
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-extrabold py-4 px-8 rounded-xl shadow-xl transition transform hover:scale-105"
            >
              <Zap className="w-6 h-6" />
              <span>Take Action Now!</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Motivation;
