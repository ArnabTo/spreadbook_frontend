"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { Home, ChevronRight, ChevronDown, ArrowUp } from "lucide-react";
import {
  swrFetcher,
  fetchWarehouses, createWarehouse, updateWarehouse,
} from "@/services/api";

const arabicLabels = {
  country: "arabic_country",
  state: "arabic_state",
  city: "arabic_city",
  building_no: "arabic_building_no",
  street_name: "arabic_street_name",
  district: "arabic_district",
  additional_no: "arabic_additional_no",
  zip_code: "arabic_zip_code",
};

const arabicLabelText = {
  country: "الدولة",
  state: "المحافظة / الولاية",
  city: "المدينة",
  building_no: "رقم المبنى",
  street_name: "اسم الشارع",
  district: "الحي",
  additional_no: "الرقم الإضافي",
  zip_code: "الرمز البريدي",
};

export default function WarehouseCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEdit = !!editId;

  const [name, setName] = useState("");
  const [countryId, setCountryId] = useState("");
  const [stateId, setStateId] = useState("");
  const [city, setCity] = useState("");
  const [buildingNo, setBuildingNo] = useState("");
  const [streetName, setStreetName] = useState("");
  const [district, setDistrict] = useState("");
  const [additionalNo, setAdditionalNo] = useState("");
  const [zipCode, setZipCode] = useState("");

  const [arabicFields, setArabicFields] = useState({
    arabic_country: "", arabic_state: "", arabic_city: "",
    arabic_building_no: "", arabic_street_name: "", arabic_district: "",
    arabic_additional_no: "", arabic_zip_code: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingData, setLoadingData] = useState(false);

  const { data: countriesData } = useSWR("/api/countries/", swrFetcher, { revalidateOnFocus: false });
  const countries = useMemo(() => countriesData?.results || countriesData || [], [countriesData]);

  const { data: statesData } = useSWR(
    countryId ? `/api/states/?country_id=${countryId}` : null,
    swrFetcher, { revalidateOnFocus: false }
  );
  const states = useMemo(() => statesData?.results || statesData || [], [statesData]);

  useEffect(() => {
    if (!editId) return;
    setLoadingData(true);
    fetchWarehouses({ id: editId }).then((data) => {
      const items = data?.results || data || [];
      const wh = Array.isArray(items) ? items[0] : items;
      if (wh) {
        setName(wh.name || "");
        setCountryId(wh.country_ref || "");
        setStateId(wh.state_ref || "");
        setCity(wh.city || "");
        setBuildingNo(wh.building_no || "");
        setStreetName(wh.street_name || "");
        setDistrict(wh.district || "");
        setAdditionalNo(wh.additional_no || "");
        setZipCode(wh.postal_code || "");
        setArabicFields({
          arabic_country: wh.arabic_country || "",
          arabic_state: wh.arabic_state || "",
          arabic_city: wh.arabic_city || "",
          arabic_building_no: wh.arabic_building_no || "",
          arabic_street_name: wh.arabic_street_name || "",
          arabic_district: wh.arabic_district || "",
          arabic_additional_no: wh.arabic_additional_no || "",
          arabic_zip_code: wh.arabic_zip_code || "",
        });
      }
    }).catch(() => setError("Failed to load."))
      .finally(() => setLoadingData(false));
  }, [editId]);

  const translateField = (fieldKey, englishValue) => {
    if (!englishValue) return;
    setArabicFields((prev) => ({ ...prev, [arabicLabels[fieldKey]]: `[${englishValue}]` }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        country_ref: countryId || null,
        state_ref: stateId || null,
        city: city || "",
        building_no: buildingNo || "",
        street_name: streetName || "",
        district: district || "",
        additional_no: additionalNo || "",
        postal_code: zipCode || "",
        ...arabicFields,
      };
      if (isEdit) await updateWarehouse(editId, payload);
      else await createWarehouse(payload);
      router.push("/dashboard/masters/warehouse");
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
          <Link href="/dashboard/masters/warehouse" className="hover:text-brand">Warehouse</Link>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-gray-800">{isEdit ? "Edit" : "Create"}</span>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="rounded-t-xl bg-[#004080] py-3 text-center">
          <h2 className="text-base font-bold uppercase text-white">WAREHOUSE</h2>
        </div>
        <div className="p-6 space-y-5">
          {error && <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          {/* Name — full width, no Arabic */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#004080]">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
          </div>

          {/* Country */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">Country</label>
              <select value={countryId} onChange={(e) => { setCountryId(e.target.value); setStateId(""); }} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand bg-white">
                <option value="">-- Select --</option>
                {countries.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{arabicLabelText.country}</label>
                <input value={arabicFields.arabic_country} onChange={(e) => setArabicFields((p) => ({ ...p, arabic_country: e.target.value }))} placeholder={arabicLabelText.country} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand text-right" dir="rtl" />
              </div>
              <button type="button" onClick={() => translateField("country", countries.find((c) => c.id == countryId)?.name || "")} className="flex size-9 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 shrink-0 mb-0.5" title="Translate">T</button>
            </div>
          </div>

          {/* State */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">State / Province</label>
              <select value={stateId} onChange={(e) => setStateId(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand bg-white">
                <option value="">-- Select --</option>
                {states.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{arabicLabelText.state}</label>
                <input value={arabicFields.arabic_state} onChange={(e) => setArabicFields((p) => ({ ...p, arabic_state: e.target.value }))} placeholder={arabicLabelText.state} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand text-right" dir="rtl" />
              </div>
              <button type="button" onClick={() => translateField("state", states.find((s) => s.id == stateId)?.name || "")} className="flex size-9 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 shrink-0 mb-0.5" title="Translate">T</button>
            </div>
          </div>

          {/* City */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">City</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter City" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{arabicLabelText.city}</label>
                <input value={arabicFields.arabic_city} onChange={(e) => setArabicFields((p) => ({ ...p, arabic_city: e.target.value }))} placeholder={arabicLabelText.city} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand text-right" dir="rtl" />
              </div>
              <button type="button" onClick={() => translateField("city", city)} className="flex size-9 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 shrink-0 mb-0.5" title="Translate">T</button>
            </div>
          </div>

          {/* Building No */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">Building No</label>
              <input value={buildingNo} onChange={(e) => setBuildingNo(e.target.value)} placeholder="Enter Building No" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{arabicLabelText.building_no}</label>
                <input value={arabicFields.arabic_building_no} onChange={(e) => setArabicFields((p) => ({ ...p, arabic_building_no: e.target.value }))} placeholder={arabicLabelText.building_no} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand text-right" dir="rtl" />
              </div>
              <button type="button" onClick={() => translateField("building_no", buildingNo)} className="flex size-9 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 shrink-0 mb-0.5" title="Translate">T</button>
            </div>
          </div>

          {/* Street Name */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">Street Name</label>
              <input value={streetName} onChange={(e) => setStreetName(e.target.value)} placeholder="Enter Street Name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{arabicLabelText.street_name}</label>
                <input value={arabicFields.arabic_street_name} onChange={(e) => setArabicFields((p) => ({ ...p, arabic_street_name: e.target.value }))} placeholder={arabicLabelText.street_name} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand text-right" dir="rtl" />
              </div>
              <button type="button" onClick={() => translateField("street_name", streetName)} className="flex size-9 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 shrink-0 mb-0.5" title="Translate">T</button>
            </div>
          </div>

          {/* District */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">District</label>
              <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Enter District" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{arabicLabelText.district}</label>
                <input value={arabicFields.arabic_district} onChange={(e) => setArabicFields((p) => ({ ...p, arabic_district: e.target.value }))} placeholder={arabicLabelText.district} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand text-right" dir="rtl" />
              </div>
              <button type="button" onClick={() => translateField("district", district)} className="flex size-9 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 shrink-0 mb-0.5" title="Translate">T</button>
            </div>
          </div>

          {/* Additional No */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">Additional No</label>
              <input value={additionalNo} onChange={(e) => setAdditionalNo(e.target.value)} placeholder="Enter Additional No" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{arabicLabelText.additional_no}</label>
                <input value={arabicFields.arabic_additional_no} onChange={(e) => setArabicFields((p) => ({ ...p, arabic_additional_no: e.target.value }))} placeholder={arabicLabelText.additional_no} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand text-right" dir="rtl" />
              </div>
              <button type="button" onClick={() => translateField("additional_no", additionalNo)} className="flex size-9 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 shrink-0 mb-0.5" title="Translate">T</button>
            </div>
          </div>

          {/* Zip / Postal Code */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">Zip / Postal Code</label>
              <input value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="Enter Zip Postal Code" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{arabicLabelText.zip_code}</label>
                <input value={arabicFields.arabic_zip_code} onChange={(e) => setArabicFields((p) => ({ ...p, arabic_zip_code: e.target.value }))} placeholder={arabicLabelText.zip_code} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand text-right" dir="rtl" />
              </div>
              <button type="button" onClick={() => translateField("zip_code", zipCode)} className="flex size-9 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 shrink-0 mb-0.5" title="Translate">T</button>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 border-t px-6 py-4">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">
            {saving ? "Saving..." : "Save"}
          </button>
          <Link href="/dashboard/masters/warehouse" className="flex items-center gap-2 rounded-lg bg-red-500 px-6 py-2 text-sm font-semibold text-white hover:bg-red-600">
            Clear
          </Link>
        </div>
      </div>
      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-6 right-6 flex size-10 items-center justify-center rounded-lg bg-[#004080] text-white shadow-lg hover:bg-[#003060]"><ArrowUp className="size-5" /></button>
    </div>
  );
}
