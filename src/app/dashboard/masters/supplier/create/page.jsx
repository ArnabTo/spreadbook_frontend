"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { Home, ChevronRight, ChevronDown, ArrowUp } from "lucide-react";
import { swrFetcher, fetchSuppliers, createSupplier, updateSupplier } from "@/services/api";
import { CreatePermission, UpdatePermission, DeletePermission } from "@/components/permission/action-permission";

export default function SupplierCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEdit = !!editId;

  const [activeTab, setActiveTab] = useState("party-info");

  const [name, setName] = useState("");
  const [arabicName, setArabicName] = useState("");
  const [address, setAddress] = useState("");
  const [arabicAddress, setArabicAddress] = useState("");
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [vatNo, setVatNo] = useState("");
  const [crNumber, setCrNumber] = useState("");
  const [isEffectedToLedger, setIsEffectedToLedger] = useState(false);
  const [duePeriod, setDuePeriod] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [remarks, setRemarks] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!editId) return;
    setLoadingData(true);
    fetchSuppliers({ id: editId }).then((data) => {
      const items = data?.results || data || [];
      const sup = Array.isArray(items) ? items[0] : items;
      if (sup) {
        setName(sup.name || "");
        setArabicName(sup.arabic_name || "");
        setAddress(sup.address || "");
        setArabicAddress(sup.arabic_address || "");
        setCode(sup.supplier_code || "");
        setPhone(sup.phone || "");
        setMobile(sup.mobile_number || "");
        setEmail(sup.email || "");
        setVatNo(sup.vat_no || "");
        setCrNumber(sup.cr_number || "");
        setIsEffectedToLedger(sup.is_effected_to_ledger || false);
        setDuePeriod(sup.due_period != null ? String(sup.due_period) : "");
        setContactPerson(sup.contactPerson || "");
        setRemarks(sup.remarks || "");
        setOpeningBalance(sup.opening_balance != null ? String(sup.opening_balance) : "");
      }
    }).catch(() => setError("Failed to load."))
      .finally(() => setLoadingData(false));
  }, [editId]);

  const translateToArabic = (field, englishValue) => {
    if (!englishValue) return;
    if (field === "arabicName") setArabicName(`[${englishValue}]`);
    if (field === "arabicAddress") setArabicAddress(`[${englishValue}]`);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: name.trim() || null,
        arabic_name: arabicName.trim() || null,
        address: address || null,
        arabic_address: arabicAddress || null,
        supplier_code: code.trim() || null,
        phone: phone || null,
        mobile_number: mobile || null,
        email: email || null,
        vat_no: vatNo || null,
        cr_number: crNumber || null,
        is_effected_to_ledger: isEffectedToLedger,
        due_period: duePeriod ? Number(duePeriod) : null,
        contactPerson: contactPerson || null,
        remarks: remarks || null,
        opening_balance: openingBalance || null,
      };
      if (isEdit) await updateSupplier(editId, payload);
      else await createSupplier(payload);
      router.push("/dashboard/masters/supplier");
    } catch (err) {
      setError(err?.detail || err?.message || "Failed to save.");
    } finally { setSaving(false); }
  };

  if (loadingData) return <div className="flex items-center justify-center py-32 text-gray-400">Loading...</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl bg-white px-5 py-3 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-brand"><Home className="size-4" /></Link>
          <span>Home</span><ChevronRight className="size-3.5" />
          <Link href="/dashboard/masters/supplier" className="hover:text-brand">Supplier</Link>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-gray-800">{isEdit ? "Edit" : "Create"}</span>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        {/* Tab Bar */}
        <div className="flex rounded-t-xl bg-[#00477D]">
          <button
            onClick={() => setActiveTab("party-info")}
            className="px-6 py-3 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: activeTab === "party-info" ? "#3F51B5" : "transparent" }}
          >
            Party Info
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          {/* Name + Arabic Name */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Supplier name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-sm font-semibold text-[#004080]">Arabic Name</label>
                <input value={arabicName} onChange={(e) => setArabicName(e.target.value)} placeholder="Arabic name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand text-right" dir="rtl" />
              </div>
              <button type="button" onClick={() => translateToArabic("arabicName", name)} className="flex size-9 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 shrink-0 mb-0.5" title="Translate">T</button>
            </div>
          </div>

          {/* Address + Arabic Address */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">Address</label>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} placeholder="Address" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-sm font-semibold text-[#004080]">Arabic Address</label>
                <textarea value={arabicAddress} onChange={(e) => setArabicAddress(e.target.value)} rows={3} placeholder="Arabic address" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand text-right" dir="rtl" />
              </div>
              <button type="button" onClick={() => translateToArabic("arabicAddress", address)} className="flex size-9 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 shrink-0 mt-5" title="Translate">T</button>
            </div>
          </div>

          {/* Code + Phone */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">Code</label>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Supplier code" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">Phone Number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>
          </div>

          {/* Mobile + Email */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">Mobile Number</label>
              <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Mobile" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>
          </div>

          {/* VAT No + CR Number */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">VAT No</label>
              <input value={vatNo} onChange={(e) => setVatNo(e.target.value)} placeholder="VAT No" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">CR Number</label>
              <input value={crNumber} onChange={(e) => setCrNumber(e.target.value)} placeholder="CR Number" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>
          </div>

          {/* Is Effected To Ledger + Due Period */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="effectedLedger" checked={isEffectedToLedger} onChange={(e) => setIsEffectedToLedger(e.target.checked)} className="size-4 accent-brand" />
              <label htmlFor="effectedLedger" className="text-sm font-semibold text-[#004080]">Is Effected To Ledger</label>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">Due Period</label>
              <input type="number" value={duePeriod} onChange={(e) => setDuePeriod(e.target.value)} placeholder="Days" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              <p className="text-xs text-gray-500">Number Of Days</p>
            </div>
          </div>

          {/* Contact Person + Opening Balance */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">Contact Person</label>
              <input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Contact person" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">Opening Balance</label>
              <input type="number" step="0.01" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#004080]">Remarks</label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} placeholder="Remarks" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t px-6 py-4">
          <Link href="/dashboard/masters/supplier" className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</Link>
          <CreatePermission module="supplier">
          <button onClick={handleSave} disabled={saving} className="rounded-lg bg-[#004080] px-6 py-2 text-sm font-semibold text-white hover:bg-[#003060] disabled:opacity-60">
            {saving ? "Saving..." : isEdit ? "Update" : "Save"}
          </button>
          </CreatePermission>
        </div>
      </div>
      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-6 right-6 flex size-10 items-center justify-center rounded-lg bg-[#004080] text-white shadow-lg hover:bg-[#003060]"><ArrowUp className="size-5" /></button>
    </div>
  );
}
