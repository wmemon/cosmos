import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import React from "react";
import History from "./history";
import RecentInputs from "./recent-inputs";

interface TabButtonProps {
  title: string;
  id: string;
}

const TabButton = ({ title, id }: TabButtonProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const infoQuery = searchParams.get("info") ?? "history";

  const onTabclick = () => {
    router.push({ pathname: "/", query: { info: id } });
  };

  return (
    <button
      onClick={onTabclick}
      className={`text-white p-2 py-3 rounded-[100px] w-full font-semibold uppercase tracking-[2.5%] text-xl leading-5 duration-150 focus:outline-none ${
        infoQuery === id ? "bg-grey-100" : ""
      }`}
    >
      {title}
    </button>
  );
};

function Tabs() {
  const searchParams = useSearchParams();
  const infoQuery = searchParams.get("info") ?? "history";

  const renderView = () => {
    if (infoQuery === "history") {
      return <History />;
    }

    return <RecentInputs />;
  };

  return (
    <div className="max-w-[342px] w-full">
      <div className="flex gap-2 mb-2 rounded-[100px] bg-white-0.05 p-1 w-full">
        <TabButton title="History" id="history" />
        <TabButton title="Recent Inputs" id="recent-inputs" />
      </div>
      <div className="bg-tabs-bg p-1 rounded-[10px] bg-gradient-to-l from-orange-0.05">
        {renderView()}
      </div>
    </div>
  );
}

export default Tabs;
