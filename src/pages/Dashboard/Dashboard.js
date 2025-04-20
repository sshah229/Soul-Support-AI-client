// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar/Navbar";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";

const emotionMap = [
  { category: "Happy", emoji: "😊" },
  { category: "Sad", emoji: "😢" },
  { category: "Neutral", emoji: "😐" },
  { category: "Anxious", emoji: "😰" },
  { category: "Angry", emoji: "😠" },
];

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [range, setRange] = useState("30m");
  const [summary, setSummary] = useState("Loading insights...");

  // Fetch raw logs
  useEffect(() => {
    axios
      .get("http://localhost:3000/emotions")
      .then((res) => setLogs(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch Gemini summary on range change
  useEffect(() => {
    setSummary("Loading insights...");
    axios
      .get("http://localhost:3000/emotions/summary", { params: { range } })
      .then((res) => setSummary(res.data.summary))
      .catch((err) => {
        console.error(err);
        setSummary("Could not load insights.");
      });
  }, [range]);

  // Compute threshold
  const now = new Date();
  let threshold;
  if (range === "30m") threshold = new Date(now - 30 * 60 * 1000);
  else if (range === "week") threshold = new Date(now - 7 * 24 * 60 * 60 * 1000);
  else threshold = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const filtered = logs.filter((e) => new Date(e.timestamp) >= threshold);

  // Emoji status
  const emojiStatus = emotionMap.map((e) => ({
    ...e,
    experienced: filtered.some((f) => f.emotion_category === e.category),
  }));

  // Avg intensity per day
  const byDate = filtered.reduce((acc, { emotion_intensity, timestamp }) => {
    const day = timestamp.slice(0, 10);
    acc[day] = acc[day] || { total: 0, count: 0 };
    acc[day].total += emotion_intensity;
    acc[day].count += 1;
    return acc;
  }, {});
  const intensityData = Object.entries(byDate)
    .map(([date, { total, count }]) => ({
      date,
      avgIntensity: total / count,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Frequency data
  const freq = filtered.reduce((acc, { emotion_category }) => {
    acc[emotion_category] = (acc[emotion_category] || 0) + 1;
    return acc;
  }, {});
  const freqData = emotionMap.map((e) => ({
    emotion: e.category,
    count: freq[e.category] || 0,
  }));

  return (
    <div className="flex flex-row w-full">
      <Navbar />
      <div className="w-full p-6 space-y-6">
        {/* Header + Range Buttons */}
        <div className="flex items-center justify-between bg-blue-100 p-4 rounded-lg">
          <h1 className="text-2xl font-bold text-blue-800">Mood Dashboard</h1>
          <div className="space-x-2">
            {[
              { key: "30m", label: "Last 30 mins" },
              { key: "week", label: "Last Week" },
              { key: "month", label: "Last Month" },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`px-3 py-1 rounded ${
                  range === key ? "bg-blue-500 text-white" : "bg-white"
                }`}
                onClick={() => setRange(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Gemini Summary */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Insight</h2>
          <p className="text-gray-700">{summary}</p>
        </div>

        {/* Emoji Summary */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Emotions Experienced</h2>
          <div className="flex">
            {emojiStatus.map(({ emoji, experienced }, i) => (
              <span
                key={i}
                className={`text-4xl m-2 transition-opacity ${
                  experienced ? "opacity-100" : "opacity-20"
                }`}
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>

        {/* Avg Intensity Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">
            Average Emotion Intensity (per Day)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={intensityData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="avgIntensity" stroke="#3182ce" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Emotion Frequency Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Emotion Frequency</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={freqData}>
              <XAxis dataKey="emotion" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
