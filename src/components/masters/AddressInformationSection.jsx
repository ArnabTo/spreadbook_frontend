"use client";

import useSWR from "swr";
import { useMemo } from "react";
import { swrFetcher } from "@/services/api";
import { useTranslation } from "react-i18next";

const arabicFieldKeys = {
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

export default function AddressInformationSection({
  countryId,
  setCountryId,
  stateId,
  setStateId,
  city,
  setCity,
  buildingNo,
  setBuildingNo,
  streetName,
  setStreetName,
  district,
  setDistrict,
  additionalNo,
  setAdditionalNo,
  zipCode,
  setZipCode,
  arabicFields,
  setArabicFields,
}) {
  const { t } = useTranslation();

  const { data: countriesData } = useSWR("/api/countries/", swrFetcher, { revalidateOnFocus: false });
  const countries = useMemo(() => countriesData?.results || countriesData || [], [countriesData]);

  const { data: statesData } = useSWR(
    countryId ? `/api/states/?country_id=${countryId}` : null,
    swrFetcher,
    { revalidateOnFocus: false }
  );
  const states = useMemo(() => statesData?.results || statesData || [], [statesData]);

  const handleTranslate = (fieldKey, englishValue) => {
    if (!englishValue) return;
    setArabicFields((prev) => ({ ...prev, [arabicFieldKeys[fieldKey]]: `[${englishValue}]` }));
  };

  const updateArabic = (key, value) => {
    setArabicFields((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-5">
      {/* Country */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#004080]">{t("customer.country")}</label>
          <select
            value={countryId}
            onChange={(e) => { setCountryId(e.target.value); setStateId(""); }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="">-- {t("customer.country")} --</option>
            {countries.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-semibold text-[#004080]">{arabicLabelText.country}</label>
            <input
              value={arabicFields.arabic_country || ""}
              onChange={(e) => updateArabic("arabic_country", e.target.value)}
              placeholder={arabicLabelText.country}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand text-right"
              dir="rtl"
            />
          </div>
          <button
            type="button"
            onClick={() => handleTranslate("country", countries.find((c) => c.id == countryId)?.name || "")}
            className="flex size-9 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 shrink-0 mb-0.5"
            title={t("customer.translate")}
          >
            T
          </button>
        </div>
      </div>

      {/* State */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#004080]">{t("customer.state")}</label>
          <select
            value={stateId}
            onChange={(e) => setStateId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="">-- {t("customer.state")} --</option>
            {states.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-semibold text-[#004080]">{arabicLabelText.state}</label>
            <input
              value={arabicFields.arabic_state || ""}
              onChange={(e) => updateArabic("arabic_state", e.target.value)}
              placeholder={arabicLabelText.state}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand text-right"
              dir="rtl"
            />
          </div>
          <button
            type="button"
            onClick={() => handleTranslate("state", states.find((s) => s.id == stateId)?.name || "")}
            className="flex size-9 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 shrink-0 mb-0.5"
            title={t("customer.translate")}
          >
            T
          </button>
        </div>
      </div>

      {/* City */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#004080]">{t("customer.city")}</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t("customer.city")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-semibold text-[#004080]">{arabicLabelText.city}</label>
            <input
              value={arabicFields.arabic_city || ""}
              onChange={(e) => updateArabic("arabic_city", e.target.value)}
              placeholder={arabicLabelText.city}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand text-right"
              dir="rtl"
            />
          </div>
          <button
            type="button"
            onClick={() => handleTranslate("city", city)}
            className="flex size-9 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 shrink-0 mb-0.5"
            title={t("customer.translate")}
          >
            T
          </button>
        </div>
      </div>

      {/* Building No */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#004080]">{t("customer.buildingNo")}</label>
          <input
            value={buildingNo}
            onChange={(e) => setBuildingNo(e.target.value)}
            placeholder={t("customer.buildingNo")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-semibold text-[#004080]">{arabicLabelText.building_no}</label>
            <input
              value={arabicFields.arabic_building_no || ""}
              onChange={(e) => updateArabic("arabic_building_no", e.target.value)}
              placeholder={arabicLabelText.building_no}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand text-right"
              dir="rtl"
            />
          </div>
          <button
            type="button"
            onClick={() => handleTranslate("building_no", buildingNo)}
            className="flex size-9 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 shrink-0 mb-0.5"
            title={t("customer.translate")}
          >
            T
          </button>
        </div>
      </div>

      {/* Street Name */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#004080]">{t("customer.streetName")}</label>
          <input
            value={streetName}
            onChange={(e) => setStreetName(e.target.value)}
            placeholder={t("customer.streetName")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-semibold text-[#004080]">{arabicLabelText.street_name}</label>
            <input
              value={arabicFields.arabic_street_name || ""}
              onChange={(e) => updateArabic("arabic_street_name", e.target.value)}
              placeholder={arabicLabelText.street_name}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand text-right"
              dir="rtl"
            />
          </div>
          <button
            type="button"
            onClick={() => handleTranslate("street_name", streetName)}
            className="flex size-9 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 shrink-0 mb-0.5"
            title={t("customer.translate")}
          >
            T
          </button>
        </div>
      </div>

      {/* District */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#004080]">{t("customer.district")}</label>
          <input
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder={t("customer.district")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-semibold text-[#004080]">{arabicLabelText.district}</label>
            <input
              value={arabicFields.arabic_district || ""}
              onChange={(e) => updateArabic("arabic_district", e.target.value)}
              placeholder={arabicLabelText.district}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand text-right"
              dir="rtl"
            />
          </div>
          <button
            type="button"
            onClick={() => handleTranslate("district", district)}
            className="flex size-9 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 shrink-0 mb-0.5"
            title={t("customer.translate")}
          >
            T
          </button>
        </div>
      </div>

      {/* Additional No */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#004080]">{t("customer.additionalNo")}</label>
          <input
            value={additionalNo}
            onChange={(e) => setAdditionalNo(e.target.value)}
            placeholder={t("customer.additionalNo")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-semibold text-[#004080]">{arabicLabelText.additional_no}</label>
            <input
              value={arabicFields.arabic_additional_no || ""}
              onChange={(e) => updateArabic("arabic_additional_no", e.target.value)}
              placeholder={arabicLabelText.additional_no}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand text-right"
              dir="rtl"
            />
          </div>
          <button
            type="button"
            onClick={() => handleTranslate("additional_no", additionalNo)}
            className="flex size-9 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 shrink-0 mb-0.5"
            title={t("customer.translate")}
          >
            T
          </button>
        </div>
      </div>

      {/* Zip Code */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#004080]">{t("customer.zipCode")}</label>
          <input
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder={t("customer.zipCode")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-semibold text-[#004080]">{arabicLabelText.zip_code}</label>
            <input
              value={arabicFields.arabic_zip_code || ""}
              onChange={(e) => updateArabic("arabic_zip_code", e.target.value)}
              placeholder={arabicLabelText.zip_code}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand text-right"
              dir="rtl"
            />
          </div>
          <button
            type="button"
            onClick={() => handleTranslate("zip_code", zipCode)}
            className="flex size-9 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 shrink-0 mb-0.5"
            title={t("customer.translate")}
          >
            T
          </button>
        </div>
      </div>
    </div>
  );
}
