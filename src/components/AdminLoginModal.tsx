"use client";

import React, { useState } from "react";
import { X, Lock, ShieldCheck, KeyRound } from "lucide-react";
import { AdminUser } from "@/types";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "af" | "en";
  onLoginSuccess: (user: AdminUser) => void;
}

export default function AdminLoginModal({
  isOpen,
  onClose,
  lang,
  onLoginSuccess,
}: AdminLoginModalProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.error || "Ongeldige gebruikersnaam of wagwoord.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Netwerkfout tydens inlog.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-amber-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 bg-gradient-to-r from-stone-900 to-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black">
                {lang === "af" ? "Admin Kantoor Inlog" : "Admin Office Login"}
              </h2>
              <p className="text-[11px] text-amber-200">
                {lang === "af" ? "Verifieer besighede & hanteer fooie" : "Verify vendors & manage fees"}
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
              {lang === "af" ? "Admin Gebruikersnaam" : "Admin Username"}
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              {lang === "af" ? "Wagwoord" : "Password"}
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
            <KeyRound className="w-4 h-4 text-orange-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Standaard Admin Kode:</p>
              <p className="font-mono text-stone-700 mt-0.5">Wagwoord: <strong>richtersveld2026</strong></p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-200 font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{isSubmitting ? "Besig..." : lang === "af" ? "Teken In as Admin" : "Log in as Admin"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
