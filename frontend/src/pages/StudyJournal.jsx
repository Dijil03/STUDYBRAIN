import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../utils/axios";

const StudyJournal = () => {
  const userId = localStorage.getItem("userId");
  const [journal, setJournal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/myworld/${userId}`);
        setJournal(res.data?.journal || []);
      } catch (e) {
        setError("Failed to load journal");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (userId) load();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold text-indigo-700 mb-6">Study Journal</h1>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : journal.length === 0 ? (
          <p className="text-gray-500">No journal entries yet.</p>
        ) : (
          <ul className="space-y-4">
            {journal
              .slice()
              .reverse()
              .map((entry, idx) => (
                <li key={idx} className="bg-white p-5 rounded-xl shadow border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-indigo-800">Entry {journal.length - idx}</div>
                    {entry.date && (
                      <div className="text-sm text-gray-500">
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{entry.entry}</p>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StudyJournal;


