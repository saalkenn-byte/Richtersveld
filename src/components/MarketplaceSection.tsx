"use client";

import React, { useState } from "react";
import { Plus, MessageCircle, Phone, Tag, MapPin, Search } from "lucide-react";
import { MarketplaceListing } from "@/types";
import { getMarketplaceWhatsAppLink } from "@/lib/constants";
import { t } from "@/lib/translations";

interface MarketplaceSectionProps {
  listings: MarketplaceListing[];
  dataSaver: boolean;
  lang: "af" | "en";
  activeTown: string;
  onAddClick: () => void;
}

export default function MarketplaceSection({
  listings,
  dataSaver,
  lang,
  activeTown,
  onAddClick,
}: MarketplaceSectionProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const strings = t[lang];

  const filtered = listings.filter((item) => {
    if (activeTown && activeTown !== "Alle Dorpe" && item.town !== activeTown) return false;
    if (filterType !== "all" && item.type !== filterType) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.sellerName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-amber-200">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
              filterType === "all" ? "bg-orange-700 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            {lang === "af" ? "Alles" : "All"}
          </button>
          <button
            onClick={() => setFilterType("sell")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
              filterType === "sell" ? "bg-orange-700 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            {lang === "af" ? "Te Koop" : "For Sale"}
          </button>
          <button
            onClick={() => setFilterType("buy")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
              filterType === "buy" ? "bg-orange-700 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            {lang === "af" ? "Gesoek" : "Wanted"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === "af" ? "Soek advertensies..." : "Search items..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs outline-hidden focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <button
            onClick={onAddClick}
            className="px-3 py-1.5 rounded-lg bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs flex items-center gap-1 shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{strings.actions.postListing}</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-dashed border-amber-300 text-center text-stone-500">
          <p className="text-sm font-semibold">
            {lang === "af"
              ? "Geen advertensies gevind vir hierdie filter nie."
              : "No listings found for this filter."}
          </p>
          <button
            onClick={onAddClick}
            className="mt-3 px-4 py-2 bg-orange-700 text-white rounded-lg text-xs font-bold"
          >
            {strings.actions.postListing}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((item) => {
            const waLink = getMarketplaceWhatsAppLink(item.whatsapp || item.phone, item.title, item.sellerName, lang);
            const telLink = `tel:${item.phone.replace(/\s+/g, "")}`;

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-amber-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {!dataSaver && item.imageUrl ? (
                    <div className="h-36 w-full bg-stone-200 overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2 bg-stone-900/80 text-amber-300 font-extrabold px-2 py-0.5 rounded text-xs">
                        {item.price}
                      </div>
                      <div className="absolute bottom-2 left-2 bg-orange-700/90 text-white font-bold px-2 py-0.5 rounded text-[11px]">
                        {item.town}
                      </div>
                    </div>
                  ) : (
                    <div className="px-3.5 pt-3 pb-1 flex items-center justify-between border-b border-amber-100 bg-amber-50/50">
                      <span className="text-xs font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded">
                        {item.town}
                      </span>
                      <span className="text-sm font-black text-stone-900">{item.price}</span>
                    </div>
                  )}

                  <div className="p-3.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-500 uppercase">
                      <span
                        className={`px-1.5 py-0.2 rounded ${
                          item.type === "buy" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {item.type === "buy" ? (lang === "af" ? "Gesoek" : "Wanted") : (lang === "af" ? "Te Koop" : "For Sale")}
                      </span>
                      <span>• {item.sellerName}</span>
                    </div>

                    <h4 className="font-extrabold text-stone-900 text-sm sm:text-base mt-1 leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-xs text-stone-600 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 border-t border-amber-200/80 flex items-center gap-2">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={telLink}
                    className="flex-1 py-1.5 px-2.5 bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition"
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
