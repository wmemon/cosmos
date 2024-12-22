import React from "react";

const sampleData = [
  {
    coords: "(-12, -13)",
    time: "left 2m ago",
  },
  {
    coords: "(-12, -13)",
    time: "left 2m ago",
  },
  {
    coords: "(-12, -13)",
    time: "left 2m ago",
  },
  {
    coords: "(-12, -13)",
    time: "left 2m ago",
  },
  {
    coords: "(-12, -13)",
    time: "left 2m ago",
  },
  {
    coords: "(-12, -13)",
    time: "left 2m ago",
  },
  {
    coords: "(-12, -13)",
    time: "left 2m ago",
  },
];

interface HistoryRowProps {
  coords: string;
  time: string;
}

function History() {
  const HistoryRow = ({ coords, time }: HistoryRowProps) => {
    return (
      <div className="flex items-center justify-between py-2 px-4">
        <h3 className="tracking-[2.5%] text-xl leading-5 text-white font-semibold">
          {coords}
        </h3>
        <h3 className="tracking-[2.5%] text-xl leading-5 text-white-0.4 font-semibold">
          {time}
        </h3>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {sampleData.map((historyData, idx) => (
        <HistoryRow
          key={idx}
          coords={historyData.coords}
          time={historyData.time}
        />
      ))}
    </div>
  );
}

export default History;
