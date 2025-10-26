import React, { useState } from "react";

const Sidebar = () => {
  const [open, setOpen] = useState(true);

  return (
    <div
      className={`h-screen fixed top-15 left-0 z-50 bg-white shadow-lg transition-all duration-300 ${
        open ? "w-64" : "w-16"
      }`}
    >
      {/* Toggle Button */}
      <div className="flex justify-end p-2">
        <button
          onClick={() => setOpen(!open)}
          className="text-gray-600 hover:text-gray-800"
        >
          <span className="material-symbols-outlined">
            {open ? "X" : "menu"}
          </span>
        </button>
      </div>

      {/* Sidebar Content */}
      <div className={`px-4 ${open ? "block" : "hidden"}`}>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Quick access
        </h2>
        <ul className="space-y-3">
          <li>
            <a
              href="https://classroom.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google Classroom
            </a>
          </li>
          <li>
            <a
              href="https://khanacademy.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Khan Academy
            </a>
          </li>
          <li>
            <a
              href="https://quizlet.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Quizlet
            </a>
          </li>
          <li>
            <a
              href="https://coursera.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Coursera
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
