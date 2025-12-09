"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ArduinoData {
  timestamp: number;
  data: {
    temp: number;
    hum: number;
    d1: number;
    d2: number;
    gate: number;
    worker: number;
  };
}

export default function Home() {
  const [dataList, setDataList] = useState<ArduinoData[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch Arduino data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/data");
        const json = await res.json();
        setDataList(json);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Send POST request to open gate
  const openGate = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "OPEN" }),
      });
      const json = await res.json();
      console.log("Gate response:", json);
    } catch (err) {
      console.error("Error opening gate:", err);
    } finally {
      setLoading(false);
    }
  };

  // Chart data
  const chartData = {
    labels: dataList.map((entry) =>
      new Date(entry.timestamp * 1000).toLocaleTimeString()
    ),
    datasets: [
      {
        label: "Temperature (°C)",
        data: dataList.map((entry) => entry.data.temp),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
      {
        label: "Humidity (%)",
        data: dataList.map((entry) => entry.data.hum),
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
      },
    ],
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Arduino Data
        </h1>
        <button
          onClick={openGate}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Open Gate"}
        </button>
      </div>

      {/* Chart */}
      <div className="mb-8 bg-white dark:bg-gray-800 p-4 rounded shadow">
        <Line data={chartData} />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {dataList.map((entry, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg shadow-md ${
              entry.data.gate
                ? "bg-green-100 dark:bg-green-700"
                : "bg-white dark:bg-gray-800"
            }`}
          >
            <p>
              <strong>Time:</strong>{" "}
              {new Date(entry.timestamp * 1000).toLocaleTimeString()}
            </p>
            <p>
              <strong>Temp:</strong> {entry.data.temp}°C
            </p>
            <p>
              <strong>Humidity:</strong> {entry.data.hum}%
            </p>
            <p>
              <strong>D1:</strong> {entry.data.d1} | <strong>D2:</strong>{" "}
              {entry.data.d2}
            </p>
            <p>
              <strong>Gate:</strong> {entry.data.gate ? "Open" : "Closed"}
            </p>
            <p>
              <strong>Worker:</strong> {entry.data.worker ? "Yes" : "No"}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <table className="w-full border border-gray-300 dark:border-gray-700">
        <thead className="bg-gray-200 dark:bg-gray-800">
          <tr>
            <th className="p-2 border">Time</th>
            <th className="p-2 border">Temp</th>
            <th className="p-2 border">Humidity</th>
            <th className="p-2 border">D1</th>
            <th className="p-2 border">D2</th>
            <th className="p-2 border">Gate</th>
            <th className="p-2 border">Worker</th>
          </tr>
        </thead>
        <tbody>
          {dataList.map((entry, idx) => (
            <tr
              key={idx}
              className="text-center border-b border-gray-300 dark:border-gray-700"
            >
              <td className="p-2">
                {new Date(entry.timestamp * 1000).toLocaleTimeString()}
              </td>
              <td className="p-2">{entry.data.temp}</td>
              <td className="p-2">{entry.data.hum}</td>
              <td className="p-2">{entry.data.d1}</td>
              <td className="p-2">{entry.data.d2}</td>
              <td className="p-2">{entry.data.gate ? "Open" : "Closed"}</td>
              <td className="p-2">{entry.data.worker ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
