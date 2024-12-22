import Footer from "@/components/footer";
import Tabs from "@/components/tabs";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [showLanding, setShowLanding] = useState(true);

  const renderView = () => {
    if (showLanding) {
      return (
        <div className="relative z-[1]">
          <div className="pt-16">
            <Image
              src="/assets/svgs/logo.svg"
              width={126.74}
              height={22.84}
              alt="Cosmos Logo"
              className="mx-auto"
            />
          </div>
          <div className="mt-[300px] max-w-[400px] mx-auto relative z-[1]">
            <button
              onClick={() => setShowLanding(false)}
              className="flex items-center justify-center relative w-full h-full group"
            >
              <h1 className="text-2xl leading-[28.8px] text-[#f2f2ff88] duration-150 group-hover:text-white">
                ENTER THE COSMOS
              </h1>
              <div className="absolute w-[282.36px] h-[282.36px] rounded-full border border-white-0.7 opacity-40 duration-150 group-hover:scale-90"></div>
              <div className="absolute w-[288px] h-[288px] rounded-full border border-white-0.7 opacity-60 duration-150 group-hover:scale-90"></div>
              <div className="absolute w-[294px] h-[294px] rounded-full border border-white-0.7 opacity-80 duration-150 group-hover:scale-90"></div>
              <div className="absolute w-[300px] h-[300px] rounded-full border border-white-0.7 duration-150 group-hover:scale-90"></div>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="relative z-[1] min-h-screen">
        <div className="flex justify-between pt-16 pl-16 pr-[44px] relative z-[2]">
          <div>
            <Image
              src="/assets/svgs/logo.svg"
              width={126.74}
              height={22.84}
              alt="Cosmos Logo"
              className="mx-auto"
            />
          </div>
          <Tabs />
        </div>
        <div className="absolute top-0 z-0 overflow-hidden">
          <video
            src="/assets/videos/CryptoSpace1.mp4"
            autoPlay
            muted
            loop
            playsInline
            width="100%"
            height="100%"
          />
        </div>
        <div className="absolute bottom-0 right-0">
          <Footer />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-base-black min-h-screen">
      {renderView()}
      <div className="fixed top-0 animate-spin-slow z-0">
        <Image
          src="/assets/svgs/stars-bg.svg"
          width={1440}
          height={1037.19}
          alt="Stars"
        />
      </div>
    </div>
  );
}
