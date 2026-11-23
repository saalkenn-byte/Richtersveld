"use client";

import React, { useState } from "react";
import { AlertTriangle, Bell, Phone, Calendar, User, MapPin, Plus, Send, X } from "lucide-react";
import { CommunityNotice } from "@/types";
import { TOWNS } from "@/lib/constants";
import { t } from "@/lib/translations";

interface NoticesSectionProps {
  notices: CommunityNotice[];
  lang: "af" | "en";
  activeTown: string;
  onNoticeAdded: () => void;
}

export default function NoticesSection({ notices, lang, activeTown, onNoticeAdded }: NoticesSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [town, setTown] = useState("Kuboes");
  const [category, setCategory] = useState("kliniek");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strings = t[lang];

  const filtered = notices.filter((n) => {
    if (activeTown && activeTown !== "Alle Dorpe" && n.town !== activeTown) return false;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !author.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          town,
          content,
          author,
          contactPhone,
          isUrgent,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setTitle("");
        setContent("");
        setAuthor("");
        setContactPhone("");
        onNoticeAdded();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryLabels: Record<string, string> = {
    water_krag: lang === "af" ? "Water & Krag" : "Water & Power",
    kliniek: lang === "af" ? "Mobiele Kliniek & Gesondheid" : "Mobile Clinic",
    paaie: lang === "af" ? "Padtoestande & Sand" : "Road Conditions",
    skool: lang === "af" ? "Skool & Jeug" : "School & Youth",
    basaar: lang === "af" ? "Basaar & Gemeenskapsfees" : "Bazaar & Events",
    munisipaal: lang === "af" ? "Munisipaal" : "Municipal",
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-amber-200">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-stone-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-700" />
            <span>{lang === "af" ? "Richtersveld Gemeenskapskennisgewings" : "Community Notices"}</span>
          </h3>
          <p className="text-xs text-stone-600 mt-0.5">
            {lang === "af"
              ? "Belangrike datums vir mobiele klinieke, munisipale wateronderhoud, en padtoestande."
              : "Important dates for mobile clinics, municipal water cuts, and road warnings."}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{strings.actions.postNotice}</span>
        </button>
      </div>

      {/* Notices Feed */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl border transition ${
              item.isUrgent
                ? "bg-amber-50/90 border-amber-400 ring-1 ring-amber-300 shadow-xs"
                : "bg-white border-amber-200 shadow-2xs"
            }`}
          >
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {item.isUrgent && (
                  <span className="flex items-center gap-1 bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{strings.labels.urgent}</span>
                  </span>
                )}
                <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-0.5 rounded">
                  {categoryLabels[item.category] || item.category}
                </span>
                <span className="text-xs font-semibold text-stone-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-stone-400" />
                  <span>{item.town}</span>
                </span>
              </div>

              <span className="text-xs font-medium text-stone-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-stone-400" />
                <span>{item.date}</span>
              </span>
            </div>

            <h4 className="font-extrabold text-stone-900 text-base mt-2 leading-snug">
              {item.title}
            </h4>

            <p className="text-xs sm:text-sm text-stone-700 mt-2 leading-relaxed whitespace-pre-line">
              {item.content}
            </p>

            <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex items-center justify-between text-xs text-stone-600 flex-wrap gap-2">
              <span className="flex items-center gap-1 font-medium">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>{item.author}</span>
              </span>

              {item.contactPhone && (
                <a
                  href={`tel:${item.contactPhone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-700 hover:bg-orange-800 text-white rounded font-bold text-xs shadow-2xs transition"
                >
                  <Phone className="w-3 h-3" />
                  <span>{item.contactPhone}</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-amber-300 overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-orange-800 to-amber-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-300" />
                <h3 className="text-base font-black">
                  {lang === "af" ? "Plaas 'n Gemeenskapskennisgewing" : "Post Community Notice"}
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-full hover:bg-white/20 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs text-stone-800 overflow-y-auto">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {lang === "af" ? "Opskrif / Kennisgewing Titel *" : "Title *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === "af" ? "bv. Mobiele Kliniek Besoek Datums" : "e.g. Mobile Clinic Visit"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === "af" ? "Dorp *" : "Town *"}
                  </label>
                  <select
                    value={town}
                    onChange={(e) => setTown(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
                  >
                    {TOWNS.filter((t) => t !== "Alle Dorpe").map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === "af" ? "Kategorie" : "Category"}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
                  >
                    <option value="kliniek">{lang === "af" ? "Kliniek & Gesondheid" : "Clinic & Health"}</option>
                    <option value="water_krag">{lang === "af" ? "Water & Krag" : "Water & Power"}</option>
                    <option value="paaie">{lang === "af" ? "Padtoestande" : "Road Conditions"}</option>
                    <option value="basaar">{lang === "af" ? "Basaar / Fees" : "Bazaar / Event"}</option>
                    <option value="skool">{lang === "af" ? "Skool & Jeug" : "School"}</option>
                    <option value="munisipaal">{lang === "af" ? "Munisipaal" : "Municipal"}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {lang === "af" ? "Inhoud van Kennisgewing *" : "Content *"}
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={lang === "af" ? "Verskaf alle besonderhede, tye, reëlings..." : "Provide details, times, dates..."}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === "af" ? "Outeur / Organisasie *" : "Author / Organization *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="bv. VGK Kerkraad / Munisipaliteit"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === "af" ? "Kontak Telefoon" : "Contact Phone"}
                  </label>
                  <input
                    type="tel"
                    placeholder="027 851 1234"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="urgentCheck"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 text-orange-700 rounded border-stone-300 focus:ring-orange-500"
                />
                <label htmlFor="urgentCheck" className="font-bold text-stone-800 text-xs cursor-pointer">
                  {lang === "af" ? "Merk as DRINGENDE kennisgewing" : "Mark as URGENT notice"}
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? "Besig..." : lang === "af" ? "Plaas Kennisgewing" : "Publish Notice"}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
