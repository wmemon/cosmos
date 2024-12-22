// src/TransactionTable.js
import React from "react";

const transactions = [
  { time: "2m ago", from: "helH..jwYb", amount: 0.87 },
  { time: "2m ago", from: "xewQ..MNae", amount: 12.45 },
  { time: "2m ago", from: "HYeg..L0pm", amount: 9.87 },
  { time: "4m ago", from: "NHfw..Auuw", amount: 1.24 },
  { time: "5m ago", from: "ndhy..QAsw", amount: 15.01 },
  { time: "6m ago", from: "MKjn..wsjU", amount: 0.07 },
];

const RecentInputs = () => {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full p-1">
          <thead>
            <tr className="font-bold text-white tracking-[2.5%] text-xl leading-5 ">
              <th scope="col" className="text-left pl-4">
                Time
              </th>
              <th scope="col" className="text-left py-2">
                From
              </th>
              <th scope="col" className="text-right pr-4 py-2">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={index} className="text-white tracking-[2.5%] text-xl leading-5">
                <td className="pl-4 py-4">{transaction.time}</td>
                <td className="py-4">
                  <span className="px-2 rounded-[100px] bg-white-0.09">{transaction.from}</span>
                </td>
                <td className="text-right py-4 pr-4">{transaction.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentInputs;
