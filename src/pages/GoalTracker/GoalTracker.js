// src/pages/GoalTracker/GoalTracker.js

import React, { useEffect, useState } from "react";
import emailjs from "emailjs-com";

const FREQ_OPTIONS = Array.from(
  { length: (3 * 24 * 60) / 15 }, // 288 options for 3 days
  (_, i) => {
    const mins = (i + 1) * 15;
    if (mins < 60) return { value: mins, label: `${mins} min` };
    if (mins % 60 === 0) return { value: mins, label: `${mins / 60} hr` };
    return { value: mins, label: `${Math.floor(mins / 60)}h ${mins % 60}m` };
  }
);

const BASE_URL = "http://localhost:3000/goals";

const GoalTracker = ({ email }) => {
  // Form state
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState("mood_checkin");
  const [newFreq, setNewFreq] = useState("daily");

  // Goals state
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch goals from backend
  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/email/${email}`);
      const data = await res.json();
      setGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ fetchGoals error:", err);
      setGoals([]);
    }
    setLoading(false);
  };

  // EmailJS helper
  const sendEmail = (templateParams) => {
    emailjs
      .send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        templateParams,
        process.env.REACT_APP_EMAILJS_USER_ID
      )
      .then(
        () => console.log("✅ Email sent"),
        (err) => console.error("❌ EmailJS error:", err)
      );
  };

  // Create a new custom goal
  const createCustomGoal = async () => {
    if (!newLabel.trim()) return;
    try {
      const res = await fetch(`${BASE_URL}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          label: newLabel,
          type: newType,
          frequency: newFreq,
        }),
      });
      if (res.ok) {
        // reload goals
        fetchGoals();
        // send notification email
        sendEmail({
          to_email: email,
          goal_label: newLabel,
          goal_type: newType.replace("_", " "),
          goal_frequency: newFreq,
          goal_status: "created",
        });
        // reset form
        setNewLabel("");
        setNewType("mood_checkin");
        setNewFreq("daily");
      } else {
        console.error("❌ createCustomGoal failed:", await res.text());
      }
    } catch (err) {
      console.error("❌ createCustomGoal error:", err);
    }
  };

  const handleDelete = async (goalId) => {
    try {
      const res = await fetch(`${BASE_URL}/${goalId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        // refresh the list
        fetchGoals();
        // optional: notify via email
        sendEmail({
          to_email: email,
          goal_status: 'deleted',
          goal_label: goals.find((g) => g._id === goalId)?.label,
        });
      } else {
        console.error('❌ deleteGoal failed:', await res.text());
      }
    } catch (err) {
      console.error('❌ deleteGoal error:', err);
    }
  };

  // Mark goal done for today
  const handleComplete = async (goal) => {
    const now = Date.now();
    const last = new Date(goal.lastCompleted || goal.createdAt).getTime();
    const diffMins = (now - last) / 1000 / 60;
    if (diffMins < goal.frequency) {
      return alert(
        `Hold on! You can only mark “${goal.label}” again in ${Math.ceil(goal.frequency - diffMins)
        } minutes.`
      );
    }
    // otherwise proceed
    await fetch(`${BASE_URL}/complete/${goal._id}`, { method: "PATCH" });
    fetchGoals();
    sendEmail({
      to_email: email,
      goal_label: goal.label,
      goal_status: "completed",
    });
  };

  useEffect(() => {
    fetchGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <span className="text-gray-500">Loading your goals…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ► Custom Goal Form */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Label</label>
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="e.g. Drink Water"
            className="mt-1 w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Type</label>
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="mt-1 w-full border rounded p-2"
          >
            <option value="mood_checkin">Mood Check‑In</option>
            <option value="hydration">Hydration</option>  
            <option value="journal_streak">Journaling</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Frequency</label>
          <select
            value={newFreq}
            onChange={e => setNewFreq(Number(e.target.value))}
            className="mt-1 w-full border rounded p-2"
          >
            {FREQ_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={createCustomGoal}
        className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition"
      >
        + Add Goal
      </button>

      {/* ► Goals List */}
      {goals.length === 0 ? (
        <p className="text-gray-500">No goals yet. Create one to get started!</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <li
              key={goal._id}
              className="border border-gray-200 p-4 rounded-lg shadow hover:shadow-md transition"
            >
              <p className="text-lg font-semibold text-gray-800">{goal.label}</p>
              <p className="text-sm text-gray-600 capitalize">
                Type: {goal.type.replace("_", " ")}
              </p>
              <p className="text-sm text-gray-600">
                🔁 Frequency: <span className="font-medium">{goal.frequency}</span>
              </p>
              <p className="text-sm text-gray-600">
                🔥 Streak: <span className="font-semibold">{goal.streak}</span> days
              </p>
              <p className="text-sm text-gray-600">
                ✅ Today:{" "}
                <span className={goal.completedToday ? "text-green-600" : "text-red-500"}>
                  {goal.completedToday ? "Yes" : "No"}
                </span>
              </p>
              <button
                onClick={() => handleComplete(goal)}
                className="mt-3 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
              >
                {goal.completedToday ? "✅ Done" : "Mark Done"}
              </button>
              <button
                onClick={() => handleDelete(goal._id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ml-2.5"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GoalTracker;
