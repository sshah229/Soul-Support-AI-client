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

  useEffect(() => {
    axios
      .get("http://localhost:3000/emotions", {
        params: { email: JSON.parse(localStorage.getItem("data")).email },
      })
      .then((res) => setLogs(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Calculate threshold based on selected range
  const now = new Date();
  let threshold;
  if (range === "30m") {
    threshold = new Date(now.getTime() - 30 * 60 * 1000);
  } else if (range === "week") {
    threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else {
    threshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Filter logs within threshold
  const filtered = logs.filter((entry) => new Date(entry.timestamp) >= threshold);

  // Emoji display data
  const emojiStatus = emotionMap.map((e) => ({
    ...e,
    experienced: filtered.some((entry) => entry.emotion_category === e.category),
  }));

  // Average intensity per day
  const byDate = filtered.reduce((acc, { emotion_intensity, timestamp }) => {
    const day = new Date(timestamp).toISOString().slice(0, 10);
    acc[day] = acc[day] || { total: 0, count: 0 };
    acc[day].total += emotion_intensity;
    acc[day].count += 1;
    return acc;
  }, {});

  const intensityData = Object.entries(byDate)
    .map(([date, { total, count }]) => ({ date, avgIntensity: total / count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Emotion frequency for bar chart
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
        {/* Header */}
        <div className="flex items-center justify-between bg-blue-100 p-4 rounded-lg">
          <h1 className="text-2xl font-bold text-blue-800">Mood Dashboard</h1>
          <div className="space-x-2">
            <button
              className={`px-3 py-1 rounded ${range === "30m" ? "bg-blue-500 text-white" : "bg-white"}`}
              onClick={() => setRange("30m")}
            >
              Last 30 mins
            </button>
            <button
              className={`px-3 py-1 rounded ${range === "week" ? "bg-blue-500 text-white" : "bg-white"}`}
              onClick={() => setRange("week")}
            >
              Last Week
            </button>
            <button
              className={`px-3 py-1 rounded ${range === "month" ? "bg-blue-500 text-white" : "bg-white"}`}
              onClick={() => setRange("month")}
            >
              Last Month
            </button>
          </div>
        </div>

        {/* Emoji Summary */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Emotions Experienced</h2>
          <div className="flex">
            {emojiStatus.map(({ emoji, experienced }, idx) => (
              <span
                key={idx}
                className={`text-4xl m-2 transition-opacity duration-300 ${
                  experienced ? "opacity-100" : "opacity-20"
                }`}
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>

        {/* Avg Intensity Line Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Average Emotion Intensity (per Day)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={intensityData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="avgIntensity" stroke="#3182ce" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Emotion Frequency Bar Chart */}
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

        {/* You can add more charts here, like sentiment trend, stability index, etc. */}
      </div>
    </div>
  );
};

export default Dashboard;
