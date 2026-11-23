"use client";

import React, { useState } from "react";
import { X, Tag, Send } from "lucide-react";
import { TOWNS, MARKETPLACE_CATEGORIES } from "@/lib/constants";

interface AddMarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "af" | "en";
  onAdded: () => void;
}

export default function AddMarketplaceModal({ isOpen, onClose, lang, onAdded }: AddMarketplaceModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("vee_diere");
  const [town, setTown] = useState("Kuboes");
  const [price, setPrice] = useState("R ");
  const [description, setDescription] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [type, setType] = useState("sell");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !sellerName.trim() || !phone.trim() || !description.trim()) {
      setErrorMsg(lang === "af" ? "Vul asseblief alle velde in." : "Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          town,
          price,
          description,
          sellerName,
          phone,
          whatsapp: whatsapp || phone,
          type,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onAdded();
        onClose();
      } else {
        setErrorMsg(data.error || "Fout met adverteer");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Netwerkfout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-amber-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 bg-gradient-to-r from-orange-800 to-amber-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-300" />
            <h2 className="text-base sm:text-lg font-black">
              {lang === "af" ? "Plaas 'n Advertensie op Markplein" : "Post Marketplace Listing"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 text-xs text-stone-800">
          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setType("sell")}
              className={`flex-1 py-2 rounded-lg font-bold text-xs border ${
                type === "sell" ? "bg-orange-700 text-white border-orange-700" : "bg-stone-50 text-stone-700 border-stone-200"
              }`}
            >
              {lang === "af" ? "Ek verkoop iets (Te Koop)" : "I'm selling (For Sale)"}
            </button>
            <button
              type="button"
              onClick={() => setType("buy")}
              className={`flex-1 py-2 rounded-lg font-bold text-xs border ${
                type === "buy" ? "bg-orange-700 text-white border-orange-700" : "bg-stone-50 text-stone-700 border-stone-200"
              }`}
            >
              {lang === "af" ? "Ek soek iets (Gesoek)" : "I'm looking for (Wanted)"}
            </button>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              {lang === "af" ? "Opskrif / Item *" : "Title / Item *"}
            </label>
            <input
              type="text"
              required
              placeholder={lang === "af" ? "bv. 4x Boerbok Ooie te koop" : "e.g. 4x Boer goats"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg outline-hidden focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {lang === "af" ? "Prys *" : "Price *"}
              </label>
              <input
                type="text"
                required
                placeholder="R 500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>
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
                {MARKETPLACE_CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              {lang === "af" ? "Beskrywing van Item *" : "Description *"}
            </label>
            <textarea
              required
              rows={3}
              placeholder={lang === "af" ? "Toestand, ouderdom, waar om op te laai, ens." : "Condition, location..."}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg outline-hidden focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {lang === "af" ? "Jou Naam *" : "Your Name *"}
              </label>
              <input
                type="text"
                required
                placeholder="bv. Willem Links"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {lang === "af" ? "Kontaknommer *" : "Contact Phone *"}
              </label>
              <input
                type="tel"
                required
                placeholder="082 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? "Besig..." : lang === "af" ? "Plaas Advertensie" : "Publish Listing"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
