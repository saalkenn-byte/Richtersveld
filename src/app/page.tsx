"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import TownFilter from "@/components/TownFilter";
import BusinessCard from "@/components/BusinessCard";
import BusinessModal from "@/components/BusinessModal";
import AddBusinessModal from "@/components/AddBusinessModal";
import MarketplaceSection from "@/components/MarketplaceSection";
import AddMarketplaceModal from "@/components/AddMarketplaceModal";
import RidesSection from "@/components/RidesSection";
import AddRideModal from "@/components/AddRideModal";
import NoticesSection from "@/components/NoticesSection";
import EmergencySection from "@/components/EmergencySection";
import AdminSection from "@/components/AdminSection";
import AdminLoginModal from "@/components/AdminLoginModal";

import { Business, MarketplaceListing, Ride, CommunityNotice, EmergencyContact, AdminUser } from "@/types";
import { CATEGORIES } from "@/lib/constants";
import { t } from "@/lib/translations";
import {
  Search,
  Store,
  ShoppingBag,
  Car,
  Bell,
  PhoneCall,
  Zap,
  RotateCcw,
  ShieldCheck,
  Lock,
} from "lucide-react";

export default function HomePage() {
  const [lang, setLang] = useState<"af" | "en">("af");
  const [dataSaver, setDataSaver] = useState<boolean>(true); // Default to data saver for fast mobile loading
  const [activeTab, setActiveTab] = useState<"businesses" | "marketplace" | "rides" | "notices" | "emergency" | "admin">("businesses");
  const [activeTown, setActiveTown] = useState<string>("Alle Dorpe");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [notices, setNotices] = useState<CommunityNotice[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Admin Account & Auth
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);

  // Modals
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isAddBusinessOpen, setIsAddBusinessOpen] = useState<boolean>(false);
  const [isAddMarketplaceOpen, setIsAddMarketplaceOpen] = useState<boolean>(false);
  const [isAddRideOpen, setIsAddRideOpen] = useState<boolean>(false);

  const strings = t[lang];

  // Load preferences and admin session from localStorage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("rv_lang");
      if (savedLang === "en" || savedLang === "af") setLang(savedLang);

      const savedDataSaver = localStorage.getItem("rv_data_saver");
      if (savedDataSaver !== null) setDataSaver(savedDataSaver === "true");

      const savedAdmin = localStorage.getItem("rv_admin_user");
      if (savedAdmin) {
        setAdminUser(JSON.parse(savedAdmin));
      }

      // Load cached offline data if present
      const cached = localStorage.getItem("rv_cached_data");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.businesses) setBusinesses(parsed.businesses);
        if (parsed.listings) setListings(parsed.listings);
        if (parsed.rides) setRides(parsed.rides);
        if (parsed.notices) setNotices(parsed.notices);
        if (parsed.emergencyContacts) setEmergencyContacts(parsed.emergencyContacts);
        setLoading(false);
      }
    } catch (e) {
      console.warn("Storage access issue:", e);
    }
  }, []);

  const handleSetLang = (l: "af" | "en") => {
    setLang(l);
    try {
      localStorage.setItem("rv_lang", l);
    } catch (e) {}
  };

  const handleSetDataSaver = (val: boolean) => {
    setDataSaver(val);
    try {
      localStorage.setItem("rv_data_saver", String(val));
    } catch (e) {}
  };

  // Fetch live data
  const fetchData = async () => {
    try {
      const res = await fetch("/api/data");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBusinesses(data.businesses || []);
          setListings(data.listings || []);
          setRides(data.rides || []);
          setNotices(data.notices || []);
          setEmergencyContacts(data.emergencyContacts || []);

          // Cache locally for offline resilience
          try {
            localStorage.setItem("rv_cached_data", JSON.stringify(data));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn("Offline or network issue, using cached data if available:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    try {
      localStorage.setItem("rv_admin_user", JSON.stringify(user));
    } catch (e) {}
    setActiveTab("admin");
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    try {
      localStorage.removeItem("rv_admin_user");
    } catch (e) {}
    setActiveTab("businesses");
  };

  const pendingCount = businesses.filter((b) => b.verificationStatus === "hangend" || !b.isVerified).length;

  // Filter businesses for public directory (only approved or verified)
  const filteredBusinesses = businesses.filter((b) => {
    if (activeTown && activeTown !== "Alle Dorpe" && b.town !== activeTown) return false;
    if (selectedCategory && selectedCategory !== "all" && b.category !== selectedCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        b.name.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.ownerName.toLowerCase().includes(q) ||
        b.town.toLowerCase().includes(q) ||
        (b.services && b.services.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40">
      {/* Header with Data Saver, Admin & PWA Controls */}
      <Header
        lang={lang}
        setLang={handleSetLang}
        dataSaver={dataSaver}
        setDataSaver={handleSetDataSaver}
        onRegisterClick={() => setIsAddBusinessOpen(true)}
        activeTown={activeTown}
        setActiveTown={setActiveTown}
        adminUser={adminUser}
        onAdminClick={() => {
          if (adminUser) {
            setActiveTab("admin");
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        pendingCount={pendingCount}
      />

      {/* Town Bar */}
      {activeTab !== "admin" && (
        <TownFilter activeTown={activeTown} setActiveTown={setActiveTown} lang={lang} />
      )}

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 sm:py-6 space-y-4">
        {/* Quick Hero Notification for Data-Saver */}
        {dataSaver && activeTab !== "admin" && (
          <div className="bg-amber-100/90 border border-amber-300 text-amber-950 px-3.5 py-2 rounded-xl text-xs flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-700 flex-shrink-0" />
              <span>
                <strong>{strings.dataSaverActive}:</strong>{" "}
                {lang === "af"
                  ? "Prente is afgeskakel om lugtyd te spaar en bladsye onmiddellik te laai."
                  : "Images are hidden to save mobile data and load instantly on slow 2G/3G connections."}
              </span>
            </div>
            <button
              onClick={() => handleSetDataSaver(false)}
              className="text-orange-800 underline font-bold whitespace-nowrap hover:text-orange-950"
            >
              {lang === "af" ? "Wys Prente" : "Show Images"}
            </button>
          </div>
        )}

        {/* Tab Navigation (Clean Mobile Pill Bar) */}
        <div className="bg-white p-1.5 rounded-2xl border border-amber-200/90 shadow-xs flex items-center gap-1 overflow-x-auto no-scrollbar scrollbar-none">
          <button
            onClick={() => setActiveTab("businesses")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === "businesses"
                ? "bg-orange-700 text-white shadow-xs"
                : "text-stone-700 hover:bg-amber-50 hover:text-stone-900"
            }`}
          >
            <Store className="w-4 h-4" />
            <span>{strings.tabs.businesses}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 ml-0.5">
              {businesses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("marketplace")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === "marketplace"
                ? "bg-orange-700 text-white shadow-xs"
                : "text-stone-700 hover:bg-amber-50 hover:text-stone-900"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{strings.tabs.marketplace}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 ml-0.5">
              {listings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("rides")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === "rides"
                ? "bg-orange-700 text-white shadow-xs"
                : "text-stone-700 hover:bg-amber-50 hover:text-stone-900"
            }`}
          >
            <Car className="w-4 h-4" />
            <span>{strings.tabs.rides}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 ml-0.5">
              {rides.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("notices")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === "notices"
                ? "bg-orange-700 text-white shadow-xs"
                : "text-stone-700 hover:bg-amber-50 hover:text-stone-900"
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{strings.tabs.notices}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 ml-0.5">
              {notices.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("emergency")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === "emergency"
                ? "bg-red-700 text-white shadow-xs"
                : "text-red-700 hover:bg-red-50"
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>{strings.tabs.emergency}</span>
          </button>

          {/* Admin Tab Pill */}
          <button
            onClick={() => {
              if (adminUser) {
                setActiveTab("admin");
              } else {
                setIsAdminLoginOpen(true);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ml-auto ${
              activeTab === "admin"
                ? "bg-stone-900 text-amber-200 shadow-xs"
                : "text-amber-900 bg-amber-100/60 hover:bg-amber-100"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{strings.tabs.admin}</span>
            {pendingCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-600 text-white font-black">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Businesses & Entrepreneurs */}
        {activeTab === "businesses" && (
          <div className="space-y-4">
            {/* Search and Category Filter Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-amber-200/90 shadow-xs space-y-3">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={strings.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-700"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none py-1">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        isSelected
                          ? "bg-stone-900 text-amber-200 shadow-2xs"
                          : "bg-amber-50 hover:bg-amber-100 text-stone-700 border border-amber-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Status Row */}
              <div className="flex items-center justify-between text-xs text-stone-600 pt-1 border-t border-amber-100">
                <span className="font-semibold">
                  {lang === "af"
                    ? `${filteredBusinesses.length} entrepreneurs beskikbaar`
                    : `${filteredBusinesses.length} entrepreneurs found`}
                  {activeTown !== "Alle Dorpe" && ` in ${activeTown}`}
                </span>

                {(searchTerm || selectedCategory !== "all" || activeTown !== "Alle Dorpe") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setActiveTown("Alle Dorpe");
                    }}
                    className="flex items-center gap-1 text-orange-700 hover:text-orange-900 font-bold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{strings.actions.clearFilters}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Businesses Grid */}
            {loading ? (
              <div className="p-12 text-center text-stone-500 text-sm font-semibold">
                {lang === "af" ? "Besighede laai tans..." : "Loading businesses..."}
              </div>
            ) : filteredBusinesses.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-amber-300 text-center space-y-3">
                <p className="text-sm font-semibold text-stone-600">{strings.labels.noResults}</p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setActiveTown("Alle Dorpe");
                    }}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold"
                  >
                    {strings.actions.clearFilters}
                  </button>
                  <button
                    onClick={() => setIsAddBusinessOpen(true)}
                    className="px-4 py-2 bg-orange-700 text-white rounded-lg text-xs font-bold shadow-xs"
                  >
                    {strings.actions.registerBusiness}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBusinesses.map((biz) => (
                  <BusinessCard
                    key={biz.id}
                    business={biz}
                    dataSaver={dataSaver}
                    lang={lang}
                    onOpenDetails={(b) => setSelectedBusiness(b)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Marketplace */}
        {activeTab === "marketplace" && (
          <MarketplaceSection
            listings={listings}
            dataSaver={dataSaver}
            lang={lang}
            activeTown={activeTown}
            onAddClick={() => setIsAddMarketplaceOpen(true)}
          />
        )}

        {/* Tab 3: Rides / Saamry */}
        {activeTab === "rides" && (
          <RidesSection
            rides={rides}
            lang={lang}
            activeTown={activeTown}
            onAddClick={() => setIsAddRideOpen(true)}
          />
        )}

        {/* Tab 4: Notices */}
        {activeTab === "notices" && (
          <NoticesSection
            notices={notices}
            lang={lang}
            activeTown={activeTown}
            onNoticeAdded={fetchData}
          />
        )}

        {/* Tab 5: Emergency Contacts */}
        {activeTab === "emergency" && (
          <EmergencySection
            contacts={emergencyContacts}
            lang={lang}
            activeTown={activeTown}
          />
        )}

        {/* Tab 6: Admin Portal */}
        {activeTab === "admin" && (
          adminUser ? (
            <AdminSection
              adminUser={adminUser}
              lang={lang}
              onLogout={handleAdminLogout}
              onDataChanged={fetchData}
            />
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-amber-200 text-center space-y-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-900 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-stone-900">
                {lang === "af" ? "Admin Kantoor Toegang" : "Admin Office Access"}
              </h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                {lang === "af"
                  ? "Teken in met jou admin rekening om besighede te verifieer en verskaffer intekeningfooie te bestuur."
                  : "Sign in with your admin account to verify vendors and manage subscription fees."}
              </p>
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="px-5 py-2.5 bg-stone-900 text-amber-200 font-bold rounded-xl text-xs"
              >
                {lang === "af" ? "Teken In as Admin" : "Log In as Admin"}
              </button>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-stone-900 text-stone-300 border-t border-stone-800 text-xs py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-extrabold text-amber-200 text-sm">
              Richtersveld Gemeenskap & Plaaslike Besighede
            </p>
            <p className="text-stone-400 mt-0.5">
              Kuboes • Lekkersing • Eksteenfontein • Sanddrift • Port Nolloth • Alexanderbaai • Sendelingsdrif
            </p>
          </div>
          <div className="flex items-center gap-3 text-stone-400 text-[11px]">
            <span>PWA vanlyn ondersteuning</span>
            <span>•</span>
            <button
              onClick={() => {
                if (adminUser) setActiveTab("admin");
                else setIsAdminLoginOpen(true);
              }}
              className="text-amber-400 hover:underline font-semibold"
            >
              Admin & Fooie Kantoor
            </button>
            <span>•</span>
            <span>Lae-Data Geoptimaliseer</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BusinessModal
        business={selectedBusiness}
        onClose={() => setSelectedBusiness(null)}
        lang={lang}
        dataSaver={dataSaver}
        onReviewAdded={fetchData}
      />

      <AddBusinessModal
        isOpen={isAddBusinessOpen}
        onClose={() => setIsAddBusinessOpen(false)}
        lang={lang}
        onBusinessAdded={fetchData}
      />

      <AddMarketplaceModal
        isOpen={isAddMarketplaceOpen}
        onClose={() => setIsAddMarketplaceOpen(false)}
        lang={lang}
        onAdded={fetchData}
      />

      <AddRideModal
        isOpen={isAddRideOpen}
        onClose={() => setIsAddRideOpen(false)}
        lang={lang}
        onAdded={fetchData}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        lang={lang}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}
