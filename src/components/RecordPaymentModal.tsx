"use client";

import React, { useState, useEffect } from "react";
import { X, CreditCard, CheckCircle2, Banknote, Calendar, Send } from "lucide-react";
import { Business } from "@/types";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: Business[];
  selectedBusinessId?: number | null;
  lang: "af" | "en";
  onPaymentSuccess: () => void;
}

export default function RecordPaymentModal({
  isOpen,
  onClose,
  businesses,
  selectedBusinessId,
  lang,
  onPaymentSuccess,
}: RecordPaymentModalProps) {
  const [businessId, setBusinessId] = useState<number>(selectedBusinessId || (businesses[0]?.id || 0));
  const [amount, setAmount] = useState<number>(50);
  const [period, setPeriod] = useState<string>("Maart 2026");
  const [paymentMethod, setPaymentMethod] = useState<string>("Capitec Pay");
  const [reference, setReference] = useState<string>("");
  const [monthsToExtend, setMonthsToExtend] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (selectedBusinessId) {
      setBusinessId(selectedBusinessId);
      const biz = businesses.find((b) => b.id === selectedBusinessId);
      if (biz && biz.monthlyFee) {
        setAmount(biz.monthlyFee);
      }
    } else if (businesses.length > 0) {
      setBusinessId(businesses[0].id);
      setAmount(businesses[0].monthlyFee || 50);
    }

    // Set default current month period
    const currentMonth = new Date().toLocaleDateString("af-ZA", { month: "long", year: "numeric" });
    setPeriod(currentMonth);
  }, [selectedBusinessId, businesses, isOpen]);

  const handleBusinessChange = (id: number) => {
    setBusinessId(id);
    const biz = businesses.find((b) => b.id === id);
    if (biz && biz.monthlyFee) {
      setAmount(biz.monthlyFee);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!businessId || !amount || !period.trim() || !paymentMethod) {
      setErrorMsg("Vul asseblief alle velde in.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          amount,
          period,
          paymentMethod,
          reference: reference || `BET-${Date.now().toString().slice(-4)}`,
          notes,
          monthsToExtend,
          recordedBy: "Admin Kantoor",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onPaymentSuccess();
        onClose();
      } else {
        setErrorMsg(data.error || "Fout met aantekening van betaling");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Netwerkfout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBiz = businesses.find((b) => b.id === businessId);

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-amber-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black">
                {lang === "af" ? "Teken Intekeningfooi Aan" : "Record Subscription Fee"}
              </h2>
              <p className="text-[11px] text-emerald-200">
                {lang === "af" ? "Ontvang fooi en verleng verskaffer se lisensie" : "Receive payment and renew vendor subscription"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs text-stone-800">
          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg font-semibold">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              {lang === "af" ? "Kies Besigheid / Entrepreneur *" : "Select Vendor *"}
            </label>
            <select
              value={businessId}
              onChange={(e) => handleBusinessChange(Number(e.target.value))}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-bold text-xs"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.ownerName} - {b.town}) [R{b.monthlyFee || 50}/m]
                </option>
              ))}
            </select>
          </div>

          {selectedBiz && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950 flex items-center justify-between">
              <div>
                <p className="font-bold">{selectedBiz.name}</p>
                <p className="text-stone-600">Plan: {selectedBiz.subscriptionPlan || "Basies"}</p>
              </div>
              <span className="font-black text-emerald-800 text-sm">
                R{selectedBiz.monthlyFee || 50} / mnd
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {lang === "af" ? "Ontvangde Bedrag (R) *" : "Amount Received (R) *"}
              </label>
              <input
                type="number"
                min={10}
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {lang === "af" ? "Tydperk / Maand *" : "Period / Month *"}
              </label>
              <input
                type="text"
                required
                placeholder="bv. Maart 2026"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {lang === "af" ? "Betaalmetode *" : "Payment Method *"}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold"
              >
                <option value="Capitec Pay">Capitec Pay</option>
                <option value="Kontant by Gemeenskapskantoor">Kontant (Kantoor)</option>
                <option value="eWallet">eWallet / Instant Money</option>
                <option value="EFT">Bank EFT</option>
                <option value="SnapScan">SnapScan</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {lang === "af" ? "Verleng Met *" : "Extend By *"}
              </label>
              <select
                value={monthsToExtend}
                onChange={(e) => setMonthsToExtend(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold"
              >
                <option value={1}>1 Maand (+30 dae)</option>
                <option value={3}>3 Maande (+90 dae)</option>
                <option value={6}>6 Maande (+180 dae)</option>
                <option value={12}>1 Jaar (+365 dae)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              {lang === "af" ? "Kwitansie / Betalingsverwysing" : "Reference / Receipt No."}
            </label>
            <input
              type="text"
              placeholder="bv. CAP-8841-KONTANT"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              {lang === "af" ? "Notas (opsioneel)" : "Notes (optional)"}
            </label>
            <textarea
              rows={2}
              placeholder="bv. Kontant ontvang by Kuboes kantoor deur Suster Cloete"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? "Besig..." : lang === "af" ? "Teken Fooi Aan & Verleng" : "Record Payment & Renew"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
