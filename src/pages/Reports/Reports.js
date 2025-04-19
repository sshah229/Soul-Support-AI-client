import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";

const Reports = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);

  useEffect(() => {
    axios
      .post("http://localhost:3000/report/", {
        email: JSON.parse(localStorage.getItem("data"))?.email,
      })
      .then((res) => {
        console.log(res.data);
        setReport(res.data);
      });
  }, []);

  // Function to clean markdown formatting completely
  const formatReportText = (text) => {
    // Remove both double and single asterisks, and bullet points
    return text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/^\s*\•\s+/, "")
      .replace(/^\s*\-\s+/, "");
  };

  // Determine if the text is a title, subtitle, or regular text
  const getTextStyle = (text) => {
    const cleanText = text.trim();

    // Title: ends with colon
    if (cleanText.endsWith(":")) {
      return "font-bold text-teal-800";
    }

    // Subtitle: lines that look like headers or emphasis
    if (
      cleanText.startsWith("Why") ||
      cleanText.includes("?") ||
      (cleanText.match(/^[A-Z]/) && cleanText.length < 50) || // Capitalized short lines
      cleanText.match(/^\d+\.\s/) || // Numbered items
      cleanText.match(/^(Analysis|Overview|Recommendation|Summary|Conclusion|Finding)/) // Report sections
    ) {
      return "font-semibold text-teal-700";
    }

    // Regular text
    return "text-gray-700";
  };

  return (
    <div className="flex flex-row w-full">
      <Navbar />
      <div className="w-full">
        <div className="flex flex-row items-center p-6 bg-teal-100 h-fit shadow-lg">
          <h1 className="ml-4 text-3xl font-semibold text-teal-800">
            Your Health Report
          </h1>
        </div>

        <div className="p-6 bg-gradient-to-br from-teal-50 to-green-100">
          <div className="mb-6">
            {!report?.success ? (
              <button
                onClick={() => navigate("/quiz")}
                className="bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300"
              >
                Take Test
              </button>
            ) : (
              <button
                onClick={() => navigate("/quiz")}
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300"
              >
                Retake Test
              </button>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border-l-8 border-teal-500">
            {!report?.success ? (
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-red-600">
                  No report found, please take a test
                </h2>
              </div>
            ) : (
              <div className="report-content space-y-2">
                {report?.report?.split("\n").map((item, index) => {
                  if (!item.trim()) return null; // Skip empty lines

                  const cleanedText = formatReportText(item);
                  const textStyle = getTextStyle(cleanedText);

                  return (
                    <p
                      key={index}
                      className={`text-lg ${textStyle}`}
                    >
                      {cleanedText}
                    </p>
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

export default Reports;