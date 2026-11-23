"use client";

import React, { useState, useEffect } from "react";
import { Zap, Wifi, WifiOff, Globe, Download, ShieldCheck, Lock, ShieldAlert } from "lucide-react";
import { t } from "@/lib/translations";
import { AdminUser } from "@/types";

interface HeaderProps {
  lang: "af" | "en";
  setLang: (lang: "af" | "en") => void;
  dataSaver: boolean;
  setDataSaver: (val: boolean) => void;
  onRegisterClick: () => void;
  activeTown: string;
  setActiveTown: (town: string) => void;
  adminUser: AdminUser | null;
  onAdminClick: () => void;
  pendingCount?: number;
}

export default function Header({
  lang,
  setLang,
  dataSaver,
  setDataSaver,
  onRegisterClick,
  activeTown,
  setActiveTown,
  adminUser,
  onAdminClick,
  pendingCount = 0,
}: HeaderProps) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installable, setInstallable] = useState<boolean>(false);
  const strings = t[lang];

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstallable(false);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <header className="bg-gradient-to-r from-orange-800 via-amber-800 to-stone-900 text-white shadow-md sticky top-0 z-30">
      {/* Top Utility Bar */}
      <div className="max-w-6xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between text-xs border-b border-orange-700/40 gap-2">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 font-medium border border-emerald-500/40">
              <Wifi className="w-3 h-3 text-emerald-400" />
              {strings.onlineBadge}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-900/90 text-amber-200 font-medium border border-amber-400/50 animate-pulse">
              <WifiOff className="w-3 h-3 text-amber-300" />
              {strings.offlineBadge}
            </span>
          )}

          <span className="hidden sm:inline-flex items-center gap-1 text-orange-200/90">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            UNESCO Richtersveld Kultuurlandskap
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Admin Kantoor Quick Link */}
          <button
            onClick={onAdminClick}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition shadow-xs ${
              adminUser
                ? "bg-amber-400 text-stone-950 ring-2 ring-amber-300"
                : "bg-stone-900/90 text-amber-200 hover:bg-stone-800 border border-amber-500/40"
            }`}
            title="Admin & Verifikasiekantoor"
          >
            <Lock className="w-3 h-3" />
            <span>{adminUser ? (lang === "af" ? "Admin Kantoor ⚙️" : "Admin Office ⚙️") : (lang === "af" ? "Admin Inlog" : "Admin Login")}</span>
            {pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.1 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Data-Saver Switch Button */}
          <button
            onClick={() => setDataSaver(!dataSaver)}
            title={strings.dataSaverDesc}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold transition-all text-xs ${
              dataSaver
                ? "bg-amber-400 text-stone-950 ring-2 ring-amber-300 shadow-sm"
                : "bg-orange-950/70 text-orange-200 hover:bg-orange-900 border border-orange-600/50"
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${dataSaver ? "text-stone-950 fill-stone-950" : "text-amber-400"}`} />
            <span>{dataSaver ? strings.dataSaverActive : strings.dataSaverOff}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="flex items-center gap-1 px-2 py-1 rounded bg-stone-800/80 hover:bg-stone-700 text-stone-200 border border-stone-600/40 transition text-xs font-medium"
            title="Wissel Taal / Toggle Language"
          >
            <Globe className="w-3 h-3 text-amber-400" />
            <span>{lang === "af" ? "EN" : "AF"}</span>
          </button>

          {/* Install PWA Button if available */}
          {installable && (
            <button
              onClick={handleInstall}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm transition"
            >
              <Download className="w-3 h-3" />
              <span className="hidden xs:inline">{strings.actions.installApp}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Brand Hero Row */}
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 p-0.5 shadow-md flex-shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-stone-900 rounded-[10px] flex items-center justify-center text-amber-400 font-black text-xl tracking-tighter">
              RV
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-amber-100">
                {strings.appName}
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-orange-700/80 text-orange-200 border border-orange-500/50">
                PWA
              </span>
            </div>
            <p className="text-xs sm:text-sm text-orange-200/90 line-clamp-1 max-w-xl">
              {strings.appTagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onRegisterClick}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition transform active:scale-95 flex items-center gap-1.5"
          >
            <span>{strings.actions.registerBusiness}</span>
          </button>
        </div>
      </div>

      {/* Offline Alert Strip */}
      {!isOnline && (
        <div className="bg-amber-600 text-stone-950 text-xs px-4 py-1.5 font-semibold text-center border-t border-amber-400 flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span>{strings.offlineBanner}</span>
        </div>
      )}
    </header>
  );
}
