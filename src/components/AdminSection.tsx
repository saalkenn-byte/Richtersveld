"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Banknote,
  TrendingUp,
  CreditCard,
  Trash2,
  Star,
  Plus,
  RefreshCw,
  LogOut,
  Phone,
  MessageCircle,
  Filter,
  Receipt,
  Car,
  Tag,
  Bell,
  Check,
} from "lucide-react";
import { Business, SubscriptionPayment, AdminUser, MarketplaceListing, Ride, CommunityNotice } from "@/types";
import { getWhatsAppLink } from "@/lib/constants";
import RecordPaymentModal from "@/components/RecordPaymentModal";

interface AdminSectionProps {
  adminUser: AdminUser;
  lang: "af" | "en";
  onLogout: () => void;
  onDataChanged: () => void;
}

export default function AdminSection({ adminUser, lang, onLogout, onDataChanged }: AdminSectionProps) {
  const [activeAdminTab, setActiveAdminTab] = useState<"verifications" | "subscriptions" | "moderation">("verifications");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);

  // Data states
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [marketplace, setMarketplace] = useState<MarketplaceListing[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [notices, setNotices] = useState<CommunityNotice[]>([]);
  const [stats, setStats] = useState<any>({});

  // Payment recording modal
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState<boolean>(false);
  const [paymentBizId, setPaymentBizId] = useState<number | null>(null);

  // Notification message
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  const fetchAdminOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/overview");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBusinesses(data.businesses || []);
          setPayments(data.payments || []);
          setMarketplace(data.marketplace || []);
          setRides(data.rides || []);
          setNotices(data.notices || []);
          setStats(data.stats || {});
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminOverview();
  }, []);

  const handleAction = async (type: string, id: number, action: string, extraData?: any) => {
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, action, ...extraData }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlertNotice(data.message || "Aksie suksesvol voltooi");
        setTimeout(() => setAlertNotice(null), 3000);
        await fetchAdminOverview();
        onDataChanged();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdatePlan = async (businessId: number, plan: string, fee: number) => {
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, subscriptionPlan: plan, monthlyFee: fee }),
      });
      if (res.ok) {
        setAlertNotice("Intekeningplan opgedateer");
        setTimeout(() => setAlertNotice(null), 3000);
        await fetchAdminOverview();
        onDataChanged();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredBusinesses = businesses.filter((b) => {
    if (filterStatus === "hangend") return b.verificationStatus === "hangend" || !b.isVerified;
    if (filterStatus === "goedgekeur") return b.verificationStatus === "goedgekeur" && b.isVerified;
    if (filterStatus === "afgekeur") return b.verificationStatus === "afgekeur";
    if (filterStatus === "agterstallig") return b.subscriptionStatus === "agterstallig";
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Admin Title Bar */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-4 rounded-2xl shadow-md border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-lg text-amber-100">
                {lang === "af" ? "Admin & Verifikasiekantoor" : "Admin & Verification Portal"}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                {adminUser.role?.toUpperCase() || "ADMIN"}
              </span>
            </div>
            <p className="text-xs text-amber-200/80">
              {lang === "af"
                ? `Aangemeld as ${adminUser.fullName} (${adminUser.username})`
                : `Logged in as ${adminUser.fullName}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={fetchAdminOverview}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs font-semibold flex items-center gap-1 transition"
            title="Herlaai Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{lang === "af" ? "Herlaai" : "Refresh"}</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-lg bg-red-900/80 hover:bg-red-800 text-red-200 text-xs font-bold flex items-center gap-1 border border-red-700 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{lang === "af" ? "Teken Uit" : "Log Out"}</span>
          </button>
        </div>
      </div>

      {alertNotice && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span>{alertNotice}</span>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>{lang === "af" ? "Totale Besighede" : "Total Businesses"}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-stone-900">{stats.totalBusinesses || 0}</span>
            <span className="text-[11px] font-bold text-emerald-700">
              {stats.verifiedCount || 0} geverifieer
            </span>
          </div>
          {Number(stats.pendingVerificationCount || 0) > 0 && (
            <p className="text-[11px] font-bold text-amber-700 mt-1">
              ⚠️ {stats.pendingVerificationCount} hangend
            </p>
          )}
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>{lang === "af" ? "Maandelikse Fooie (MRR)" : "Monthly Fees (MRR)"}</span>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-black text-orange-800">
              R {stats.monthlyProjectedRevenue || 0}
            </span>
            <span className="text-[11px] text-stone-500 font-medium">/mnd</span>
          </div>
          <p className="text-[11px] text-stone-600 mt-1">
            {stats.activeSubs || 0} aktiewe verskaffers
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>{lang === "af" ? "Totaal Ingevorder" : "Collected Fees"}</span>
            <Banknote className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-800">
              R {stats.totalCollectedFees || 0}
            </span>
          </div>
          <p className="text-[11px] text-stone-600 mt-1">
            {payments.length} kwitansies aangeteken
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>{lang === "af" ? "Intekening Status" : "Subscription Status"}</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap text-xs font-bold">
            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {stats.activeSubs || 0} Aktief
            </span>
            <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              {stats.trialSubs || 0} Proef
            </span>
            {Number(stats.overdueSubs || 0) > 0 && (
              <span className="text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
                {stats.overdueSubs} Agterstallig
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white p-1 rounded-xl border border-amber-200 flex items-center gap-1 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveAdminTab("verifications")}
          className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
            activeAdminTab === "verifications"
              ? "bg-orange-700 text-white shadow-2xs"
              : "text-stone-700 hover:bg-stone-100"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{lang === "af" ? "Besigheidsverifikasies" : "Business Verifications"}</span>
          {Number(stats.pendingVerificationCount || 0) > 0 && (
            <span className="bg-amber-400 text-stone-950 font-black px-1.5 py-0.2 rounded-full text-[10px]">
              {stats.pendingVerificationCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab("subscriptions")}
          className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
            activeAdminTab === "subscriptions"
              ? "bg-orange-700 text-white shadow-2xs"
              : "text-stone-700 hover:bg-stone-100"
          }`}
        >
          <Banknote className="w-4 h-4" />
          <span>{lang === "af" ? "Verskaffers Intekeningfooie & Kwitansies" : "Subscription Fees & Receipts"}</span>
        </button>

        <button
          onClick={() => setActiveAdminTab("moderation")}
          className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
            activeAdminTab === "moderation"
              ? "bg-orange-700 text-white shadow-2xs"
              : "text-stone-700 hover:bg-stone-100"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>{lang === "af" ? "Gemeenskapsmoderering" : "Community Moderation"}</span>
        </button>
      </div>

      {/* TAB 1: BUSINESS VERIFICATION */}
      {activeAdminTab === "verifications" && (
        <div className="space-y-3">
          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-2 bg-white p-3 rounded-xl border border-amber-200 text-xs">
            <div className="flex items-center gap-1.5 font-semibold overflow-x-auto">
              <span className="text-stone-500 font-bold mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Status:</span>
              </span>
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-2.5 py-1 rounded-lg ${filterStatus === "all" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-700"}`}
              >
                Alles ({businesses.length})
              </button>
              <button
                onClick={() => setFilterStatus("hangend")}
                className={`px-2.5 py-1 rounded-lg ${filterStatus === "hangend" ? "bg-amber-500 text-stone-950 font-bold" : "bg-stone-100 text-stone-700"}`}
              >
                Hangend ({businesses.filter((b) => b.verificationStatus === "hangend" || !b.isVerified).length})
              </button>
              <button
                onClick={() => setFilterStatus("goedgekeur")}
                className={`px-2.5 py-1 rounded-lg ${filterStatus === "goedgekeur" ? "bg-emerald-700 text-white" : "bg-stone-100 text-stone-700"}`}
              >
                Goedgekeur ({businesses.filter((b) => b.verificationStatus === "goedgekeur" && b.isVerified).length})
              </button>
              <button
                onClick={() => setFilterStatus("afgekeur")}
                className={`px-2.5 py-1 rounded-lg ${filterStatus === "afgekeur" ? "bg-red-700 text-white" : "bg-stone-100 text-stone-700"}`}
              >
                Afgekeur ({businesses.filter((b) => b.verificationStatus === "afgekeur").length})
              </button>
            </div>
          </div>

          {/* List of Businesses for Admin */}
          <div className="space-y-3">
            {filteredBusinesses.map((biz) => {
              const waLink = getWhatsAppLink(biz.whatsapp || biz.phone, biz.name, biz.ownerName, lang);
              const isPending = biz.verificationStatus === "hangend" || !biz.isVerified;
              const isApproved = biz.verificationStatus === "goedgekeur" && biz.isVerified;

              return (
                <div
                  key={biz.id}
                  className={`bg-white rounded-xl border p-4 transition flex flex-col justify-between gap-3 ${
                    isPending
                      ? "border-amber-400 bg-amber-50/40 ring-1 ring-amber-300"
                      : "border-stone-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-base text-stone-900">{biz.name}</span>
                        <span className="text-xs font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded">
                          📍 {biz.town}
                        </span>
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Geverifieer</span>
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 bg-amber-200 text-amber-950 text-[11px] font-bold px-2 py-0.5 rounded animate-pulse">
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>Wag op Verifikasie</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded">
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>Afgekeur</span>
                          </span>
                        )}
                        {biz.isFeatured && (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[11px] font-bold px-2 py-0.5 rounded">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>Uitgelig</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-600 mt-1">
                        <strong>Eienaar:</strong> {biz.ownerName} • <strong>Foon:</strong> {biz.phone}
                      </p>

                      <p className="text-xs text-stone-700 mt-2 bg-stone-50 p-2.5 rounded-lg border border-stone-200 leading-relaxed">
                        {biz.description}
                      </p>
                    </div>

                    {/* Subscription Pill */}
                    <div className="text-right sm:flex-shrink-0 self-start">
                      <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {biz.subscriptionPlan || "Gemeenskap Basies (R50/m)"}
                      </span>
                      <p className="text-xs font-black text-orange-800 mt-1">
                        R{biz.monthlyFee || 50} / mnd
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1"
                        title="Gesels met eienaar op WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Eienaar</span>
                      </a>
                      <a
                        href={`tel:${biz.phone.replace(/\s+/g, "")}`}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5 text-stone-600" />
                        <span>Bel</span>
                      </a>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {!isApproved && (
                        <button
                          onClick={() => handleAction("business", biz.id, "verify")}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1 shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Goedkeur & Verifieer</span>
                        </button>
                      )}

                      {isApproved && (
                        <button
                          onClick={() => handleAction("business", biz.id, "pending")}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold"
                          title="Stel terug na hangend"
                        >
                          Hangend
                        </button>
                      )}

                      {biz.verificationStatus !== "afgekeur" && (
                        <button
                          onClick={() => handleAction("business", biz.id, "reject")}
                          className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-red-50 text-red-700 font-bold"
                          title="Keur besigheid af"
                        >
                          Keur Af
                        </button>
                      )}

                      <button
                        onClick={() =>
                          handleAction("business", biz.id, "toggleFeatured", {
                            isFeatured: !biz.isFeatured,
                          })
                        }
                        className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 ${
                          biz.isFeatured
                            ? "bg-amber-200 text-amber-900"
                            : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                        }`}
                      >
                        <Star className="w-3 h-3" />
                        <span>{biz.isFeatured ? "Ont-uitlig" : "Uitlig"}</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Is jy seker jy wil besigheid '${biz.name}' verwyder?`)) {
                            handleAction("business", biz.id, "delete");
                          }
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-700 hover:bg-red-50 transition"
                        title="Verwyder besigheid"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: VENDOR SUBSCRIPTION FEES & RECEIPTS */}
      {activeAdminTab === "subscriptions" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-amber-200">
            <div>
              <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-700" />
                <span>{lang === "af" ? "Verskaffers Intekeningfooie & Kwitansies" : "Vendor Subscription Fees"}</span>
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                {lang === "af"
                  ? "Teken maandelikse fooie aan vir Capitec Pay, Kontant by die kantoor, eWallet of EFT."
                  : "Record monthly subscription fee payments and manage vendor tier plans."}
              </p>
            </div>

            <button
              onClick={() => {
                setPaymentBizId(businesses[0]?.id || null);
                setIsRecordPaymentOpen(true);
              }}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === "af" ? "+ Teken Betaling Aan" : "+ Record Fee Payment"}</span>
            </button>
          </div>

          {/* Vendors Subscription Status Table / Cards */}
          <div className="bg-white rounded-xl border border-amber-200 overflow-hidden shadow-2xs">
            <div className="p-3 bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-700 flex items-center justify-between">
              <span>Lys van Entrepreneurs & Intekeningstatus</span>
              <span>{businesses.length} Verskaffers Gelys</span>
            </div>

            <div className="divide-y divide-stone-100 text-xs">
              {businesses.map((biz) => {
                const isOverdue = biz.subscriptionStatus === "agterstallig";
                const isTrial = biz.subscriptionStatus === "proeftydperk";
                const isActive = biz.subscriptionStatus === "aktief";

                return (
                  <div
                    key={biz.id}
                    className="p-3.5 hover:bg-stone-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-stone-900 text-sm">{biz.name}</span>
                        <span className="text-[11px] font-bold text-stone-500">({biz.town})</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : isTrial
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {biz.subscriptionStatus || "aktief"}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Eienaar: <strong>{biz.ownerName}</strong> ({biz.phone}) • Verwysing:{" "}
                        <span className="font-mono text-stone-700">{biz.paymentReference || "Geen"}</span>
                      </p>
                      {biz.subscriptionPaidUntil && (
                        <p className="text-[11px] text-stone-600 mt-0.5">
                          Geldig tot: <strong>{new Date(biz.subscriptionPaidUntil).toLocaleDateString("af-ZA")}</strong>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto flex-wrap">
                      {/* Plan selector */}
                      <select
                        value={biz.subscriptionPlan || "Gemeenskap Basies (R50/m)"}
                        onChange={(e) => {
                          const plan = e.target.value;
                          const fee = plan.includes("120") ? 120 : plan.includes("200") ? 200 : 50;
                          handleUpdatePlan(biz.id, plan, fee);
                        }}
                        className="px-2 py-1 bg-stone-100 border border-stone-200 rounded text-xs font-bold text-stone-800"
                      >
                        <option value="Gemeenskap Basies (R50/m)">Basies (R50/m)</option>
                        <option value="Besigheid Plus (R120/m)">Besigheid (R120/m)</option>
                        <option value="Pro Korporatief (R200/m)">Pro (R200/m)</option>
                        <option value="Gratis Proef (R0/m)">Gratis Proef</option>
                      </select>

                      <span className="font-black text-emerald-800 text-sm whitespace-nowrap">
                        R{biz.monthlyFee || 50}/mnd
                      </span>

                      <button
                        onClick={() => {
                          setPaymentBizId(biz.id);
                          setIsRecordPaymentOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1 shadow-2xs whitespace-nowrap"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Teken Betaling Aan</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Receipts Ledger */}
          <div className="bg-white rounded-xl border border-amber-200 overflow-hidden shadow-2xs">
            <div className="p-3 bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-700 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-700" />
              <span>Geskiedenis van Ontvangde Betalings (Ledger)</span>
            </div>

            {payments.length === 0 ? (
              <p className="p-6 text-center text-xs text-stone-500">
                Nog geen betalings aangeteken nie.
              </p>
            ) : (
              <div className="divide-y divide-stone-100 text-xs">
                {payments.map((p) => {
                  const biz = businesses.find((b) => b.id === p.businessId);

                  return (
                    <div key={p.id} className="p-3 flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">{biz ? biz.name : `Besigheid #${p.businessId}`}</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.2 rounded">
                            {p.paymentMethod}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Tydperk: <strong>{p.period}</strong> • Verwysing: <span className="font-mono">{p.reference || "Nvt"}</span> • Aangeteken deur: {p.recordedBy}
                        </p>
                        {p.notes && <p className="text-[11px] text-stone-600 italic">&ldquo;{p.notes}&rdquo;</p>}
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-emerald-800">+ R {p.amount}</span>
                        <p className="text-[10px] text-stone-400">
                          {p.paidAt ? new Date(p.paidAt).toLocaleDateString("af-ZA") : "Vandag"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: COMMUNITY MODERATION (Marketplace, Rides, Notices) */}
      {activeAdminTab === "moderation" && (
        <div className="space-y-4">
          {/* Marketplace moderation */}
          <div className="bg-white rounded-xl border border-amber-200 overflow-hidden shadow-2xs">
            <div className="p-3 bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-700 flex items-center gap-2">
              <Tag className="w-4 h-4 text-orange-700" />
              <span>Markplein Advertensies ({marketplace.length})</span>
            </div>
            <div className="p-3 space-y-2">
              {marketplace.map((m) => (
                <div key={m.id} className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-stone-900">{m.title}</span> ({m.price}) - 📍 {m.town} deur {m.sellerName}
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Verwyder markplein advertensie '${m.title}'?`)) {
                        handleAction("marketplace", m.id, "delete");
                      }
                    }}
                    className="p-1 text-stone-400 hover:text-red-700"
                    title="Verwyder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Rides moderation */}
          <div className="bg-white rounded-xl border border-amber-200 overflow-hidden shadow-2xs">
            <div className="p-3 bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-700 flex items-center gap-2">
              <Car className="w-4 h-4 text-orange-700" />
              <span>Saamry Ritte ({rides.length})</span>
            </div>
            <div className="p-3 space-y-2">
              {rides.map((r) => (
                <div key={r.id} className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-stone-900">{r.origin} ➔ {r.destination}</span> ({r.date} @ {r.time}) - Bestuurder: {r.driverName} ({r.pricePerSeat})
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Verwyder rit van ${r.origin}?`)) {
                        handleAction("ride", r.id, "delete");
                      }
                    }}
                    className="p-1 text-stone-400 hover:text-red-700"
                    title="Verwyder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notices moderation */}
          <div className="bg-white rounded-xl border border-amber-200 overflow-hidden shadow-2xs">
            <div className="p-3 bg-stone-50 border-b border-stone-200 text-xs font-bold text-stone-700 flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-700" />
              <span>Kennisgewings ({notices.length})</span>
            </div>
            <div className="p-3 space-y-2">
              {notices.map((n) => (
                <div key={n.id} className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-stone-900">{n.title}</span> (📍 {n.town}) - Outeur: {n.author}
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Verwyder kennisgewing '${n.title}'?`)) {
                        handleAction("notice", n.id, "delete");
                      }
                    }}
                    className="p-1 text-stone-400 hover:text-red-700"
                    title="Verwyder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => {
          setIsRecordPaymentOpen(false);
          setPaymentBizId(null);
        }}
        businesses={businesses}
        selectedBusinessId={paymentBizId}
        lang={lang}
        onPaymentSuccess={async () => {
          setAlertNotice("Betaling suksesvol aangeteken en verskaffer se lisensie is verleng!");
          setTimeout(() => setAlertNotice(null), 3500);
          await fetchAdminOverview();
          onDataChanged();
        }}
      />
    </div>
  );
}
