"use client";

import React, { useState } from "react";
import { X, Store, CheckCircle, Plus, Trash2, Send, ShieldCheck, Sparkles } from "lucide-react";
import { TOWNS, CATEGORIES } from "@/lib/constants";
import { t } from "@/lib/translations";

interface AddBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "af" | "en";
  onBusinessAdded: () => void;
}

export default function AddBusinessModal({ isOpen, onClose, lang, onBusinessAdded }: AddBusinessModalProps) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
const [isUploading, setIsUploading] = useState(false);

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setIsUploading(true);
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.success && data.imageUrl) {
      setImageUrl(data.imageUrl);
    } else {
      alert(data.error || "Kon nie foto oplaai nie");
    }
  } finally {
    setIsUploading(false);
  }
};

  const [ownerName, setOwnerName] = useState("");
  const [category, setCategory] = useState("kos_bakkery");
  const [town, setTown] = useState("Kuboes");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("Ma - Sa: 08:00 - 17:00");
  const [paymentMethods, setPaymentMethods] = useState("Kontant, Capitec Pay");
  const [subscriptionPlan, setSubscriptionPlan] = useState("Gemeenskap Basies (R50/m)");
  const [services, setServices] = useState<{ title: string; price: string }[]>([
    { title: "", price: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleAddService = () => {
    setServices([...services, { title: "", price: "" }]);
  };

  const handleServiceChange = (index: number, field: "title" | "price", value: string) => {
    const updated = [...services];
    updated[index][field] = value;
    setServices(updated);
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || !ownerName.trim() || !phone.trim() || !description.trim()) {
      setErrorMsg(lang === "af" ? "Vul asseblief alle verpligte velde in." : "Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const validServices = services.filter((s) => s.title.trim().length > 0);

      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          ownerName,
          category,
          town,
          phone,
          whatsapp: whatsapp || phone,
          description,
          address,
          hours,
          paymentMethods,
          services: validServices,
          subscriptionPlan,
          imageUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onBusinessAdded();
        onClose();
      } else {
        setErrorMsg(data.error || "Kon nie besigheid registreer nie");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Netwerkfout. Probeer asseblief weer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-amber-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-orange-800 to-amber-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-base sm:text-lg font-black">
                {lang === "af" ? "Registreer Jou Besigheid" : "Register Your Business"}
              </h2>
              <p className="text-xs text-amber-200">
                {lang === "af" ? "Koppel jou dienste gratis aan die Richtersveld gemeenskap" : "Connect your services to the Richtersveld community"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 text-xs text-stone-800">
          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Trial info banner */}
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-orange-700 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Gratis 3-dae proeftydperk ingesluit!</strong> Jou besigheid word na registrasie deur die gemeenskapskantoor geverifieer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {lang === "af" ? "Besigheidsnaam *" : "Business Name *"}
              </label>
              <input
                type="text"
                required
                placeholder={lang === "af" ? "bv. Tannie Maria se Roosterkoek" : "e.g. Maria's Bakery"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {lang === "af" ? "Eienaar se Naam *" : "Owner's Name *"}
              </label>
              <input
                type="text"
                required
                placeholder={lang === "af" ? "bv. Maria Cloete" : "e.g. Maria Cloete"}
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-hidden"
              />
            </div>
          </div>
          
<div>
  <label className="block font-bold text-stone-700 mb-1">Foto / Logo (Opsioneel)</label>
  <input
    type="file"
    accept="image/*"
    onChange={handleImageUpload}
    disabled={isUploading}
    className="w-full text-xs text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-amber-100 file:text-amber-900"
  />
  {isUploading && <p className="text-[11px] text-amber-700 mt-1">Besig om foto op te laai...</p>}
  {imageUrl && (
    <img src={imageUrl} alt="Voorskou" className="mt-2 h-24 w-24 object-cover rounded-lg border border-stone-300" />
  )}
</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                {lang === "af" ? "Kategorie *" : "Category *"}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
              >
                {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {lang === "af" ? "Telefoonnommer (vir oproepe) *" : "Phone Number (for calls) *"}
              </label>
              <input
                type="tel"
                required
                placeholder="078 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {lang === "af" ? "WhatsApp Nommer" : "WhatsApp Number"}
              </label>
              <input
                type="tel"
                placeholder={lang === "af" ? "bv. 078 123 4567 (of selfs as foon)" : "e.g. 078 123 4567"}
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              {lang === "af" ? "Beskrywing van Dienste of Produkte *" : "Description of Services or Products *"}
            </label>
            <textarea
              required
              rows={3}
              placeholder={lang === "af" ? "Vertel die gemeenskap wat jy aanbied, beskikbaarheid, en spesiale dienste..." : "Tell the community what you offer..."}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-hidden leading-relaxed"
            />
          </div>

          {/* Subscription plan choice */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              {lang === "af" ? "Gekose Intekeningplan (Eerste 30 dae gratis)" : "Subscription Plan (First 30 days free)"}
            </label>
            <select
              value={subscriptionPlan}
              onChange={(e) => setSubscriptionPlan(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-bold text-xs text-stone-800"
            >
              <option value="Gemeenskap Basies (R50/m)">Gemeenskap Basies (R50/m) - Vir klein produsente & tuisnywerhede</option>
              <option value="Besigheid Plus (R120/m)">Besigheid Plus (R120/m) - Vir bakkie vervoer, sonkrag & toergidse</option>
              <option value="Pro Korporatief (R200/m)">Pro Korporatief (R200/m) - Vir gevestigde kontrakteurs & winkels</option>
            </select>
          </div>

          {/* Dynamic Services / Price List */}
          <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-stone-900">
                {lang === "af" ? "Dienste & Pryse (Opsioneel maar aanbeveel)" : "Services & Prices (Optional but recommended)"}
              </label>
              <button
                type="button"
                onClick={handleAddService}
                className="text-orange-700 hover:text-orange-800 font-bold flex items-center gap-1 text-[11px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === "af" ? "+ Voeg Diens By" : "+ Add Service"}</span>
              </button>
            </div>

            <div className="space-y-2">
              {services.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={lang === "af" ? "Item / Diens (bv. Roosterkoek)" : "Item / Service"}
                    value={item.title}
                    onChange={(e) => handleServiceChange(idx, "title", e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-stone-300 rounded text-xs"
                  />
                  <input
                    type="text"
                    placeholder={lang === "af" ? "Prys (bv. R18)" : "Price (e.g. R18)"}
                    value={item.price}
                    onChange={(e) => handleServiceChange(idx, "price", e.target.value)}
                    className="w-24 px-2.5 py-1.5 bg-white border border-stone-300 rounded text-xs"
                  />
                  {services.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveService(idx)}
                      className="p-1.5 text-stone-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {lang === "af" ? "Werksure" : "Operating Hours"}
              </label>
              <input
                type="text"
                placeholder="Ma - Sa: 08:00 - 17:00"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {lang === "af" ? "Aanvaarde Betalings" : "Payment Methods"}
              </label>
              <input
                type="text"
                placeholder="Kontant, Capitec Pay, eWallet"
                value={paymentMethods}
                onChange={(e) => setPaymentMethods(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              {lang === "af" ? "Fisiese Adres of Verwysing" : "Address or Landmark"}
            </label>
            <input
              type="text"
              placeholder={lang === "af" ? "bv. Hoofstraat 12, naby die kerk" : "e.g. Main Street 12"}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-orange-700 to-amber-700 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? lang === "af" ? "Besig om te registreer..." : "Registering..."
                  : lang === "af" ? "Dien Besigheid In vir Verifikasie" : "Submit Business for Verification"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
