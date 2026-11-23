"use client";

import React from "react";
import { MapPin } from "lucide-react";
import { TOWNS } from "@/lib/constants";

interface TownFilterProps {
  activeTown: string;
  setActiveTown: (town: string) => void;
  lang: "af" | "en";
}

export default function TownFilter({ activeTown, setActiveTown, lang }: TownFilterProps) {
  return (
    <div className="bg-amber-100/70 border-y border-amber-200/80 px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none py-0.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 whitespace-nowrap pl-1 pr-2 border-r border-amber-300/80">
          <MapPin className="w-3.5 h-3.5 text-orange-700" />
          <span>{lang === "af" ? "Dorp:" : "Town:"}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {TOWNS.map((town) => {
            const isSelected = activeTown === town || (town === "Alle Dorpe" && !activeTown);
            const label = town === "Alle Dorpe" && lang === "en" ? "All Towns" : town;

            return (
              <button
                key={town}
                onClick={() => setActiveTown(town)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-orange-700 text-white shadow-sm ring-2 ring-orange-500 font-bold"
                    : "bg-white/80 hover:bg-white text-stone-700 hover:text-stone-900 border border-amber-300/60"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
