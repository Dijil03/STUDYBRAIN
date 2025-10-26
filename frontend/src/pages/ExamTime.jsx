import React, { useEffect, useState } from "react";
import api from "../utils/axios";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

// Importing Heroicons for a modern look
import {
  CalendarDaysIcon,
  BookOpenIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  ClockIcon,
  ChartBarIcon,
  SparklesIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/solid";

const ExamTime = () => {
  const userId = localStorage.getItem("userId");
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState({
    subject: "",
    examName: "",
    examDate: "",
    revisionGoals: "",
  });
  // State to hold temporary log data before submission
  const [studyLog, setStudyLog] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to get dayjs object and format for display
  const formatExamDate = (date) => dayjs(date).format("MMM D, YYYY");

  // --- Effects & Handlers ---

  useEffect(() => {
    const fetchExams = async () => {
      try {
        // Mocking data for display purposes if API is not set up
        // await new Promise(resolve => setTimeout(resolve, 800));
        // const mockExams = [
        //     { _id: "e1", subject: "Calculus", examName: "Midterm", examDate: dayjs().add(10, 'day').format('YYYY-MM-DD'), revisionGoals: ["Derivatives", "Integrals"], studyLog: [{ duration: 60, notes: "Finished Chapter 1", timestamp: dayjs().subtract(1, 'day') }] },
        //     { _id: "e2", subject: "History", examName: "Final", examDate: dayjs().add(35, 'day').format('YYYY-MM-DD'), revisionGoals: ["World Wars", "Cold War"], studyLog: [{ duration: 90, notes: "Reviewed WWI", timestamp: dayjs().subtract(2, 'day') }] },
        // ];
        // setExams(mockExams);

        const res = await api.get(`/examtime/${userId}`);
        setExams(res.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching exams:", err);
        setError("Failed to load exams. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [userId]);

  const handleCreateExam = async () => {
    if (!form.subject || !form.examName || !form.examDate) {
      alert("Please fill in subject, name, and date.");
      return;
    }

    const goalsArray = form.revisionGoals
      .split("\n")
      .map((g) => g.trim())
      .filter((g) => g);

    try {
      const res = await api.post(`/examtime/${userId}`, {
        subject: form.subject,
        examName: form.examName,
        examDate: form.examDate,
        revisionGoals: goalsArray,
      });
      setExams([res.data, ...exams]);
      setForm({ subject: "", examName: "", examDate: "", revisionGoals: "" });
    } catch (err) {
      console.error("Error creating exam:", err);
      alert("Failed to create exam.");
    }
  };

  const handleLogStudy = async (examId) => {
    const log = studyLog[examId];
    if (!log?.duration || parseInt(log.duration) <= 0) return;

    try {
      const res = await api.post(`/examtime/${userId}/${examId}/log`, {
        duration: parseInt(log.duration),
        notes: log.notes,
      });

      setExams((prev) =>
        prev.map((exam) => (exam._id === examId ? res.data : exam))
      );
      setStudyLog((prev) => ({
        ...prev,
        [examId]: { duration: "", notes: "" },
      }));
    } catch (err) {
      console.error("Error logging study session:", err);
      alert("Failed to log study session.");
    }
  };

  // --- Component JSX (Stunning UI) ---

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />

      {/* Main Container: Wider, rounded, shadow, and a smooth primary color border */}
      <div className="max-w-6xl mx-auto p-8 lg:p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl mt-12 mb-10 border-t-6 border-indigo-600">
        {/* Header with quick action button */}
        <header className="mb-10 flex justify-between items-center border-b pb-4 border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-4xl font-extrabold text-indigo-700 dark:text-indigo-400 flex items-center">
              <AcademicCapIcon className="w-9 h-9 mr-3 text-indigo-500" />
              Exam Planning Hub
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
              Track upcoming tests, set goals, and log your dedicated revision
              time.
            </p>
          </div>

          {/* Link to Study Timer for quick launch */}
          <Link
            to="/study-timer"
            className="flex items-center bg-purple-600 text-white px-5 py-2.5 rounded-lg text-md font-semibold shadow-md shadow-purple-500/50 hover:bg-purple-700 transition duration-300 transform hover:scale-105"
          >
            <ClockIcon className="w-5 h-5 mr-2" />
            Go To Timer
          </Link>
        </header>

        {/* --- Create Exam Form Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 p-6 bg-indigo-50 dark:bg-gray-700 rounded-xl shadow-lg h-fit">
            <h3 className="text-2xl font-bold text-indigo-800 dark:text-indigo-300 mb-5 flex items-center">
              <PlusCircleIcon className="w-6 h-6 mr-2" />
              Plan New Exam
            </h3>

            <div className="space-y-4">
              {/* Input Fields */}
              <input
                type="text"
                placeholder="Subject (e.g., Mathematics)"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
              <input
                type="text"
                placeholder="Exam Name (e.g., Final Exam, Unit 3 Test)"
                value={form.examName}
                onChange={(e) => setForm({ ...form, examName: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
              <div className="flex items-center border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg p-3 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition">
                <CalendarDaysIcon className="w-5 h-5 mr-2 text-indigo-500" />
                <input
                  type="date"
                  value={form.examDate}
                  onChange={(e) =>
                    setForm({ ...form, examDate: e.target.value })
                  }
                  className="w-full bg-transparent text-gray-700 dark:text-white outline-none"
                />
              </div>

              <textarea
                rows={4}
                placeholder="Revision goals (one per line, e.g., 'Master Chapter 5', 'Practice Essay')"
                value={form.revisionGoals}
                onChange={(e) =>
                  setForm({ ...form, revisionGoals: e.target.value })
                }
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />

              <button
                onClick={handleCreateExam}
                className="w-full flex items-center justify-center bg-indigo-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-indigo-700 shadow-md shadow-indigo-500/50 transition duration-200"
              >
                <SparklesIcon className="w-5 h-5 mr-2" />
                Schedule Exam
              </button>
            </div>
          </div>

          {/* --- Exam List Section --- */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-5 flex items-center">
              <ChartBarIcon className="w-6 h-6 mr-2 text-indigo-500" />
              Upcoming Exams & Progress
            </h3>

            {loading ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-10">
                Loading exams...
              </p>
            ) : error ? (
              <p className="text-red-500 dark:text-red-400 text-center py-10">
                {error}
              </p>
            ) : exams.length === 0 ? (
              <div className="text-center py-12 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
                <p className="text-xl font-medium text-gray-500 dark:text-gray-400">
                  No exams scheduled yet. Use the form on the left to start
                  planning!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {exams.map((exam) => {
                  const daysLeft = dayjs(exam.examDate).diff(
                    dayjs().startOf("day"),
                    "day"
                  );
                  const countdownColor =
                    daysLeft <= 7
                      ? "bg-red-500"
                      : daysLeft <= 21
                      ? "bg-orange-500"
                      : "bg-green-500";
                  const log = studyLog[exam._id] || { duration: "", notes: "" };
                  const totalMinutesStudied = exam.studyLog.reduce(
                    (sum, entry) => sum + entry.duration,
                    0
                  );

                  return (
                    <div
                      key={exam._id}
                      // Exam Card Styling: Clean, shadowed, primary border
                      className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border-l-4 border-indigo-400 hover:shadow-2xl transition duration-300"
                    >
                      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-gray-600">
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                          <BookOpenIcon className="w-6 h-6 mr-2 inline-block text-indigo-500" />
                          {exam.subject} — {exam.examName}
                        </h4>

                        {/* Days Left Badge */}
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-bold text-white shadow-md ${countdownColor}`}
                        >
                          {daysLeft >= 0
                            ? `${daysLeft} DAYS LEFT`
                            : "COMPLETED"}
                        </span>
                      </div>

                      {/* Date and Total Study Time */}
                      <div className="flex justify-between items-center text-gray-600 dark:text-gray-300 mb-4">
                        <p>
                          <CalendarDaysIcon className="w-4 h-4 mr-1 inline-block" />
                          **Exam Date:** {formatExamDate(exam.examDate)}
                        </p>
                        <p className="text-indigo-600 dark:text-indigo-400 font-semibold">
                          <ClockIcon className="w-4 h-4 mr-1 inline-block" />
                          **Total Revision:** {totalMinutesStudied} min
                        </p>
                      </div>

                      {/* Revision Goals */}
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                        <p className="text-gray-700 dark:text-gray-200 font-bold mb-2 flex items-center">
                          <PencilSquareIcon className="w-4 h-4 mr-2 text-indigo-500" />
                          Revision Goals:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                          {exam.revisionGoals.map((goal, i) => (
                            <li key={i} className="text-sm">
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Study Log Form */}
                      <div className="p-4 bg-indigo-50 dark:bg-gray-600 rounded-lg">
                        <h5 className="text-gray-800 dark:text-white font-bold mb-3 flex items-center">
                          <ClockIcon className="w-5 h-5 mr-2 text-indigo-700 dark:text-indigo-300" />
                          Log New Session
                        </h5>
                        <div className="flex space-x-3">
                          <input
                            type="number"
                            placeholder="Minutes"
                            value={log.duration}
                            onChange={(e) =>
                              setStudyLog((prev) => ({
                                ...prev,
                                [exam._id]: {
                                  ...log,
                                  duration: e.target.value,
                                },
                              }))
                            }
                            className="w-1/4 border border-gray-300 dark:border-gray-500 rounded-md p-2 text-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          />
                          <input
                            type="text"
                            placeholder="Notes (e.g., Ch 5 Practice)"
                            value={log.notes}
                            onChange={(e) =>
                              setStudyLog((prev) => ({
                                ...prev,
                                [exam._id]: { ...log, notes: e.target.value },
                              }))
                            }
                            className="w-1/2 border border-gray-300 dark:border-gray-500 rounded-md p-2 text-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          />
                          <button
                            onClick={() => handleLogStudy(exam._id)}
                            disabled={!log.duration || log.duration <= 0}
                            className="w-1/4 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 font-semibold text-sm disabled:bg-green-400 transition"
                          >
                            💾 Log
                          </button>
                        </div>
                      </div>

                      {/* Study Log Display */}
                      {exam.studyLog.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                          <h5 className="text-gray-800 dark:text-gray-200 font-bold mb-2 flex items-center">
                            Recent Activity:
                          </h5>
                          {/* Display only the latest 3 entries for brevity */}
                          <ul className="space-y-1">
                            {exam.studyLog.slice(0, 3).map((entry, i) => (
                              <li
                                key={i}
                                className="text-gray-700 dark:text-gray-300 text-sm italic"
                              >
                                **{entry.duration} min** on{" "}
                                {dayjs(entry.timestamp).format("DD MMM")} —{" "}
                                {entry.notes || "No notes"}
                              </li>
                            ))}
                            {exam.studyLog.length > 3 && (
                              <li className="text-gray-500 dark:text-gray-400 text-sm">
                                ...and {exam.studyLog.length - 3} more sessions.
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamTime;
