"use client";

import React from "react";
import { Plus, MessageCircle, Phone, Calendar, Clock, Users, Car, ArrowRight } from "lucide-react";
import { Ride } from "@/types";
import { getRideWhatsAppLink } from "@/lib/constants";
import { t } from "@/lib/translations";

interface RidesSectionProps {
  rides: Ride[];
  lang: "af" | "en";
  activeTown: string;
  onAddClick: () => void;
}

export default function RidesSection({ rides, lang, activeTown, onAddClick }: RidesSectionProps) {
  const strings = t[lang];

  const filtered = rides.filter((r) => {
    if (activeTown && activeTown !== "Alle Dorpe") {
      const match = r.origin.includes(activeTown) || r.destination.includes(activeTown);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 to-orange-800 text-white p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
            <Car className="w-5 h-5 text-amber-300" />
            <span>{lang === "af" ? "Richtersveld Saamry & Vervoer" : "Richtersveld Lift Club"}</span>
          </h3>
          <p className="text-xs text-amber-100 mt-0.5 max-w-xl">
            {lang === "af"
              ? "Deel bakkieritte en brandstofkoste na Springbok, Alexanderbaai, Port Nolloth en omliggende dorpe."
              : "Share rides and fuel costs to Springbok, Alexander Bay, Port Nolloth, and surrounding towns."}
          </p>
        </div>

        <button
          onClick={onAddClick}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-200 font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{strings.actions.offerRide}</span>
        </button>
      </div>

      {/* Rides List */}
      {filtered.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-dashed border-amber-300 text-center text-stone-500">
          <p className="text-sm font-semibold">
            {lang === "af"
              ? "Geen ritte tans gelys vir hierdie dorp nie."
              : "No rides currently listed for this town."}
          </p>
          <button
            onClick={onAddClick}
            className="mt-3 px-4 py-2 bg-orange-700 text-white rounded-lg text-xs font-bold"
          >
            {strings.actions.offerRide}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filtered.map((ride) => {
            const waLink = getRideWhatsAppLink(ride.whatsapp || ride.phone, ride, lang);
            const telLink = `tel:${ride.phone.replace(/\s+/g, "")}`;

            return (
              <div
                key={ride.id}
                className="bg-white rounded-xl border border-amber-200/90 shadow-xs hover:shadow-md transition p-4 flex flex-col justify-between"
              >
                <div>
                  {/* Route Heading */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-amber-100">
                    <div className="flex items-center gap-1.5 text-stone-900 font-extrabold text-sm sm:text-base flex-wrap">
                      <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-xs font-black">
                        {ride.origin}
                      </span>
                      <ArrowRight className="w-4 h-4 text-orange-700" />
                      <span className="bg-orange-100 text-orange-900 px-2 py-0.5 rounded text-xs font-black">
                        {ride.destination}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-orange-800">{ride.pricePerSeat}</span>
                    </div>
                  </div>

                  {/* Date, Time, Seats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2.5 text-xs text-stone-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-orange-700 flex-shrink-0" />
                      <span className="font-semibold text-stone-800">{ride.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-orange-700 flex-shrink-0" />
                      <span className="font-semibold text-stone-800">{ride.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                      <Users className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                      <span className="font-bold text-emerald-800">
                        {ride.seatsAvailable} {strings.labels.seats}
                      </span>
                    </div>
                  </div>

                  {/* Driver and Vehicle Info */}
                  <div className="text-xs bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">{lang === "af" ? "Bestuurder:" : "Driver:"}</span>
                      <span className="font-bold text-stone-900">{ride.driverName}</span>
                    </div>
                    {ride.vehicleInfo && (
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">{lang === "af" ? "Voertuig:" : "Vehicle:"}</span>
                        <span className="font-semibold text-stone-700">{ride.vehicleInfo}</span>
                      </div>
                    )}
                    {ride.notes && (
                      <p className="text-[11px] text-stone-600 pt-1 border-t border-amber-200 italic">
                        &ldquo;{ride.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 mt-3 border-t border-amber-100 flex items-center gap-2">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={telLink}
                    className="flex-1 py-1.5 px-3 bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{strings.actions.call}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
