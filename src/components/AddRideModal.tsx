"use client";

import React, { useState } from "react";
import { X, Car, Send } from "lucide-react";

interface AddRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "af" | "en";
  onAdded: () => void;
}

export default function AddRideModal({ isOpen, onClose, lang, onAdded }: AddRideModalProps) {
  const [origin, setOrigin] = useState("Kuboes");
  const [destination, setDestination] = useState("Springbok");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("06:00 vm");
  const [seatsAvailable, setSeatsAvailable] = useState(3);
  const [pricePerSeat, setPricePerSeat] = useState("R 200 pp");
  const [driverName, setDriverName] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim() || !date.trim() || !driverName.trim() || !phone.trim()) {
      setErrorMsg(lang === "af" ? "Vul asseblief alle ritbesonderhede in." : "Please fill in all ride details.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          date,
          time,
          seatsAvailable,
          pricePerSeat,
          driverName,
          vehicleInfo,
          phone,
          whatsapp: whatsapp || phone,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onAdded();
        onClose();
      } else {
        setErrorMsg(data.error || "Fout met oplaai");
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
            <Car className="w-5 h-5 text-amber-300" />
            <h2 className="text-base sm:text-lg font-black">
              {lang === "af" ? "Bied Saamry / Vervoer Aan" : "Offer a Ride"}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {lang === "af" ? "Vertrekplek *" : "Origin *"}
              </label>
              <input
                type="text"
                required
                placeholder="bv. Kuboes"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {lang === "af" ? "Bestemming *" : "Destination *"}
              </label>
              <input
                type="text"
                required
                placeholder="bv. Springbok / Alexanderbaai"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {lang === "af" ? "Datum *" : "Date *"}
              </label>
              <input
                type="text"
                required
                placeholder="bv. Vrydag, 13 Maart"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {lang === "af" ? "Vertrektyd *" : "Departure Time *"}
              </label>
              <input
                type="text"
                required
                placeholder="06:00 vm"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {lang === "af" ? "Sitplekke Beskikbaar *" : "Seats Available *"}
              </label>
              <input
                type="number"
                min={1}
                max={15}
                required
                value={seatsAvailable}
                onChange={(e) => setSeatsAvailable(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {lang === "af" ? "Prys per Sitplek *" : "Price per Seat *"}
              </label>
              <input
                type="text"
                required
                placeholder="R 200 pp"
                value={pricePerSeat}
                onChange={(e) => setPricePerSeat(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {lang === "af" ? "Bestuurder se Naam *" : "Driver Name *"}
              </label>
              <input
                type="text"
                required
                placeholder="bv. Oom Dawid"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {lang === "af" ? "Voertuig Besonderhede" : "Vehicle Info"}
              </label>
              <input
                type="text"
                placeholder="bv. Wit Toyota Hilux 4x4"
                value={vehicleInfo}
                onChange={(e) => setVehicleInfo(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              {lang === "af" ? "Telefoonnommer *" : "Phone Number *"}
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

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              {lang === "af" ? "Notas (bv. bagasie, terugkeertyd)" : "Notes"}
            </label>
            <textarea
              rows={2}
              placeholder={lang === "af" ? "Plek vir inkopiesakke, stop op Port Nolloth..." : "Luggage space, return details..."}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? "Besig..." : lang === "af" ? "Plaas Saamry" : "Post Ride"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
