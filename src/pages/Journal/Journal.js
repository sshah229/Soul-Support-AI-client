// src/pages/Journal.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar/Navbar";

const Journal = () => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/journal")
      .then((res) => setEntries(res.data))
      .catch((err) => console.error("Failed to load journal:", err));
  }, []);

  return (
    <div className="flex flex-row w-full">
      <Navbar />
      <div className="w-full p-6">
        <h1 className="text-3xl font-semibold text-teal-800 mb-6">
          Your Journal Summaries
        </h1>

        {entries.length === 0 ? (
          <p className="text-gray-600">No journal entries yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-teal-500"
              >
                <p className="text-sm text-gray-500">
                  {new Date(entry.timestamp).toLocaleString()}
                </p>
                <p className="mt-2 text-lg font-semibold text-teal-700 capitalize">
                  {entry.latest_emotion_category}
                </p>
                <p className="mt-3 text-gray-700">{entry.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;
