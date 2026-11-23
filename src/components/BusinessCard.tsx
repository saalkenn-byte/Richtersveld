"use client";

import React from "react";
import { MessageCircle, Phone, Clock, CreditCard, CheckCircle2, Star, Tag, ChevronRight, MessageSquareText } from "lucide-react";
import { Business, ServiceItem } from "@/types";
import { getWhatsAppLink } from "@/lib/constants";
import { t } from "@/lib/translations";

interface BusinessCardProps {
  business: Business;
  dataSaver: boolean;
  lang: "af" | "en";
  onOpenDetails: (b: Business) => void;
}

export default function BusinessCard({ business, dataSaver, lang, onOpenDetails }: BusinessCardProps) {
  const strings = t[lang];
  const waLink = getWhatsAppLink(business.whatsapp || business.phone, business.name, business.ownerName, lang);
  const telLink = `tel:${business.phone.replace(/\s+/g, "")}`;
  const smsLink = `sms:${business.phone.replace(/\s+/g, "")}?body=${encodeURIComponent(
    lang === "af"
      ? `Hallo ${business.ownerName}, ek het jou besigheid op die Richtersveld App gesien en stel belang in jou dienste.`
      : `Hello ${business.ownerName}, I saw your business on the Richtersveld App and I am interested in your services.`
  )}`;

  // Parse services
  let parsedServices: ServiceItem[] = [];
  try {
    if (business.services) {
      parsedServices = JSON.parse(business.services);
    }
  } catch (e) {
    parsedServices = [];
  }

  // Category badge label
  const categoryLabels: Record<string, string> = {
    kos_bakkery: lang === "af" ? "Kos & Bakkery" : "Food & Bakery",
    ambag_bou: lang === "af" ? "Ambagsmanne & Bou" : "Trades & Building",
    vervoer: lang === "af" ? "Vervoer & Bakkies" : "Transport & Lifts",
    toerisme_gidse: lang === "af" ? "Toerisme & 4x4 Gidse" : "Tourism & 4x4",
    handwerk_kuns: lang === "af" ? "Nama Handwerk" : "Nama Crafts",
    landbou_vars: lang === "af" ? "Vars Seekos & Plaas" : "Fresh Seafood & Farm",
    meganies_sonkrag: lang === "af" ? "Sonkrag & Meganies" : "Solar & Mechanical",
    skoonheid_klerasie: lang === "af" ? "Skoonheid & Hare" : "Beauty & Hair",
    ander: lang === "af" ? "Ander Diens" : "Other Service",
  };

  return (
    <div className="bg-white rounded-xl border border-amber-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
      <div>
        {/* Top Header / Image Area */}
        {!dataSaver && business.imageUrl ? (
          <div className="relative h-36 w-full bg-stone-200 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={business.imageUrl}
              alt={business.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white text-xs">
              <span className="bg-orange-700/90 backdrop-blur-xs px-2 py-0.5 rounded font-semibold text-[11px]">
                {categoryLabels[business.category] || business.category}
              </span>
              <span className="bg-stone-900/80 px-2 py-0.5 rounded font-bold text-amber-300 text-[11px]">
                {business.town}
              </span>
            </div>
          </div>
        ) : (
          <div className="px-4 pt-3 pb-1 flex items-center justify-between border-b border-amber-100 bg-amber-50/60">
            <span className="inline-block bg-orange-100 text-orange-800 text-[11px] font-bold px-2 py-0.5 rounded">
              {categoryLabels[business.category] || business.category}
            </span>
            <span className="text-xs font-bold text-stone-700 bg-stone-200/80 px-2 py-0.5 rounded">
              📍 {business.town}
            </span>
          </div>
        )}

        {/* Business Main Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-stone-900 leading-snug hover:text-orange-700 transition cursor-pointer" onClick={() => onOpenDetails(business)}>
                {business.name}
              </h3>
              <p className="text-xs font-semibold text-amber-900 flex items-center gap-1.5 mt-0.5">
                <span>{strings.labels.owner}: {business.ownerName}</span>
                {business.isVerified && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-bold" title={strings.labels.verified}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Inwoner</span>
                  </span>
                )}
              </p>
            </div>

            {/* Rating pill */}
            <div className="flex items-center gap-1 bg-amber-100/90 text-amber-900 px-2 py-1 rounded text-xs font-bold flex-shrink-0">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{business.rating || "5.0"}</span>
              <span className="text-[10px] text-stone-500">({business.reviewCount || 1})</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 mt-2 line-clamp-2 leading-relaxed">
            {business.description}
          </p>

          {/* Pricing / Key Services Tags */}
          {parsedServices.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-amber-100">
              <div className="flex items-center gap-1 text-[11px] font-bold text-stone-500 mb-1.5">
                <Tag className="w-3 h-3 text-orange-600" />
                <span>{strings.labels.servicesAndPrices}:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {parsedServices.slice(0, 3).map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-amber-50 text-stone-800 border border-amber-200 text-[11px] px-2 py-0.5 rounded font-medium"
                  >
                    <span>{item.title}</span>
                    {item.price && (
                      <strong className="text-orange-800 font-bold">({item.price})</strong>
                    )}
                  </span>
                ))}
                {parsedServices.length > 3 && (
                  <button
                    onClick={() => onOpenDetails(business)}
                    className="text-[11px] text-orange-700 font-bold hover:underline self-center"
                  >
                    +{parsedServices.length - 3} nog
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Hours & Payment */}
          <div className="mt-3 text-[11px] text-stone-500 space-y-1">
            {business.hours && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-stone-400 flex-shrink-0" />
                <span className="truncate">{business.hours}</span>
              </div>
            )}
            {business.paymentMethods && (
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3 h-3 text-stone-400 flex-shrink-0" />
                <span className="truncate font-medium text-stone-600">{business.paymentMethods}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DIRECT ACTION BUTTONS (WhatsApp, Call, SMS, Details) */}
      <div className="p-3 bg-stone-50 border-t border-amber-200/80 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Direct WhatsApp Call-to-action */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-sm transition transform active:scale-95"
            title="Gesels direk op WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
            <span>{strings.actions.whatsapp}</span>
          </a>

          {/* Direct Phone Call Call-to-action */}
          <a
            href={telLink}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-orange-700 hover:bg-orange-800 active:bg-orange-900 text-white font-bold text-xs shadow-sm transition transform active:scale-95"
            title="Skakel direk sonder data"
          >
            <Phone className="w-4 h-4" />
            <span>{strings.actions.call}</span>
          </a>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 px-1">
          <a
            href={smsLink}
            className="text-[11px] text-stone-600 hover:text-stone-900 font-semibold flex items-center gap-1"
          >
            <MessageSquareText className="w-3 h-3 text-stone-500" />
            <span>{strings.actions.sms}</span>
          </a>

          <button
            onClick={() => onOpenDetails(business)}
            className="text-[11px] text-orange-800 hover:text-orange-900 font-bold flex items-center gap-0.5 transition"
          >
            <span>{strings.actions.details}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
