"use client";

import React from "react";
import { Phone, ShieldAlert, HeartPulse, Building2, Compass, AlertCircle } from "lucide-react";
import { EmergencyContact } from "@/types";
import { t } from "@/lib/translations";

interface EmergencySectionProps {
  contacts: EmergencyContact[];
  lang: "af" | "en";
  activeTown: string;
}

export default function EmergencySection({ contacts, lang, activeTown }: EmergencySectionProps) {
  const strings = t[lang];

  const filtered = contacts.filter((c) => {
    if (activeTown && activeTown !== "Alle Dorpe" && c.town !== activeTown) return false;
    return true;
  });

  const getIcon = (cat: string) => {
    switch (cat) {
      case "polisie":
        return <ShieldAlert className="w-5 h-5 text-blue-600" />;
      case "ambulans":
      case "kliniek":
        return <HeartPulse className="w-5 h-5 text-red-600" />;
      case "sanparks":
        return <Compass className="w-5 h-5 text-emerald-700" />;
      default:
        return <Building2 className="w-5 h-5 text-amber-700" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Alert Header */}
      <div className="bg-red-900 text-white p-4 rounded-2xl shadow-sm flex items-start gap-3 border border-red-700">
        <AlertCircle className="w-6 h-6 text-red-300 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-black text-base sm:text-lg">
            {lang === "af" ? "Richtersveld Noodnommers & Belangrike Kontakte" : "Emergency Numbers"}
          </h3>
          <p className="text-xs text-red-200 mt-1 leading-relaxed">
            {lang === "af"
              ? "Hierdie nommers word op jou foon gestoor sodat jy hulle selfs sonder mobiele data of tydens netwerkonderbrekings kan skakel."
              : "These numbers are stored on your device so you can call them even without mobile data."}
          </p>
        </div>
      </div>

      {/* Grid of Emergency Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filtered.map((item) => {
          const telLink = `tel:${item.phone.replace(/\s+/g, "")}`;
          const altTelLink = item.altPhone ? `tel:${item.altPhone.replace(/\s+/g, "")}` : null;

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-stone-200 shadow-xs hover:shadow-md transition p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-stone-100 flex-shrink-0">
                      {getIcon(item.category)}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wider">
                        {item.town}
                      </span>
                      <h4 className="font-extrabold text-stone-900 text-sm sm:text-base leading-snug">
                        {item.name}
                      </h4>
                    </div>
                  </div>

                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded whitespace-nowrap">
                    {item.available}
                  </span>
                </div>

                {item.notes && (
                  <p className="text-xs text-stone-600 mt-2.5 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                    {item.notes}
                  </p>
                )}
              </div>

              {/* Call Buttons */}
              <div className="pt-3 mt-3 border-t border-stone-100 flex items-center gap-2">
                <a
                  href={telLink}
                  className="flex-1 py-2 px-3 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white font-extrabold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <Phone className="w-4 h-4 fill-white" />
                  <span>{item.phone}</span>
                </a>

                {altTelLink && (
                  <a
                    href={altTelLink}
                    className="py-2 px-3 bg-stone-200 hover:bg-stone-300 text-stone-900 font-bold text-xs rounded-lg flex items-center justify-center gap-1 transition"
                    title="Alternatiewe Noodnommer"
                  >
                    <span>{item.altPhone}</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
