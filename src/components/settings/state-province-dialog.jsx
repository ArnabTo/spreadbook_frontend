"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { X } from "lucide-react";
import useSWR from "swr";
import { createState, updateState, swrFetcher } from "@/services/api";

export function StateProvinceDialog({ open, onClose, onSaved, stateProvince, endpointCountries }) {
    const [name, setName] = useState("");
    const [arabicName, setArabicName] = useState("");
    const [countryId, setCountryId] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const { data: countriesData } = useSWR(endpointCountries, swrFetcher, { revalidateOnFocus: false });
    const countries = useMemo(() => countriesData?.results || countriesData || [], [countriesData]);

    const isEdit = useMemo(() => !!stateProvince, [stateProvince]);
    const title = useMemo(() => (isEdit ? "Edit State/Province" : "Add New State/Province"), [isEdit]);

    useEffect(() => {
        if (open) {
            setName(stateProvince?.name || "");
            setArabicName(stateProvince?.arabic_name || "");
            setCountryId(stateProvince?.country || "");
            setIsActive(stateProvince?.is_active ?? true);
            setError("");
        }
    }, [open, stateProvince]);

    const handleSave = useCallback(async () => {
        setError("");
        if (!name.trim()) { setError("Name is required."); return; }
        if (!countryId) { setError("Country is required."); return; }
        setSaving(true);
        try {
            const payload = { name: name.trim(), arabic_name: arabicName.trim() || "", country: countryId, is_active: isActive };
            if (isEdit) { await updateState(stateProvince.id, payload); }
            else { await createState(payload); }
            onSaved();
        } catch (err) {
            const msg = err?.detail || err?.message || "Failed to save state/province.";
            setError(typeof msg === "string" ? msg : "Failed to save state/province.");
        } finally { setSaving(false); }
    }, [name, arabicName, countryId, isActive, isEdit, stateProvince, onSaved]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
            <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-2xl ring-1 ring-black/10">
                <div className="flex items-center justify-between rounded-t-xl bg-[#004080] px-5 py-3">
                    <h2 className="text-base font-bold uppercase tracking-wide text-white">{title}</h2>
                    <button onClick={onClose} className="flex size-7 items-center justify-center rounded text-white/70 hover:bg-white/10 hover:text-white"><X className="size-4" /></button>
                </div>
                <div className="space-y-4 px-5 py-5">
                    {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Country <span className="text-red-500">*</span></label>
                        <select value={countryId} onChange={(e) => setCountryId(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand">
                            <option value="">-- Select Country --</option>
                            {countries.filter(c => c.is_active !== false).map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Name <span className="text-red-500">*</span></label>
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="State/Province name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Arabic Name</label>
                        <input value={arabicName} onChange={(e) => setArabicName(e.target.value)} placeholder="اسم المنطقة" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand" />
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="stateActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="size-4 accent-brand" />
                        <label htmlFor="stateActive" className="text-sm font-semibold text-gray-700">Active</label>
                    </div>
                </div>
                <div className="flex justify-end gap-3 rounded-b-xl border-t bg-gray-50 px-5 py-3">
                    <button onClick={onClose} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="rounded-lg bg-[#004080] px-5 py-2 text-sm font-semibold text-white hover:bg-[#003060] disabled:opacity-60">{saving ? "Saving..." : isEdit ? "Update" : "Save"}</button>
                </div>
            </div>
        </div>
    );
}
