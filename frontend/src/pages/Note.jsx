import React from "react";
import { BookOpen, Zap, Save, Minimize2, Settings } from "lucide-react"; 

/**
 * Full-Screen Splendid Note Component
 * Creates an immersive, dedicated note-taking environment that fills the entire viewport, 
 * designed for deep focus.
 *
 * NOTE: This component assumes 'Navbar' is either not used or handled externally, 
 * as its purpose is an immersive, full-screen takeover.
 *
 * @param {string} currentTask - The name of the task the user is currently focused on.
 * @param {string} notes - The current content of the notes.
 * @param {function} setNotes - Function to update the notes content in the parent component.
 */
const Note = ({ currentTask, notes, setNotes }) => {
  const primaryColor = "indigo"; 

  // Safely calculate word count, defaulting 'notes' to an empty string if undefined.
  const wordCount = (notes || '').split(/\s+/).filter(word => word.length > 0).length;

  return (
    // FULL SCREEN CONTAINER: Occupies 100% of viewport height and width.
    <div className="h-screen w-screen bg-gray-900 flex flex-col items-center justify-start py-8 md:py-16 transition-all duration-700">
      
      {/* FLOATING CONTROL BAR: Discreet top bar for context and controls */}
      <header className="fixed top-0 w-full max-w-4xl px-8 py-4 flex justify-between items-center z-10">
        
        {/* Active Task Tag - A clean context indicator */}
        <div className={`flex items-center px-3 py-1.5 bg-${primaryColor}-500/10 text-${primaryColor}-300 text-sm font-semibold rounded-full shadow-lg border border-${primaryColor}-400/30`}>
          <Zap className="w-4 h-4 mr-2 fill-current text-${primaryColor}-400" />
          Task Focus: <span className="ml-1 font-bold">{currentTask}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button className="p-2 text-gray-400 hover:text-${primaryColor}-300 hover:bg-gray-800 rounded-full transition-colors duration-200" title="Minimize/Exit Focus Mode">
            <Minimize2 className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-${primaryColor}-300 hover:bg-gray-800 rounded-full transition-colors duration-200" title="Settings">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT CARD: The "Paper" area, prominent and centered */}
      <main className="w-full max-w-4xl mx-auto flex flex-col flex-grow mt-16 px-6 sm:px-8">
        <div className={`flex-grow bg-white/98 rounded-3xl shadow-3xl border-t-8 border-${primaryColor}-500 overflow-hidden transform transition-all duration-700 hover:shadow-${primaryColor}-400/50`}>
          
          {/* Internal Header */}
          <div className="flex items-center space-x-3 p-6 border-b border-gray-100">
            <BookOpen className={`w-7 h-7 text-${primaryColor}-600 stroke-2`} />
            <h2 className="text-2xl font-black text-gray-900 tracking-tightest">
              Deep Focus Note
            </h2>
          </div>

          {/* Hyper-Focused Textarea */}
          <div className="relative h-full">
            <textarea
              className={`w-full h-full p-8 bg-transparent resize-none 
                       text-xl text-gray-800 font-light leading-relaxed tracking-wide 
                       focus:ring-0 focus:border-0 focus:outline-none 
                       transition-all duration-500 placeholder:text-gray-400 placeholder:italic`} 
              placeholder="✍️ Start writing your masterpiece... In this mode, distraction fades, and only the words remain."
              value={notes || ''} 
              onChange={(e) => setNotes(e.target.value)}
              spellCheck="false" 
              style={{ minHeight: 'calc(100% - 65px)' }} // Ensures textarea fills the rest of the card
            />

            {/* Unsaved Status Indicator */}
            <div className="absolute top-4 right-4 flex items-center text-sm text-red-600 bg-red-50/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg transition-colors hover:bg-red-100 cursor-default">
              <Save className="w-4 h-4 mr-2 stroke-2" />
              <p className="font-semibold">Unsaved</p>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER BAR: Clean status bar at the very bottom */}
      <footer className="fixed bottom-0 w-full max-w-4xl px-8 py-3 flex justify-between items-center text-gray-400 bg-gray-800/80 backdrop-blur-md rounded-t-xl shadow-inner shadow-gray-700/50">
        <p className="text-sm font-medium tracking-tight">
          <span className="text-white font-semibold">{wordCount}</span> Words
        </p>
        <p className="text-sm italic">
          Tip: Maximize focus by closing other tabs!
        </p>
      </footer>
    </div>
  );
};

export default Note;