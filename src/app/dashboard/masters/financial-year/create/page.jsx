"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Home, ChevronRight, ArrowUp } from "lucide-react";
import {
  fetchFinancialYears, createFinancialYear, updateFinancialYear,
} from "@/services/api";
import { useTranslation } from "react-i18next";

export default function FinancialYearCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEdit = !!editId;
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [closed, setClosed] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!editId) return;
    setLoadingData(true);
    fetchFinancialYears({ id: editId }).then((data) => {
      const items = data?.results || data || [];
      const fy = Array.isArray(items) ? items[0] : items;
      if (fy) {
        setName(fy.name || "");
        setFromDate(fy.from_date || "");
        setToDate(fy.to_date || "");
        setClosed(fy.closed || false);
      }
    }).catch(() => setError(t("financialYear.failed")))
      .finally(() => setLoadingData(false));
  }, [editId, t]);

  const validateForm = () => {
    if (!name.trim()) return t("financialYear.nameRequired");
    if (!fromDate) return t("financialYear.fromDateRequired");
    if (!toDate) return t("financialYear.toDateRequired");
    if (fromDate >= toDate) return t("financialYear.dateOrderError");
    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }
    setError("");
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        from_date: fromDate,
        to_date: toDate,
        closed,
      };
      if (isEdit) await updateFinancialYear(editId, payload);
      else await createFinancialYear(payload);
      router.push("/dashboard/masters/financial-year");
    } catch (err) {
      const msg = typeof err === "object" ? (err?.name || err?.from_date || err?.to_date || err?.non_field_errors || err?.detail || err?.message || "Failed to save.") : "Failed to save.";
      setError(Array.isArray(msg) ? msg.join(", ") : String(msg));
    } finally { setSaving(false); }
  };

  if (loadingData) return <div className="flex items-center justify-center py-32 text-gray-400">{t("financialYear.loading")}</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl bg-white px-5 py-3 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-brand"><Home className="size-4" /></Link>
          <span>Home</span><ChevronRight className="size-3.5" />
          <Link href="/dashboard/masters/financial-year" className="hover:text-brand">{t("financialYear.title")}</Link>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-gray-800">{isEdit ? t("financialYear.editTitle") : t("financialYear.addTitle")}</span>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="rounded-t-xl bg-[#004080] py-3 text-center">
          <h2 className="text-base font-bold uppercase text-white">{isEdit ? t("financialYear.editTitle") : t("financialYear.addTitle")}</h2>
        </div>
        <div className="p-6 space-y-5">
          {error && <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#004080]">{t("financialYear.name")}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("financialYear.name")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">{t("financialYear.fromDate")}</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">{t("financialYear.toDate")}</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="closed" checked={closed} onChange={(e) => setClosed(e.target.checked)} className="size-4 accent-brand" />
            <label htmlFor="closed" className="text-sm font-semibold text-[#004080]">{t("financialYear.closed")}</label>
          </div>
        </div>

        <div className="flex justify-center gap-4 border-t px-6 py-4">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">
            {saving ? "Saving..." : isEdit ? t("financialYear.update") : t("financialYear.save")}
          </button>
          <Link href="/dashboard/masters/financial-year" className="flex items-center gap-2 rounded-lg bg-red-500 px-6 py-2 text-sm font-semibold text-white hover:bg-red-600">
            {t("financialYear.cancel")}
          </Link>
        </div>
      </div>
      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-6 right-6 flex size-10 items-center justify-center rounded-lg bg-[#004080] text-white shadow-lg hover:bg-[#003060]"><ArrowUp className="size-5" /></button>
    </div>
  );
}
