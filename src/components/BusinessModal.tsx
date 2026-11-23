"use client";

import React, { useState } from "react";
import { X, MessageCircle, Phone, MapPin, Clock, CreditCard, CheckCircle2, Star, Tag, MessageSquareText, Send } from "lucide-react";
import { Business, ServiceItem } from "@/types";
import { getWhatsAppLink } from "@/lib/constants";
import { t } from "@/lib/translations";

interface BusinessModalProps {
  business: Business | null;
  onClose: () => void;
  lang: "af" | "en";
  dataSaver: boolean;
  onReviewAdded?: () => void;
}

export default function BusinessModal({ business, onClose, lang, dataSaver, onReviewAdded }: BusinessModalProps) {
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  if (!business) return null;

  const strings = t[lang];
  const waLink = getWhatsAppLink(business.whatsapp || business.phone, business.name, business.ownerName, lang);
  const telLink = `tel:${business.phone.replace(/\s+/g, "")}`;

  let parsedServices: ServiceItem[] = [];
  try {
    if (business.services) {
      parsedServices = JSON.parse(business.services);
    }
  } catch (e) {
    parsedServices = [];
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          reviewerName,
          rating,
          comment,
        }),
      });

      if (res.ok) {
        setReviewSuccess(true);
        setReviewerName("");
        setComment("");
        if (onReviewAdded) onReviewAdded();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-amber-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-orange-800 to-amber-800 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-amber-200">
              <MapPin className="w-3.5 h-3.5" />
              <span>{business.town}, Richtersveld</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black mt-0.5">{business.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-stone-800 text-sm">
          {/* Owner & Verification Badge */}
          <div className="flex items-center justify-between bg-amber-50 p-3 rounded-xl border border-amber-200">
            <div>
              <p className="text-xs text-stone-500 font-medium">{strings.labels.owner}</p>
              <p className="font-bold text-stone-900 text-base">{business.ownerName}</p>
            </div>
            <div className="flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{strings.labels.verified}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-amber-900 mb-1">
              {lang === "af" ? "Oor Hierdie Besigheid" : "About This Business"}
            </h4>
            <p className="text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-200">
              {business.description}
            </p>
          </div>

          {/* Services & Price list */}
          {parsedServices.length > 0 && (
            <div>
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-orange-700" />
                <span>{strings.labels.servicesAndPrices}</span>
              </h4>
              <div className="space-y-1.5">
                {parsedServices.map((service, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs"
                  >
                    <div>
                      <span className="font-bold text-stone-900">{service.title}</span>
                      {service.desc && <p className="text-stone-500 text-[11px] mt-0.5">{service.desc}</p>}
                    </div>
                    {service.price && (
                      <span className="font-black text-orange-800 bg-white px-2 py-1 rounded border border-amber-200 shadow-2xs whitespace-nowrap ml-2">
                        {service.price}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Business Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200">
            {business.hours && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-700 flex-shrink-0" />
                <div>
                  <span className="font-bold text-stone-800">{strings.labels.hours}:</span>
                  <p>{business.hours}</p>
                </div>
              </div>
            )}
            {business.paymentMethods && (
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-700 flex-shrink-0" />
                <div>
                  <span className="font-bold text-stone-800">{strings.labels.payment}:</span>
                  <p>{business.paymentMethods}</p>
                </div>
              </div>
            )}
            {business.address && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <MapPin className="w-4 h-4 text-orange-700 flex-shrink-0" />
                <div>
                  <span className="font-bold text-stone-800">{lang === "af" ? "Adres:" : "Address:"}</span>
                  <p>{business.address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Review / Recommendation section */}
          <div className="pt-2 border-t border-amber-200">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{lang === "af" ? "Laat 'n Plaaslike Aanbeveling" : "Leave a Local Recommendation"}</span>
            </h4>

            {reviewSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
                ✓ {lang === "af" ? "Baie dankie! Jou aanbeveling is bygevoeg." : "Thank you! Your recommendation has been added."}
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-2 bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={lang === "af" ? "Jou Naam (bv. Koos Cloete)" : "Your Name"}
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    required
                    className="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="px-2 py-1.5 bg-white border border-amber-300 rounded text-xs font-bold text-amber-900"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                    <option value={4}>⭐⭐⭐⭐ (4)</option>
                    <option value={3}>⭐⭐⭐ (3)</option>
                  </select>
                </div>
                <textarea
                  placeholder={lang === "af" ? "Skryf kortliks waarom jy hierdie entrepreneur aanbeveel..." : "Briefly write why you recommend this entrepreneur..."}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  required
                  className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-1.5 px-3 bg-stone-900 hover:bg-stone-800 text-amber-200 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition"
                >
                  <Send className="w-3 h-3" />
                  <span>{isSubmitting ? "Besig..." : lang === "af" ? "Plaas Aanbeveling" : "Post Recommendation"}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Fixed Action Buttons */}
        <div className="p-4 bg-amber-100/80 border-t border-amber-200 flex items-center gap-2">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
            <span>{strings.actions.whatsapp}</span>
          </a>

          <a
            href={telLink}
            className="flex-1 py-2.5 px-3 bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
          >
            <Phone className="w-4 h-4" />
            <span>{strings.actions.call} ({business.phone})</span>
          </a>
        </div>
      </div>
    </div>
  );
}
