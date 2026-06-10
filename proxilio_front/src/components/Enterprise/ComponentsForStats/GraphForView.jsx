import PropTypes from "prop-types";
import { useState, useMemo } from "react";
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
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

export default function GraphForView({ reservations = [] }) {
  const [timeFrame, setTimeFrame] = useState("month");

  const { labels, data } = useMemo(() => {
    if (!reservations.length) {
      if (timeFrame === "week") return { labels: ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"], data: new Array(7).fill(0) };
      if (timeFrame === "month") return { labels: MONTHS, data: new Array(12).fill(0) };
      const y = new Date().getFullYear();
      return { labels: [y-4, y-3, y-2, y-1, y].map(String), data: new Array(5).fill(0) };
    }

    if (timeFrame === "week") {
      const counts = new Array(7).fill(0);
      const today = new Date();
      const lbls = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        lbls.unshift(d.toLocaleDateString("fr-FR", { weekday: "short" }));
      }
      reservations.forEach((r) => {
        if (!r.date) return;
        const d = new Date(r.date);
        const diff = Math.round((today - d) / 86400000);
        if (diff >= 0 && diff <= 6) counts[6 - diff]++;
      });
      return { labels: lbls.reverse().reverse(), data: counts };
    }

    if (timeFrame === "month") {
      const counts = new Array(12).fill(0);
      const currentYear = new Date().getFullYear();
      reservations.forEach((r) => {
        if (!r.date) return;
        const d = new Date(r.date);
        if (d.getFullYear() === currentYear) counts[d.getMonth()]++;
      });
      return { labels: MONTHS, data: counts };
    }

    const currentYear = new Date().getFullYear();
    const years = [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
    const counts = years.map((y) =>
      reservations.filter((r) => r.date && new Date(r.date).getFullYear() === y).length
    );
    return { labels: years.map(String), data: counts };
  }, [reservations, timeFrame]);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Réservations",
        data,
        borderColor: "#132A24",
        backgroundColor: "rgba(19,42,36,0.06)",
        borderWidth: 2,
        pointBackgroundColor: "#132A24",
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#132A24",
        bodyColor: "#879f98",
        borderColor: "rgba(0,0,0,0.05)",
        borderWidth: 1,
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} réservation${ctx.parsed.y !== 1 ? "s" : ""}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#879f98", font: { size: 11 } },
        grid: { color: "rgba(0,0,0,0.04)" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#879f98", font: { size: 11 }, stepSize: 1, precision: 0 },
        grid: { color: "rgba(0,0,0,0.04)" },
      },
    },
  };

  const tabs = [
    { key: "week", label: "7 jours" },
    { key: "month", label: "Ce mois" },
    { key: "year", label: "Par an" },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <p className="text-sm font-light text-[#132A24]">Évolution des réservations</p>
        <div className="flex gap-1 rounded-lg border border-black/5 bg-[#f5f7f6] p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTimeFrame(tab.key)}
              className={`px-3 py-1 rounded-md text-xs font-light transition-colors ${
                timeFrame === tab.key
                  ? "bg-white text-[#132A24] shadow-sm"
                  : "text-[#879f98] hover:text-[#132A24]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1" style={{ position: "relative", width: "100%", minHeight: "200px" }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

GraphForView.propTypes = {
  reservations: PropTypes.arrayOf(PropTypes.object),
};
